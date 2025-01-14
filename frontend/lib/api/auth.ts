import apiClient from './client';

export interface SignupData {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const authApi = {
  signup: async (email: string, password: string, fullName: string) => {
    const response = await apiClient.post('/auth/signup', {
      email,
      password,
      fullName
    });
    return response.data;
  },
  
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    const token = response.data.access_token;
    localStorage.setItem('auth_token', token);
    return response.data;
  }
}; 