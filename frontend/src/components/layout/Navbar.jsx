import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { isAuthenticated, removeToken } from "../../services/auth";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAdmin = isAuthenticated();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    removeToken();
    window.location.href = "/admin/login";
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Register", path: "/register" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/85 backdrop-blur-md border-b border-slate-900 shadow-lg"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo / Brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold font-display shadow-md shadow-cyan-500/20">
                H
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-white text-base leading-tight">
                  HINDUSTAN
                </span>
                <span className="text-[10px] tracking-widest text-cyan-400 font-semibold uppercase leading-none">
                  University
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium tracking-wide transition-colors ${
                    active
                      ? "text-cyan-400 font-semibold"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {isAdmin ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/admin/dashboard"
                  className="text-sm font-medium bg-cyan-950/50 hover:bg-cyan-950 text-cyan-400 hover:text-cyan-300 px-4 py-2 border border-cyan-800/30 rounded-lg transition-all"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors border border-slate-800 hover:border-slate-700 px-3.5 py-1.5 rounded-lg"
              >
                Organizers Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-400 hover:text-white p-2 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-900 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-3 py-2.5 rounded-md text-base font-medium ${
                    active
                      ? "bg-slate-900 text-cyan-400"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {isAdmin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className="block px-3 py-2.5 rounded-md text-base font-medium text-cyan-400 bg-cyan-950/20"
                >
                  Admin Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2.5 rounded-md text-base font-medium text-slate-400 hover:bg-slate-900 hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-400 hover:bg-slate-900 hover:text-white"
              >
                Organizers Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
