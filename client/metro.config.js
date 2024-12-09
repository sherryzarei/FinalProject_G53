const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
    const config = getDefaultConfig(__dirname);

    // Blocklist the backend folder to avoid Metro including it
    config.resolver.blockList = [
        /api\/.*/,
        /server\/.*/,
    ];

    return config;
})();
