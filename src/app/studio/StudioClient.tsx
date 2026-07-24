'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules';
import { useGlobalVideoObserver } from '@/lib/videoObserver';
import { cloudinaryVideo, cloudinaryImage } from '@/lib/cloudinary';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

// How Studio Works Card Data
const HOW_IT_WORKS = [
  {
    id: '01',
    heading: 'Pre-production',
    copy: 'Every production begins with strategy. We define the concept, write the script, design storyboards, plan shots, and build AI visual references before production begins.',
    tags: ['storyboard frames', 'script pages', 'moodboards', 'concept sketches', 'AI references'],
    glowColor: 'rgba(168, 85, 247, 0.15)',
  },
  {
    id: '02',
    heading: 'Production',
    copy: 'Ideas become visuals. Using AI tools, motion systems, 3D workflows, and digital production pipelines, we create commercials without the limitations of traditional production.',
    tags: ['AI video generation', 'product renders', 'motion graphics', 'lighting', 'compositing'],
    glowColor: 'rgba(59, 130, 246, 0.15)',
  },
  {
    id: '03',
    heading: 'Post-production',
    copy: 'Every frame is refined through editing, sound, color, visual effects, and motion finishing before delivery.',
    tags: ['editing timeline', 'color grading', 'audio waveform', 'export screen'],
    glowColor: 'rgba(249, 115, 22, 0.15)',
  },
];

// Media items for the carousel
const CAROUSEL_MEDIA = [
  { id: 'mockups/labs/portfolio/ad', alt: 'Apple Product Film', type: 'video', poster: '/mockups/labs/gallery/sara-10.webp' },
  { id: 'mockups/labs/gallery/sara-2', alt: 'AI Model Portrait', type: 'image', poster: '/mockups/labs/gallery/sara-2.webp' },
  { id: 'mockups/labs/portfolio/whatsapp-campaign', alt: 'Neidhal FC Launch', type: 'video', poster: '/mockups/labs/gallery/sara-6.webp' },
  { id: 'mockups/labs/gallery/sara-4', alt: 'AI Concept Art', type: 'image', poster: '/mockups/labs/gallery/sara-4.webp' },
  { id: 'mockups/labs/portfolio/mountain-dew', alt: 'Thai Chips', type: 'video', poster: '/mockups/labs/gallery/sara-1.webp' },
  { id: 'mockups/labs/gallery/sara-5', alt: 'Procedural Textures', type: 'image', poster: '/mockups/labs/gallery/sara-5.webp' },
  { id: 'mockups/labs/gallery/sara-8', alt: 'Cinematic Visual', type: 'image', poster: '/mockups/labs/gallery/sara-8.webp' },
  { id: 'mockups/labs/gallery/sara-9', alt: 'AI Concept Render', type: 'image', poster: '/mockups/labs/gallery/sara-9.webp' },
] as const;

interface OptimizedMediaCardProps {
  id: string;
  type: 'video' | 'image';
  alt: string;
  poster: string;
  isActive: boolean;
  onClick: () => void;
}

function OptimizedMediaCard({ id, type, alt, poster, isActive, onClick }: OptimizedMediaCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const shouldPlay = isActive || isHovered;

  useEffect(() => {
    if (type !== 'video' || !videoRef.current) return;
    if (shouldPlay) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [shouldPlay, type]);

  const localSrc = type === 'video'
    ? `/${id}.mp4`
    : poster;

  return (
    <div
      className="w-full h-full rounded-[1.5rem] overflow-hidden bg-zinc-950 border border-white/10 hover:border-white/30 transition-all duration-500 shadow-2xl cursor-pointer relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {type === 'video' ? (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
        >
          <source src={localSrc} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={poster}
          width={360}
          height={480}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt={alt}
          unoptimized
        />
      )}

      {/* Subtle overlay gradient on hover for aesthetic detail */}
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 z-20" />

      {/* Play indicator overlay on non-active video slides */}
      {type === 'video' && !shouldPlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/5 transition-all duration-300 z-10">
          <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play size={14} fill="currentColor" />
          </div>
        </div>
      )}
    </div>
  );
}

// Main Client Component
export default function StudioClient() {
  const pageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Dynamically force dark mode on html tag on mount and revert on unmount
  useEffect(() => {
    const html = document.documentElement;
    const hasDark = html.classList.contains('dark');
    html.classList.add('dark');
    return () => {
      if (!hasDark) {
        html.classList.remove('dark');
      }
    };
  }, []);

  const hasInitializedRef = useRef(false);

  // Guaranteed safety fallback to dismiss loading screen even if video metadata is delayed or blocked
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const initAnimations = () => {
    setIsLoading(false);
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const video = videoRef.current;
    if (video) {
      gsap.to(video, {
        currentTime: video.duration || 1,
        ease: 'none',
        scrollTrigger: {
          trigger: pageRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.1,
        },
      });
    }

    if (heroTextRef.current) {
      gsap.to(heroTextRef.current, {
        opacity: 0,
        y: -80,
        ease: 'power1.inOut',
        scrollTrigger: {
          trigger: heroTextRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  };

  // Scroll scrubbing video trigger setup
  useGSAP(
    () => {
      const video = videoRef.current;
      if (!video) return;

      if (video.readyState >= 1) {
        initAnimations();
      } else {
        video.addEventListener('loadedmetadata', initAnimations);
        video.addEventListener('loadeddata', initAnimations);
        video.addEventListener('canplay', initAnimations);
        video.addEventListener('error', initAnimations);
        video.load();
      }

      return () => {
        video.removeEventListener('loadedmetadata', initAnimations);
        video.removeEventListener('loadeddata', initAnimations);
        video.removeEventListener('canplay', initAnimations);
        video.removeEventListener('error', initAnimations);
      };
    },
    { scope: pageRef }
  );

  return (
    <div ref={pageRef} className="relative dark text-white min-h-screen font-body selection:bg-purple-500/30 selection:text-white bg-transparent">
      {/* ── FIXED BACKGROUND VIDEO LAYER ── */}
      <div className="fixed inset-0 w-full h-screen overflow-hidden pointer-events-none z-0 bg-[#080808]">
        <video
          ref={videoRef}
          src="/mockups/labs/portfolio/mountain-dew.mp4"
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={initAnimations}
          onCanPlay={initAnimations}
          onError={initAnimations}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Cinematic dark gradients for maximum video visibility and high overlay readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#080808] pointer-events-none"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span className="text-xs uppercase tracking-widest text-white/50 font-questrial">Loading Environment...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SCROLLABLE SECTIONS LAYER ── */}
      <div className="relative z-10 w-full">
        
        {/* SECTION 1: HERO OVERLAY */}
        <section ref={heroTextRef} className="relative w-full h-screen flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-questrial font-bold tracking-tight text-white max-w-5xl leading-[1.2]">
            AI-powered creative production<br className="hidden sm:inline" /> for brands that want to launch differently.
          </h1>

          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 animate-pulse">
            <span className="text-[9px] uppercase tracking-[0.25em] font-questrial">Scroll to explore</span>
            <span className="text-sm">&darr;</span>
          </div>
        </section>

        {/* SECTION 2: HOW STUDIO WORKS (GLASSMORPHIC CARDS OVER BG) */}
        <section className="relative py-24 md:py-32 px-6 md:px-12 border-t border-white/5 bg-transparent">
          <div className="max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="max-w-2xl mb-16 md:mb-20">
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-purple-400 block mb-3 font-questrial">
                Our Pipeline
              </span>
              <h2 className="text-3xl md:text-5xl font-questrial font-bold tracking-tight text-white mb-6">
                How Studio Works
              </h2>
            </div>

            {/* Glassmorphic Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {HOW_IT_WORKS.map((stage) => (
                <div
                  key={stage.id}
                  className="group relative bg-black/60 backdrop-blur-md border border-white/10 hover:border-white/25 hover:bg-black/80 transition-all duration-500 rounded-3xl p-8 flex flex-col justify-between min-h-[360px] overflow-hidden"
                >
                  {/* Stage Floating Number */}
                  <div className="absolute top-6 right-8 text-4xl md:text-5xl font-bold font-questrial text-white/5 tracking-tighter select-none">
                    {stage.id}
                  </div>

                  {/* Content */}
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 block mb-4 font-questrial">
                      Stage {stage.id}
                    </span>
                    <h3 className="text-xl md:text-2xl font-questrial font-bold text-white mb-4">
                      {stage.heading}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed font-light mb-8">
                      {stage.copy}
                    </p>
                  </div>

                  {/* Bottom Tags */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                    {stage.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-medium tracking-wider uppercase bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-zinc-300 transition-colors duration-300 group-hover:border-white/20 group-hover:bg-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Hover Radial Background Glow */}
                  <div
                    className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${stage.glowColor} 0%, transparent 65%)`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: CREATIVE PRODUCTIONS */}
        <section className="relative py-24 md:py-32 border-t border-white/5 bg-transparent overflow-hidden">
          {(() => {
            const swiperStyles = `
              .studio-swiper {
                  width: 100%;
                  padding-bottom: 50px;
              }
              
              .studio-swiper .swiper-slide {
                  background-position: center;
                  background-size: cover;
                  width: 300px;
                  overflow: visible !important;
              }
              @media (min-width: 768px) {
                  .studio-swiper .swiper-slide {
                      width: 360px;
                  }
              }
              
              .studio-swiper .swiper-slide > div {
                  transform-style: preserve-3d;
                  backface-visibility: hidden;
                  isolation: isolate;
                  will-change: transform;
                  clip-path: inset(0 round 1.5rem);
                  height: 480px;
              }
              
              .studio-swiper .swiper-3d .swiper-slide-shadow-left,
              .studio-swiper .swiper-3d .swiper-slide-shadow-right {
                  background-image: none;
              }

              .studio-swiper .swiper-pagination-bullet {
                  background: #ffffff;
                  opacity: 0.4;
              }

              .studio-swiper .swiper-pagination-bullet-active {
                  opacity: 1;
                  width: 24px;
                  border-radius: 4px;
              }
            `;
            return (
              <style dangerouslySetInnerHTML={{ __html: swiperStyles }} />
            );
          })()}

          {/* Header */}
          <div className="container mx-auto max-w-[1600px] px-6 md:px-12 mb-16 flex flex-col items-center text-center w-full">
            <h2 className="text-3xl md:text-5xl font-questrial font-bold tracking-tight text-white mb-6">
              Creative Productions
            </h2>
          </div>

          {/* Swiper Coverflow Carousel */}
          <div className="relative w-full overflow-hidden px-0">
            <Swiper
              className="studio-swiper"
              spaceBetween={50}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
              }}
              effect="coverflow"
              grabCursor={true}
              centeredSlides={true}
              loop={true}
              slidesPerView="auto"
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 80,
                modifier: 2.0,
              }}
              pagination={{ clickable: true }}
              modules={[EffectCoverflow, Autoplay, Pagination]}
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            >
              {CAROUSEL_MEDIA.map((item, index) => {
                const isWithinRange = index === activeIndex;
                const localSrc = item.type === 'video'
                  ? `/${item.id}.mp4`
                  : item.poster;
                return (
                  <SwiperSlide key={`slide-${index}`}>
                    <OptimizedMediaCard
                      id={item.id}
                      type={item.type}
                      alt={item.alt}
                      poster={item.poster}
                      isActive={isWithinRange}
                      onClick={() => {
                        if (item.type === 'video') {
                          setActiveVideo(localSrc);
                        }
                      }}
                    />
                  </SwiperSlide>
                );
              })}
              {CAROUSEL_MEDIA.map((item, index) => {
                const isWithinRange = index === activeIndex;
                const localSrc = item.type === 'video'
                  ? `/${item.id}.mp4`
                  : item.poster;
                return (
                  <SwiperSlide key={`slide-dup-${index}`}>
                    <OptimizedMediaCard
                      id={item.id}
                      type={item.type}
                      alt={item.alt}
                      poster={item.poster}
                      isActive={isWithinRange}
                      onClick={() => {
                        if (item.type === 'video') {
                          setActiveVideo(localSrc);
                        }
                      }}
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </section>

        {/* SECTION 4: CTA */}
        <section className="relative py-32 px-6 md:px-12 border-t border-white/5 bg-transparent overflow-hidden">
          {/* Glow backdrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-6xl font-questrial font-bold tracking-tight text-white mb-6">
              Ready to create<br />something remarkable?
            </h2>
            <p className="text-sm md:text-base text-zinc-400 font-light max-w-xl mx-auto leading-relaxed mb-12">
              Whether it's a product launch, brand commercial, or AI-generated campaign, let's bring it to life.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-black font-semibold text-xs tracking-[0.15em] uppercase px-8 py-4 rounded-full hover:bg-zinc-200 transition-colors font-questrial"
              >
                Start a Production
              </Link>
              <Link
                href="/contact#booking-section"
                className="w-full sm:w-auto inline-flex items-center justify-center border border-white/20 bg-white/5 text-white font-semibold text-xs tracking-[0.15em] uppercase px-8 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-300 font-questrial group"
              >
                <span>Book a Conversation</span>
                <ArrowRight size={13} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

      </div>

      {/* ── FULL SCREEN CINEMA MODAL ── */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-8"
          >
            {/* Modal Closer Background */}
            <div className="absolute inset-0" onClick={() => setActiveVideo(null)} />

            {/* Video Box Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 z-10 shadow-2xl flex items-center justify-center"
            >
              <video
                src={activeVideo}
                autoPlay
                controls
                playsInline
                muted={isMuted}
                className="w-full h-full object-contain"
              />

              {/* Top Controls Overlay */}
              <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
                {/* Audio Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2.5 rounded-full bg-black/60 text-white/80 border border-white/10 hover:bg-white hover:text-black hover:border-white transition-all duration-200"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setActiveVideo(null)}
                  className="p-2.5 rounded-full bg-black/60 text-white/80 border border-white/10 hover:bg-white hover:text-black hover:border-white transition-all duration-200"
                  title="Close player"
                >
                  <X size={15} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
