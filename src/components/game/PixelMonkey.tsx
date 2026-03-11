'use client';

export type TypedShapeKey = 'match' | 'miss' | 'empty';

export interface TypedShape {
  shape: TypedShapeKey;
  symbol: string;
}

/** 미션 TARGET 패널과 동일하게: ○△□ → 채움 기호(●▲■)로 통일해 시각 비교 가능 */
function toFilledSymbol(char: string): string {
  if (char === '○') return '●';
  if (char === '△') return '▲';
  if (char === '□') return '■';
  return char;
}

const shapeColorMap: Record<TypedShapeKey, string> = {
  match: 'text-emerald-400',
  miss: 'text-red-400',
  empty: 'text-zinc-500',
};

export interface PixelMonkeyProps {
  typing?: boolean;
  typedShapes?: TypedShape[];
  earnedGold?: number | null;
  /** 버튼 등에서 원숭이만 표시할 때 true */
  iconOnly?: boolean;
}

export function PixelMonkey({
  typing,
  typedShapes = [],
  earnedGold,
  iconOnly = false,
}: PixelMonkeyProps) {
  return (
    <div className="flex flex-col items-center gap-1 relative pt-8">
      {/* Gold earned floating text (iconOnly일 때 숨김, 상단 여유로 잘림 방지) */}
      {!iconOnly && earnedGold !== null && earnedGold !== undefined && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 font-mono text-[10px] whitespace-nowrap pointer-events-none z-10 text-amber-400"
          style={{ animation: 'floatUp 1.2s ease-out forwards' }}
        >
          {earnedGold > 0 ? `+${earnedGold}G` : '0'}
        </div>
      )}

      {/* Typed shapes above head — 실제 친 문자(○△□→●▲■) 표시, 일치/불일치만 색으로 구분 (2/3 크기) */}
      {!iconOnly && (
        <div className="symbol-row-sm">
          {typedShapes.map((item, i) => {
            const displayChar = toFilledSymbol(item.symbol);
            const colorClass = shapeColorMap[item.shape];
            return (
              <span
                key={i}
                className={`symbol-cell-sm ${colorClass}`}
                style={{ animation: 'popIn 0.2s ease-out' }}
                title={item.shape === 'match' ? '일치' : '불일치'}
              >
                {displayChar}
              </span>
            );
          })}
        </div>
      )}

      {/* Monkey body */}
      <div
        className={`flex flex-col items-center ${typing ? 'animate-typing' : 'animate-monkey-idle'}`}
      >
        <div
          className="relative"
          style={{ width: 32, height: 40, imageRendering: 'pixelated' }}
        >
          <div
            className="absolute"
            style={{
              top: 0,
              left: 4,
              width: 24,
              height: 20,
              background: 'hsl(30, 60%, 40%)',
              borderRadius: 2,
            }}
          />
          <div
            className="absolute"
            style={{
              top: 4,
              left: 8,
              width: 16,
              height: 12,
              background: 'hsl(30, 50%, 55%)',
              borderRadius: 1,
            }}
          />
          <div
            className="absolute"
            style={{
              top: 6,
              left: 10,
              width: 4,
              height: 4,
              background: 'hsl(0, 0%, 10%)',
              borderRadius: 1,
            }}
          />
          <div
            className="absolute"
            style={{
              top: 6,
              left: 18,
              width: 4,
              height: 4,
              background: 'hsl(0, 0%, 10%)',
              borderRadius: 1,
            }}
          />
          <div
            className="absolute"
            style={{
              top: 12,
              left: 12,
              width: 8,
              height: 2,
              background: 'hsl(0, 40%, 35%)',
            }}
          />
          <div
            className="absolute"
            style={{
              top: 20,
              left: 6,
              width: 20,
              height: 16,
              background: 'hsl(30, 60%, 40%)',
              borderRadius: 1,
            }}
          />
          <div
            className="absolute"
            style={{
              top: 22,
              left: 0,
              width: 6,
              height: 4,
              background: 'hsl(30, 60%, 40%)',
            }}
          />
          <div
            className="absolute"
            style={{
              top: 22,
              left: 26,
              width: 6,
              height: 4,
              background: 'hsl(30, 60%, 40%)',
            }}
          />
          <div
            className="absolute"
            style={{
              top: 36,
              left: 8,
              width: 6,
              height: 4,
              background: 'hsl(30, 60%, 35%)',
            }}
          />
          <div
            className="absolute"
            style={{
              top: 36,
              left: 18,
              width: 6,
              height: 4,
              background: 'hsl(30, 60%, 35%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
