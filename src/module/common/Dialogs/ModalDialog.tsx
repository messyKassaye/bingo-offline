import { Icon } from '@iconify/react';
import { Modal } from 'antd';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  width?: number;
  isOpen: boolean;
  title: string;
  onCloseIcon: () => void;
};

const ModalDialog = ({
  children,
  width,
  isOpen,
  title,
  onCloseIcon,
}: Props) => {
  return (
    <Modal
      className="w-auto"
      closeIcon={
        <Icon
          onClick={onCloseIcon}
          className="cursor-pointer md:text-3xl"
          icon="material-symbols:close"
          color="black"
          fontSize={28}
        />
      }
      maskClosable={false}
      title={title}
      centered
      footer
      open={isOpen}
      destroyOnClose
      width={width}
      onCancel={() => onCloseIcon()}
    >
      {children}
    </Modal>
  );
};

export default ModalDialog;
