import dotenv from 'dotenv';

// Load environment variables manually
dotenv.config();

export default ({ env }) => {
  // Debug logs to confirm APP_KEYS
  console.log('APP_KEYS:', process.env.APP_KEYS);
  console.log('APP_KEYS as array:', process.env.APP_KEYS?.split(','));
  console.log(env,' ',process.env.APP_KEYS);
  

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1338),
    app: {
      keys: process.env.APP_KEYS?.split(',') || ['fallbackKey1', 'fallbackKey2'],
    },
  };
};
