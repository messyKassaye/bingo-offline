import { Form, Input } from 'antd';
import SelectCartella from '../SelectCartella/SelectCartella';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/redux-hooks/redux-hooks';
import { ChangeEvent, useEffect, useState } from 'react';
import {
  addAllCartella,
  addMultipleCartella,
  updateSelectedCartellaAfterAdded,
} from '../../slices/CartellaSlice';
import { ICartella } from '../../model/ICartella';
import {
  changeBetAmount,
  addMultipleCalledNumber,
  resetClickCount,
  startNewBingoGameAPI,
  updateAddCartellStatus,
  updateBingoBetAmount,
  updateBingoBetAmountStatus,
} from '../../slices/BingoGameSlice';
import { IUpdateBingoGame } from '../../model/IUpdateBIngoGame';
import { Icon } from '@iconify/react';
import { handlePlay } from '../../slices/AudioSlice';
import audioFiles from '../../../../../utils/amAudioFiles';
import { IBingoGame } from '../../model/IBingoGame';
import { storeItemOnLocalstorage } from '../../../../../utils/utils';
import { BET_AMOUNT, CALLED_NUMBERS } from '../../../../../constants/constants';
import { getCashierBingoShopAPI } from '../../slices/BingoShopSlice';
import { changePattern } from '../../slices/PatternSlice';

const StartNewGame = () => {
  const [activeGame, setActiveGame] = useState<IBingoGame | null>(null);
  const { betAmount } = useAppSelector((state) => state.BingoGameSlice);
  const [betAmountInputValue, setBetAmountInputValue] = useState(betAmount);
  const [debouncedBetAmount, setDebouncedBetAmount] = useState(betAmount);
  const { selectedPattern } = useAppSelector((state) => state.PatternSlice);

  const { selectedCartellaClickCount: clickCount } = useAppSelector(
    (state) => state.BingoGameSlice,
  );

  const { selectedCartella, allCartella, totalCartella } = useAppSelector(
    (state) => state.CartellaSlice,
  );

  const { status: updateBetAmountStatus } = useAppSelector(
    (state) => state.BingoGameSlice.updateBetAmount,
  );

  const { status: addCartellStatus, data: addedCartellaData } = useAppSelector(
    (state) => state.BingoGameSlice.addCartella,
  );

  const { data: cashierBingoShopDeposit } = useAppSelector(
    (state) => state.BingoShopSlice.cashierBingoShopDeposit,
  );
  const appliedCut = cashierBingoShopDeposit?.activeCut?.[0]?.cut
    ?? cashierBingoShopDeposit?.cut
    ?? cashierBingoShopDeposit?.company?.cut
    ?? 20;

  const {
    status: startNewGameStatus,
    loading: startNewGameLoading,
    data: startNewGameActiveGame,
    error: startNewGameError,
    errorMessage: startNewGameErrorMessage,
  } = useAppSelector((state) => state.BingoGameSlice.startNewBingoGame);

  const [disableButtons, setDisableButtons] = useState(false);
  const dispatch = useAppDispatch();

  //we start creating new game at the moment start new game button clicked
  useEffect(() => {
    if (startNewGameStatus && startNewGameActiveGame) {
      setActiveGame(startNewGameActiveGame);
      setBetAmountInputValue(startNewGameActiveGame.betAmount);
      setDebouncedBetAmount(startNewGameActiveGame.betAmount);
      dispatch(changeBetAmount(startNewGameActiveGame.betAmount));
      dispatch(changePattern(startNewGameActiveGame.gamePattern.value));
      storeItemOnLocalstorage(BET_AMOUNT, startNewGameActiveGame.betAmount.toString());
      dispatch(addMultipleCartella(startNewGameActiveGame.selectedCartella));
      dispatch(addMultipleCalledNumber(startNewGameActiveGame.calledNumbers));
      localStorage.setItem(
        CALLED_NUMBERS,
        JSON.stringify(startNewGameActiveGame.calledNumbers),
      );
      updateAllCartellaData(startNewGameActiveGame.selectedCartella);
    }
  }, [startNewGameStatus]);

  useEffect(() => {
    dispatch(
      startNewBingoGameAPI({
        gamePattern: selectedPattern,
        betAmount: betAmount,
      }),
    );

    dispatch(getCashierBingoShopAPI());
  }, []);

  useEffect(() => {
    if (addCartellStatus) {
      dispatch(updateSelectedCartellaAfterAdded(addedCartellaData));
      dispatch(updateAddCartellStatus(false));
    }
  }, [addCartellStatus]);

  useEffect(() => {
    updateAllCartellaData();
  }, []);

  useEffect(() => {
    if (cashierBingoShopDeposit !== null) {
      // first we have to check active check is enabled for the current shop
      // if active check is not enabled we use agent shop cut
      // and if agent shop cut is not enable we use the default company cut
      if ((cashierBingoShopDeposit.deposit ?? 0) <= 0) {
        setDisableButtons(true);
        updateAllCartellaData();
        return;
      }

      // The deposit is the ledger balance before this game's commission.
      // Compare it to the full 20% fee for the selected cards plus one more.
      const playerCount = selectedCartella.length;
      const newTotalCut = (playerCount + 1) * betAmount * (appliedCut / 100);
      updateAllCartellaData();
      setDisableButtons(newTotalCut > cashierBingoShopDeposit.deposit);
    } else {
      setDisableButtons(true); // Disable if deposit or company cut is missing
    }
  }, [selectedCartella, betAmount, cashierBingoShopDeposit]);

  useEffect(() => {
    if (clickCount === 10) {
      dispatch(
        handlePlay({
          play: true,
          audioSrc: audioFiles['check_your_number'],
        }),
      );
      dispatch(resetClickCount(0));
    }
  }, [clickCount]);

  useEffect(() => {
    if (updateBetAmountStatus) {
      storeItemOnLocalstorage(BET_AMOUNT, debouncedBetAmount.toString());
      dispatch(changeBetAmount(debouncedBetAmount));
      dispatch(updateBingoBetAmountStatus(false));
    }
  }, [updateBetAmountStatus]);

  // Debounce effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedBetAmount(betAmountInputValue); // Update debounced value after delay
    }, 1000); // Delay of 1 second

    return () => clearTimeout(delayDebounceFn); // Cleanup timeout on change
  }, [betAmountInputValue]);

  useEffect(() => {
    if (activeGame) {
      const updateBetAmountFormData: IUpdateBingoGame = {
        id: activeGame.id,
        betAmount: debouncedBetAmount,
      };
      dispatch(updateBingoBetAmount(updateBetAmountFormData));
    }
  }, [betAmountInputValue, debouncedBetAmount]);

  const updateAllCartellaData = (selectedNumbers = selectedCartella) => {
    //prepare cartella numbers
    const numbers = Array.from(
      { length: totalCartella },
      (_, index) => index + 1,
    ); // 15x5 = 75 items
    const cartellaNumbers = numbers.map((n) => {
      const isSelected = selectedNumbers.includes(n);
      let cartella: ICartella = {
        cartellaNumber: n,
        isSelected: isSelected,
      };
      return cartella;
    });
    dispatch(addAllCartella(cartellaNumbers));
  };

  const onHandeBetAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    if (Number(numericValue) < 10) {
      setBetAmountInputValue(20);
    } else {
      setBetAmountInputValue(Number(numericValue));
    }
  };

  const playCheckYourNumber = () => {
    dispatch(
      handlePlay({
        play: true,
        audioSrc: audioFiles['check_your_number'],
      }),
    );
  };

  if (startNewGameLoading) {
    return <span>Loading...</span>;
  }

  return (
    <div className="flex flex-col items-start justify-start w-[800px]">
      <div className="flex items-start justify-between gap-10 w-full">
        <div className="flex flex-col items-start justify-between w-full">
          <span className="text-2xl font-bold new-game-label capitalize">
            Bet amount
          </span>
          <Form.Item
            className={`mb-2 flex-col new-game-inputs`}
            name={'betAmount'}
          >
            <Input
              onChange={onHandeBetAmountChange}
              value={betAmount}
              type={'text'}
              className="p-2 new-game-input"
              maxLength={6}
              defaultValue={betAmount}
              placeholder={'Bet amount'}
              name={'betAmount'}
            />
          </Form.Item>
        </div>

        <div className="flex items-start justify-center w-full gap-4">
          <span className="text-2xl font-bold new-game-label capitalize">
            Check your number
          </span>
          <Icon
            onClick={playCheckYourNumber}
            className="speaker-icon"
            icon={'game-icons:speaker'}
            fontSize={40}
          />
        </div>
      </div>

      {/** number */}
      {(disableButtons || startNewGameError) && (
        <div className="flex items-center justify-center w-full p-2">
          <span className="text-lg text-red-600 font-bold">
            {startNewGameErrorMessage ||
              "You don't have enough balance. Add balance from Dashboard > Balance before starting a game."}
          </span>
        </div>
      )}
      <div className="cartella-numbers-grid">
        {allCartella.map((cartella: ICartella) => (
          <SelectCartella
            key={cartella.cartellaNumber}
            cartella={cartella}
            disabledButton={disableButtons}
          />
        ))}
      </div>
    </div>
  );
};

export default StartNewGame;
