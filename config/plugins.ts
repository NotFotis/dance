import dotenv from 'dotenv';

// Load environment variables from `.env` file
dotenv.config();

export default ({ env }) => ({
  'users-permissions': {
    enabled: true,
    config: {
      jwtSecret: process.env.JWT_SECRET || env('JWT_SECRET'),
    },
  },
});
