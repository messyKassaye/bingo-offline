import LEDContainer from '../LEDContainer/LEDContainer';
import RegisteredCartella from '../RegisteredCartella/RegisteredCartella';
import WinAmount from '../WinAmount/WinAmount';

const BingoHeader = () => {
  return (
    <div className="flex items-start justify-between w-full px-1 bg-[#0e2238]">
      <LEDContainer />
      <div className="flex items-start justify-between w-full">
        <RegisteredCartella />
        <WinAmount />
      </div>
    </div>
  );
};
export default BingoHeader;
