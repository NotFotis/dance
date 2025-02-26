import dotenv from 'dotenv';
dotenv.config(); // Manually load .env file

export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'fallback-secret'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'fallback-salt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'fallback-transfer-salt'),
    },
  },
});
