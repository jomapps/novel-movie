export default {
  apps: [
    {
      name: 'novel-movie',
      script: './node_modules/.bin/next',
      args: 'start',
      cwd: '/opt/novel-movie',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },
      // Restart configuration
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',

      // Logging
      log_file: '/var/log/pm2/novel-movie-combined.log',
      out_file: '/var/log/pm2/novel-movie-out.log',
      error_file: '/var/log/pm2/novel-movie-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Auto restart on file changes (disable in production)
      watch: false,

      // Graceful shutdown
      kill_timeout: 5000,

      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
    },
  ],
}
