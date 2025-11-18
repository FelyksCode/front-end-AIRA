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
  objectUrl?: string;
}

const NewsSection: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_AI_BACKEND_URL;

  const loadImageAsBlobUrl = async (imageData: any) => {
    if (!imageData) return null;

    if (imageData?.type === "Buffer" && Array.isArray(imageData.data)) {
      try {
        const uint8 = new Uint8Array(imageData.data);
        const blob = new Blob([uint8], { type: "image/jpeg" });
        return URL.createObjectURL(blob);
      } catch {
        return null;
      }
    }

    if (typeof imageData === "string") {
      const cleanPath = imageData.startsWith("/") ? imageData : `/${imageData}`;
      const fullUrl = `${baseUrl}${cleanPath}`;
      try {
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error("Image fetch failed");
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } catch {
        return null;
      }
    }

    return null;
  };

  useEffect(() => {
    const loadNews = async () => {
      try {
        const res = await fetch(`${baseUrl}/news`);
        const data: NewsItem[] = await res.json();
        const processed = await Promise.all(
          data.map(async (item) => {
            const blobUrl = await loadImageAsBlobUrl(item.image_url);
            return { ...item, objectUrl: blobUrl ?? null };
          })
        );
        setNewsList(processed);
      } catch (err) {
        console.error("Gagal mengambil data berita:", err);
      }
    };
    loadNews();
  }, []);

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
              <img
                src={headline.objectUrl ?? ""}
                alt={headline.title}
                className="w-full h-[380px] md:h-[460px] object-cover scale-105 group-hover:scale-100 transition duration-700"
              />
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
                <img
                  src={article.objectUrl ?? ""}
                  alt={article.title}
                  className="w-full h-52 object-cover group-hover:scale-105 transition duration-500"
                />
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
