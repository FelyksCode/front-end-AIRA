import { useNavigate } from "react-router-dom";

const PrognosisFeature = () => {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer w-full max-w-md mx-auto mb-8"
      style={{ backgroundColor: "#5595c9" }}
      onClick={() => navigate("/prognosis")}
    >
      {/* Bigger image */}
      <img
        src="picture3.jpeg"
        alt="Prognosis"
        className="w-full h-60 object-cover"
      />

      {/* Text section */}
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-4 text-white">
          Prognosis
        </h3>
        <p className="text-base leading-relaxed mb-6 text-white">
          Today, AI technology enables early prognosis of cancer patients by
          analyzing complex medical data quickly and accurately.
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/prognosis");
          }}
          className="px-6 py-3 bg-white text-[#5595c9] text-lg font-semibold rounded-lg hover:bg-gray-200 transition"
        >
          Go to Prognosis
        </button>
      </div>
    </div>
  );
};

export default PrognosisFeature;
