import classNames from 'classnames';
import { ReactNode } from 'react';

import Portal from './Portal';

type Props = {
  children: ReactNode;
  portalClassName?: string;
};
const SpinnerWrapper = ({ children, portalClassName }: Props) => {
  return (
    <Portal className={classNames('', portalClassName)}>
      <div className={`centered ${portalClassName}`}>{children}</div>
    </Portal>
  );
};

export default SpinnerWrapper;
