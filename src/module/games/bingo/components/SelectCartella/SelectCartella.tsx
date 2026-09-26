import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/redux-hooks/redux-hooks';
import { IAddCartella } from '../../model/IAddCartella';

import {
  addCartellaAPI,
  increamentClickCount,
} from '../../slices/BingoGameSlice';
import { ICartella } from '../../model/ICartella';
import { useEffect, useState } from 'react';
import { notification } from 'antd';

type Props = {
  cartella: ICartella;
  disabledButton: boolean;
};
const SelectCartella = ({ cartella, disabledButton }: Props) => {
  const { selectedCartellaClickCount } = useAppSelector(
    (state) => state.BingoGameSlice,
  );
  const { selectedPattern } = useAppSelector((state) => state.PatternSlice);
  const [clickCount, setClickCount] = useState(selectedCartellaClickCount);
  const { betAmount, isGameStarted } = useAppSelector(
    (state) => state.BingoGameSlice,
  );
  const selectedCartella = useAppSelector(
    (state) => state.CartellaSlice.selectedCartella,
  );
  const isSelected = selectedCartella.includes(cartella.cartellaNumber);
  const { data: gamePatterns } = useAppSelector(
    (state) => state.PatternSlice.gamePatterns,
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (clickCount === 10) {
      setClickCount(0);
    }
  }, [clickCount]);

  const onAddCartella = () => {
    const pattern = gamePatterns.find((p) => p.value === selectedPattern);

    if (pattern) {
      const formData: IAddCartella = {
        betAmount: betAmount,
        gamePatternId: pattern?.id,
        selectedCartella: cartella.cartellaNumber,
        isSelect: isSelected,
      };
      dispatch(addCartellaAPI(formData));
      setClickCount((prev) => prev + 1);
      dispatch(increamentClickCount(''));
    } else {
      notification.open({
        message: 'Confirmation',
        description: 'Please select game pattern',
      });
    }
  };

  return (
    <button
      disabled={isGameStarted || (!isSelected && disabledButton)}
      onClick={onAddCartella}
      className={`${
        isSelected ? 'selected-cartella-number' : 'cartella-numbers'
      }`}
    >
      {cartella.cartellaNumber}
    </button>
  );
};

export default SelectCartella;
