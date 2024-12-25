module.exports = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Adjust the poll interval for file watching during development
      config.watchOptions = {
        ...config.watchOptions,
        poll: 300,
      };
    }
    return config;
  },
};
