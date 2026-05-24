import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Home, ChevronRight, ArrowLeft, Calendar, User, Tag } from "lucide-react";
import Footer from "../../components/layout/Footer";

interface NewsItem {
  id: number; title: string; image_url: any; category: string;
  body: string; created_at: string; created_by: string; objectUrl?: string;
}

const NewsDetail: React.FC = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [news,    setNews]    = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const baseUrl = import.meta.env.VITE_AI_BACKEND_URL;

  const loadImage = async (imageData: any): Promise<string | null> => {
    if (!imageData) return null;
    if (imageData?.type === "Buffer" && Array.isArray(imageData.data))
      try { return URL.createObjectURL(new Blob([new Uint8Array(imageData.data)], { type: "image/jpeg" })); } catch { return null; }
    if (typeof imageData === "string") {
      if (imageData.startsWith("blob:") || imageData.startsWith("data:")) return imageData;
      try {
        const r = await fetch(`${baseUrl}${imageData.startsWith("/") ? imageData : "/" + imageData}`);
        if (!r.ok) return null;
        return URL.createObjectURL(await r.blob());
      } catch { return null; }
    }
    if (imageData instanceof Blob) return URL.createObjectURL(imageData);
    return null;
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true); setError("");
    const load = async () => {
      try {
        const res = await fetch(`${baseUrl}/news/${id}`);
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        setNews({ ...data, objectUrl: await loadImage(data.image_url) });
      } catch (e: any) {
        setError("Failed to load article. Please try again.");
      } finally { setLoading(false); }
    };
    load();
  }, [id, baseUrl]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link to="/" className="flex items-center gap-1 hover:text-slate-700"><Home size={12}/> Home</Link>
            <ChevronRight size={12}/>
            <Link to="/news" className="hover:text-slate-700">News</Link>
            <ChevronRight size={12}/>
            <span className="text-slate-800 font-medium truncate max-w-48">{news?.title || "Article"}</span>
          </nav>
        </div>
      </div>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-72 bg-slate-200 rounded-2xl" />
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              {[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-slate-100 rounded" />)}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button onClick={() => navigate("/news")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm hover:bg-slate-50 transition-colors">
                <ArrowLeft size={15}/> Back to News
              </button>
            </div>
          ) : news ? (
            <article className="animate-fadeIn">
              {/* Hero image */}
              {news.objectUrl ? (
                <div className="relative rounded-2xl overflow-hidden shadow-sm mb-8">
                  <img src={news.objectUrl} alt={news.title} className="w-full h-64 sm:h-80 object-cover"
                    onError={e => { e.currentTarget.style.display = "none"; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
              ) : (
                <div className="w-full h-64 bg-slate-200 rounded-2xl mb-8 flex items-center justify-center">
                  <span className="text-slate-400 text-sm">No image available</span>
                </div>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                  bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                  <Tag size={11}/> {news.category}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <User size={11}/> {news.created_by}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar size={11}/> {new Date(news.created_at).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A5F] leading-tight mb-6">
                {news.title}
              </h1>

              {/* Body */}
              <div
                className="prose prose-slate prose-sm sm:prose max-w-none
                  prose-headings:text-[#1E3A5F] prose-a:text-cyan-700
                  prose-img:rounded-xl prose-img:shadow-sm"
                dangerouslySetInnerHTML={{ __html: news.body }}
              />

              {/* Back button */}
              <div className="mt-10 pt-6 border-t border-slate-200">
                <button onClick={() => navigate("/news")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                    border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
                  <ArrowLeft size={16}/> Back to News
                </button>
              </div>
            </article>
          ) : null}
        </div>
      </main>
      <Footer/>
    </div>
  );
};

export default NewsDetail;
