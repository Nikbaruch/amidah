import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Désactiver le SSG pour cette page qui nécessite le client
  output: 'standalone',
  
  images: {
    unoptimized: false,
  },
  
  // Force le mode client-side rendering pour éviter les erreurs window
  experimental: {
    // Pas de pré-rendu pour les pages avec window
  },
};

export default nextConfig;