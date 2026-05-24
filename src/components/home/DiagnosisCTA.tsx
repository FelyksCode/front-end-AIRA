import React, { useEffect, useRef, useState } from "react";

const DiagnosisCTA = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`w-full py-24 px-6 md:px-12 text-center bg-white transition-all duration-1000 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
      `}
    >
      <h2
        className={`text-4xl md:text-5xl font-bold mb-16 transition-all duration-1000
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
        style={{ color: "#152e66" }} // 👈 biru tua
      >
        Ready to begin your cancer diagnosis?
      </h2>
    </section>
  );
};

export default DiagnosisCTA;
