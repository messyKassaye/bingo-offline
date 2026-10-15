import { useEffect } from 'react';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../store/redux-hooks/redux-hooks';
import BingoFooter from './components/BingoFooter/BingoFooter';
import BingoHeader from './components/BingoHeader/BingoHeader';
import BingoMain from './components/BingoMain/BingoMain';
import { getCashierBingoShopAPI } from './slices/BingoShopSlice';
import {
  addAllCartella,
  addMultipleCartella,
  updateTotalCartella,
} from './slices/CartellaSlice';
import {
  addMultipleCalledNumber,
  changeBetAmount,
  updateAddCartellStatus,
} from './slices/BingoGameSlice';
import AudioPlayer from '../../common/components/AuidoPlayer/AudioPlayer';
import { ICartella } from './model/ICartella';
import SubscriptionBanner from './components/SubscriptionBanner/SubscriptionBanner';

const BingoGame = () => {
  const { status, data: cashierBingoShopData } = useAppSelector(
    (state) => state.BingoShopSlice.cashierBingoShop,
  );
  const { totalCartella } = useAppSelector((state) => state.CartellaSlice);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getCashierBingoShopAPI());
  }, []);

  useEffect(() => {
    //prepare cartella numbers
    if (status && cashierBingoShopData.agentShop.company?.cards) {
      dispatch(updateTotalCartella(cashierBingoShopData.agentShop.company.cards.length));
    }
  }, [status, cashierBingoShopData]);

  useEffect(() => {
    const cards = cashierBingoShopData.agentShop.company?.cards;
    const numbers = Array.from(
      { length: cards?.length ? cards.length : 100 },
      (_, index) => index + 1,
    ); // 15x5 = 75 items
    const cartellaNumbers = numbers.map((n) => {
      let cartella: ICartella = {
        cartellaNumber: n,
        isSelected: false,
      };
      return cartella;
    });
    dispatch(addAllCartella(cartellaNumbers));
  }, [totalCartella]);

  useEffect(() => {
    if (status) {
      if (cashierBingoShopData.agentShop) {
        const { games } = cashierBingoShopData.agentShop;
        if (games.length > 0) {
          dispatch(
            changeBetAmount(cashierBingoShopData.agentShop.games[0].betAmount),
          );
          dispatch(addMultipleCalledNumber(games[0].calledNumbers));
          dispatch(addMultipleCartella(games[0].selectedCartella));
          dispatch(updateAddCartellStatus(false));
        }
      }
    }
  }, [status]);

  return (
    <div className="w-full h-screen flex flex-col items-start justify-start gap-2">
      <BingoHeader />
      <SubscriptionBanner />
      <BingoMain />
      <AudioPlayer />
      <BingoFooter />
    </div>
  );
};

export default BingoGame;
