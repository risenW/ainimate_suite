import type { ApiResponse } from './types.js';

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Makes a request to the Ainimate API via HTTP
 * @param endpoint - API endpoint path
 * @param options - Request options
 * @returns Promise with the API response
 */
export async function makeAinimateRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
} 
