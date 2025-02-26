export default ({ env }) => {
  // Log APP_KEYS to check if it's correctly read
  console.log('APP_KEYS:', env('APP_KEYS'));
  console.log('APP_KEYS as array:', env.array('APP_KEYS'));

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1338),
    app: {
      keys: env.array('APP_KEYS'),
    },
  };
};
