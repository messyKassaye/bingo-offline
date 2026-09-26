import { IDeposit } from '../../../model/IDeposit';

const DepositListColumn = () => {
  return [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text: string, record: IDeposit, rowIndex: number) => {
        return <span>{record.recipient.name}</span>;
      },
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      render: (text: string, record: IDeposit, rowIndex: number) => {
        return <span>{record.recipient.phone}</span>;
      },
    },
    {
      title: 'Amount',
      dataIndex: 'masterAgent',
      render: (text: string, record: IDeposit, rowIndex: number) => {
        return <span>{record.amount}</span>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'statusId',
      render: (text: string, record: IDeposit, rowIndex: number) => {
        return (
          <span>{record.statusId === 1 ? 'Delivered' : 'Not delivered'}</span>
        );
      },
    },
  ];
};

export default DepositListColumn;
