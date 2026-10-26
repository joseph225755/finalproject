import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/70 py-4 px-6 text-center text-xs text-slate-500 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <p>
          InternTrack Portal &copy; {new Date().getFullYear()} — College Full-Stack Development Internship Project.
        </p>
        <p className="flex items-center gap-1 font-medium text-slate-600">
          Built with <span className="text-indigo-600">React</span>, <span className="text-teal-600">Express</span>, and <span className="text-emerald-600">MongoDB</span>.
        </p>
      </div>
    </footer>
  );
};
