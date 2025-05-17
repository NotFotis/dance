export default [
  'strapi::logger',
  'strapi::errors',
  // Remove duplicate 'strapi::security' if present above!
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "script-src": ["'self'", "'unsafe-inline'", "https:", "blob:", "editor.unlayer.com"],
          "script-src-elem": ["'self'", "'unsafe-inline'", "https:", "blob:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "https://res.cloudinary.com", // <-- Add this line!
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "https://res.cloudinary.com", // <-- Add this line!
          ],
          "connect-src": ["'self'", "http:", "https:"],
          "frame-src": ["'self'", "editor.unlayer.com"],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
