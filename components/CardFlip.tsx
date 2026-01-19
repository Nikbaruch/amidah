'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CardFlipProps {
  imageA: string;
  imageB: string;
  isActive: boolean;
}

export default function CardFlip({ imageA, imageB, isActive }: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isActive) return; // Seulement sur la carte active
    e.stopPropagation(); // Empêche la propagation au parent
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isActive) return;
    e.stopPropagation();
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    
    const offset = currentTouch - touchStart;
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    if (!isActive) return;
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isSwipeLeft = distance > minSwipeDistance;
    const isSwipeRight = distance < -minSwipeDistance;

    if (isSwipeLeft || isSwipeRight) {
      setIsFlipped(!isFlipped);
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  // Calcul de la rotation basée sur le drag
  const getRotation = () => {
    if (!isDragging) return isFlipped ? 180 : 0;
    
    const dragRotation = (dragOffset / window.innerWidth) * 90; // Réduction de 180 à 90 pour plus de contrôle
    const baseRotation = isFlipped ? 180 : 0;
    return baseRotation + dragRotation;
  };

  // Calcul de l'opacité des indicateurs
  const getIndicatorOpacity = () => {
    if (isDragging) return 0;
    return 1;
  };

  return (
    <div 
      className="w-full max-w-2xl h-[75vh] md:h-[85vh] perspective-1000"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="relative w-full h-full transform-style-3d"
        style={{
          transformStyle: 'preserve-3d',
          transition: isDragging 
            ? 'none' 
            : 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: `rotateY(${getRotation()}deg)`,
          willChange: 'transform',
        }}
      >
        {/* Face A */}
        <div 
          className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden shadow-2xl"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div className="relative w-full h-full bg-white">
            <Image
              src={imageA}
              alt="Carte face A"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
          
          {/* Indicateur de swipe */}
          <div 
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm transition-opacity duration-300"
            style={{ opacity: getIndicatorOpacity() }}
          >
            ← Swipe pour retourner →
          </div>
        </div>

        {/* Face B */}
        <div 
          className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden shadow-2xl"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="relative w-full h-full bg-white">
            <Image
              src={imageB}
              alt="Carte face B"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
          
          {/* Indicateur de swipe */}
          <div 
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm transition-opacity duration-300"
            style={{ opacity: getIndicatorOpacity() }}
          >
            ← Swipe pour retourner →
          </div>
        </div>
      </div>
    </div>
  );
}