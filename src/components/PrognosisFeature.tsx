import { useNavigate } from "react-router-dom";

const PrognosisFeature = () => {
  const navigate = useNavigate();

  return (
    <div
      className="group relative rounded-2xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl cursor-pointer w-full h-full"
      style={{ backgroundColor: "#5595c9" }}
      onClick={() => navigate("/prognosis")}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

      {/* Animated Border Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
        <div className="absolute inset-0 rounded-2xl border-2 border-cyan-300 animate-pulse" />
      </div>

      {/* Image with Zoom Effect */}
      <div className="relative overflow-hidden h-52 md:h-56">
        <img
          src="/public/picture3.jpeg"
          alt="Prognosis"
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#5595c9] via-transparent to-transparent opacity-60" />

        {/* Floating Icon Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
          <svg className="w-6 h-6 text-[#5595c9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative p-6 z-20">
        {/* Title with Animated Underline */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-100 transition-colors duration-300">
            Prognosis
          </h3>
          <div className="h-1 w-0 group-hover:w-20 bg-cyan-300 rounded-full transition-all duration-500" />
        </div>

        <p className="text-base leading-relaxed mb-6 text-gray-100 group-hover:text-white transition-colors duration-300">
          Today, AI technology enables early prognosis of cancer patients by
          analyzing complex medical data quickly and accurately.
        </p>

        {/* Enhanced Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/prognosis");
          }}
          className="w-full px-6 py-3 bg-white text-[#5595c9] text-lg font-semibold rounded-lg hover:bg-cyan-50 transform group-hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center gap-2"
        >
          <span>Go to Prognosis</span>
          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </div>
  );
};

export default PrognosisFeature;
