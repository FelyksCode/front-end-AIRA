import React, {
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const featureRoutes = [
  {
    label: "Diagnosis",
    path: "/diagnosis",
  },
  {
    label: "Prognosis",
    path: "/prognosis",
  },
  {
    label: "Treatment",
    path: "/treatment",
  },
  {
    label: "Information",
    path: "/information",
  },
];

const Footer = () => {
  const [query, setQuery] =
    useState("");
  const [
    suggestion,
    setSuggestion,
  ] = useState<string | null>(
    null
  );
  const navigate =
    useNavigate();

  const handleInput = (
    value: string
  ) => {
    setQuery(value);
    const match =
      featureRoutes.find(
        (f) =>
          f.label
            .toLowerCase()
            .startsWith(
              value.toLowerCase()
            )
      );
    setSuggestion(
      match?.label || null
    );
  };

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    const match =
      featureRoutes.find(
        (f) =>
          f.label
            .toLowerCase()
            .startsWith(
              query.toLowerCase()
            )
      );
    if (match)
      navigate(match.path);
  };

  return (
    <footer
      className="w-full text-white font-poppins relative overflow-hidden"
      style={{
        backgroundColor:
          "#0e368bff",
      }}
    >
      {/* WRAPPER → AGAR FOOTER TIDAK MELEBAR */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[1200px] px-6 md:px-10 lg:px-14 py-16 relative z-20">

          {/* GRID 4 KOLOM RATA & SEIMBANG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

            {/* ABOUT */}
            <div className="space-y-4">
              <img
                src="/public/logo.png"
                alt="AIRA Logo"
                className="w-24 mb-2"
              />

              <h3 className="font-semibold text-lg">
                About Us
              </h3>

              <p className="text-sm font-light leading-relaxed text-gray-200">
                AIRA is an
                AI-powered
                platform for
                cancer
                analytics. We
                provide
                intelligent
                tools for
                diagnosis,
                prognosis, and
                treatment
                recommendations
                to support
                clinical
                decision-making
                and research
                innovation.
              </p>

              {/* SMART SEARCH */}
              <form
                onSubmit={
                  handleSubmit
                }
                className="relative w-full pt-1"
              >
                <div className="relative bg-white rounded-md shadow-sm overflow-hidden">
                  {suggestion &&
                    suggestion
                      .toLowerCase()
                      .startsWith(
                        query.toLowerCase()
                      ) &&
                    query.length >
                      0 && (
                      <div className="absolute inset-y-0 left-3 flex items-center text-sm text-black font-medium pointer-events-none">
                        <span>
                          {
                            query
                          }
                        </span>
                        <span className="text-gray-400">
                          {suggestion.slice(
                            query.length
                          )}
                        </span>
                      </div>
                    )}

                  <input
                    type="text"
                    value={
                      query
                    }
                    onChange={(
                      e
                    ) =>
                      handleInput(
                        e
                          .target
                          .value
                      )
                    }
                    placeholder="Search features..."
                    className="w-full px-3 py-2 pr-10 text-sm text-black bg-transparent relative z-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />

                  <FaSearch className="absolute right-3 top-2.5 text-gray-500" />
                </div>
              </form>
            </div>

            {/* FEATURES */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Our Features</h3>
              <ul className="space-y-2.5 text-sm font-light">
                {featureRoutes.map((f) => (
                  <li key={f.path}>
                    <Link
                      to={f.path}
                      className="text-gray-200 hover:text-white hover:underline transition-colors duration-200"
                    >
                      {f.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ACKNOWLEDGEMENT */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Acknowledgement</h3>
              <p className="text-sm font-light leading-relaxed text-gray-200">
                AIRA project is entirely funded by the Ministry of Education and Culture of the Republic of Indonesia.
              </p>
            </div>

            {/* CONTACT */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact</h3>

              <div className="text-sm font-light leading-relaxed space-y-3">
                <p>
                  <span className="font-semibold text-white">Phone</span><br />
                  <span className="text-gray-200">(021) 1234 567 ext.3518</span>
                </p>

                <p>
                  <span className="font-semibold text-white">Email</span><br />
                  <span className="text-gray-200">AIRA@umn.ac.id</span>
                </p>

                <p className="text-gray-200">
                  WhatsApp (Message Only):<br />
                  0822-1234-5678
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CITY BACKGROUND PATTERN */}
      <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none opacity-10 overflow-hidden">
        <div className="flex flex-wrap w-full h-full">
          {Array.from({ length: 3 }).map((_, idx) => (
            <img
              key={idx}
              src="/background.svg"
              alt="city pattern"
              className="flex-1 min-w-[33%] h-28 md:h-36 lg:h-40 object-cover"
            />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

