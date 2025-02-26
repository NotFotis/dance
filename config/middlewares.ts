export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "script-src": ["'self'", "'unsafe-inline'", "https:", "blob:"],
          "script-src-elem": ["'self'", "'unsafe-inline'", "https:", "blob:"],
          "img-src": ["'self'", "data:", "blob:"],
          "media-src": ["'self'", "data:", "blob:"],
          "connect-src": ["'self'", "https:", "https://dance-production-c62a.up.railway.app"],
        },
      },
    },
  },
];
