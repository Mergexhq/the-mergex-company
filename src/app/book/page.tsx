import type { Metadata } from 'next';
import CalEmbed from '@/components/ui/CalEmbed';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mergex.in';

export const metadata: Metadata = {
    title: 'Book a Call - MergeX',
    description:
        'Schedule a discovery call with MergeX founders to discuss your custom software, AI systems, or creative production needs.',
    alternates: {
        canonical: `${siteUrl}/book`,
    },
    openGraph: {
        title: 'Book a Call - MergeX',
        description:
            'Schedule a discovery call with MergeX founders to discuss your custom software, AI systems, or creative production needs.',
        url: `${siteUrl}/book`,
    },
};

export default function BookPage() {
    return (
        <main className="bg-[var(--bg-primary)] min-h-screen pt-28 pb-16 text-[var(--text-primary)] font-body">
            <div className="container mx-auto max-w-[1200px] px-6 md:px-8">
                <div className="text-center max-w-2xl mx-auto mb-10 space-y-4">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] block font-questrial">
                        Schedule a Discovery Call
                    </span>
                    <h1 className="text-3xl md:text-5xl font-questrial font-bold tracking-tight text-[var(--text-primary)]">
                        Let&apos;s build something exceptional.
                    </h1>
                    <p className="text-base md:text-lg text-[var(--text-secondary)] font-light leading-relaxed">
                        Select a time below for a 30-minute discovery conversation with our team.
                    </p>
                </div>

                <div className="w-full rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-[var(--bg-secondary)] shadow-xl p-4 md:p-8 min-h-[700px]">
                    <CalEmbed namespace="meet" calLink="mergex/meet" />
                </div>
            </div>
        </main>
    );
}
