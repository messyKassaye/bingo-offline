const horizontalPattern = (
  length: number,
  secondArrayGenerator?: (row: number) => number[][],
) => {
  const horizontalPattern: number[][][] = [];
  for (let row = 0; row < length; row++) {
    horizontalPattern.push([
      ...Array.from({ length: 5 }, (_, col) => [row, col]),
      ...(secondArrayGenerator ? secondArrayGenerator(row) : []), // Second array if provided
    ]);
  }

  return horizontalPattern;
};

const generateHorizontalRows = (
  numRows: number,
  numCols: number,
): number[][] => {
  const rows: number[][] = [];
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      rows.push([row, col]);
    }
  }
  return rows;
};

const horizontalAndCenter = (
  rows: number,
  columns: number,
  centerColumn: number,
) => {
  const center: number[][][] = [];
  const rowCoordinates: number[][] = [];

  // Create a horizontal row (first row)
  for (let col = 0; col < columns; col++) {
    rowCoordinates.push([0, col]);
  }

  // Add the vertical center column
  for (let row = 0; row < rows; row++) {
    rowCoordinates.push([row, centerColumn]);
  }

  center.push(rowCoordinates);
  return center;
};

const drawFirstColumnAndCenterRow = () => {
  const gridSize = 5;
  const center: number[][][] = [];
  const coordinates: number[][] = [];

  const centerRow = Math.floor(gridSize / 2);

  // Add the first column (all rows in column 0)
  for (let row = 0; row < gridSize; row++) {
    coordinates.push([row, 0]);
  }

  // Add the center row (all columns in the center row)
  for (let col = 0; col < gridSize; col++) {
    coordinates.push([centerRow, col]);
  }

  center.push(coordinates);
  return center;
};

const twoVertical = () => {
  const gridSize = 5;

  const centerColumn = Math.floor(gridSize / 2);

  // Add the first column (all rows in column 0)
  const firstRow: number[][][] = [];
  const firstRowCoordinates: number[][] = [];
  for (let row = 0; row < gridSize; row++) {
    firstRowCoordinates.push([row, 0]);
    firstRowCoordinates.push([row, 1]);
  }

  firstRow.push([
    ...Array.from([...firstRowCoordinates]),
    ...Array.from(
      Array.from({ length: 5 }, (_, i) => [i, i]), // Top-left to bottom-right
    ),
  ]);

  // Add the center column (all rows in the center column)
  const centerRow: number[][][] = [];
  const centerRowCoordinates: number[][] = [];
  for (let row = 0; row < gridSize; row++) {
    centerRowCoordinates.push([row, centerColumn]);
    centerRowCoordinates.push([row, centerColumn + 1]);
  }
  centerRow.push([
    ...Array.from(centerRowCoordinates),
    ...Array.from({ length: 5 }, (_, i) => [i, i]), // Top-left to bottom-right
  ]);

  return [...firstRow, ...centerRow];
};

const twoHorizontal = () => {
  const gridSize = 5;

  const centerColumn = Math.floor(gridSize / 2);

  // Add the first column (all rows in column 0)
  const firstRow: number[][][] = [];
  const firstRowCoordinates: number[][] = [];
  for (let row = 0; row < gridSize; row++) {
    firstRowCoordinates.push([0, row]);
    firstRowCoordinates.push([1, row]);
  }

  firstRow.push([
    ...Array.from([...firstRowCoordinates]),
    ...Array.from(
      Array.from({ length: 5 }, (_, i) => [i, i]), // Top-left to bottom-right
    ),
  ]);

  // Add the center column (all rows in the center column)
  const centerRow: number[][][] = [];
  const centerRowCoordinates: number[][] = [];
  for (let row = 0; row < gridSize; row++) {
    centerRowCoordinates.push([centerColumn, row]);
    centerRowCoordinates.push([centerColumn + 1, row]);
  }
  centerRow.push([
    ...Array.from(centerRowCoordinates),
    ...Array.from({ length: 5 }, (_, i) => [i, i]), // Top-left to bottom-right
  ]);

  return [...firstRow, ...centerRow];
};

const verticalPattern = (
  length: number,
  secondArrayGenerator?: (row: number) => number[][],
) => {
  const verticalPatterns: number[][][] = [];
  for (let col = 0; col < length; col++) {
    verticalPatterns.push([
      ...Array.from({ length: 5 }, (_, row) => [row, col]),
      ...(secondArrayGenerator ? secondArrayGenerator(col) : []), // Second array if provided
    ]);
  }
  return verticalPatterns;
};

const topLeftBottomRighDiagonal = () => {
  const topLeft: number[][][] = [];
  topLeft.push(
    Array.from({ length: 5 }, (_, i) => [i, i]), // Top-left to bottom-right
  );
  return topLeft;
};

const topRightLeftBottomDiagonal = () => {
  const topRight: number[][][] = [];
  topRight.push(
    Array.from({ length: 5 }, (_, i) => [i, 4 - i]), // Top-right to bottom-left
  );
  return topRight;
};

const corners = () => {
  const corner: number[][][] = [];
  corner.push([
    [0, 0], // Top-left corner
    [0, 4], // Top-right corner
    [4, 0], // Bottom-left corner
    [4, 4], // Bottom-right corner
  ]);
  return corner;
};

export const defaultPattern = [
  ...horizontalPattern(2),
  ...verticalPattern(2),
  ...topLeftBottomRighDiagonal(),
  ...topRightLeftBottomDiagonal(),
  ...corners(),
];

export const anyDiagonal = [
  ...topLeftBottomRighDiagonal(),
  ...topRightLeftBottomDiagonal(),
];

export const anyHorizontal = [
  ...horizontalPattern(5, () => topLeftBottomRighDiagonal()[0]),
  ...horizontalPattern(1, () => topRightLeftBottomDiagonal()[0]),
];

export const anyVertical = [
  ...verticalPattern(5, () => topLeftBottomRighDiagonal()[0]),
  ...verticalPattern(1, () => topRightLeftBottomDiagonal()[0]),
];

export const anyTwoLines = [
  generateHorizontalRows(2, 6),
  generateHorizontalRows(6, 2),
  ...horizontalAndCenter(6, 6, 2),
  ...drawFirstColumnAndCenterRow(),
  ...[...verticalPattern(1, () => topLeftBottomRighDiagonal()[0])],
];

export const anyTwoVertical = [...twoVertical()];
export const anyTwoHorizontal = [...twoHorizontal()];

export const animationPatterns: Record<string, number[][][]> = {
  default: defaultPattern,
  any_diagonal: anyDiagonal,
  any_horizontal: anyHorizontal,
  any_vertical: anyVertical,
  any_two_lines: anyTwoLines,
  any_two_vertical: anyTwoVertical,
  any_two_horizontal: anyTwoHorizontal,
  corners: corners(),
  horizontal_line: horizontalPattern(5),
  vertical_line: verticalPattern(5),
};

export function getAnimationPatterns(patternValue: string): number[][][] {
  const normalized = patternValue.trim().toLowerCase().replace(/[\s-]+/g, '_');
  const aliases: Record<string, string> = {
    all: 'default',
    default_pattern: 'default',
    default_patterns: 'default',
    corner: 'corners',
    four_corner: 'corners',
    four_corners: 'corners',
    horizontal: 'horizontal_line',
    vertical: 'vertical_line',
    diagonal: 'any_diagonal',
  };
  return animationPatterns[aliases[normalized] ?? normalized] ?? animationPatterns.default;
}
