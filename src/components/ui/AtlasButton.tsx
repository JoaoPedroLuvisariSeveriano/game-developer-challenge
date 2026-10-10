import React, { useState } from 'react';
import { AudioEngine } from '../../game/engine/AudioEngine';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  baseName?: string;
  sound?: string;
}

export const AtlasButton: React.FC<Props> = ({ 
  baseName,
  sound = 'click', 
  children, 
  className = '', 
  disabled, 
  ...props 
}) => {
  const [state, setState] = useState<'normal' | 'hover' | 'pressed'>('normal');
  
  const bgStyle = {
    backgroundImage: `url('/assets/kenney_pirate-pack/PNG/Retina/Ship parts/wood (2).png')`,
    backgroundSize: '100% 100%',
    width: '240px',
    height: '64px',
    backgroundRepeat: 'no-repeat',
    transition: 'transform 0.1s',
    transform: state === 'pressed' ? 'scale(0.95)' : 'scale(1)',
    filter: state === 'hover' ? 'brightness(1.1)' : 'none',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      setState('hover');
      AudioEngine.play('hover');
    }
    props.onMouseEnter?.(e);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      setState('pressed');
    }
    props.onMouseDown?.(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      if (sound) AudioEngine.play(sound);
    }
    props.onClick?.(e);
  };

  return (
    <button
      className={`relative flex items-center justify-center font-display text-[#FFF5E1] text-xl uppercase tracking-wider focus:outline-none focus:ring-4 focus:ring-doubloon rounded ${className}`}
      style={bgStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={(e) => { if (!disabled) setState('normal'); props.onMouseLeave?.(e); }}
      onMouseDown={handleMouseDown}
      onMouseUp={(e) => { if (!disabled) setState('hover'); props.onMouseUp?.(e); }}
      onClick={handleClick}
      onFocus={(e) => { if (!disabled) setState('hover'); props.onFocus?.(e); }}
      onBlur={(e) => { if (!disabled) setState('normal'); props.onBlur?.(e); }}
      disabled={disabled}
      {...props}
    >
      <span className="z-10 drop-shadow-md">{children}</span>
    </button>
  );
};
