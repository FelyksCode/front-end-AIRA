import React, { useState } from 'react';

const UploadTreatmentMulti: React.FC = () => {
  const [selectedCancer, setSelectedCancer] = useState('');
  const [geneFile, setGeneFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const baseUrl = import.meta.env.VITE_AI_BACKEND_URL;

  const handleSubmit = async () => {
    if (!selectedCancer || !geneFile || !imageFile) return;

    const slug = selectedCancer.toLowerCase().replace(/\s+/g, '-');
    const url = `${baseUrl}/cancers/${slug}/predict?ai_feature=gene+image&feature_key=gene_image`;

    const formData = new FormData();
    formData.append("gene_file", geneFile);
    formData.append("image_file", imageFile);

    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      setPredictionResult(result);
    } catch (err) {
      console.error("Gagal kirim file:", err);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload Treatment (Gene + Image)</h2>

      <input
        type="text"
        placeholder="Cancer Type"
        value={selectedCancer}
        onChange={(e) => setSelectedCancer(e.target.value)}
        className="mb-2 w-full p-2 border"
      />

      <label className="block mb-1 font-semibold">Gene File</label>
      <input
        type="file"
        onChange={(e) => setGeneFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <label className="block mb-1 font-semibold">Image File</label>
      <input
        type="file"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <button
        onClick={handleSubmit}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>

      {predictionResult && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Prediction Result</h3>
          <pre className="text-sm whitespace-pre-wrap break-words">
            {JSON.stringify(predictionResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default UploadTreatmentMulti;
