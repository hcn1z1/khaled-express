import React from 'react';

interface BarcodeDisplayProps {
  svg?: string;
  code: string;
  className?: string;
}

export const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({ svg, code, className = '' }) => {
  if (svg) {
    return (
      <div 
        className={`inline-block ${className}`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  // Fallback visual barcode representation
  return (
    <div className={`p-2 bg-white rounded border border-gray-200 inline-block text-center ${className}`}>
      <div className="flex items-center justify-center gap-[2px] h-12 px-2 bg-gray-50 border-b border-gray-200 mb-1">
        {code.split('').map((char, i) => (
          <div
            key={i}
            className="bg-black"
            style={{
              width: `${(char.charCodeAt(0) % 3) + 1.5}px`,
              height: '100%',
              marginRight: `${(char.charCodeAt(0) % 2) + 1}px`,
            }}
          />
        ))}
      </div>
      <span className="font-mono text-xs font-bold text-gray-800 tracking-wider">{code}</span>
    </div>
  );
};
