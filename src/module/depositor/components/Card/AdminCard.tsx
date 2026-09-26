import { Icon } from '@iconify/react';
import Dot from '../Dot/Dot';
import { IDashboardReport } from '../../model/IDashboardReport';

type Props = {
  card: IDashboardReport;
};
const AdminCard = ({ card }: Props) => {
  return (
    <div className="admin-card">
      <div className="flex items-start justify-between w-full">
        <div className="flex flex-col items-start justify-start">
          <div className="flex items-center justify-center mb-2">
            {card.iconColor && <Dot type="small" color={card.iconColor} />}
            <div className="flex items-center justify-center">
              <h5 className="uppercase font-semibold">{card.title}</h5>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 font-bold">
            {card.currency && <h2 className="font-bold">{card.currency}</h2>}
            <h2 className="font-bold">
              {typeof card.data === 'string'
                ? card.data
                : card.id === 6
                  ? `Av ${card.data}%`
                  : card.data.toLocaleString()}
            </h2>
          </div>
          {card.subTitle && <span className="subtitle">{card.subTitle}</span>}
        </div>

        <div className="flex flex-col items-start justify-start">
          <Icon icon={card.icon} color={card.color} fontSize={38} />
        </div>
      </div>
    </div>
  );
};

export default AdminCard;
