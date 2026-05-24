import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Newspaper, Video, BookOpen, Search, Calendar, User, Home, ChevronRight } from "lucide-react";
import Footer from "../../components/layout/Footer";

interface NewsItem {
  id: number; title: string; image_url: any; category: string;
  body: string; created_at: string; created_by: string; objectUrl?: string | null;
}

const categoryIcons: Record<string, React.ElementType> = {
  news: Newspaper, tutorial: BookOpen, documentary: Video,
};

const NewsPage: React.FC = () => {
  const [newsList,          setNewsList]         = useState<NewsItem[]>([]);
  const [selectedCategory,  setSelectedCategory] = useState("all");
  const [searchQuery,       setSearchQuery]      = useState("");
  const [loading,           setLoading]          = useState(true);
  const navigate = useNavigate();
  const baseUrl  = import.meta.env.VITE_AI_BACKEND_URL;

  const loadImageAsBlobUrl = async (imageData: any): Promise<string | null> => {
    if (!imageData) return null;
    if (imageData?.type === "Buffer" && Array.isArray(imageData.data)) {
      try { return URL.createObjectURL(new Blob([new Uint8Array(imageData.data)], { type: "image/jpeg" })); }
      catch { return null; }
    }
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
    const load = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${baseUrl}/news`);
        if (!res.ok) throw new Error();
        const data: NewsItem[] = await res.json();
        const processed = await Promise.all(data.map(async item => ({
          ...item, objectUrl: await loadImageAsBlobUrl(item.image_url)
        })));
        setNewsList(processed);
      } catch { setNewsList([]); }
      finally { setLoading(false); }
    };
    load();
  }, [baseUrl]);

  const categories = ["all", ...Array.from(new Set(newsList.map(n => n.category).filter(Boolean)))];

  const filtered = newsList.filter(item => {
    const matchCat   = selectedCategory === "all" || item.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchQuery = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const headline = filtered[0];
  const rest     = filtered.slice(1);

  const CardImage = ({ url, title, h }: { url?: string | null; title: string; h: string }) =>
    url ? (
      <img src={url} alt={title} className={`w-full ${h} object-cover group-hover:scale-105 transition-transform duration-500`}
        onError={e => { e.currentTarget.style.display = "none"; }} />
    ) : (
      <div className={`w-full ${h} bg-slate-200 flex items-center justify-center`}>
        <Newspaper size={32} className="text-slate-400" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link to="/" className="flex items-center gap-1 hover:text-slate-700"><Home size={12}/> Home</Link>
            <ChevronRight size={12}/>
            <span className="text-slate-800 font-medium">News</span>
          </nav>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Clinical News & Updates</h1>
            <p className="text-sm text-slate-500 mt-1">Latest articles, tutorials, and research from AIRA</p>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg bg-white
                focus:border-slate-400 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {categories.map(cat => {
            const Icon = categoryIcons[cat] || BookOpen;
            return (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium
                  border whitespace-nowrap transition-all duration-150
                  ${selectedCategory === cat
                    ? "bg-[#1E3A5F] text-white border-[#1E3A5F]"
                    : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"}`}>
                <Icon size={12}/> {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="h-48 bg-slate-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper size={40} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No articles found</p>
            <p className="text-sm text-slate-400">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <>
            {/* Headline */}
            {headline && !searchQuery && selectedCategory === "all" && (
              <div onClick={() => navigate(`/news/${headline.id}`)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer mb-8 shadow-sm hover:shadow-md transition-shadow">
                <CardImage url={headline.objectUrl} title={headline.title} h="h-72 md:h-96" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 p-6 text-white">
                  <span className="inline-block px-2 py-0.5 rounded bg-white/20 text-xs font-medium mb-2">
                    {headline.category}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold leading-snug mb-3 max-w-2xl">
                    {headline.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-white/70">
                    <span className="flex items-center gap-1"><User size={11}/>{headline.created_by}</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11}/>{new Date(headline.created_at).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(searchQuery || selectedCategory !== "all" ? filtered : rest).map(article => (
                <article key={article.id} onClick={() => navigate(`/news/${article.id}`)}
                  className="group bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer
                    hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className="overflow-hidden">
                    <CardImage url={article.objectUrl} title={article.title} h="h-44" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {article.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(article.created_at).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-slate-900 leading-snug group-hover:text-[#1E3A5F]
                      transition-colors line-clamp-2 mb-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <User size={10}/> {article.created_by}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer/>
    </div>
  );
};

export default NewsPage;
