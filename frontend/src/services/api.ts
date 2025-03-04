// frontend/src/services/api.ts
import { getIdToken } from './auth';

// Replace with your API URL from the SAM deployment
const API_URL = import.meta.env.VITE_API_URL || '';

interface ApiOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: any;
  queryParams?: Record<string, string>;
  requiresAuth?: boolean;
}

/**
 * Make an API request
 */
export async function apiRequest<T>({
  method,
  path,
  body,
  queryParams,
  requiresAuth = true,
}: ApiOptions): Promise<T> {
  // Build query string
  let url = `${API_URL}${path}`;
  
  if (queryParams) {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  // Build request options
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  // Add request body for POST/PUT
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }
  
  // Add authorization header if required
  if (requiresAuth) {
    const token = await getIdToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  
  // Make the request
  const response = await fetch(url, options);
  
  // Handle errors
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: 'Unknown error' };
    }
    
    // Throw error with response data
    const error = new Error(errorData.message || `API Error: ${response.status}`);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }
  
  // Parse and return response data
  return await response.json();
}