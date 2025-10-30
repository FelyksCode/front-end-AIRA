import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const featureRoutes = [
  { label: "Diagnosis", path: "/diagnosis" },
  { label: "Prognosis", path: "/prognosis" },
  { label: "Treatment", path: "/treatment" },
  { label: "Information", path: "/information" },
];

const Footer = () => {
  const [query, setQuery] = useState('');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInput = (value: string) => {
    setQuery(value);
    const match = featureRoutes.find(f =>
      f.label.toLowerCase().startsWith(value.toLowerCase())
    );
    setSuggestion(match?.label || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = featureRoutes.find(f =>
      f.label.toLowerCase().startsWith(query.toLowerCase())
    );
    if (match) navigate(match.path);
    else alert("Feature not found. Try: diagnosis, prognosis, treatment, or information.");
  };

  return (
    <footer
      className="relative w-full text-white px-6 md:px-12 py-16"
      style={{ backgroundColor: "#152e66" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
        {/* Logo & About Us */}
        <div className="flex flex-col">
          <img
            src="logo.png"
            alt="AIRA Logo"
            className="w-32 mb-4"
          />
          <h3 className="font-bold text-lg mb-2">About Us</h3>
          <p className="text-sm font-light leading-relaxed mb-4">
            AIRA is an AI-powered platform for cancer analytics. We provide intelligent tools for diagnosis, prognosis, and treatment recommendations to support clinical decision-making and research innovation.
          </p>

          {/* Smart Search Box */}
          <form onSubmit={handleSubmit} className="relative w-full max-w-xs">
            <div className="relative bg-white rounded overflow-hidden">
              {/* Suggestion overlay */}
              {suggestion &&
                suggestion.toLowerCase().startsWith(query.toLowerCase()) &&
                query.length > 0 && (
                  <div className="absolute inset-y-0 left-0 flex items-center px-4 text-sm font-medium pointer-events-none">
                    <span className="text-black">{query}</span>
                    <span className="text-gray-400">{suggestion.slice(query.length)}</span>
                  </div>
              )}

              {/* Input field */}
              <input
                type="text"
                value={query}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="Search features..."
                className="w-full px-4 py-2 pr-10 text-sm font-medium text-black bg-transparent placeholder-gray-500 relative z-10"
                style={{ caretColor: "#000" }}
              />

              {/* Search icon */}
              <FaSearch className="absolute right-3 top-2.5 text-gray-500 z-10" />
            </div>
          </form>
        </div>

        {/* Features */}
        <div>
          <h3 className="font-bold text-lg mb-3">Our Features</h3>
          <ul className="space-y-2 text-sm font-light">
            {featureRoutes.map((f) => (
              <li key={f.path}>
                <Link to={f.path} className="hover:underline">{f.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Helpdesk */}
        <div>
          <h3 className="font-bold text-lg mb-3">Helpdesk</h3>
          <p className="text-sm font-light hover:underline cursor-pointer">
            Building A, 5th Floor<br />
            Scientia Boulevard, Gading Serpong<br />
            Tangerang, Banten 15811
          </p>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold text-lg mb-3">Contact</h3>
          <p className="text-sm font-light">
            <span className="font-semibold">Phone</span><br />
            <span className="hover:underline cursor-pointer">(021) 1234 567 ext.3518</span>
          </p>
          <p className="mt-2 text-sm font-light">
            <span className="font-semibold">Email</span><br />
            <span className="hover:underline cursor-pointer">AIRA@umn.ac.id</span>
          </p>
          <p className="mt-2 text-sm font-light hover:underline cursor-pointer">
            WhatsApp (Message Only): 0822-1234-5678
          </p>
        </div>
      </div>

      {/* Cityscape Background */}
      <div className="absolute bottom-0 left-0 w-full">
        <img
          src="footer-city.png"
          alt="Cityscape"
          className="w-full object-cover"
        />
      </div>
    </footer>
  );
};

export default Footer;
