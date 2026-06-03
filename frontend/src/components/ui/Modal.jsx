import React, { useEffect } from "react";

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-3xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="absolute inset-0 cursor-default" 
        onClick={onClose} 
      />
      
      <div className={`relative w-full ${sizes[size]} bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 animate-slide-up`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <h3 className="text-xl font-bold tracking-tight text-white font-display">
            {title}
          </h3>
          
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 rounded-lg p-1 transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};
