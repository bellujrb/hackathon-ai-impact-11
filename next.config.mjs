/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuração para pdfkit funcionar corretamente com webpack
  webpack: (config, { isServer }) => {
    // Para server-side, marcar pdfkit e fontkit como external
    if (isServer) {
      config.externals.push('pdfkit', 'fontkit');
    }

    // Para client-side, fornecer um fallback vazio para fs, pois o pdfkit tenta usá-lo
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };

    return config;
  },
}

export default nextConfig
