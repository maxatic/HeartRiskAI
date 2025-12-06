const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Types
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'patient' | 'doctor';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface PredictionInput {
  age: number;
  gender: number;
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  blood_sugar: number;
  ck_mb: number;
  troponin: number;
}

export interface Factor {
  name: string;
  value: string;
  status: string;
  score: number;
  max: number;
}

export interface PredictionResult {
  risk_score: number;
  risk_level: string;
  risk_class: 'critical' | 'warning' | 'safe';
  recommendation: string;
  factors: Factor[];
  input_data: Record<string, number>;
  chart_data: {
    age_impact: number;
    bp_impact: number;
    sugar_impact: number;
    hr_impact: number;
  };
}

// API Error handling
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function for API calls
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'An error occurred');
  }

  return data;
}

// Auth API
export const authApi = {
  signup: async (data: {
    full_name: string;
    email: string;
    password: string;
    confirm_password: string;
    role: 'patient' | 'doctor';
    doctor_id?: string;
  }): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>('/auth/signup/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: {
    email: string;
    password: string;
    role: 'patient' | 'doctor';
  }): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  me: async (): Promise<User> => {
    return fetchApi<User>('/auth/me/');
  },
};

// Prediction API
export const predictionApi = {
  predict: async (data: PredictionInput): Promise<PredictionResult> => {
    return fetchApi<PredictionResult>('/predict/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

