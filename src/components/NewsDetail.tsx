import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from './Footer';

interface NewsDetail {
  id: number;
  title: string;
  image_url: any;
  category: string;
  body: string;
  created_at: string;
  created_by: string;
  objectUrl?: string;
}

const NewsDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const baseUrl = import.meta.env.VITE_AI_BACKEND_URL;

  const loadImageAsBlobUrl = async (imageData: any) => {
    if (!imageData) {
      console.log('No image data provided');
      return null;
    }

    console.log('Image data type:', typeof imageData, imageData);

    // Handle Buffer data
    if (imageData?.type === "Buffer" && Array.isArray(imageData.data)) {
      try {
        const uint8 = new Uint8Array(imageData.data);
        const blob = new Blob([uint8], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        console.log('Created blob URL from buffer:', url);
        return url;
      } catch (error) {
        console.error('Error creating blob from buffer:', error);
        return null;
      }
    }

    // Handle direct blob URL or base64
    if (typeof imageData === "string") {
      // Check if it's already a blob URL or base64
      if (imageData.startsWith('blob:') || imageData.startsWith('data:')) {
        console.log('Using existing blob/data URL:', imageData);
        return imageData;
      }

      // Handle file path
      const cleanPath = imageData.startsWith("/") ? imageData : `/${imageData}`;
      const fullUrl = `${baseUrl}${cleanPath}`;
      console.log('Fetching image from URL:', fullUrl);
      try {
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        console.log('Created blob URL from fetch:', url);
        return url;
      } catch (error) {
        console.error('Error fetching image:', error);
        return null;
      }
    }

    // Handle direct blob object
    if (imageData instanceof Blob) {
      const url = URL.createObjectURL(imageData);
      console.log('Created blob URL from blob object:', url);
      return url;
    }

    console.warn('Unsupported image data format:', imageData);
    return null;
  };

  useEffect(() => {
    if (!id) return;

    const loadNews = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('Fetching news with ID:', id);
        const res = await fetch(`${baseUrl}/news/${id}`);
        if (!res.ok) throw new Error(`Gagal mengambil detail berita: ${res.status}`);
        const data = await res.json();
        console.log('Received news data:', data);
        
        const blobUrl = await loadImageAsBlobUrl(data.image_url);
        console.log('Final blob URL:', blobUrl);
        
        setNews({ ...data, objectUrl: blobUrl });
      } catch (err: any) {
        console.error('Error loading news:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [id, baseUrl]);

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <main className="flex-1 py-10 px-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="text-red-600 text-center mb-6">{error}</div>
          )}

          {loading ? (
            <div className="text-center text-gray-500">Loading news...</div>
          ) : news ? (
            <div className="space-y-6">
              {news.objectUrl ? (
                <img
                  src={news.objectUrl}
                  alt={news.title}
                  className="w-full h-64 object-cover rounded-lg shadow"
                  onError={(e) => {
                    console.error('Image failed to load:', news.objectUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => console.log('Image loaded successfully:', news.objectUrl)}
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg shadow flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
              <span className="inline-block px-3 py-1 text-sm rounded bg-[#e0e8ff] text-[#191757]">
                {news.category}
              </span>
              <h1 className="text-3xl font-bold text-[#191757]">{news.title}</h1>
              <p className="text-sm text-gray-600">
                {news.created_by} • {new Date(news.created_at).toLocaleDateString('id-ID')}
              </p>
              <div 
                className="text-gray-800 leading-relaxed prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: news.body }}
              />
              <button
                onClick={() => navigate(-1)}
                className="mt-6 px-4 py-2 bg-gray-200 text-[#191757] rounded hover:bg-gray-300 transition"
              >
                Back
              </button>
            </div>
          ) : (
            !error && !loading && <div className="text-center text-gray-500">News not found</div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetail;
