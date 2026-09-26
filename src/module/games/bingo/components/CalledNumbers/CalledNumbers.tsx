import { useEffect, useState } from 'react';
import { useAppSelector } from '../../../../../store/redux-hooks/redux-hooks';
import CalledNumber from '../CalledNumber/CalledNumber';
import { ICalledNumber } from '../../model/ICalledNumber';

const CalledNumbers = () => {
  const { latestCalledNumber, calledNumber: allCalledNumbers } = useAppSelector(
    (state) => state.BingoGameSlice,
  );
  const [last4Calls, setLast4Calls] = useState<ICalledNumber[]>([]);

  useEffect(() => {
    const last4 = allCalledNumbers.slice(-3, -1);
    const transformedCalls = last4
      .map((n) => {
        const letter = ['b', 'i', 'n', 'g', 'o'][Math.floor((n - 1) / 15)];
        const result: ICalledNumber = {
          letter: letter,
          calledNumber: n,
        };
        return result;
      })
      .reverse();
    setLast4Calls(transformedCalls);
  }, [latestCalledNumber]);
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      <CalledNumber bingoNumber={latestCalledNumber} />
      <div className="flex flex-col items-center justify-center w-full h-full gap-1">
        {last4Calls.map((last4) => (
          <CalledNumber bingoNumber={last4} />
        ))}
      </div>
    </div>
  );
};

export default CalledNumbers;
