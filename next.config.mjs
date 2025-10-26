/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Desabilitar Turbopack explicitamente - usar webpack por incompatibilidade com pdfkit
  turbopack: undefined,
  // Configuração para pdfkit funcionar corretamente com webpack
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
