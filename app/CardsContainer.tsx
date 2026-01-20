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

export default function CardsContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchCurrentY, setTouchCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [screenHeight, setScreenHeight] = useState(800);
  const containerRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 80;
  const peekHeight = 60;

  // Détecter la hauteur de l'écran côté client
  useEffect(() => {
    setScreenHeight(window.innerHeight);
    
    const handleResize = () => setScreenHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    setTouchStartY(touch.clientY);
    setTouchCurrentY(touch.clientY);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.targetTouches[0];
    setTouchCurrentY(touch.clientY);
  };

  const onTouchEnd = () => {
    if (!isDragging) return;

    const distance = touchStartY - touchCurrentY;
    const isSwipeUp = distance > minSwipeDistance;
    const isSwipeDown = distance < -minSwipeDistance;

    if (isSwipeUp && currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (isSwipeDown && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }

    setIsDragging(false);
    setTouchStartY(0);
    setTouchCurrentY(0);
  };

  const getDragOffset = () => {
    if (!isDragging) return 0;
    const offset = touchStartY - touchCurrentY;
    
    if (currentIndex >= cards.length - 1 && offset > 0) return 0;
    if (currentIndex <= 0 && offset < 0) return 0;
    
    const maxDrag = screenHeight * 0.7;
    if (Math.abs(offset) > maxDrag) {
      return offset > 0 ? maxDrag : -maxDrag;
    }
    
    return offset;
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (e.deltaY > 20 && currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.deltaY < -20 && currentIndex > 0) {
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

  const dragOffset = getDragOffset();

  return (
    <div 
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-blue-900 to-purple-900"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute inset-0">
        {cards.map((card, index) => {
          const isActive = index === currentIndex;
          const isNext = index === currentIndex + 1;
          const isPrev = index === currentIndex - 1;
          
          if (!isActive && !isNext && !isPrev) return null;
          
          let transform = '';
          let zIndex = 0;
          let opacity = 1;
          let scale = 1;
          let shadow = '';
          
          if (isActive) {
            zIndex = 20;
            const dragProgress = Math.abs(dragOffset) / (screenHeight * 0.5);
            scale = 1 - (dragProgress * 0.05);
            transform = `translateY(${-dragOffset}px) scale(${scale})`;
            shadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
          } else if (isNext) {
            zIndex = 10;
            const basePosition = screenHeight - peekHeight;
            const dragAdjustment = dragOffset > 0 ? dragOffset : 0;
            const parallaxFactor = 0.85;
            const finalPosition = basePosition - (dragAdjustment * parallaxFactor);
            scale = 0.95;
            transform = `translateY(${finalPosition}px) scale(${scale})`;
            shadow = '0 -10px 30px -10px rgba(0, 0, 0, 0.3)';
          } else if (isPrev) {
            zIndex = 10;
            const basePosition = -screenHeight + peekHeight;
            const dragAdjustment = dragOffset < 0 ? dragOffset : 0;
            const parallaxFactor = 0.85;
            const finalPosition = basePosition - (dragAdjustment * parallaxFactor);
            scale = 0.95;
            transform = `translateY(${finalPosition}px) scale(${scale})`;
            shadow = '0 10px 30px -10px rgba(0, 0, 0, 0.3)';
          }

          return (
            <div
              key={card.id}
              className="absolute top-0 left-0 w-full h-full"
              style={{
                transform,
                zIndex,
                opacity,
                boxShadow: shadow,
                transition: isDragging 
                  ? 'box-shadow 0.2s ease-out' 
                  : 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                willChange: 'transform',
              }}
            >
              <div className="h-full w-full flex items-center justify-center p-4 md:p-8">
                <CardFlip
                  imageA={card.imageA}
                  imageB={card.imageB}
                  isActive={isActive}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-30 pointer-events-none">
        {cards.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white w-8' 
                : 'bg-white/30 w-2'
            }`}
          />
        ))}
      </div>

      {currentIndex === 0 && !isDragging && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-black/70 text-white px-6 py-3 rounded-full text-sm backdrop-blur-sm animate-bounce">
            ↑ Swipe vers le haut pour la carte suivante
          </div>
        </div>
      )}
    </div>
  );
}