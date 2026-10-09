import React, { useState } from 'react';
import uiSheet from '../../assets/spritesheet/ui_sheet.json';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  baseName?: string;
}

export const AtlasButton: React.FC<Props> = ({ 
  baseName = 'button_primary', 
  children, 
  className = '', 
  disabled, 
  ...props 
}) => {
  const [state, setState] = useState<'normal' | 'hover' | 'pressed'>('normal');
  
  let suffix = disabled ? 'disabled' : state;
  // Map our internal state to the sprite naming conventions
  if (suffix === 'pressed') suffix = 'pressed'; // just to be explicit
  
  const spriteName = `${baseName}_${suffix}`;
  const frameData = (uiSheet.frames as any)[spriteName]?.frame || (uiSheet.frames as any)[`${baseName}_normal`]?.frame;
  
  const bgStyle = frameData ? {
    backgroundImage: `url(/assets/spritesheet/ui_sheet.png)`,
    backgroundPosition: `-${frameData.x}px -${frameData.y}px`,
    width: `${frameData.w}px`,
    height: `${frameData.h}px`,
    backgroundRepeat: 'no-repeat',
  } : {
    // Fallback for placeholder JSON
    backgroundColor: disabled ? '#4b5563' : state === 'pressed' ? '#1d4ed8' : state === 'hover' ? '#3b82f6' : '#2563eb',
    width: '200px',
    height: '60px',
  };

  return (
    <button
      className={`relative flex items-center justify-center font-display text-white text-xl uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-doubloon rounded ${className}`}
      style={bgStyle}
      onMouseEnter={() => setState('hover')}
      onMouseLeave={() => setState('normal')}
      onMouseDown={() => setState('pressed')}
      onMouseUp={() => setState('hover')}
      onFocus={() => setState('hover')}
      onBlur={() => setState('normal')}
      disabled={disabled}
      {...props}
    >
      <span className="z-10 drop-shadow-md">{children}</span>
    </button>
  );
};
