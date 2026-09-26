type Props = {
  bgColor: string;
  title: string;
  value: number;
  isShowCurrency: boolean;
};
const BingoDashboardCard = ({
  bgColor,
  title,
  value,
  isShowCurrency,
}: Props) => {
  return (
    <div
      className={`flex min-w-0 w-full flex-col items-start justify-start p-3 rounded-lg`}
      style={{ backgroundColor: bgColor, color: '#0F0D0F' }}
    >
      <span className="text-lg capitalize">{title}</span>
      <div className="flex items-start gap-2 text-2xl font-bold">
        <span>{value.toLocaleString()}</span>
        {isShowCurrency && <span>Br</span>}
      </div>
    </div>
  );
};

export default BingoDashboardCard;
