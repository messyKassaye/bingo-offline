import { Icon } from '@iconify/react';
import { Button, Form, Input } from 'antd';
import { ChangeEvent, useEffect, useState } from 'react';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/redux-hooks/redux-hooks';
import {
  checkGameWinnerAPI,
  endBingoGameAPI,
  lockCartellaAPI,
  refunBingoGameAPI,
} from '../../slices/BingoGameSlice';

import { handlePlay } from '../../slices/AudioSlice';
import WinnerBingoBoard from '../WinnerBingoBoard/WinnerBingoBoard';
import { getCashierBingoShopAPI } from '../../slices/BingoShopSlice';
import audioFiles from '../../../../../utils/amAudioFiles';
import { updateWinnerCartellas } from '../../slices/CartellaSlice';
import { CALLED_NUMBERS } from '../../../../../constants/constants';

const CheckWinner = () => {
  const {
    status: winnerStatus,
    data: { hasWon, winningLines },
  } = useAppSelector((state) => state.BingoGameSlice.checkWinner);
  const { loading: cahsierBingoShopLoading, data: cashierBingoShopData } =
    useAppSelector((state) => state.BingoShopSlice.cashierBingoShop);

  const {
    data: { status: lockCartellaStatus, message: lockCartellaMessage },
  } = useAppSelector((state) => state.BingoGameSlice.lockCartella);
  const { selectedCartella, winnerCartellas: winnerCartellasData } =
    useAppSelector((state) => state.CartellaSlice);
  const { selectedPattern, gamePatterns } = useAppSelector((state) => state.PatternSlice);
  const [numberOfWinners, setNumberOfWinners] = useState(0);
  const [winnerCartellas, setWinnerCartellas] = useState<number[]>([]);

  const [message, setMessage] = useState('');
  const [isButtonsDisabled, setButtonsDisabled] = useState(true);
  const [cartellaId, setCartellaId] = useState<number>(0);
  const dispatch = useAppDispatch();
  const selectedPatternName = gamePatterns.data.find(
    (pattern) => pattern.value === selectedPattern,
  )?.name;

  useEffect(() => {
    dispatch(getCashierBingoShopAPI());
  }, []);

  useEffect(() => {
    if (lockCartellaStatus) {
      setMessage(lockCartellaMessage);
    }
  }, [lockCartellaStatus]);

  useEffect(() => {
    if (winnerStatus) {
      if (hasWon) {
        playAudio(audioFiles['win']);
        if (!winnerCartellas.includes(cartellaId)) {
          setWinnerCartellas((prev) => [...prev, cartellaId]);
        }
        //dispatch(handleDisableCartella(false));
      } else {
        playAudio(audioFiles['not_win']);
      }

      setButtonsDisabled(false);
    }
  }, [winnerStatus, hasWon, winningLines]);

  useEffect(() => {
    if (winnerCartellas.includes(cartellaId)) {
      setNumberOfWinners((winner) => winner + 1);
      dispatch(updateWinnerCartellas(winnerCartellas));
    }
  }, [winnerCartellas]);

  const playAudio = (path: string) => {
    dispatch(
      handlePlay({
        play: true,
        audioSrc: path,
      }),
    );
  };

  const onHandleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMessage('');
    setCartellaId(Number(value));
  };

  const onHandleCheck = () => {
    if (!selectedCartella.includes(Number(cartellaId))) {
      setMessage('This cartella is not added to this Game');
    } else if (
      cashierBingoShopData?.agentShop?.games[0]?.lockedCartella.includes(
        cartellaId,
      )
    ) {
      setMessage('This cartella is Locked');
    } else {
      const stored = localStorage.getItem(CALLED_NUMBERS);
      const storedCalledNumbers = stored ? JSON.parse(stored) : [];
      dispatch(
        checkGameWinnerAPI({
          cartellaNumber: cartellaId,
          calledNumbers: storedCalledNumbers,
        }),
      );
    }
  };

  const endGame = () => {
    dispatch(
      endBingoGameAPI({
        winnerCartellas: winnerCartellasData,
      }),
    );
  };

  const lockCartella = () => {
    dispatch(lockCartellaAPI({ cartellaNumber: cartellaId }));
  };

  const refund = () => {
    dispatch(
      refunBingoGameAPI({
        winnerCartellas: winnerCartellasData,
      }),
    );
  };
  if (cahsierBingoShopLoading) {
    return <span className="text-lg text-green-300 font-bold">Loading...</span>;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full gap-3">
      {message && (
        <div className="p-2">
          <span className="text-red-500 text-lg">{message}</span>
        </div>
      )}
      <span className="text-2xl text-green-400">Enter Cartela Number</span>
      <div className="flex items-center justify-center w-full gap-2">
        <Form.Item
          className={`mb-1 flex-col new-game-inputs`}
          name={'betAmount'}
        >
          <Input
            onChange={onHandleChange}
            type={'text'}
            className="p-2 new-game-input"
            placeholder={'Enter Cartella Number'}
            name={'cartellaId'}
          />
        </Form.Item>

        <Button
          onClick={onHandleCheck}
          className="p-5"
          type="primary"
          disabled={cartellaId <= 0}
          icon={<Icon icon={'material-symbols:check'} fontSize={32} />}
        >
          Check
        </Button>
        <Button
          onClick={lockCartella}
          type="primary"
          danger
          className="p-5"
          disabled={isButtonsDisabled}
          icon={<Icon icon={'material-symbols:lock'} fontSize={32} />}
        >
          Lock
        </Button>
      </div>
      <div className="flex items-center justify-start gap-2 w-full">
        <Button
          onClick={endGame}
          type="primary"
          className="p-5"
          danger
          disabled={isButtonsDisabled}
          icon={<Icon icon={'hugeicons:call-end-01'} fontSize={32} />}
        >
          End game
        </Button>
        <Button
          onClick={refund}
          type="primary"
          className="p-5"
          disabled={numberOfWinners < 3}
          icon={<Icon icon={'gridicons:refund'} fontSize={32} />}
        >
          Refund
        </Button>
      </div>

      {/* Display the WinnerBingoBoard only if the data is valid */}
      <div className="flex flex-col w-full gap-0">
        {winnerStatus && (
          <div className="flex items-center justify-end w-full">
            <span className="text-2xl text-green-600 capitalize">
              {selectedPatternName || cashierBingoShopData.agentShop?.games[0]?.gamePattern?.name || 'No Pattern'}
            </span>
          </div>
        )}
        <WinnerBingoBoard />
      </div>
    </div>
  );
};

export default CheckWinner;
