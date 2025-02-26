export default ({ env }) => ({
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1338),
    keys: env.array('APP_KEYS'),
    secret: env('ADMIN_JWT_SECRET'),
    salt: env('API_TOKEN_SALT'),
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    jwtSecret: env('JWT_SECRET'),
    url: env('RAILWAY_URL', 'https://dance-production-c62a.up.railway.app'),
  });