import { Button } from 'antd';

type Props = {
  message: string;
  onOk: () => void;
  onCancel: () => void;
};
const Confirmation = ({ message, onOk, onCancel }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center w-full gap-6">
      <span className="text-lg text-red-500">{message}</span>
      <div className="flex items-center justify-end gap-10 w-full">
        <Button type="primary" color="primary" onClick={onOk}>
          Ok
        </Button>
        <Button type="primary" danger onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default Confirmation;
