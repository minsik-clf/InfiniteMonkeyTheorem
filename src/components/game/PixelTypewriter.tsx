'use client';

export function PixelTypewriter() {
  return (
    <div className="relative" style={{ width: 64, height: 40, imageRendering: 'pixelated' }}>
      {/* Base */}
      <div
        className="absolute"
        style={{
          bottom: 0,
          left: 4,
          width: 56,
          height: 12,
          background: 'hsl(220, 10%, 25%)',
          borderRadius: 2,
        }}
      />
      {/* Body */}
      <div
        className="absolute"
        style={{
          bottom: 10,
          left: 8,
          width: 48,
          height: 16,
          background: 'hsl(220, 10%, 30%)',
          borderRadius: 2,
        }}
      />
      {/* Keys row */}
      <div className="absolute flex gap-[1px]" style={{ bottom: 12, left: 12 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: 4,
              background: 'hsl(45, 20%, 70%)',
              borderRadius: 1,
            }}
          />
        ))}
      </div>
      {/* Paper holder */}
      <div
        className="absolute"
        style={{
          bottom: 26,
          left: 16,
          width: 32,
          height: 4,
          background: 'hsl(220, 10%, 35%)',
        }}
      />
      {/* Paper */}
      <div
        className="absolute"
        style={{
          bottom: 24,
          left: 18,
          width: 28,
          height: 16,
          background: 'hsl(40, 30%, 85%)',
          borderRadius: 1,
        }}
      />
      {/* Text lines on paper */}
      <div
        className="absolute"
        style={{ bottom: 34, left: 22, width: 20, height: 1, background: 'hsl(220, 20%, 30%)' }}
      />
      <div
        className="absolute"
        style={{ bottom: 31, left: 22, width: 16, height: 1, background: 'hsl(220, 20%, 30%)' }}
      />
      <div
        className="absolute"
        style={{ bottom: 28, left: 22, width: 18, height: 1, background: 'hsl(220, 20%, 30%)' }}
      />
    </div>
  );
}
