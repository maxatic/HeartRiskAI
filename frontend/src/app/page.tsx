'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/auth-context';

function LandingContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <header className="bg-white text-center py-20 px-5">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-primary leading-tight mb-5">
            Understand Your Heart Attack Risk with an Advanced Machine Analysis
          </h1>
          <div className="inline-block bg-red-100 text-red-500 px-4 py-2 rounded-full text-sm font-semibold mb-5">
            Machine-based Heart Attack Risk Prediction
          </div>
          <p className="text-lg text-slate-500 mb-10 leading-relaxed">
            Our machine-based system reviews your health information and provides a clear, data-driven estimate of your heart attack risk — fast, simple, and easy to understand.
          </p>
          
          <div className="flex justify-center gap-4 mb-16">
            <Link href="/predict" className="btn-primary">
              Start Free Assessment
            </Link>
            <a href="#how-it-works" className="btn-secondary">
              Learn More
            </a>
          </div>
          
          <div className="flex justify-around max-w-lg mx-auto">
            <div className="text-center">
              <h2 className="text-5xl font-bold text-primary">98%</h2>
              <p className="text-slate-500 text-sm mt-1">Prediction Accuracy</p>
            </div>
            <div className="text-center">
              <h2 className="text-5xl font-bold text-primary">24/7</h2>
              <p className="text-slate-500 text-sm mt-1">Available Anytime</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-5 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">How It Works</h2>
            <p className="text-slate-500">Simple, fast, and accurate health risk assessment</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl text-center border border-slate-100 shadow-sm">
              <div className="w-14 h-14 bg-blue-100 text-accent-blue rounded-full flex items-center justify-center text-2xl mx-auto mb-5">
                <i className="fas fa-bolt"></i>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-3">Enter Health Data</h3>
              <p className="text-slate-500 text-sm">
                Input your health parameters including systolic blood pressure, diastolic blood pressure and blood sugar.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl text-center border border-slate-100 shadow-sm">
              <div className="w-14 h-14 bg-purple-100 text-accent-purple rounded-full flex items-center justify-center text-2xl mx-auto mb-5">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-3">Machine Analysis</h3>
              <p className="text-slate-500 text-sm">
                Our machine system processes your inputs and calculates your heart attack risk using validated medical data.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl text-center border border-slate-100 shadow-sm">
              <div className="w-14 h-14 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-5">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-3">View Your Risk Score</h3>
              <p className="text-slate-500 text-sm">
                See a clear breakdown of your risk level in just a few seconds.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Choose */}
      <section className="py-20 px-5 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">Why Choose CardioGuard Assistant</h2>
            <p className="text-slate-500">Advanced technology meets healthcare expertise</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-5">
              <div className="text-accent-blue text-3xl">
                <i className="fas fa-medal"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary mb-1">Clinically Validated</h3>
                <p className="text-slate-500 text-sm">
                  Our model is trained on extensive medical datasets and validated by healthcare professionals.
                </p>
              </div>
            </div>
            
            <div className="flex gap-5">
              <div className="text-accent-blue text-3xl">
                <i className="fas fa-users"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary mb-1">Trusted by Thousands</h3>
                <p className="text-slate-500 text-sm">
                  Join thousands of users who trust CardioGuard AI for their health monitoring.
                </p>
              </div>
            </div>
            
            <div className="flex gap-5">
              <div className="text-accent-blue text-3xl">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary mb-1">Privacy Protected</h3>
                <p className="text-slate-500 text-sm">
                  Your health data is encrypted and never shared with third parties.
                </p>
              </div>
            </div>
            
            <div className="flex gap-5">
              <div className="text-accent-blue text-3xl">
                <i className="fas fa-clock"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary mb-1">Fast & Simple</h3>
                <p className="text-slate-500 text-sm">
                  Get your risk score in minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="mx-5 my-10">
        <div className="bg-gradient-to-br from-accent-blue to-accent-purple py-20 px-8 rounded-3xl text-center text-white max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-3">Ready to Take Control of Your Heart Health?</h2>
          <p className="text-lg opacity-90 mb-8">Get your personalized risk assessment in just 5 minutes</p>
          <Link href="/predict" className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-bold hover:bg-slate-100 transition-colors">
            Calculate My Risk Now
          </Link>
        </div>
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
