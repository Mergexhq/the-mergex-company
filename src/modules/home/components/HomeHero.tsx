'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './HomeHero.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function HomeHero() {
  const wrapperRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLElement>(null);

  // Staggered fade-in for text elements on mount
  useEffect(() => {
    const items = wrapperRef.current?.querySelectorAll('.hh-animate');
    items?.forEach((el, i) => {
      (el as HTMLElement).style.animationDelay = `${0.2 + i * 0.18}s`;
    });
  }, []);

  // GSAP ScrollTrigger timeline transition
  useGSAP(
    () => {
      if (!wrapperRef.current || !heroRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: '+=150%',
          pin: heroRef.current,
          scrub: 0.15,
          anticipatePin: 1,
        },
      });

      // 1. Hero main content moves up and fades out
      tl.to(
        contentRef.current,
        {
          y: -40,
          opacity: 0,
          pointerEvents: 'none',
          duration: 0.25,
          ease: 'power1.inOut',
        },
        0.15
      );

      // 2. Darkening overlay intensifies slightly for readability
      tl.to(
        overlayRef.current,
        {
          opacity: 0.65,
          duration: 0.4,
          ease: 'power1.inOut',
        },
        0.15
      );

      // 3. About Glimpse section emerges from below
      tl.fromTo(
        aboutRef.current,
        {
          y: 70,
          opacity: 0,
          pointerEvents: 'none',
        },
        {
          y: 0,
          opacity: 1,
          pointerEvents: 'auto',
          duration: 0.35,
          ease: 'power1.out',
        },
        0.4
      );

      // Brief hold at the end
      tl.to({}, { duration: 0.15 });
    },
    { scope: wrapperRef }
  );

  return (
    <section ref={wrapperRef} className="home-hero-scroll-wrapper">
      {/* ── HERO LAYER ── */}
      <div ref={heroRef} className="home-hero">
        {/* Real background image layer for GSAP scaling */}
        <div ref={bgRef} className="home-hero-bg" />

        {/* Noise grain overlay */}
        <div className="hh-noise" />

        {/* Scroll-driven dark overlay */}
        <div ref={overlayRef} className="hh-overlay opacity-0" />

        {/* ── HERO CONTENT ── */}
        <div ref={contentRef} className="hh-content">
          <div className="hh-push-up flex flex-col items-start">
            <div className="hh-top-content">
              <h1 className="hh-heading">
                <span className="hh-heading-line hh-animate">Engineering the systems</span>
                <span className="hh-heading-accent hh-animate">behind better businesses.</span>
              </h1>
            </div>
          </div>

          <div ref={subRef} className="hh-bottom-content">
            <p className="hh-sub hh-animate">
              MergeX brings together software, AI, and creative production to help businesses build better digital experiences and smarter ways of working.
            </p>
            <div className="hh-cta-wrapper hh-animate">
              <a href="#works" className="hh-cta-button">
                <span className="hh-cta-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
                <span className="hh-cta-text">Get Started</span>
              </a>
            </div>
          </div>
        </div>

        {/* ── ABOUT GLIMPSE SECTION (inside pinned layer) ── */}
        <section ref={aboutRef} className="about-section opacity-0 pointer-events-none">

          {/* Vertical alignment wrapper to center details */}
          <div className="flex-1 flex items-center justify-center w-full -translate-y-8">
            <div className="about-inner">
              {/* Left Column */}
              <div className="about-left">
                <p className="about-eyebrow">Who We Are</p>
                <h2 className="about-statement">
                  Intelligent software.<br />
                  Thoughtful engineering.
                </h2>
              </div>
              {/* Right Column */}
              <div className="about-right">
                <p className="about-body">
                  We design and build custom software, AI integrations, and high-impact creative productions that solve real problems. No templates, no packages-just high-quality engineering tailored to your objectives.
                </p>
              </div>
            </div>
          </div>

        </section>
      </div>
    </section>
  );
}
