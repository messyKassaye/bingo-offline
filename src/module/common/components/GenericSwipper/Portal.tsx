import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  children: ReactNode;
  className?: string;
}

const Portal = ({ children, className }: Props) => {
  const [container] = useState(() => document.createElement('div'));

  useEffect(() => {
    if (className) {
      container.className = className;
    }

    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

  return createPortal(children, container);
};

export default Portal;
