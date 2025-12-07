import { API_BASE_URL } from "@/config/api";

/**
 * Helper function to make API requests with consistent error handling
 * 
 * @param {string} endpoint - API endpoint (e.g., '/users', '/events')
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>} Fetch response
 * @throws {Error} If request fails
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return response;
  } catch (err) {
    // Re-throw with more context if it's not already an Error
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(err.message || 'Възникна грешка при заявката');
  }
}

/**
 * Helper function to make GET requests
 * 
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiGet(endpoint) {
  const response = await apiRequest(endpoint, { method: 'GET' });
  return response.json();
}

/**
 * Helper function to make POST requests
 * 
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Data to send
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiPost(endpoint, data) {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Helper function to make PUT requests
 * 
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Data to send
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiPut(endpoint, data) {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Helper function to make PATCH requests
 * 
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Data to send
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiPatch(endpoint, data) {
  const response = await apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Helper function to make DELETE requests
 * 
 * @param {string} endpoint - API endpoint
 * @returns {Promise<void>}
 */
export async function apiDelete(endpoint) {
  await apiRequest(endpoint, { method: 'DELETE' });
}

