import React, { useState } from 'react';


interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  baseName?: string;
}

export const AtlasButton: React.FC<Props> = ({ 
  baseName, 
  children, 
  className = '', 
  disabled, 
  ...props 
}) => {
  return (
    <button
      className={`px-8 py-3 bg-gradient-to-b from-amber-500 to-amber-700 text-white font-bold tracking-widest rounded-lg border-b-4 border-amber-900 hover:from-amber-400 hover:to-amber-600 hover:border-amber-700 active:border-b-0 active:translate-y-1 transition-all duration-150 uppercase shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-500/50 ${className}`}
      disabled={disabled}
      {...props}
    >
      <span className="z-10 drop-shadow-md font-display">{children}</span>
    </button>
  );
};
