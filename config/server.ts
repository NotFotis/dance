export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1338),
  url: env('RAILWAY_URL', 'https://dance-production-c62a.up.railway.app'),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
