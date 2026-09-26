import { useEffect } from 'react';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/redux-hooks/redux-hooks';
import RuleAnimations from '../RuleAnimations/RuleAnimations';
import { IBingoNumbers } from '../../model/IBingoNumber';
import { createBingoNumbers } from '../../slices/BingoNumberSlice';
import BingoNumbers from '../BingoNumbers/BingoNumbers';
import CalledNumbers from '../CalledNumbers/CalledNumbers';

const BingoMain = () => {
  const { bingoNumbers } = useAppSelector((state) => state.BingoNumberSlice);
  const dispatch = useAppDispatch();
  useEffect(() => {
    const number75 = Array.from({ length: 15 * 5 }, (_, index) => index + 1); // 15x5 = 75 items
    const bingoNumbers = number75.map((n) => {
      const result: IBingoNumbers = {
        id: n,
        bingoNumber: n,
        isCalled: false,
      };
      return result;
    });
    dispatch(createBingoNumbers(bingoNumbers));
  }, []);

  return (
    <div className="flex items-start justify-start w-full bingo-main-container gap-1 overflow-hidden">
      <div className="flex flex-col items-center justify-center p-1 gap-8 h-full">
        <RuleAnimations />
        <CalledNumbers />
      </div>
      <div className="flex flex-col items-start justify-start flex-grow h-full">
        {['B', 'I', 'N', 'G', 'O'].map((letter, index) => (
          <div
            className="bingo-letters flex items-center justify-center flex-grow h-full"
            key={index}
          >
            {letter}
          </div>
        ))}
      </div>
      <div className="bingo-card-container h-full">
        {bingoNumbers.map((bingoNumber) => (
          <BingoNumbers
            key={bingoNumber.bingoNumber}
            bingoNumber={bingoNumber}
          />
        ))}
      </div>
    </div>
  );
};

export default BingoMain;
