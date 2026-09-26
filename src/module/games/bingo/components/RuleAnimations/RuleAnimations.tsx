import { useState, useEffect } from 'react';
import { useAppSelector } from '../../../../../store/redux-hooks/redux-hooks';
import { getAnimationPatterns } from './patterns/patterns';

const RuleAnimations = () => {
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const { selectedPattern } = useAppSelector((state) => state.PatternSlice);
  const patterns = getAnimationPatterns(selectedPattern);
  const activePattern = patterns[currentPatternIndex % patterns.length] ?? patterns[0] ?? [];

  const grid = [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25],
  ];

  useEffect(() => {
    setCurrentPatternIndex(0);
    if (patterns.length === 0) return;
    const interval = setInterval(() => {
      setCurrentPatternIndex((prevIndex) =>
        (prevIndex + 1) % patterns.length,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedPattern, patterns.length]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <span className="text-lg font-bold text-white">Supported patterns</span>
      <div className="bingo-container">
        <div className="bingo-grid" key={`${selectedPattern}-${currentPatternIndex}`}>
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`bingo-cell ${
                  activePattern.some(
                    ([r, c]) => r === rowIndex && c === colIndex,
                  )
                    ? 'winning'
                    : ''
                }`}
              ></div>
            )),
          )}
        </div>
      </div>
    </div>
  );
};

export default RuleAnimations;
