import React from "react";

export const Input = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  onBlur,
  error = "",
  placeholder = "",
  required = false,
  disabled = false,
  icon = null,
  className = "",
  maxLength,
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full bg-slate-950/60 border rounded-lg py-2.5 px-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200
            ${icon ? "pl-11" : "pl-4"}
            ${
              error
                ? "border-red-500/80 focus:border-red-500 focus:ring-red-500/50"
                : "border-slate-800/80 focus:border-cyan-500 focus:ring-cyan-500/30"
            }
            disabled:opacity-50 disabled:bg-slate-900/30
          `}
        />
      </div>
      
      {error && (
        <p className="text-xs text-red-500 font-medium mt-0.5 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};
