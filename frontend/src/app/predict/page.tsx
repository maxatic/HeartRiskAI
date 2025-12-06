'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { predictionApi, PredictionInput, PredictionResult } from '@/lib/api';
import { AuthProvider } from '@/lib/auth-context';

interface FormField {
  name: keyof PredictionInput;
  label: string;
  type: 'number' | 'select';
  placeholder?: string;
  helpText?: string;
  min?: number;
  max?: number;
  step?: string;
  options?: { value: number; label: string }[];
}

const formFields: FormField[] = [
  {
    name: 'age',
    label: 'Age',
    type: 'number',
    placeholder: '45',
    helpText: 'Years',
    min: 0,
    max: 120,
  },
  {
    name: 'gender',
    label: 'Gender',
    type: 'select',
    options: [
      { value: 1, label: 'Male' },
      { value: 0, label: 'Female' },
    ],
  },
  {
    name: 'heart_rate',
    label: 'Heart Rate',
    type: 'number',
    placeholder: '72',
    helpText: 'Beats per minute (Normal: 60-100 bpm)',
    min: 0,
  },
  {
    name: 'systolic_bp',
    label: 'Systolic Blood Pressure',
    type: 'number',
    placeholder: '120',
    helpText: 'Top number (Normal: under 120 mmHg)',
    min: 0,
  },
  {
    name: 'diastolic_bp',
    label: 'Diastolic Blood Pressure',
    type: 'number',
    placeholder: '80',
    helpText: 'Bottom number (Normal: under 80 mmHg)',
    min: 0,
  },
  {
    name: 'blood_sugar',
    label: 'Blood Sugar',
    type: 'number',
    placeholder: '95',
    helpText: 'Fasting glucose (Normal: 70-100 mg/dL)',
    min: 0,
    step: '0.1',
  },
  {
    name: 'ck_mb',
    label: 'CK-MB',
    type: 'number',
    placeholder: '0.0',
    helpText: 'Creatine Kinase-MB levels',
    min: 0,
    step: '0.01',
  },
  {
    name: 'troponin',
    label: 'Troponin',
    type: 'number',
    placeholder: '0.0',
    helpText: 'Troponin levels',
    min: 0,
    step: '0.001',
  },
];

function PredictContent() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<PredictionInput>>({
    gender: 1,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PredictionInput, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const field = formFields.find(f => f.name === name);
    
    let parsedValue: number | string = value;
    if (field?.type === 'number' || field?.type === 'select') {
      parsedValue = field.step ? parseFloat(value) : parseInt(value, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue,
    }));
    
    // Clear error for this field
    if (errors[name as keyof PredictionInput]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PredictionInput, string>> = {};
    
    formFields.forEach(field => {
      const value = formData[field.name];
      if (value === undefined || value === null || (typeof value === 'string' && value === '')) {
        newErrors[field.name] = `${field.label} is required`;
      } else if (field.min !== undefined && value < field.min) {
        newErrors[field.name] = `${field.label} must be at least ${field.min}`;
      } else if (field.max !== undefined && value > field.max) {
        newErrors[field.name] = `${field.label} must be at most ${field.max}`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await predictionApi.predict(formData as PredictionInput);
      // Store result in sessionStorage and navigate to result page
      sessionStorage.setItem('predictionResult', JSON.stringify(result));
      router.push('/result');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to get prediction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-3xl mx-auto px-5">
        <Link 
          href="/" 
          className="inline-flex items-center text-slate-700 font-medium mb-5 hover:text-slate-900"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <span className="text-red-500">♡</span> Health Assessment
          </h1>
          <p className="text-slate-500 mt-2">
            Please provide accurate information for the most reliable risk prediction
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              {formFields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name] ?? ''}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      name={field.name}
                      value={formData[field.name] ?? ''}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      step={field.step || '1'}
                      className="input-field"
                    />
                  )}
                  
                  {field.helpText && (
                    <p className="text-xs text-slate-500 mt-1.5">{field.helpText}</p>
                  )}
                  
                  {errors[field.name] && (
                    <p className="text-xs text-red-500 mt-1.5">{errors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>

            {apiError && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                {apiError}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-white px-8 py-3.5 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Calculating...' : 'Calculate Risk Assessment'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-sm">
          <strong>Note:</strong> This assessment is for educational purposes only and should not replace professional medical advice. Always consult with healthcare providers for medical decisions.
        </div>
      </div>
    </div>
  );
}

export default function PredictPage() {
  return (
    <AuthProvider>
      <PredictContent />
    </AuthProvider>
  );
}

