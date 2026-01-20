'use client';

import dynamic from 'next/dynamic';

// Importer le composant principal sans SSR
const CardsContainer = dynamic(() => import('@/components/CardsContainer'), {
  ssr: false,
  loading: () => (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-white text-xl">Chargement...</div>
    </div>
  ),
});

export default function Home() {
  return <CardsContainer />;
}