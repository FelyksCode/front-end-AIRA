import React, { useState, useEffect } from 'react';

const images = [
  'picture1.jpg',
  'picture5.jpg',
  'picture3.jpeg'
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const getSlideStyle = (index: number) => {
    const diff = index - currentIndex;

    if (diff === 0) {
      // CENTER - 40% BIGGER
      return {
        transform: 'translateX(-50%) scale(1.4)',
        left: '50%',
        zIndex: 30,
        opacity: 1,
        filter: 'brightness(1) blur(0px)'
      };
    } else if (diff === 1 || diff === -(images.length - 1)) {
      // RIGHT
      return {
        transform: 'translateX(60%) scale(0.8)',
        left: '50%',
        zIndex: 20,
        opacity: 0.6,
        filter: 'brightness(0.7) blur(1px)'
      };
    } else if (diff === -1 || diff === images.length - 1) {
      // LEFT
      return {
        transform: 'translateX(-160%) scale(0.8)',
        left: '50%',
        zIndex: 20,
        opacity: 0.6,
        filter: 'brightness(0.7) blur(1px)'
      };
    } else {
      return {
        transform: 'translateX(-50%) scale(0.5)',
        left: '50%',
        zIndex: 10,
        opacity: 0,
        filter: 'brightness(0.5) blur(2px)'
      };
    }
  };

  return (
    <section className="w-full pt-96 pb-24 min-h-[900px] bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="relative w-full max-w-7xl mx-auto px-4">

        {/* CAROUSEL - MOVED DOWN WAY MORE (80%) */}
        <div className="relative w-full h-[520px]">

          {/* SLIDES - NO ARROW BUTTONS */}
          {images.map((img, index) => {
            const style = getSlideStyle(index);

            return (
              <div
                key={index}
                className="absolute top-1/2 -translate-y-1/2 w-[700px] h-[420px] transition-all duration-700 ease-out cursor-pointer"
                style={{
                  left: style.left,
                  transform: `translateY(-50%) ${style.transform}`,
                  zIndex: style.zIndex,
                  opacity: style.opacity
                }}
                onClick={() => goToSlide(index)}
              >
                <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={img}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{ filter: style.filter }}
                  />
                  {index !== currentIndex && (
                    <div className="absolute inset-0 bg-white/40" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* THREE SIMPLE DOTS */}
        <div className="flex justify-center items-center gap-2.5 mt-10">
          <button
            onClick={() => goToSlide(0)}
            aria-label="Slide 1"
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: currentIndex === 0 ? '#3B82F6' : '#9CA3AF',
              border: 'none',
              padding: 0,
              cursor: 'pointer'
            }}
          />
          <button
            onClick={() => goToSlide(1)}
            aria-label="Slide 2"
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: currentIndex === 1 ? '#3B82F6' : '#9CA3AF',
              border: 'none',
              padding: 0,
              cursor: 'pointer'
            }}
          />
          <button
            onClick={() => goToSlide(2)}
            aria-label="Slide 3"
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: currentIndex === 2 ? '#3B82F6' : '#9CA3AF',
              border: 'none',
              padding: 0,
              cursor: 'pointer'
            }}
          />
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
