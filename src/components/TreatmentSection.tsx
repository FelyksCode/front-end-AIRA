import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

const TreatmentSection: React.FC = () => {
  const [selectedCancer, setSelectedCancer] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [cancerList, setCancerList] = useState<{ name: string; slug: string }[]>([]);
  const [rawOptions, setRawOptions] = useState<any[]>([]);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_AI_BACKEND_URL;

  useEffect(() => {
    fetch(`${baseUrl}/cancers?ai_feature=treatment`)
      .then((res) => res.json())
      .then((data) => {
        const cancers = Array.isArray(data) ? data.map((item: any) => ({
          name: item.name,
          slug: item.slug
        })) : [];
        setCancerList(cancers);
      })
      .catch((err) => console.error("Gagal ambil daftar kanker:", err));
  }, []);

  useEffect(() => {
    if (!selectedCancer) return;

    const slug = selectedCancer.toLowerCase().replace(/\s+/g, '-');

    fetch(`${baseUrl}/cancers/${slug}/feature-options?ai_feature=treatment`)
      .then((res) => res.json())
      .then((data) => setRawOptions(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Gagal ambil opsi:", err);
        setRawOptions([]);
      });
  }, [selectedCancer]);

  const featureList = Array.from(new Set(rawOptions.map((opt) => opt.ai_data_type)));

  const datasetList = rawOptions
    .filter((opt) => opt.ai_data_type === selectedFeature)
    .map((opt) => opt.label);

  const handleContinue = () => {
    if (selectedFeature.toLowerCase().includes('image') && selectedFeature.toLowerCase().includes('gene')) {
      navigate('/upload/treatment/multi');
    } else {
      navigate('/upload/treatment');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="relative flex flex-1 h-[600px] overflow-hidden" style={{
        backgroundImage: `url('/picture3.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center left',
      }}>
        <div className="w-1/2"></div>
        <div className="w-1/2 flex items-center justify-center bg-[#6592bf]">
          <div className="flex flex-col gap-6 bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-6">
            <h2 className="text-2xl font-bold text-center text-[#191757]">Treatment</h2>

            {/* Dropdown 1: Cancer Type */}
            <div>
              <label className="font-semibold block mb-2 text-[#191757]">Select Cancer Type</label>
              <select
                value={selectedCancer}
                onChange={(e) => {
                  setSelectedCancer(e.target.value);
                  setSelectedFeature('');
                  setSelectedDataset('');
                }}
                className="w-full border border-gray-300 rounded p-2 bg-white text-black"
              >
                <option value="">-- Choose --</option>
                {cancerList.map((cancer, index) => (
                  <option key={index} value={cancer.slug}>
                    {cancer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown 2: AI Feature */}
            <div>
              <label className="font-semibold block mb-2 text-[#191757]">Select AI Feature</label>
              <select
                value={selectedFeature}
                onChange={(e) => {
                  setSelectedFeature(e.target.value);
                  setSelectedDataset('');
                }}
                className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                disabled={featureList.length === 0}
              >
                <option value="">-- Choose --</option>
                {featureList.map((f, index) => (
                  <option key={index} value={f}>
                    {f.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown 3: Dataset Type */}
            <div>
              <label className="font-semibold block mb-2 text-[#191757]">Select Dataset Type</label>
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                disabled={datasetList.length === 0}
              >
                <option value="">-- Choose --</option>
                {datasetList.map((label, index) => (
                  <option key={index} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={handleContinue} className="w-full px-4 py-2 text-white font-semibold rounded transition bg-[#191757]" disabled={!selectedCancer || !selectedFeature || !selectedDataset}>
              Continue
            </button>
          </div>
        </div>
      </main>
      <div className="bg-[#aaaaaa] text-white text-center py-6">
        <p className="text-lg font-semibold">Empowering cancer treatment prediction with AI technology</p>
      </div>
      <Footer />
    </div>
  );
};

export default TreatmentSection;
