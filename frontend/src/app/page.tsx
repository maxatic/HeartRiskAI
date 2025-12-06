'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/auth-context';
import { useEffect, useRef, useState } from 'react';

// Custom hook for scroll animations
function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Animated counter component
function AnimatedCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useScrollAnimation();

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, target, duration]);

  return (
    <span ref={ref} className="stat-number">
      {count}{suffix}
    </span>
  );
}

// Animated Section wrapper
function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div 
      ref={ref} 
      className={`${className} transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function LandingContent() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 5,  // Reduced from 20 to 5
        y: (e.clientY / window.innerHeight - 0.5) * 5,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth interpolation for ultra-slow movement
  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;
    
    const animate = () => {
      setSmoothPosition(prev => ({
        x: lerp(prev.x, mousePosition.x, 0.02),  // Very slow interpolation (0.02 = 2% per frame)
        y: lerp(prev.y, mousePosition.y, 0.02),
      }));
    };
    
    const interval = setInterval(animate, 16); // ~60fps
    return () => clearInterval(interval);
  }, [mousePosition]);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center gradient-mesh overflow-hidden">
        
        {/* Animated background shapes - ultra smooth parallax */}
        <div 
          className="floating-shape w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 shape-blob -top-20 -left-20 transition-transform duration-[3000ms] ease-out"
          style={{ transform: `translate(${smoothPosition.x}px, ${smoothPosition.y}px)` }}
        />
        <div 
          className="floating-shape w-80 h-80 bg-gradient-to-br from-purple-400/20 to-rose-400/20 shape-blob top-1/4 -right-20 animate-float-slow transition-transform duration-[3000ms] ease-out"
          style={{ transform: `translate(${-smoothPosition.x * 0.7}px, ${-smoothPosition.y * 0.7}px)` }}
        />
        <div 
          className="floating-shape w-64 h-64 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 shape-blob bottom-20 left-1/4 animate-float-reverse transition-transform duration-[3000ms] ease-out"
          style={{ transform: `translate(${smoothPosition.x * 0.5}px, ${smoothPosition.y * 0.5}px)` }}
        />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center px-5 py-20">
          {/* Animated badge */}
          <div className="animate-slide-down opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/50 text-blue-600 px-5 py-2.5 rounded-full text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              AI-Powered Heart Risk Analysis
            </div>
          </div>
          
          {/* Main heading with gradient */}
          <h1 className="animate-slide-up opacity-0 text-5xl md:text-7xl font-bold leading-tight mb-6" style={{ animationDelay: '0.4s', animationFillMode: 'forwards', fontFamily: "'Space Grotesk', sans-serif" }}>
            Protect Your Heart with{' '}
            <span className="text-gradient">Intelligent</span>{' '}
            Risk Analysis
          </h1>
          
          {/* Animated heart icon */}
          <div className="animate-fade-in opacity-0 my-8" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-red-500 animate-pulse-glow">
              <svg className="w-10 h-10 text-white animate-heartbeat" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
          
          {/* Subtitle */}
          <p className="animate-slide-up opacity-0 text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
            Our advanced machine learning system analyzes your health data to provide 
            accurate, personalized heart attack risk assessments in seconds.
          </p>
          
          {/* CTA Buttons */}
          <div className="animate-scale-in opacity-0 flex flex-col sm:flex-row justify-center gap-4 mb-20" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
            <Link href="/predict" className="btn-primary group">
              <span className="relative z-10 flex items-center gap-2">
                Start Free Assessment
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <a href="#how-it-works" className="btn-secondary group">
              <span className="flex items-center gap-2">
                Learn How It Works
                <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </span>
            </a>
          </div>
          
          {/* Stats */}
          <div className="animate-slide-up opacity-0 grid grid-cols-3 gap-8 max-w-2xl mx-auto" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold">
                <AnimatedCounter target={98} suffix="%" />
              </div>
              <p className="text-slate-500 text-sm mt-2">Accuracy Rate</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold">
                <AnimatedCounter target={50} suffix="K+" />
              </div>
              <p className="text-slate-500 text-sm mt-2">Assessments Done</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold">
                <AnimatedCounter target={24} suffix="/7" />
              </div>
              <p className="text-slate-500 text-sm mt-2">Always Available</p>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-soft">
          <div className="w-8 h-12 rounded-full border-2 border-slate-300 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-slate-400 rounded-full animate-bounce" />
          </div>
        </div>
      </header>
      
      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-5 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedSection className="text-center mb-20">
            <span className="inline-block text-blue-500 font-semibold text-sm tracking-wider uppercase mb-4">Simple Process</span>
            <h2 className="section-title text-gradient">How It Works</h2>
            <p className="section-subtitle">Three simple steps to understand your heart health</p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: 'Enter Your Data',
                description: 'Input your health metrics including blood pressure, heart rate, and other vital signs.',
                color: 'from-blue-500 to-cyan-500',
                bgColor: 'bg-blue-50',
              },
              {
                step: '02',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'AI Analysis',
                description: 'Our machine learning model processes your data using advanced algorithms trained on medical datasets.',
                color: 'from-purple-500 to-pink-500',
                bgColor: 'bg-purple-50',
              },
              {
                step: '03',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Get Results',
                description: 'Receive a comprehensive risk assessment with personalized recommendations instantly.',
                color: 'from-emerald-500 to-teal-500',
                bgColor: 'bg-emerald-50',
              },
            ].map((item, index) => (
              <AnimatedSection key={index} delay={index * 200}>
                <div className="card-hover group relative">
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br shadow-lg flex items-center justify-center text-white font-bold text-lg"
                       style={{ background: `linear-gradient(135deg, var(--accent-blue), var(--accent-purple))` }}>
                    {item.step}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 ${item.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={`bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                      {item.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{item.description}</p>
                  
                  {/* Connecting line (hidden on mobile) */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-slate-200 to-transparent" />
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-32 px-5 gradient-mesh relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <span className="inline-block text-purple-500 font-semibold text-sm tracking-wider uppercase mb-4">Why CardioGuard</span>
            <h2 className="section-title">Advanced Technology,<br/><span className="text-gradient">Trusted Results</span></h2>
            <p className="section-subtitle">Built with cutting-edge AI and validated by healthcare professionals</p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Clinically Validated',
                description: 'Trained on extensive Kaggle medical datasets with healthcare professional validation.',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: 'Privacy Protected',
                description: 'Your health data is encrypted and never shared with third parties.',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Instant Results',
                description: 'Get your comprehensive risk assessment in under 30 seconds.',
                gradient: 'from-amber-500 to-orange-500',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: 'Trusted by Many',
                description: 'Join thousands of users who trust CardioGuard for health monitoring.',
                gradient: 'from-emerald-500 to-teal-500',
              },
            ].map((feature, index) => (
              <AnimatedSection key={index} delay={index * 150}>
                <div className="glass rounded-2xl p-6 hover-lift group">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonial / Social Proof */}
      <section className="py-32 px-5 bg-white">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-rose-500/10 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-2xl font-medium text-slate-700 mb-6 leading-relaxed">
                  &ldquo;CardioGuard helped me understand my heart health risks before they became serious. 
                  The assessment was quick, accurate, and the recommendations were invaluable.&rdquo;
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                    JD
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-primary">John Doe</p>
                    <p className="text-sm text-slate-500">Verified User</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-5">
        <AnimatedSection>
          <div className="gradient-cta py-24 px-8 rounded-3xl text-center text-white max-w-6xl mx-auto relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float-reverse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-glow" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Ready to Take Control?
              </h2>
              <p className="text-xl opacity-90 mb-10 max-w-xl mx-auto">
                Get your personalized heart risk assessment in just a few minutes. It&apos;s free, fast, and could save your life.
              </p>
              <Link 
                href="/predict" 
                className="inline-flex items-center gap-3 bg-white text-primary px-10 py-5 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                Start Your Free Assessment
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>
      
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <LandingContent />
    </AuthProvider>
  );
}
