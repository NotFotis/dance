module.exports = ({ env }) => ({
    'users-permissions': {
      enabled: true,
    },
    email: {
      config: {
        provider: 'nodemailer',
        providerOptions: {
          host: env('SMTP_HOST', 'smtp-relay.sendinblue.com'),
          port: env('SMTP_PORT', 587),
          secure: false,               // true if you use port 465
          auth: {
            user: env('SMTP_USERNAME'),// your Sendinblue SMTP user
            pass: env('SMTP_PASSWORD'),// your Sendinblue SMTP password
          },
        },
        settings: {
          defaultFrom: 'f.staikos7@gmail.com',
          defaultReplyTo: 'f.staikos7@gmail.com',
        },
      },
    },
    upload: {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: 5000000, // 5 MB limit (adjust as needed)
      },
    },
  },
  });
