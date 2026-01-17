/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // 서버 사이드에서만 MQTT 관련 모듈을 externals로 처리
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'bufferutil': 'commonjs bufferutil',
        'utf-8-validate': 'commonjs utf-8-validate',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
