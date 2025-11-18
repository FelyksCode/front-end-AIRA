import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);

  const cmsURL = import.meta.env.VITE_CMS_URL;

  const menuItems = [
    { label: "Diagnosis", path: "/diagnosis" },
    { label: "Prognosis", path: "/prognosis" },
    { label: "Treatment", path: "/treatment" },
    { label: "Informasi", path: "/news" },
  ];

  return (
    <nav className="w-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] h-20 flex items-center px-6 relative z-50">
      {/* Logo kiri */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2">
        <Link to="/">
          <img
            src="logo.PNG"
            alt="UMN Cancer Society"
            className="h-12 w-auto cursor-pointer"
          />
        </Link>
      </div>

      {/* Menu tengah (desktop) */}
      <div className="flex-1 justify-center hidden md:flex">
        <ul className="flex gap-16 text-xl font-semibold">
          {menuItems.map((item) => {
            const isHome = currentPath === "/";
            const isActive = currentPath.startsWith(item.path);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`transition-colors duration-200 ${
                    isActive && !isHome
                      ? "font-bold text-[#181852]"
                      : "font-normal text-[#212129]"
                  } hover:text-[#181852]`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Tombol Login kanan (desktop) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:block">
        <a
          href={`${cmsURL}/login`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2 bg-[#181852] text-white rounded-lg font-semibold hover:bg-[#2c2f7c] transition-colors duration-200"
        >
          Login
        </a>
      </div>

      {/* Tombol hamburger (mobile) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 md:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-[#181852] focus:outline-none text-2xl"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Menu mobile (dropdown) */}
      {menuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white shadow-lg border-t md:hidden animate-fadeIn">
          <ul className="flex flex-col items-center py-4 space-y-3 text-lg font-medium">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="block px-4 py-2 text-[#212129] hover:text-[#181852]"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={`${cmsURL}/login`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 bg-[#181852] text-white rounded-lg hover:bg-[#2c2f7c] transition-colors duration-200"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
