import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function InformationSection() {
  return (
    <div
      id="information"
      className="bg-white rounded-xl overflow-hidden shadow-lg flex flex-col h-full min-h-[400px] transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* Gambar di atas */}
      <img
        src="picture5.jpg"
        alt="Informasi Kanker"
        className="w-full h-64 object-cover"
      />

      {/* Kotak teks di bawah */}
      <div className="bg-indigo-900 text-white p-8 flex flex-col justify-between flex-grow">
        <div>
          <h2 className="text-3xl font-bold mb-4">Informasi Tentang Kanker</h2>
          <p className="text-xl mb-6">Ini adalah bagian informasi awal tentang kanker.</p>
        </div>
        <Link to="/NODYI">
          <Button
            variant="outline"
            style={{
              backgroundColor: "#fff",
              color: "#2b15a7",
              border: "1px solid #2b15a7",
              fontWeight: "bold",
              fontSize: "1.125rem",
              padding: "0.75rem 1.5rem",
            }}
          >
            Lanjut
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default InformationSection;
