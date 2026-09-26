import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../../../../store/redux-hooks/redux-hooks';

const RegisteredCartella = () => {
  const { selectedCartella } = useAppSelector((state) => state.CartellaSlice);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [shouldScroll, setShouldScroll] = useState<boolean>(false); // Explicitly define the state type

  useEffect(() => {
    // Check if content overflows the container
    const container = containerRef.current;
    const content = contentRef.current;

    if (container && content) {
      // Set shouldScroll to true if the content's scrollWidth is greater than the container's offsetWidth
      setShouldScroll(content.scrollWidth > container.offsetWidth);
    }
  }, [selectedCartella]);

  return (
    <div className="flex flex-col items-start justify-start  ">
      <span className="title font-bold text-2xl">Registered Cartella</span>
      <div className="registeted-cartella-container" ref={containerRef}>
        <div
          className={`flex items-start justify-start gap-4 ${
            shouldScroll ? 'start-animation' : ''
          }`}
          ref={contentRef}
        >
          {' '}
          {selectedCartella.map((cart, index) => (
            <div key={index} className="registeted-cartella">
              {cart}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegisteredCartella;
