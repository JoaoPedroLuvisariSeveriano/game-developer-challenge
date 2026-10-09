import React from 'react';
import uiSheet from '../../../../public/assets/spritesheet/ui_sheet.json';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
}

export const AtlasSprite: React.FC<Props> = ({ name, className = '', style, ...props }) => {
  const frameData = (uiSheet.frames as any)[name]?.frame;
  
  if (!frameData) {
    // Fallback block if the texture hasn't been generated properly yet
    return <div className={`bg-gray-800 border-2 border-gray-600 rounded ${className}`} style={style} {...props} />;
  }

  return (
    <div
      className={className}
      style={{
        ...style,
        backgroundImage: `url(/assets/spritesheet/ui_sheet.png)`,
        backgroundPosition: `-${frameData.x}px -${frameData.y}px`,
        width: `${frameData.w}px`,
        height: `${frameData.h}px`,
        backgroundRepeat: 'no-repeat',
      }}
      {...props}
    />
  );
};
