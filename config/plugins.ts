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
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  });
