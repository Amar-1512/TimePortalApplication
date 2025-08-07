// Alternative to .env files - TypeScript configuration
export const config = {
  // Development environment
  development: {
    API_BASE_URL: 'http://localhost:8080'
  },
  
  // Production environment
  production: {
    API_BASE_URL: 'https://timeportalapplication-production.up.railway.app'
  }
};

// Get current environment based on build
const isProduction = import.meta.env.PROD;

// Export the appropriate configuration
export const currentConfig = isProduction ? config.production : config.development;

// Helper function to get config values
export const getConfig = (key: keyof typeof currentConfig) => {
  return currentConfig[key];
};
