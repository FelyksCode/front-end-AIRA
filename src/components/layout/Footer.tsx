import { Link } from "react-router-dom";
import { Activity, Phone, Mail, MapPin } from "lucide-react";

const featureLinks = [
  { label: "Diagnosis",  path: "/diagnosis"  },
  { label: "Prognosis",  path: "/prognosis"  },
  { label: "Treatment",  path: "/treatment"  },
  { label: "News",       path: "/news"       },
];

export default function Footer() {
  return (
    <footer className="bg-[#1E3A5F] text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Activity className="text-white" size={18} />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">AIRA</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              AI-powered clinical decision support platform for cancer diagnosis,
              prognosis analysis, and treatment planning. Designed for
              clinical professionals and medical researchers.
            </p>
            <p className="text-xs text-slate-500">
              Research by the Multimedia Nusantara University.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-5">
              Features
            </h4>
            <ul className="space-y-2.5">
              {featureLinks.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-sm text-white/80 hover:text-white transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-5">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-white/80">
                <Phone size={15} className="mt-0.5 shrink-0 text-white/50" />
                (021) 54220808
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/80">
                <Mail size={15} className="mt-0.5 shrink-0 text-white/50" />
                aira@umn.ac.id
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/80">
                <MapPin size={15} className="mt-0.5 shrink-0 text-white/50" />
                Universitas Multimedia Nusantara, Tangerang
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row
          items-center justify-between gap-2 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AIRA — AI Research & Analysis Platform. All rights reserved.</p>
          <p>Built for clinical use · Not a substitute for physician judgment</p>
        </div>
      </div>
    </footer>
  );
}
