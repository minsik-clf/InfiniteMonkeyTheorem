// Application constants
export const CONFIG = {
  // Environment flags
  IS_PRODUCTION: (process.env.NEXT_PUBLIC_IS_PRODUCTION || 'true') === 'true',
  // Google Analytics
  GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_ID || 'G-0000000000',
} as const;

// Debug helper
export const getEnvironmentInfo = () => {
  if (typeof window === 'undefined') {
    return {
      runtime: 'server',
      isProduction: CONFIG.IS_PRODUCTION,
    };
  }

  return {
    runtime: 'client',
    isProduction: CONFIG.IS_PRODUCTION,
  };
};
