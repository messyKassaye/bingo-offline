type Props = {
  value: number;
  title?: string;
};
const LEDNumber = ({ value, title }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center led-number-container">
      <div className="led-number flex flex-col items-center justify-center gap-1">
        {value}
      </div>
      {title && (
        <span className="text-center led-number-title text-white">{title}</span>
      )}
    </div>
  );
};

export default LEDNumber;
