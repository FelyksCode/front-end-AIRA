import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const ResultPrognosis = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">

      <main className="flex flex-col items-center px-6 py-10 gap-6 flex-1">
        <h2 className="text-2xl font-bold">Prognosis result</h2>
        <p className="text-gray-600">Your prognosis result</p>

        <div className="w-full max-w-4xl h-64 border border-gray-300 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 text-lg">
          {/* Placeholder for prognosis result */}
          Prognosis data will appear here
        </div>

        <button className="mt-4 px-5 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition">
          Extract into PDF
        </button>
      </main>

      <Footer />
    </div>
  );
};

export default ResultPrognosis;
