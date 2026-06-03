import React from "react";

export const Card = ({
  children,
  className = "",
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-2xl p-6 md:p-8 ${
        hoverable ? "glass-panel-hover cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};
