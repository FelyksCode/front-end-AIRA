import React, { useState } from 'react';
import { submitMultiModalDiagnosis } from '../../models/diagnosis-model';

const UploadDiagnosisMulti: React.FC = () => {
  const [selectedCancer,     setSelectedCancer]     = useState('');
  const [geneFile,           setGeneFile]           = useState<File | null>(null);
  const [imageFile,          setImageFile]          = useState<File | null>(null);
  const [predictionResult,   setPredictionResult]   = useState<any>(null);
  const [error,              setError]              = useState('');
  const [loading,            setLoading]            = useState(false);

  const handleSubmit = async () => {
    if (!selectedCancer || !geneFile || !imageFile) return;
    setError(''); setLoading(true);

    const slug = selectedCancer.toLowerCase().replace(/\s+/g, '-');

    try {
      const result = await submitMultiModalDiagnosis({
        cancerSlug: slug,
        geneFile,
        imageFile,
      });
      setPredictionResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to submit prediction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload Diagnosis (Gene + Image)</h2>

      <input
        type="text" placeholder="Cancer Type" value={selectedCancer}
        onChange={e => setSelectedCancer(e.target.value)}
        className="mb-2 w-full p-2 border"
      />

      <label className="block mb-1 font-semibold">Gene File</label>
      <input type="file" onChange={e => setGeneFile(e.target.files?.[0] || null)} className="mb-4" />

      <label className="block mb-1 font-semibold">Image File</label>
      <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="mb-4" />

      <button
        onClick={handleSubmit} disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Submitting…' : 'Submit'}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      {predictionResult && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Prediction Result</h3>
          <pre className="text-sm">{JSON.stringify(predictionResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default UploadDiagnosisMulti;
