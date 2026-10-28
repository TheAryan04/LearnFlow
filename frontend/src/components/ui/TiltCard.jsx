import React from 'react';

export default function TiltCard({ children, className = '', intensity, perspective, scale, ...props }) {
  return (
    <div
      className={`transition-transform duration-300 ease-out hover:-translate-y-1 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
