import { useAppSelector } from '../../../../../store/redux-hooks/redux-hooks';

const WinnerBingoBoard = () => {
  const {
    loading,
    data: { hasWon, winningLines },
  } = useAppSelector((state) => state.BingoGameSlice.checkWinner);

  // Ensure columns are in the correct BINGO order
  const columns = ['B', 'I', 'N', 'G', 'O'];

  // Determine if a number was called
  const isCalled = (number: any, calledNumbers: number[]) => {
    return calledNumbers.includes(number);
  };

  // Check if the current cell is part of any winning pattern across all winning lines
  const isWinningCell = (
    colIndex: number,
    rowIndex: number,
    winningLines: any[],
  ) => {
    return winningLines.some((line) => {
      const { pattern, index } = line;
      switch (pattern) {
        case 'Horizontal Line':
          return rowIndex === index;
        case 'Vertical Line':
          return colIndex === index;
        case 'Diagonal (Top-Left to Bottom-Right)':
          return rowIndex === colIndex;
        case 'Diagonal (Top-Right to Bottom-Left)':
          return rowIndex + colIndex === columns.length - 1;
        case 'Corners':
          return (
            (rowIndex === 0 && colIndex === 0) ||
            (rowIndex === 0 && colIndex === columns.length - 1) ||
            (rowIndex === columns.length - 1 && colIndex === 0) ||
            (rowIndex === columns.length - 1 && colIndex === columns.length - 1)
          );
        default:
          return false;
      }
    });
  };

  if (loading) {
    return <span className="text-green-500 text-lg font-bold">Loading...</span>;
  }

  return (
    <>
      {hasWon && (
        <div className="bingo-card">
          <table>
            <thead className="text-2xl font-bold text-black bg-[#f1f5f7]">
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => {
                    // Get the first cartella from the winningLines (assuming all lines share the same cartella)
                    const cartella = winningLines[0]?.cartella;
                    const value = cartella[col][rowIndex];

                    // Check if the current cell is part of any winning pattern
                    const winning = isWinningCell(
                      colIndex,
                      rowIndex,
                      winningLines,
                    );

                    return (
                      <td
                        key={colIndex}
                        className={`cell ${winning ? 'winning' : ''}`}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!hasWon && winningLines.length > 0 && (
        <div className="bingo-card">
          <table>
            <thead className="text-2xl font-bold text-black bg-[#f1f5f7]">
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => {
                    const cartella = winningLines[0]?.cartella; // Assuming the same cartella is used
                    const calledNumbers = winningLines[0]?.calledNumbers;
                    const value = cartella[col][rowIndex];
                    const isFreeSpace = value === 'FREE';
                    const called =
                      isFreeSpace || isCalled(Number(value), calledNumbers);

                    return (
                      <td
                        key={colIndex}
                        className={`cell ${called ? 'called' : ''}`}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default WinnerBingoBoard;
