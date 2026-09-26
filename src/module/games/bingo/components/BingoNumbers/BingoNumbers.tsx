import { useAppSelector } from '../../../../../store/redux-hooks/redux-hooks';
import { IBingoNumbers } from '../../model/IBingoNumber';

type Props = {
  bingoNumber: IBingoNumbers;
};
const BingoNumbers = ({ bingoNumber }: Props) => {
  const { calledNumber } = useAppSelector((state) => state.BingoGameSlice);

  return (
    <div
      className={`${
        calledNumber.includes(bingoNumber.bingoNumber)
          ? 'called-bingo-number'
          : 'bingo-number-item'
      }`}
    >
      {bingoNumber.bingoNumber}
    </div>
  );
};

export default BingoNumbers;
