interface QRCodeProps {
  size?: number;
  value: string;
}

// Generates a deterministic QR-like SVG pattern from the input string
export function QRCode({ size = 160, value }: QRCodeProps) {
  const grid = 21;
  const cells = generateQRPattern(value, grid);

  const cellSize = size / grid;
  const finderSize = 7;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="white" />
      {cells.map((row, y) =>
        row.map((isBlack, x) => {
          // Skip cells in finder pattern areas
          const inTLFinder = x < finderSize && y < finderSize;
          const inTRFinder = x >= grid - finderSize && y < finderSize;
          const constInBRLocator = x < finderSize && y >= grid - finderSize;
          if (inTLFinder || inTRFinder || constInBRLocator) return null;
          return isBlack ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0F172A"
            />
          ) : null;
        })
      )}
      {/* Finder patterns */}
      <FinderPattern x={0} y={0} cellSize={cellSize} />
      <FinderPattern x={(grid - finderSize) * cellSize} y={0} cellSize={cellSize} />
      <FinderPattern x={0} y={(grid - finderSize) * cellSize} cellSize={cellSize} />
      {/* Timing patterns */}
      {Array.from({ length: grid - 14 }).map((_, i) => {
        const pos = (i + 8) * cellSize;
        const isOn = i % 2 === 0;
        return (
          <>
            {isOn && <rect x={pos} y={6 * cellSize} width={cellSize} height={cellSize} fill="#0F172A" />}
            {isOn && <rect x={6 * cellSize} y={pos} width={cellSize} height={cellSize} fill="#0F172A" />}
          </>
        );
      })}
    </svg>
  );
}

function FinderPattern({ x, y, cellSize }: { x: number; y: number; cellSize: number }) {
  const s = cellSize * 7;
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} fill="#0F172A" />
      <rect x={x + cellSize} y={y + cellSize} width={s - 2 * cellSize} height={s - 2 * cellSize} fill="white" />
      <rect x={x + 2 * cellSize} y={y + 2 * cellSize} width={s - 4 * cellSize} height={s - 4 * cellSize} fill="#0F172A" />
    </g>
  );
}

function generateQRPattern(value: string, grid: number): boolean[][] {
  const cells: boolean[][] = [];
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  let seed = Math.abs(hash) || 12345;

  for (let y = 0; y < grid; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < grid; x++) {
      // Skip finder pattern areas
      const inTL = x < 8 && y < 8;
      const inTR = x >= grid - 8 && y < 8;
      const inBL = x < 8 && y >= grid - 8;
      if (inTL || inTR || inBL) {
        row.push(false);
        continue;
      }
      // Timing pattern row/col
      if (y === 6 || x === 6) {
        row.push(false);
        continue;
      }
      // Pseudo-random fill
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      row.push((seed >> 16) % 100 < 45);
    }
    cells.push(row);
  }
  return cells;
}
