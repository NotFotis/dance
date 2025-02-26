export default ({ env }) => ({
    connection: {
        connection: {
            connectionString: env('DATABASE_URL')
        }
    }

  });