import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { Newspaper, Video, BookOpen } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  image_url: any;
  category: string;
  body: string;
  created_at: string;
  created_by: string;
  objectUrl?: string | null;
}

const NewsSection: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_AI_BACKEND_URL;

  const loadImageAsBlobUrl = async (imageData: any) => {
    if (!imageData) {
      console.log('No image data provided');
      return null;
    }

    console.log('Processing image data:', typeof imageData, imageData);

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

    // Handle string data
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
    const loadNews = async () => {
      try {
        console.log('Fetching news from:', `${baseUrl}/news`);
        const res = await fetch(`${baseUrl}/news`);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data: NewsItem[] = await res.json();
        console.log('Received news data:', data.length, 'articles');
        
        const processed = await Promise.all(
          data.map(async (item, index) => {
            console.log(`Processing article ${index + 1}:`, item.title);

            console.log(item.image_url)

            const blobUrl = await loadImageAsBlobUrl(item.image_url);
            return { ...item, objectUrl: blobUrl };
          })
        );
        console.log('Processed articles with blob URLs:', processed.length);
        setNewsList(processed);
      } catch (err) {
        console.error("Gagal mengambil data berita:", err);
      }
    };
    loadNews();
  }, [baseUrl]);

  // Ambil kategori unik dari artikel + tambah opsi "all"
  const categories = ["all", ...Array.from(new Set(newsList.map(n => n.category)))];

  const filteredNews =
    selectedCategory === "all"
      ? newsList
      : newsList.filter(
          (item) => item.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

  const handleNavigate = (id: number) => navigate(`/news/${id}`);
  const headline = newsList.length > 0 ? newsList[0] : null;

  return (
    <div className="bg-white flex flex-col min-h-screen pt-28">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-16">

        {/* HEADLINE HERO */}
        {headline && (
          <div className="max-w-6xl mx-auto mb-16">
            <div className="relative overflow-hidden rounded-2xl shadow-lg">
              {headline.objectUrl ? (
                <img
                  src={headline.objectUrl}
                  alt={headline.title}
                  className="w-full h-[380px] md:h-[460px] object-cover scale-105 group-hover:scale-100 transition duration-700"
                  onError={(e) => {
                    console.error('Headline image failed to load:', headline.objectUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => console.log('Headline image loaded successfully')}
                />
              ) : (
                <div className="w-full h-[380px] md:h-[460px] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 p-6 md:p-8 text-white z-10">
                <h1 className="text-2xl md:text-4xl font-bold drop-shadow-md leading-snug">
                  {headline.title}
                </h1>
                <button
                  onClick={() => handleNavigate(headline.id)}
                  className="mt-3 md:mt-4 px-5 py-2 bg-pink-600 font-medium text-white rounded-lg hover:bg-pink-700 transition"
                >
                  Read More
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY FILTER */}
        <div className="max-w-6xl mx-auto flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm whitespace-nowrap transition
                ${
                  selectedCategory === cat
                    ? "bg-pink-600 text-white border-pink-600 shadow"
                    : "bg-white text-[#191757] border-gray-300 hover:border-pink-400"
                }
              `}
            >
              {cat === "news" && <Newspaper size={16} />}
              {cat === "tutorial" && <BookOpen size={16} />}
              {cat === "documentary" && <Video size={16} />}
              {cat === "all" && <BookOpen size={16} />}
              {cat}
            </button>
          ))}
        </div>

        {/* GRID NEWS */}
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map((article) => (
            <div
              key={article.id}
              onClick={() => handleNavigate(article.id)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl cursor-pointer overflow-hidden transition group"
            >
              <div className="relative overflow-hidden">
                {article.objectUrl ? (
                  <img
                    src={article.objectUrl}
                    alt={article.title}
                    className="w-full h-52 object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      console.error('Article image failed to load:', article.objectUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => console.log('Article image loaded successfully:', article.id)}
                  />
                ) : (
                  <div className="w-full h-52 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No image</span>
                  </div>
                )}
                <span className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full bg-pink-600 text-white shadow">
                  {article.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg text-[#191757] mb-2 leading-snug group-hover:text-pink-600 transition">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {article.created_by} •{" "}
                  {new Date(article.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="mt-28">
        <Footer />
      </div>
    </div>
  );
};

export default NewsSection;
