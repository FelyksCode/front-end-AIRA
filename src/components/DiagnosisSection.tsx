import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

const DiagnosisSection: React.FC = () => {
  const [selectedCancer, setSelectedCancer] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('');
  const [selectedDatasetKey, setSelectedDatasetKey] = useState('');
  const [cancerList, setCancerList] = useState<{ name: string; slug: string }[]>([]);
  const [rawOptions, setRawOptions] = useState<any[]>([]);
  const [cancerDetail, setCancerDetail] = useState<{ name: string; description: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_AI_BACKEND_URL;

  useEffect(() => {
    fetch(`${baseUrl}/cancers/?ai_feature=diagnosis`)
      .then((res) => res.json())
      .then((data) => {
        const cancers = Array.isArray(data)
          ? data.map((item: any) => ({ name: item.name, slug: item.slug }))
          : [];
        setCancerList(cancers);
      })
      .catch((err) => console.error('Failed to fetch cancer list:', err));
  }, []);

  useEffect(() => {
    if (!selectedCancer) return;

    // Fetch feature options
    fetch(`${baseUrl}/cancers/${selectedCancer}/feature-options?ai_feature=diagnosis`)
      .then((res) => res.json())
      .then((data) => setRawOptions(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Failed to fetch feature options:', err);
        setRawOptions([]);
      });

    // Fetch cancer detail
    fetch(`${baseUrl}/cancers/${selectedCancer}?ai_feature=diagnosis`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.description) {
          setCancerDetail({ name: data.name, description: data.description });
        } else {
          setCancerDetail(null);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch cancer detail:', err);
        setCancerDetail(null);
      });
  }, [selectedCancer]);

  const featureList = Array.from(new Set(rawOptions.map((opt) => opt.ai_data_type)));

  const datasetList = rawOptions
    .filter((opt) => opt.ai_data_type === selectedFeature)
    .map((opt) => ({ key: opt.key, label: opt.label }));

  const handleContinue = () => {
    if (!selectedCancer) {
      setErrorMessage('⚠️ Please select a cancer type before continuing.');
      return;
    }
    if (!selectedFeature) {
      setErrorMessage('⚠️ Please select an AI feature before continuing.');
      return;
    }
    if (!selectedDatasetKey) {
      setErrorMessage('⚠️ Please select a dataset type before continuing.');
      return;
    }

    // Reset error and proceed
    setErrorMessage('');
    const selectedCancerName =
      cancerList.find((c) => c.slug === selectedCancer)?.name ||
      selectedCancer.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    navigate(`/upload/diagnosis/${selectedCancer}`, {
      state: {
        cancerName: selectedCancerName,
        datasetLabel: selectedDatasetKey,
      },
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main
        className="relative flex flex-1 h-[600px] overflow-hidden"
        style={{
          backgroundImage: `url('/picture3.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center left',
        }}
      >
        <div className="w-1/2"></div>
        <div className="w-1/2 flex items-center justify-center bg-[#6592bf]">
          <div className="flex flex-col gap-6 bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-6">
            <h2 className="text-2xl font-bold text-center text-[#191757]">Diagnosis</h2>

            {/* Dropdown 1: Cancer Type */}
            <div>
              <label className="font-semibold block mb-2 text-[#191757]">Select Cancer Type</label>
              <select
                value={selectedCancer}
                onChange={(e) => {
                  setSelectedCancer(e.target.value);
                  setSelectedFeature('');
                  setSelectedDatasetKey('');
                  setErrorMessage('');
                }}
                className="w-full border border-gray-300 rounded p-2 bg-white text-black"
              >
                <option value="">-- Choose --</option>
                {cancerList.map((cancer) => (
                  <option key={cancer.slug} value={cancer.slug}>
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
                  if (!selectedCancer) {
                    setErrorMessage('⚠️ Please select cancer type first.');
                    return;
                  }
                  setSelectedFeature(e.target.value);
                  setSelectedDatasetKey('');
                  setErrorMessage('');
                }}
                className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                disabled={featureList.length === 0}
              >
                <option value="">-- Choose --</option>
                {featureList.map((f) => (
                  <option key={f} value={f}>
                    {f.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown 3: Dataset Type */}
            <div>
              <label className="font-semibold block mb-2 text-[#191757]">Select Dataset Type</label>
              <select
                value={selectedDatasetKey}
                onChange={(e) => {
                  if (!selectedFeature) {
                    setErrorMessage('⚠️ Please select AI feature first.');
                    return;
                  }
                  setSelectedDatasetKey(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                disabled={datasetList.length === 0}
              >
                <option value="">-- Choose --</option>
                {datasetList.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cancer Description Box */}
            {cancerDetail && (
              <div className="bg-gray-100 border border-gray-300 rounded p-4 text-sm text-black">
                <h4 className="font-bold text-[#191757] mb-2">{cancerDetail.name}</h4>
                <p className="font-light">{cancerDetail.description}</p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-300 rounded p-3">
                {errorMessage}
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className={`w-full px-4 py-2 text-white font-semibold rounded transition ${
                !selectedCancer || !selectedDatasetKey
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#191757] hover:bg-[#15144a]'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </main>

      <div className="bg-[#aaaaaa] text-white text-center py-6">
        <p className="text-lg font-semibold">
          Empowering early cancer detection with AI technology
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default DiagnosisSection;
