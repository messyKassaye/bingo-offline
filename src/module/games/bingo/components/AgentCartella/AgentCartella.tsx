import { Button } from 'antd';
import { IBingoCard } from '../../model/IBingoCard';
import { Icon } from '@iconify/react';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/redux-hooks/redux-hooks';
import { IPlayerMarked } from '../../../../../models/IPlayerMarked';
import { updatePlayerMarked } from '../../slices/CartellaSlice';

type Props = {
  card: IBingoCard;
  cardNumber: number;
  onHandleDelete: (card: IBingoCard, cardNumber: number) => void;
};

const AgentCartella = ({ card, cardNumber, onHandleDelete }: Props) => {
  const { playerMarkedNumbers } = useAppSelector(
    (state) => state.CartellaSlice,
  );
  const dispatch = useAppDispatch();

  const isMarked = (cellNumber: string) => {
    return playerMarkedNumbers[cardNumber]?.includes(cellNumber);
  };

  const getWinningCells = () => {
    const markedSet = new Set(playerMarkedNumbers[cardNumber] || []);
    const winning: string[] = [];

    const cols = ['B', 'I', 'N', 'G', 'O'];

    // Horizontal lines
    for (let row = 0; row < 5; row++) {
      const rowKeys = cols.map((col) =>
        String(card[col as keyof IBingoCard][row]),
      );
      if (rowKeys.every((num) => markedSet.has(num))) {
        winning.push(...cols.map((col) => `${col}-${row}`));
      }
    }

    // Vertical lines
    for (let colIdx = 0; colIdx < 5; colIdx++) {
      const col = cols[colIdx];
      const colNums = Array.from({ length: 5 }, (_, i) =>
        String(card[col as keyof IBingoCard][i]),
      );
      if (colNums.every((num) => markedSet.has(num))) {
        winning.push(...colNums.map((_, i) => `${col}-${i}`));
      }
    }

    // Diagonal: top-left to bottom-right
    const diag1 = cols.map((col, i) =>
      String(card[col as keyof IBingoCard][i]),
    );
    if (diag1.every((num) => markedSet.has(num))) {
      winning.push(...cols.map((col, i) => `${col}-${i}`));
    }

    // Diagonal: top-right to bottom-left
    const diag2 = cols.map((col, i) =>
      String(card[col as keyof IBingoCard][4 - i]),
    );
    if (diag2.every((num) => markedSet.has(num))) {
      winning.push(...cols.map((col, i) => `${col}-${4 - i}`));
    }

    // Corners
    const cornerKeys = [
      String(card['B'][0]), // top-left
      String(card['O'][0]), // top-right
      String(card['B'][4]), // bottom-left
      String(card['O'][4]), // bottom-right
    ];
    if (cornerKeys.every((num) => markedSet.has(num))) {
      winning.push('B-0', 'O-0', 'B-4', 'O-4');
    }

    return winning;
  };

  const winningCells = getWinningCells();

  const isWinningCell = (col: string, row: number) => {
    const key = `${col}-${row}`;
    return winningCells.includes(key);
  };

  const handleClick = (row: number, col: string, cellNumber: string) => {
    const playerMarked: IPlayerMarked = {
      cardNumber: cardNumber,
      marked: cellNumber,
      isMarked: true,
    };
    dispatch(updatePlayerMarked(playerMarked));
  };

  return (
    <div className="flex flex-col w-full gap-0">
      <div className="flex items-center justify-end w-full">
        <Button
          danger
          type="text"
          size="small"
          icon={<Icon icon={'material-symbols:delete'} />}
          className="capitalize"
          onClick={() => onHandleDelete(card, cardNumber)}
        >
          delete
        </Button>
      </div>
      <div className="print-bingo-card-container">
        <div className="print-bingo-card-grid">
          {/* Render column headers */}
          <div className="print-bingo-row">
            {['B', 'I', 'N', 'G', 'O'].map((col) => (
              <div key={col} className="print-bingo-header">
                {col}
              </div>
            ))}
          </div>

          {/* Render bingo card */}
          {[0, 1, 2, 3, 4].map((rowIdx) => (
            <div key={rowIdx} className="print-bingo-row">
              {['B', 'I', 'N', 'G', 'O'].map((col) => {
                const key = `${col}-${rowIdx}`;

                return (
                  <div
                    key={key}
                    className={`print-bingo-card-ceils ${
                      isMarked(String(card[col as keyof IBingoCard][rowIdx]))
                        ? 'selected'
                        : ''
                    }
                      ${isWinningCell(col, rowIdx) ? 'winner-blinking' : ''}
                    
                    ${
                      col === 'N' && card[col][rowIdx] === 'FREE'
                        ? 'bingo-card-free-space h-full text-center'
                        : ''
                    }`}
                    onClick={() =>
                      handleClick(
                        rowIdx,
                        col,
                        String(card[col as keyof IBingoCard][rowIdx]),
                      )
                    }
                  >
                    {card[col as keyof IBingoCard][rowIdx]}{' '}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="cartella-footer">
          <span>{`Card No.`}</span>
          <span>{cardNumber}</span>
        </div>
      </div>
    </div>
  );
};

export default AgentCartella;
