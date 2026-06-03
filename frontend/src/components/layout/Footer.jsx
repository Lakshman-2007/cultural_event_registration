import React from "react";

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold font-display shadow-md">
                H
              </div>
              <span className="font-display font-bold text-white text-lg tracking-wide">
                HINDUSTAN CULTURAL FEST 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Hindustan Institute of Technology and Science (HITS) cultural event registration and management portal.
            </p>
          </div>

          {/* Guidelines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Registration Rules
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• Internal registrations are FREE with @student.hindustanuniv.ac.in emails.</li>
              <li>• Email prefix must match Register Number exactly.</li>
              <li>• External registrations require a ₹500 fee.</li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Support Desk
            </h4>
            <p className="text-xs text-slate-400">
              Email: culturalfest@hindustanuniv.ac.in
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Tel: +91 44 2747 4262
            </p>
            <p className="text-[10px] text-slate-500 mt-2">
              1, Rajiv Gandhi Salai (OMR), Padur, Kelambakkam, Chennai, Tamil Nadu 603103
            </p>
          </div>
        </div>

        <div className="border-t border-slate-900/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-slate-500 font-medium">
            © {new Date().getFullYear()} Hindustan University. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-[10px] text-slate-500">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms & Conditions</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
