import { useEffect } from 'react';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/redux-hooks/redux-hooks';
import { updateWinAmount } from '../../slices/BingoGameSlice';
import { getCashierBingoShopAPI } from '../../slices/BingoShopSlice';

const WinAmount = () => {
  const { status, data } = useAppSelector(
    (state) => state.BingoShopSlice.cashierBingoShop,
  );

  const { status: updateBetAmountStatus } = useAppSelector(
    (state) => state.BingoGameSlice.updateBetAmount,
  );
  const { betAmount } = useAppSelector((state) => state.BingoGameSlice);
  const { selectedCartella } = useAppSelector((state) => state.CartellaSlice);
  const { winAmount } = useAppSelector((state) => state.BingoGameSlice);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getCashierBingoShopAPI());
  }, []);

  useEffect(() => {
    if (status || updateBetAmountStatus) {
      updateWinAmountValue();
    }
  }, [status, updateBetAmountStatus]);

  useEffect(() => {
    updateWinAmountValue();
  }, [selectedCartella, betAmount]);

  const updateWinAmountValue = () => {
    // first we have to check active check is enabled for the current shop
    // if active check is not enabled we use agent shop cut
    // and if agent shop cut is not enable we use the default company cut
    const totalAmount = selectedCartella.length * betAmount;
    const { activeCut, cut: shopCut, company } = data.agentShop;
    const companyCut = company?.cut ?? 0;

    // Determine the applicable cut: active cut > shop cut > company cut
    const appliedCut = activeCut?.[0]?.cut ?? shopCut ?? companyCut;
    if (appliedCut) {
      const shopTakes = totalAmount * (appliedCut / 100);
      const totalWinAmount = totalAmount - shopTakes;
      dispatch(updateWinAmount(totalWinAmount));
    }
  };

  return (
    <div className="win-amount-container w-auto">
      <div className="win-amount-header">Win Amount</div>
      <div className="win-amount-value">
        <span className="amount">{Math.round(winAmount)}</span>{' '}
        <span className="currency">ETB</span>
      </div>
    </div>
  );
};
export default WinAmount;
