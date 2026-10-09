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
  
  const suffix = disabled ? 'disabled' : state;
  const spriteName = `${baseName}_${suffix}`;
  
  const bgStyle = {
    backgroundImage: `url(/assets/png/retina/ui/menu/${spriteName}.png)`,
    backgroundSize: '100% 100%',
    width: '240px',
    height: '64px',
    backgroundRepeat: 'no-repeat',
    transition: 'transform 0.1s',
    transform: state === 'pressed' ? 'scale(0.95)' : 'scale(1)',
    filter: state === 'hover' ? 'brightness(1.1)' : 'none',
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
