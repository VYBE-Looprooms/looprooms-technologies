module.exports = {
  apps: [{
    name: 'vybe-backend',
    script: './src/server.js',
    cwd: '/var/www/vybe',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3003
    },
    error_file: '/var/www/vybe/logs/err.log',
    out_file: '/var/www/vybe/logs/out.log',
    log_file: '/var/www/vybe/logs/combined.log',
    time: true
  }]
};