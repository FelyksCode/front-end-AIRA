import { useNavigate } from "react-router-dom";

const TreatmentFeature = () => {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer w-full max-w-md mx-auto mb-8"
      style={{ backgroundColor: "#6e77d4" }}
      onClick={() => navigate("/treatment")}
    >
      {/* Bigger image */}
      <img
        src="picture5.jpg"
        alt="Treatment"
        className="w-full h-60 object-cover"
      />

      {/* Text content */}
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-4 text-white">Treatment</h3>
        <p className="text-base leading-relaxed mb-6 text-white">
          Analyze and present a treatment plan appropriate to the patient’s condition.
The plan should integrate clinical findings, diagnostic results, and identified risk factors.
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/treatment");
          }}
          className="px-6 py-3 bg-white text-[#6e77d4] text-lg font-semibold rounded-lg hover:bg-gray-200 transition"
        >
          Go to Treatment
        </button>
      </div>
    </div>
  );
};

export default TreatmentFeature;
