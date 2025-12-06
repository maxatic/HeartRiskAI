'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PredictionResult } from '@/lib/api';
import { AuthProvider } from '@/lib/auth-context';
import dynamic from 'next/dynamic';

// Dynamically import Chart.js components to avoid SSR issues
const RiskCharts = dynamic(() => import('@/components/RiskCharts'), { ssr: false });

function ResultContent() {
  const router = useRouter();
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('predictionResult');
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else {
      router.push('/predict');
    }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading results...</div>
      </div>
    );
  }

  const getRiskBannerClasses = () => {
    switch (result.risk_class) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'safe':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const getRiskIcon = () => {
    switch (result.risk_class) {
      case 'critical':
        return (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case 'warning':
        return (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      default:
        return (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
    }
  };

  const getFactorBarColor = (status: string) => {
    if (status.includes('High') || status.includes('Abnormal')) return 'bg-red-500';
    if (status.includes('Elevated') || status.includes('Moderate')) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getFactorBadgeColor = (status: string) => {
    if (status.includes('High') || status.includes('Abnormal')) return 'bg-red-100 text-red-600';
    if (status.includes('Elevated') || status.includes('Moderate')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-600';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 py-4">
        <div className="max-w-7xl mx-auto px-5 flex justify-between items-center">
          <Link href="/" className="flex items-center font-bold text-xl text-slate-800">
            <span className="text-red-500 mr-2">♡</span>
            CardioGuard Assistant
          </Link>
          <Link href="/" className="btn-secondary text-sm py-2 px-4">
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Your Risk Assessment Results</h1>
          <p className="text-slate-500 mt-1">Based on the health parameters you provided</p>
        </div>

        {/* Risk Banner */}
        <div className={`flex items-center p-8 rounded-xl border mb-8 ${getRiskBannerClasses()}`}>
          <div className="mr-8">
            {getRiskIcon()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{result.risk_level}</h2>
            <p className="opacity-90 mb-5">{result.recommendation}</p>
            <div className="flex items-center gap-4 max-w-xl">
              <span className="font-semibold text-sm">Risk Score</span>
              <div className="flex-1 h-3 bg-black/10 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-current transition-all duration-1000"
                  style={{ width: `${result.risk_score}%` }}
                ></div>
              </div>
              <span className="font-bold text-lg">{result.risk_score}%</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Risk Factors Analysis */}
          <div className="card lg:row-span-2">
            <div className="flex items-center gap-2 text-slate-500 mb-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              <h3 className="font-semibold text-slate-800">Risk Factors Analysis</h3>
            </div>
            <div className="space-y-6">
              {result.factors.map((factor, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-800">{factor.name}</span>
                    <span className="text-slate-500">{factor.value} - {factor.status}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full rounded-full ${getFactorBarColor(factor.status)}`}
                      style={{ width: `${(factor.score / factor.max) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getFactorBadgeColor(factor.status)}`}>
                      {factor.score > 0 ? `+${factor.score} pts` : '0 pts'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Health Metrics */}
          <div className="card">
            <div className="flex items-center gap-2 text-slate-500 mb-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              <h3 className="font-semibold text-slate-800">Your Health Metrics</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <label className="text-xs text-slate-500 block mb-1">Age</label>
                <div className="text-xl font-bold text-primary">{result.input_data.Age}</div>
                <div className="text-xs text-slate-400">years</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <label className="text-xs text-slate-500 block mb-1">Heart Rate</label>
                <div className="text-xl font-bold text-primary">{result.input_data['Heart rate']}</div>
                <div className="text-xs text-slate-400">bpm</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <label className="text-xs text-slate-500 block mb-1">Systolic BP</label>
                <div className="text-xl font-bold text-primary">{result.input_data['Systolic blood pressure']}</div>
                <div className="text-xs text-slate-400">mmHg</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <label className="text-xs text-slate-500 block mb-1">Diastolic BP</label>
                <div className="text-xl font-bold text-primary">{result.input_data['Diastolic blood pressure']}</div>
                <div className="text-xs text-slate-400">mmHg</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg col-span-2">
                <label className="text-xs text-slate-500 block mb-1">Blood Sugar</label>
                <div className="text-xl font-bold text-primary">{result.input_data['Blood sugar']}</div>
                <div className="text-xs text-slate-400">mg/dL</div>
              </div>
            </div>
          </div>

          {/* Risk Distribution Chart */}
          <div className="card">
            <div className="mb-5">
              <h3 className="font-semibold text-slate-800">Risk Distribution</h3>
            </div>
            <RiskCharts chartData={result.chart_data} riskScore={result.risk_score} />
          </div>
        </div>

        {/* Assessment History */}
        <div className="card mb-8">
          <div className="mb-5">
            <h3 className="font-semibold text-slate-800">Assessment Summary</h3>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <span className="text-slate-500 text-sm">
              📅 {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="text-slate-600 font-semibold">
              Risk Score <span className="text-red-500">{result.risk_score}/100</span>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-blue-50 rounded-xl p-8 flex flex-wrap gap-8 items-center justify-between">
          <div className="flex gap-5 flex-1 min-w-[300px]">
            <div className="w-12 h-12 bg-blue-100 text-accent-blue rounded-full flex items-center justify-center text-2xl flex-shrink-0">
              🩺
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-1">Need professional guidance?</h4>
              <p className="text-sm text-slate-500 mb-4">
                This assessment is for informational purposes only. For a comprehensive evaluation and personalized treatment plan, we recommend consulting with a qualified healthcare provider.
              </p>
              <a href="#" className="btn-primary inline-block text-sm">
                Find a Healthcare Provider
              </a>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Link href="/predict" className="btn-secondary">
              Take New Assessment
            </Link>
            <button onClick={() => window.print()} className="btn-secondary">
              Print Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <AuthProvider>
      <ResultContent />
    </AuthProvider>
  );
}

