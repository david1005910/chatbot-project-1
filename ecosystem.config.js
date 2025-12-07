module.exports = {
  apps: [
    {
      name: 'coupang-sourcing',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      // 로그 설정
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // 재시작 설정
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
