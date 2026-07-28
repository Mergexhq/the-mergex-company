'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface BookingSectionProps {
    calNamespace?: string;
    calLink?: string;
}

export function BookingSection({
    calNamespace = 'meet',
    calLink = 'mergex/meet',
}: BookingSectionProps) {
    return (
        <section id="booking-section" className="bg-[var(--bg-primary)] pt-0 pb-16 relative overflow-hidden z-20">
            <div className="container mx-auto max-w-[1400px] px-6 md:px-8">
                {/* Taller Aspect Ratio Card with generous min-height */}
                <div className="relative w-full rounded-[20px] md:rounded-[24px] overflow-hidden bg-[var(--bg-secondary)] border border-black/5 dark:border-white/5 min-h-[440px] sm:min-h-[500px] md:min-h-[580px] lg:min-h-[640px] flex flex-col justify-between p-8 md:p-14 lg:p-16 shadow-md hover:shadow-lg transition-all duration-300 group">
                    {/* Mobile Background Image Layer */}
                    <div
                        className="absolute inset-0 z-0 bg-no-repeat bg-bottom md:hidden transition-transform duration-700 group-hover:scale-[1.02]"
                        style={{
                            backgroundImage: "url('/background/contact/schedule-mobile.webp')",
                            backgroundSize: 'cover',
                        }}
                    />

                    {/* Desktop Background Image Layer */}
                    <div
                        className="absolute inset-0 z-0 bg-no-repeat bg-bottom hidden md:block transition-transform duration-700 group-hover:scale-[1.02]"
                        style={{
                            backgroundImage: "url('/background/contact/schedule.webp')",
                            backgroundSize: 'cover',
                        }}
                    />

                    {/* Top Right Content: Title & Subtitle */}
                    <div className="relative z-10 w-full md:w-[50%] lg:w-[45%] md:ml-auto space-y-4 pt-2">
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-questrial font-bold tracking-tight text-[var(--text-primary)] leading-[1.15]">
                            Prefer a conversation?
                        </h3>
                        <p className="text-base md:text-lg lg:text-xl text-[var(--text-secondary)] font-light leading-relaxed">
                            Book a discovery call and let&apos;s discuss your project.
                        </p>
                    </div>

                    {/* Bottom Right Content: Action Button */}
                    <div className="relative z-10 w-full md:w-auto md:ml-auto pt-8 md:pt-0">
                        <Link
                            href="/book"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-full border border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-transparent hover:text-[var(--text-primary)] px-6 py-3.5 text-sm md:px-8 md:py-4 md:text-base font-semibold tracking-wide active:scale-[0.98] transition-all cursor-pointer font-questrial shadow-sm"
                        >
                            <span>Book a Discovery Call</span>
                            <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

