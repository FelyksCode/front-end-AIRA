import { useNavigate } from "react-router-dom"
// ✅ import your Button component
import { Button } from "@/components/ui/button"

const DiagnosisFeature = () => {
  const navigate = useNavigate()

  return (
    <div
      className="rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer w-full max-w-md mx-auto mb-8"
      style={{ backgroundColor: "#152e66" }}
      onClick={() => navigate("/diagnosis")}
    >
      {/* Bigger image */}
      <img
        src="picture1.jpg"
        alt="Diagnosis"
        className="w-full h-60 object-cover"
      />

      {/* Text section */}
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-4 text-white">
          Diagnosis
        </h3>
        <p className="text-base leading-relaxed mb-6 text-white">
          Today, AI technology enables early diagnosis of cancer patients by
          analyzing complex medical data quickly and accurately.
        </p>

        {/* ✅ use Button instead of <button> */}
        <Button
          variant="blueOutline" // 👈 use the custom style
          size="lg"
          onClick={(e) => {
            e.stopPropagation()
            navigate("/diagnosis")
          }}
        >
          Go to Diagnosis
        </Button>
      </div>
    </div>
  )
}

export default DiagnosisFeature
