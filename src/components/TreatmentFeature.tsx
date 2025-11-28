import { useNavigate } from "react-router-dom";

const TreatmentFeature = () => {
  const navigate = useNavigate();

  return (
    <div
      className="group relative rounded-2xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl cursor-pointer w-full h-full"
      style={{ backgroundColor: "#6e77d4" }}
      onClick={() => navigate("/treatment")}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

      {/* Animated Border Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
        <div className="absolute inset-0 rounded-2xl border-2 border-purple-300 animate-pulse" />
      </div>

      {/* Image with Zoom Effect */}
      <div className="relative overflow-hidden h-52 md:h-56">
        <img
          src="/public/picture5.jpg"
          alt="Treatment"
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#6e77d4] via-transparent to-transparent opacity-60" />

        {/* Floating Icon Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
          <svg className="w-6 h-6 text-[#6e77d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative p-6 z-20">
        {/* Title with Animated Underline */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors duration-300">
            Treatment
          </h3>
          <div className="h-1 w-0 group-hover:w-20 bg-purple-300 rounded-full transition-all duration-500" />
        </div>

        <p className="text-base leading-relaxed mb-6 text-gray-100 group-hover:text-white transition-colors duration-300">
          Analyze and present a treatment plan appropriate to the patient's condition.
          The plan should integrate clinical findings, diagnostic results, and identified risk factors.
        </p>

        {/* Enhanced Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/treatment");
          }}
          className="w-full px-6 py-3 bg-white text-[#6e77d4] text-lg font-semibold rounded-lg hover:bg-purple-50 transform group-hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center gap-2"
        >
          <span>Go to Treatment</span>
          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </div>
  );
};

export default TreatmentFeature;
