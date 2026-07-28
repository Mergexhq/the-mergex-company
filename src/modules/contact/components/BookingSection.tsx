'use client';

import { useState } from 'react';
import { ArrowRight, ChevronDown, ExternalLink } from 'lucide-react';
import CalEmbed from '@/components/ui/CalEmbed';

interface BookingSectionProps {
    calNamespace?: string;
    calLink?: string;
}

export function BookingSection({
    calNamespace = 'meet',
    calLink = 'mergex/meet',
}: BookingSectionProps) {
    const [showEmbed, setShowEmbed] = useState(false);

    return (
        <section id="booking-section" className="bg-[var(--bg-primary)] pt-0 pb-16 relative overflow-hidden z-20">
            <div className="container mx-auto max-w-[1400px] px-6 md:px-8">
                {/* Taller Aspect Ratio Card on Mobile, dynamic height on desktop when expanded */}
                <div className="relative w-full rounded-[16px] overflow-hidden bg-[var(--bg-secondary)] border border-black/5 dark:border-white/5 flex flex-col justify-between p-8 md:p-12 lg:p-16 shadow-md hover:shadow-lg transition-all duration-300">
                    {/* Mobile Background Image Layer */}
                    {!showEmbed && (
                        <div
                            className="absolute inset-0 z-0 bg-no-repeat bg-bottom md:hidden"
                            style={{
                                backgroundImage: "url('/background/contact/schedule-mobile.webp')",
                                backgroundSize: 'cover',
                            }}
                        />
                    )}

                    {/* Desktop Background Image Layer */}
                    {!showEmbed && (
                        <div
                            className="absolute inset-0 z-0 bg-no-repeat bg-bottom hidden md:block"
                            style={{
                                backgroundImage: "url('/background/contact/schedule.webp')",
                                backgroundSize: 'cover',
                            }}
                        />
                    )}

                    {/* Content Container */}
                    <div className="relative z-10 ml-auto w-full h-full flex flex-col justify-between items-start gap-8">
                        {/* Header & Action Button Row */}
                        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-4 pt-2 max-w-xl">
                                <h3 className="text-3xl md:text-4xl lg:text-5xl font-questrial font-bold tracking-tight text-[var(--text-primary)] leading-tight">
                                    Prefer a conversation?
                                </h3>
                                <p className="text-base md:text-lg lg:text-xl text-[var(--text-secondary)] font-light leading-relaxed">
                                    Book a discovery call and let&apos;s discuss your project.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                                <button
                                    type="button"
                                    onClick={() => setShowEmbed((prev) => !prev)}
                                    className="inline-flex w-full md:w-auto items-center justify-center gap-3 rounded-full border border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-transparent hover:text-[var(--text-primary)] px-6 py-3 text-xs md:px-8 md:py-4 md:text-base font-semibold tracking-wide active:scale-[0.98] transition-all cursor-pointer font-questrial"
                                >
                                    {showEmbed ? 'Hide Calendar' : 'Book a Discovery Call'}
                                    {showEmbed ? (
                                        <ChevronDown className="w-4 h-4 transition-transform rotate-180" />
                                    ) : (
                                        <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Embedded Cal.com Calendar */}
                        {showEmbed && (
                            <div className="w-full mt-4 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-[var(--bg-primary)] p-4 md:p-6 shadow-inner min-h-[650px]">
                                <CalEmbed namespace={calNamespace} calLink={calLink} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
