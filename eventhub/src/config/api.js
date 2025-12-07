/**
 * API Configuration
 * 
 * Centralized API base URL configuration.
 * In production, this should be set via environment variables.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

