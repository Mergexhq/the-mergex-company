/**
 * Intelligence Providers - Knowledge Provider
 * ===========================================
 *
 * The Knowledge Provider is the deterministic, hallucination-free answer path.
 * It answers questions using ONLY the MergeX knowledge layer
 * (src/knowledge/) - company facts, services, FAQs, and glossary terms.
 *
 * It performs NO generation and makes NO external API calls. Every answer is
 * a verbatim or faithfully-quoted fact that already exists in the knowledge
 * layer. This makes it:
 *   - free (no model cost)
 *   - zero-latency (no network round-trip)
 *   - safe (cannot invent facts)
 *   - auditable (every answer traces to a source)
 *
 * The provider exposes two kinds of functions:
 *   1. Reusable retrieval functions (getCompany, getServices, findFAQ, …)
 *      - structured data, usable by any caller (engine, UI, future APIs).
 *   2. The IntelligenceProvider.generate() contract - turns a request into a
 *      natural-language answer grounded in retrieved knowledge.
 *
 * IMPORTANT: This file never duplicates MergeX knowledge. It imports and
 * shapes data from src/knowledge/ only.
 */

import { COMPANY } from '@/knowledge/company';
import { SERVICES } from '@/knowledge/services';
import { FAQ_ITEMS } from '@/knowledge/faq';
import { GLOSSARY } from '@/knowledge/glossary';
import type { FAQItem } from '@/knowledge/faq';
import type { GlossaryTerm } from '@/knowledge/glossary';
import type { ServiceItem } from '@/knowledge/services';
import type {
    IntelligenceProvider,
    KnowledgeChunk,
    ProviderId,
    ProviderRequest,
    ProviderResult,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Reusable retrieval functions (structured data)
// ─────────────────────────────────────────────────────────────────────────────

/** Return the canonical MergeX company profile. */
export function getCompany() {
    return COMPANY;
}

/** Return all MergeX services. */
export function getServices(): ServiceItem[] {
    return SERVICES;
}

/** Return a single service by its id, or undefined. */
export function getServiceById(id: string): ServiceItem | undefined {
    return SERVICES.find((service) => service.id === id);
}

/** Return all FAQ items, optionally filtered by category. */
export function getFAQ(category?: FAQItem['category']): FAQItem[] {
    return category ? FAQ_ITEMS.filter((item) => item.category === category) : FAQ_ITEMS;
}

/** Return all glossary terms. */
export function getGlossary(): GlossaryTerm[] {
    return GLOSSARY;
}

/** Return a single glossary term by its (case-insensitive) name, or undefined. */
export function getGlossaryTerm(term: string): GlossaryTerm | undefined {
    const needle = term.trim().toLowerCase();
    return GLOSSARY.find((entry) => entry.term.toLowerCase() === needle);
}

// ─────────────────────────────────────────────────────────────────────────────
// Knowledge retrieval for a query (RAG-style, deterministic)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Common English stopwords. These contribute no signal to topic matching -
 * they appear in virtually every sentence and inflate overlap scores on
 * irrelevant chunks. Filtered out before any overlap computation.
 */
const STOPWORDS = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
    'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'up',
    'about', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'each', 'other',
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it',
    'they', 'them', 'their', 'this', 'that', 'these', 'those',
    'who', 'what', 'which', 'when', 'where', 'why', 'how',
    'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'not',
    'no', 'any', 'all', 'more', 'most', 'also', 'just', 'than', 'then',
    'if', 'as', 'such',
]);

/**
 * Normalise a string for matching: lowercase, collapse whitespace.
 */
function normalise(value: string): string {
    return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Extract meaningful tokens from a string, filtering out stopwords and
 * single-character tokens. Returns an empty Set if nothing meaningful remains.
 */
function meaningfulTokens(text: string): Set<string> {
    return new Set(
        normalise(text)
            .split(/[\s,.\-:;!?'"()\[\]\u2013\u2014]+/)
            .filter((t) => t.length > 1 && !STOPWORDS.has(t)),
    );
}

/**
 * Score how strongly a query relates to a piece of text, in [0, 1].
 *
 * Uses token overlap on *meaningful* tokens only (stopwords excluded).
 * Score = |query_tokens ∩ text_tokens| / |query_tokens|.
 *
 * This prevents common words like "is", "the", "do" from producing false
 * positives against long prose chunks that happen to contain them.
 */
function tokenOverlapScore(query: string, text: string): number {
    const queryTokens = meaningfulTokens(query);
    const textTokens = meaningfulTokens(text);
    if (queryTokens.size === 0 || textTokens.size === 0) return 0;

    let hits = 0;
    for (const token of queryTokens) {
        if (textTokens.has(token)) hits += 1;
    }
    return hits / queryTokens.size;
}

/**
 * Retrieve the knowledge chunks most relevant to a query, ranked by relevance.
 *
 * Scoring strategy per source:
 *
 *   company - score against name, description, tagline, and per-field haystacks
 *             that include domain-specific synonyms (e.g. "founder founded ceo").
 *
 *   services - score against service name and haystack of capabilities.
 *              The combined haystack is deliberately richer than just the name.
 *
 *   faq - question text carries 2× weight vs answer text. A query that
 *         semantically matches the question wins over incidental word
 *         overlap in the long answer paragraph.
 *
 *   glossary - score against term and definition separately; take the max.
 *
 * Returns structured KnowledgeChunk[] sorted by score descending, score > 0
 * entries only.
 */
export function retrieveKnowledge(query: string): KnowledgeChunk[] {
    const chunks: Array<{ chunk: KnowledgeChunk; score: number }> = [];

    // ── Company-level chunks ─────────────────────────────────────────────────

    chunks.push({
        score: Math.max(
            tokenOverlapScore(query, COMPANY.name),
            tokenOverlapScore(query, COMPANY.description),
            tokenOverlapScore(query, COMPANY.tagline),
            tokenOverlapScore(query, `${COMPANY.name} company software ai engineering technology`),
        ),
        chunk: {
            id: 'company:overview',
            source: 'company',
            content: COMPANY.description,
        },
    });

    // Founder chunk - richer haystack with all name variants and role synonyms.
    const founderNames = COMPANY.founders.map((f) => f.name).join(' ');
    const founderRoles = COMPANY.founders.map((f) => f.role).join(' ');
    const founderHaystack = `founder founders founded ceo cio co-founder leadership team ${founderNames} ${founderRoles} ${COMPANY.name}`;

    chunks.push({
        score: Math.max(
            tokenOverlapScore(query, founderHaystack),
            // Direct name matching - if a founder's name appears in the query, score highly.
            ...COMPANY.founders.map((f) =>
                normalise(query).includes(normalise(f.name.split(' ')[0])) ? 0.9 : 0,
            ),
        ),
        chunk: {
            id: 'company:founders',
            source: 'company',
            content:
                `${COMPANY.name} was founded by:\n` +
                COMPANY.founders.map((f) => `• ${f.name} - ${f.role}`).join('\n'),
        },
    });

    chunks.push({
        score: Math.max(
            tokenOverlapScore(query, `based located headquarters office ${COMPANY.location.city} ${COMPANY.location.state} ${COMPANY.location.country} india`),
            tokenOverlapScore(query, COMPANY.location.city),
        ),
        chunk: {
            id: 'company:location',
            source: 'company',
            content: `${COMPANY.name} is based in ${COMPANY.location.city}, ${COMPANY.location.state}, ${COMPANY.location.country}.`,
        },
    });

    // ── Service-level chunks ─────────────────────────────────────────────────

    for (const service of SERVICES) {
        const haystack = [service.name, service.shortDescription, ...service.capabilities].join(' ');
        chunks.push({
            score: Math.max(
                tokenOverlapScore(query, service.name),
                tokenOverlapScore(query, haystack),
            ),
            chunk: {
                id: `service:${service.id}`,
                source: 'services',
                content: `${service.name}: ${service.shortDescription}\nCapabilities: ${service.capabilities.join(', ')}.`,
            },
        });
    }

    // ── FAQ chunks ───────────────────────────────────────────────────────────

    for (const item of FAQ_ITEMS) {
        // Question text is a stronger signal than answer prose.
        // Weighting: question = 2×, answer = 1×, combined max.
        const questionScore = tokenOverlapScore(query, item.question);
        const answerScore = tokenOverlapScore(query, item.answer);
        // Weighted blend: question match worth 2×, answer match worth 1×.
        // Cap at 1.0 to stay in [0,1].
        const score = Math.min(1, (questionScore * 2 + answerScore) / 2);

        chunks.push({
            score,
            chunk: {
                id: `faq:${item.question}`,
                source: 'faq',
                content: `Q: ${item.question}\nA: ${item.answer}`,
            },
        });
    }

    // ── Glossary chunks ──────────────────────────────────────────────────────

    for (const entry of GLOSSARY) {
        chunks.push({
            score: Math.max(
                tokenOverlapScore(query, entry.term),
                tokenOverlapScore(query, entry.definition),
            ),
            chunk: {
                id: `glossary:${entry.term}`,
                source: 'glossary',
                content: `${entry.term}: ${entry.definition}`,
            },
        });
    }

    return chunks
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry) => ({ ...entry.chunk, score: entry.score }));
}


// ─────────────────────────────────────────────────────────────────────────────
// The IntelligenceProvider contract
// ─────────────────────────────────────────────────────────────────────────────

/** Stable id for this provider. */
export const KNOWLEDGE_PROVIDER_ID: ProviderId = 'knowledge';

/**
 * Compose a natural-language answer from the best retrieved knowledge chunk.
 *
 * The Knowledge Provider does NOT generate prose from scratch. It either:
 *   - returns the canonical FAQ answer verbatim, or
 *   - returns the retrieved fact with a light, fixed framing.
 *
 * If nothing relevant was retrieved, it returns an empty result so the router
 * can fall back to a generative provider.
 */
function composeAnswer(request: ProviderRequest): ProviderResult {
    const retrieved = retrieveKnowledge(request.query);
    const best = retrieved[0];

    if (!best || (best.score ?? 0) < KNOWLEDGE_MIN_SCORE) {
        // Insufficient deterministic knowledge - signal the engine to escalate.
        return { content: '', finishReason: 'no-confident-match' };
    }

    // FAQ matches are answered verbatim - already customer-ready prose.
    if (best.source === 'faq') {
        const faq = FAQ_ITEMS.find((item) => `faq:${item.question}` === best.id);
        if (faq) {
            return {
                content: faq.answer,
                finishReason: 'stop',
            };
        }
    }

    // Other sources are returned with a light, fixed framing.
    return {
        content: best.content,
        finishReason: 'stop',
    };
}

/** Minimum relevance score required for the knowledge provider to answer. */
export const KNOWLEDGE_MIN_SCORE = 0.5;

/**
 * The Knowledge Provider instance. Implements IntelligenceProvider.
 */
export const knowledgeProvider: IntelligenceProvider = {
    id: KNOWLEDGE_PROVIDER_ID,
    name: 'MergeX Knowledge Layer',
    isAvailable: () => true, // always available - pure local data
    generate: (request: ProviderRequest) => Promise.resolve(composeAnswer(request)),
};

/**
 * Factory kept for symmetry with other providers and to match the registry
 * pattern expected by the engine.
 */
export function createKnowledgeProvider(): IntelligenceProvider {
    return knowledgeProvider;
}
