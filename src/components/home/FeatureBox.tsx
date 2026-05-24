import React, { useState } from "react";

const steps = [
  {
    title: "Select Cancer Type",
    number: "01",
    desc: "Choose the specific cancer type you want to detect from our comprehensive database of supported cancer types.",
    icon: "🔬",
    color: "from-blue-500 to-blue-700"
  },
  {
    title: "Select Dataset Type",
    number: "02",
    desc: "Configure the dataset format that matches your medical data for optimal AI processing accuracy.",
    icon: "📊",
    color: "from-purple-500 to-purple-700"
  },
  {
    title: "Upload Dataset",
    number: "03",
    desc: "Securely upload your medical datasets for AI-powered analysis and processing.",
    icon: "📤",
    color: "from-pink-500 to-pink-700"
  },
  {
    title: "Get Diagnosis Result",
    number: "04",
    desc: "Receive comprehensive diagnostic results with detailed insights for further medical action.",
    icon: "✅",
    color: "from-green-500 to-green-700"
  },
];

const FeatureBox = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <section className="w-full py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-12">

        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Follow our simple 4-step process to get AI-powered cancer diagnosis results
          </p>
        </div>

        {/* Timeline Container - NO LINE */}
        <div className="relative max-w-6xl mx-auto">

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Timeline Node */}
                <div className="flex flex-col items-center mb-6">
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-3xl shadow-lg cursor-pointer transform transition-all duration-500 ${hoveredStep === index || activeStep === index
                        ? 'scale-125 shadow-2xl rotate-12'
                        : 'scale-100 hover:scale-110'
                      }`}
                    onClick={() => setActiveStep(activeStep === index ? null : index)}
                  >
                    <span className={`transform transition-transform duration-500 ${hoveredStep === index ? 'scale-110' : ''
                      }`}>
                      {step.icon}
                    </span>
                  </div>

                  {/* Step Number */}
                  <div className={`mt-3 text-2xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent transition-all duration-300 ${hoveredStep === index ? 'scale-110' : ''
                    }`}>
                    {step.number}
                  </div>
                </div>

                {/* Card */}
                <div
                  className={`relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-500 ${hoveredStep === index
                      ? 'shadow-2xl -translate-y-2 scale-105'
                      : activeStep === index
                        ? 'shadow-xl'
                        : 'hover:shadow-xl'
                    }`}
                  onClick={() => setActiveStep(activeStep === index ? null : index)}
                >
                  {/* Gradient Top Border */}
                  <div className={`h-1 bg-gradient-to-r ${step.color}`} />

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${hoveredStep === index ? 'text-transparent bg-gradient-to-r ' + step.color + ' bg-clip-text' : 'text-gray-800'
                      }`}>
                      {step.title}
                    </h3>

                    {/* Description - Expandable */}
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${activeStep === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    {/* Collapsed Preview */}
                    {activeStep !== index && (
                      <p className="text-gray-500 text-sm line-clamp-2">
                        {step.desc}
                      </p>
                    )}

                    {/* Expand Indicator */}
                    <div className="flex justify-center mt-4">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center transform transition-transform duration-300 ${activeStep === index ? 'rotate-180' : ''
                        }`}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  {hoveredStep === index && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-5 pointer-events-none`} />
                  )}
                </div>

                {/* Connection Arrow - Desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-24 -right-4 z-20">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className={`transform transition-all duration-300 ${hoveredStep === index ? 'scale-125 translate-x-1' : ''
                      }`}>
                      <path d="M9 5l7 7-7 7" stroke="url(#gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="50%" stopColor="#A855F7" />
                          <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default FeatureBox;
