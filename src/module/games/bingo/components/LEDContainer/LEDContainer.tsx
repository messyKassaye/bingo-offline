import { useAppSelector } from '../../../../../store/redux-hooks/redux-hooks';
import LEDNumber from '../LEDNumber/LEDNumber';

const LEDContainer = () => {
  const { calledNumber } = useAppSelector((state) => state.BingoGameSlice);
  return (
    <div className="flex items-center justify-start">
      <div className="flex items-center justify-center">
        <LEDNumber value={calledNumber.length} title="Total call" />
        <LEDNumber
          value={
            calledNumber.length > 0 ? calledNumber[calledNumber.length - 1] : 0
          }
          title="Last call"
        />
      </div>
    </div>
  );
};

export default LEDContainer;
