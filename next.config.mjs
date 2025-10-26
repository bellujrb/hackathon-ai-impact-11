/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Silenciar aviso do Turbopack sobre config webpack
  // Em dev usa Turbopack, em build usa webpack (mais compatível com pdfkit)
  turbopack: {},
  // Configuração para pdfkit funcionar corretamente com webpack (apenas build)
  webpack: (config, { isServer }) => {
    // Para server-side, marcar pdfkit e fontkit como external
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'pdfkit': 'commonjs pdfkit',
        'fontkit': 'commonjs fontkit',
      });
    }
    return config;
  },
}

export default nextConfig
