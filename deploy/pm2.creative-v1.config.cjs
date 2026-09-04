module.exports = {
  apps: [
    {
      name: "creative-v1",
      script: "./bridge-server.js",
      cwd: "/var/www/creative-v1",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        BRIDGE_PORT: 3457
      }
    }
  ]
};
