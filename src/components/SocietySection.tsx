import React, { useEffect, useRef, useState } from "react";

const stats = [
  { number: "95%", label: "Accuracy Rate", icon: "🎯" },
  { number: "10K+", label: "Patients Helped", icon: "👥" },
  { number: "24/7", label: "AI Availability", icon: "⚡" },
  { number: "50+", label: "Cancer Types", icon: "🔬" }
];

const features = [
  {
    icon: "🤖",
    title: "AI-Powered Analysis",
    desc: "Advanced machine learning algorithms for accurate predictions"
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    desc: "Your medical data is encrypted and completely confidential"
  },
  {
    icon: "⚡",
    title: "Fast Results",
    desc: "Get comprehensive analysis results within minutes"
  }
];

const SocietySection = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

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
      className="w-full py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-12">

        {/* Main Content Grid - Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">

          {/* LEFT SIDE - Text Content */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}>

            {/* Badge */}
            <div className="inline-block">
              <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg animate-pulse-slow">
                🚀 AI-Powered Cancer Detection
              </span>
            </div>

            {/* Main Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                What is AIRA?
              </span>
            </h2>

            {/* Description */}
            <p className="text-gray-700 text-lg leading-relaxed">
              AIRA uses advanced <span className="font-semibold text-blue-600">AI-based symptom analysis</span> technology
              to help you understand your potential cancer risk early. By inputting your symptoms or test results,
              our system provides a <span className="font-semibold text-purple-600">fast, accurate, and secure</span> initial analysis.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${hoveredFeature === index
                      ? 'bg-white shadow-lg transform translate-x-2'
                      : 'bg-white/50 hover:bg-white/70'
                    }`}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
                  }}
                >
                  <div className={`text-4xl transition-transform duration-300 ${hoveredFeature === index ? 'scale-125 rotate-12' : ''
                    }`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE - Stats & Visual */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}>

            {/* Decorative Background Circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 blur-3xl animate-pulse-slow" />
            </div>

            {/* Stats Grid */}
            <div className="relative grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden ${hoveredStat === index ? 'transform scale-110 z-10' : ''
                    }`}
                  onMouseEnter={() => setHoveredStat(index)}
                  onMouseLeave={() => setHoveredStat(null)}
                  style={{
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  {/* Gradient Border on Hover */}
                  {hoveredStat === index && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-20 animate-pulse" />
                  )}

                  {/* Icon */}
                  <div className={`text-5xl mb-3 transition-transform duration-500 ${hoveredStat === index ? 'scale-125 rotate-12' : ''
                    }`}>
                    {stat.icon}
                  </div>

                  {/* Number with animation */}
                  <div className={`text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 ${hoveredStat === index ? 'scale-110' : ''
                    }`}>
                    {stat.number}
                  </div>

                  {/* Label */}
                  <div className="text-gray-600 text-sm font-medium">
                    {stat.label}
                  </div>

                  {/* Bottom gradient line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ${hoveredStat === index ? 'opacity-100' : 'opacity-0'
                    }`} />
                </div>
              ))}
            </div>

            {/* Floating Badge */}
            <div className={`mt-8 text-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <span className="text-2xl">✅</span>
                <span className="font-semibold">Trusted by Medical Professionals</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default SocietySection;
