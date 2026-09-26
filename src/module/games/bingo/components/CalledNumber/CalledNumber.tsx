import { ICalledNumber } from '../../model/ICalledNumber';

type Props = {
  bingoNumber: ICalledNumber;
};
const CalledNumber = ({ bingoNumber }: Props) => {
  const { letter, calledNumber } = bingoNumber;
  console.log(letter);
  return (
    <>
      {letter && (
        <div className="bingo-directions-container">
          {/* Numbers in Four Directions */}
          <div className={`circle ${letter}-letter`}>
            <span className="bingo-letter text-2xl">
              {letter.toUpperCase()}
            </span>
            <span className="bingo-number text-3xl">{calledNumber}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default CalledNumber;
