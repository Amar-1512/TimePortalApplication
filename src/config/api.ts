// API Configuration for Railway deployment
// Local setup (commented out for Railway)
// export const API_BASE_URL = 'http://localhost:8080';

// Railway production setup
export const API_BASE_URL = 'https://timeportalapplication-production.up.railway.app';

// Helper function to build API endpoints
export const buildApiEndpoint = (endpoint: string) => `${API_BASE_URL}${endpoint}`;
