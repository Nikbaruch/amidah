'use client';

import { useState, useRef, useEffect } from 'react';
import CardFlip from '@/components/CardFlip';

// Configuration des cartes avec les images
const cards = [
  { id: 1, imageA: '/images/cards/card-01-a.png', imageB: '/images/cards/card-01-b.png' },
  { id: 2, imageA: '/images/cards/card-02-a.png', imageB: '/images/cards/card-02-b.png' },
  { id: 3, imageA: '/images/cards/card-03-a.png', imageB: '/images/cards/card-03-b.png' },
  { id: 4, imageA: '/images/cards/card-04-a.png', imageB: '/images/cards/card-04-b.png' },
  { id: 5, imageA: '/images/cards/card-05-a.png', imageB: '/images/cards/card-05-b.png' },
  { id: 6, imageA: '/images/cards/card-06-a.png', imageB: '/images/cards/card-06-b.png' },
  { id: 7, imageA: '/images/cards/card-07-a.png', imageB: '/images/cards/card-07-b.png' },
  { id: 8, imageA: '/images/cards/card-08-a.png', imageB: '/images/cards/card-08-b.png' },
  { id: 9, imageA: '/images/cards/card-09-a.png', imageB: '/images/cards/card-09-b.png' },
  { id: 10, imageA: '/images/cards/card-10-a.png', imageB: '/images/cards/card-10-b.png' },
  // Ajoutez autant de cartes que nécessaire
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd({ x: 0, y: 0 });
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentTouch = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
    setTouchEnd(currentTouch);
    
    const offsetY = currentTouch.y - touchStart.y;
    const offsetX = Math.abs(currentTouch.x - touchStart.x);
    
    // Ne gérer le drag vertical que si le mouvement est principalement vertical
    if (offsetX < 30) {
      // Limite le drag vers le haut seulement (valeurs négatives)
      if (offsetY < 0 && currentIndex < cards.length - 1) {
        setDragOffset(offsetY);
      } else if (offsetY > 0 && currentIndex > 0) {
        setDragOffset(offsetY);
      }
    }
  };

  const onTouchEnd = () => {
    if (!touchStart.y || !touchEnd.y) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const distance = touchStart.y - touchEnd.y;
    const isSwipeUp = distance > minSwipeDistance;
    const isSwipeDown = distance < -minSwipeDistance;

    if (isSwipeUp && currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (isSwipeDown && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  // Détection du scroll sur desktop
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (e.deltaY > 0 && currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [currentIndex, cards.length]);

  return (
    <div 
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-blue-900 to-purple-900"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Container des cartes empilées */}
      <div className="absolute inset-0 flex items-center justify-center">
        {cards.map((card, index) => {
          const offset = index - currentIndex;
          const isActive = index === currentIndex;
          const isNext = index === currentIndex + 1;
          const isPrev = index === currentIndex - 1;
          
          // Calcul de la transformation
          let transform = '';
          let zIndex = 0;
          let opacity = 0;
          
          if (isActive) {
            // Carte active
            zIndex = 10;
            opacity = 1;
            const dragY = isDragging ? dragOffset : 0;
            transform = `translateY(${dragY}px)`;
          } else if (isNext) {
            // Carte suivante (visible en dessous lors du drag)
            zIndex = 5;
            opacity = isDragging && dragOffset < 0 ? 0.3 : 0;
            const peekAmount = isDragging && dragOffset < 0 ? Math.min(20, Math.abs(dragOffset) / 10) : 0;
            transform = `translateY(${100 - peekAmount}%)`;
          } else if (isPrev) {
            // Carte précédente
            zIndex = 5;
            opacity = isDragging && dragOffset > 0 ? 0.3 : 0;
            transform = `translateY(-100%)`;
          } else if (offset > 0) {
            // Cartes futures (cachées en dessous)
            zIndex = 0;
            opacity = 0;
            transform = `translateY(100%)`;
          } else {
            // Cartes passées (cachées au-dessus)
            zIndex = 0;
            opacity = 0;
            transform = `translateY(-100%)`;
          }

          return (
            <div
              key={card.id}
              className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
              style={{
                transform,
                zIndex,
                opacity,
                transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              <CardFlip
                imageA={card.imageA}
                imageB={card.imageB}
              />
            </div>
          );
        })}
      </div>

      {/* Indicateur de progression (points) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {cards.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white w-8' 
                : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}