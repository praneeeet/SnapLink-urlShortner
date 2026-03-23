import React from 'react';

interface SparkLineProps {
  data: number[];
  width?: number;
  height?: number;
}

export const SparkLine: React.FC<SparkLineProps> = ({ data, width = 60, height = 24 }) => {
  const safeData = data && data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...safeData) || 1; // Prevent division by zero
  const peakIndex = safeData.indexOf(Math.max(...safeData));
  
  const barWidth = Math.max(2, (width / safeData.length) - 2);
  
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: `${height}px`, width: `${width}px` }}>
      {safeData.map((val, idx) => {
        const h = Math.max(1, (val / max) * height);
        const isZero = val === 0;
        const isPeak = idx === peakIndex && !isZero;
        
        let bgColor = 'rgba(217,34,0,0.30)';
        if (isZero) bgColor = 'rgba(255,255,255,0.07)';
        if (isPeak) bgColor = '#D92200';
        
        return (
          <div 
            key={idx}
            style={{
              width: `${barWidth}px`,
              height: `${h}px`,
              backgroundColor: bgColor,
              borderRadius: '1px 1px 0 0',
              transition: 'height 0.2s',
              minHeight: '2px' // 0 clicks still shows tiny bar
            }}
          />
        );
      })}
    </div>
  );
};
