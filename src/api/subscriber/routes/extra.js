module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/subscribers/confirm',
        handler: 'subscriber.confirm',
        config: { auth: false },
      },
      {
        method: 'GET',
        path: '/subscribers/unsubscribe',
        handler: 'subscriber.unsubscribe',
        config: { auth: false },
      },
    ],
  };
  