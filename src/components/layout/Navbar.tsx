import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Activity } from "lucide-react";

const navLinks = [
  { label: "Diagnosis",  path: "/diagnosis"  },
  { label: "Prognosis",  path: "/prognosis"  },
  { label: "Treatment",  path: "/treatment"  },
  { label: "News",       path: "/news"       },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const cmsURL = import.meta.env.VITE_CMS_URL;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <header
      className={`sticky top-0 z-50 bg-white border-b border-slate-200 transition-shadow duration-200
        ${scrolled ? "shadow-md" : "shadow-none"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center">
              <Activity className="text-white" size={18} />
            </div>
            <span className="text-[#1E3A5F] font-bold text-xl tracking-tight">AIRA</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive(path)
                    ? "bg-slate-100 text-[#1E3A5F] font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop Login */}
          <div className="hidden md:flex items-center ml-auto">
            <a
              href={cmsURL ? `${cmsURL}/login` : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A5F]
                text-white text-sm font-semibold hover:bg-[#1A3352] transition-colors duration-150"
            >
              Login to CMS
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden ml-auto p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white animate-fadeIn">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {navLinks.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive(path)
                    ? "bg-slate-100 text-[#1E3A5F] font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                  }`}
              >
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <a
                href={cmsURL ? `${cmsURL}/login` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-2.5 rounded-lg bg-[#1E3A5F]
                  text-white text-sm font-semibold hover:bg-[#1A3352] transition-colors"
              >
                Login to CMS
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
