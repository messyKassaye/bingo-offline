import { Button, Drawer, Select, SelectProps, Slider } from 'antd';
import { Icon } from '@iconify/react';
import { useEffect, useRef, useState } from 'react';
import PlayPauseButton from '../../../../common/components/PlayPauseButton/PlayePauseButton';
import ModalDialog from '../../../../common/Dialogs/ModalDialog';
import StartNewGame from '../StartNewGame/StartNewGame';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/redux-hooks/redux-hooks';
import {
  changeIntervalTime,
  changeSpeaker,
  handlePlay,
} from '../../slices/AudioSlice';
import {
  addCalled,
  clearCalledNumber,
  endBingoGameAPI,
  handleDisableCartella,
  handleGameStarted,
  removeCalledNumber,
  resetClickCount,
  updateBingoGameTimeIntervalAPI,
  updateBingoGameWinnerResult,
  updateEndGameState,
  updateLatestCalledNumber,
  updateRefundGameState,
} from '../../slices/BingoGameSlice';
import {
  getCashierBingoShopAPI,
  getCashierBingoShopDepositAPI,
} from '../../slices/BingoShopSlice';
import CheckWinner from '../CheckWinner/CheckWinner';
import { addMultipleCartella } from '../../slices/CartellaSlice';
import Confirmation from '../Confirmation/Confirmation';
import { openNotification } from '../../../../../slices/DialogSlice';
import {
  CALLED_NUMBERS,
  GAME_STARTED,
  INTERVAL_TIME,
  SELECTED_PATTERN,
  ShowErrorComponent,
  SUPPORTED_LANGUAGES,
} from '../../../../../constants/constants';
import BingoDashboard from '../BingoDashboard/BingoDashboard';
import { bingoCashierDashboardAPI } from '../../../../common/slices/UserSlice';
import {
  changePattern,
  changePatternAPI,
  changePatternId,
  gamePatternsAPI,
} from '../../slices/PatternSlice';
import { IOption } from '../../../../../models/IOptions';
import {
  storeItemOnLocalstorage,
  storeSelectedLanguage,
} from '../../../../../utils/utils';
import audioFiles from '../../../../../utils/audioFiles';
import { getItemFromLocalStorage } from '../../../../common/services/TokenService';
import { IAudioFile } from '../../../../../models/IAudioFiles';
import { isTauri } from '@tauri-apps/api/core';
import { LOCAL_SESSION } from '../../../../../constants/constants';
import { appendOfflineCalledNumber, getOfflineAccountId, setOfflineGamePattern, updateOfflineGame } from '../../../../../config/db/services/OfflineBingoService';

const BingoFooter = () => {
  const [speedTime, setSpeedTime] = useState<number>(5);
  const speedTimeRef = useRef(speedTime);

  const {
    data: { status: isThereActiveGame, message: noActiveMessage },
  } = useAppSelector((state) => state.BingoGameSlice.startGame);
  const { selectedCartella, winnerCartellas } = useAppSelector(
    (state) => state.CartellaSlice,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const { isGameStarted } = useAppSelector((state) => state.BingoGameSlice);
  const { status: dashboardStatus } = useAppSelector(
    (state) => state.UserSlice.cashierDashboard,
  );

  const { status: cashierDepositStatus, data: cashierShopDeposit } =
    useAppSelector((state) => state.BingoShopSlice.cashierBingoShopDeposit);

  const {
    status: patternsStatus,
    loading: isPatternLoading,
    data: gamePatternsData,
  } = useAppSelector((state) => state.PatternSlice.gamePatterns);
  const {
    data: { status: refundStatus },
  } = useAppSelector((state) => state.BingoGameSlice.refund);
  const [isOpenDashboard, setIsOpenDashboard] = useState(false);

  const { selectedPattern } = useAppSelector((state) => state.PatternSlice);
  const [isShowStartNewGameModal, setIsShowStartNewGameModal] = useState(false);
  const [isShowCheckWinnerModal, setIsShowCheckWinnerModal] = useState(false);
  const [isShowConfirmationModal, setIsShowConfirmationModal] = useState(false);
  const [patternOptions, setPatternOptions] = useState<IOption[]>([]);
  const [languageOptions, setLanguageOptions] = useState<IOption[]>([]);
  const { speaker } = useAppSelector((state) => state.AudioSlice);
  const { status: endGameStatus } = useAppSelector(
    (state) => state.BingoGameSlice.endBingoGame,
  );

  const {
    loading: cashierBingoShopLoading,
    status: cashierBingoShopStatus,
    data: cashierBingoShopData,
  } = useAppSelector((state) => state.BingoShopSlice.cashierBingoShop);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const calledNumbersRef = useRef<number[]>([]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getCashierBingoShopAPI());
    dispatch(gamePatternsAPI());

    //prepare language options
    const languages = SUPPORTED_LANGUAGES.map((l) => {
      const options: IOption = {
        label: l.name,
        value: l.code,
      };
      return options;
    });
    setLanguageOptions(languages);
  }, []);

  useEffect(() => {
    const gameStarted = getItemFromLocalStorage(GAME_STARTED);
    if (gameStarted) {
      dispatch(handleGameStarted(true));
    }
  }, []);

  useEffect(() => {
    calledNumbersRef.current = calledNumbers;
    localStorage.setItem(
      CALLED_NUMBERS,
      JSON.stringify(calledNumbersRef.current),
    );
  }, [calledNumbers]);

  useEffect(() => {
    speedTimeRef.current = speedTime;
  }, [speedTime]);

  useEffect(() => {
    if (cashierBingoShopStatus) {
      // find previously called numbers at component mount
      const { games } = cashierBingoShopData.agentShop;
      if (games.length > 0) {
        const stored = localStorage.getItem(CALLED_NUMBERS);
        const storedCalledNumbers = stored ? JSON.parse(stored) : [];
        // Combine and ensure uniqueness
        const allCalledNumbers = Array.from(
          new Set([...storedCalledNumbers, ...games[0].calledNumbers]),
        );
        setCalledNumbers(allCalledNumbers);
      }
    }
  }, [cashierBingoShopStatus]);

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(
      async () => {
        const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
        const availableNumbers = allNumbers.filter(
          (num) => !calledNumbersRef.current.includes(num),
        );
        if (availableNumbers.length === 0) return calledNumbers;

        const calledBingoNumber =
          availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        setCalledNumbers((prev) => [...prev, calledBingoNumber]); // updates state
        calledNumbersRef.current = [
          ...calledNumbersRef.current,
          calledBingoNumber,
        ];

        playCalledNumber(calledBingoNumber);

      },
      Number(speedTimeRef.current) * 1000,
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speedTimeRef.current]);

  useEffect(() => {
    if (endGameStatus) {
      clearAllGameResults();
      if (getOfflineAccountId() !== null) {
        dispatch(getCashierBingoShopAPI());
      }
    }
  }, [endGameStatus]);

  useEffect(() => {
    if (refundStatus) {
      setIsShowCheckWinnerModal(false);
      dispatch(updateEndGameState(false));
      dispatch(removeCalledNumber([]));
      dispatch(updateBingoGameWinnerResult(false));
      setIsShowConfirmationModal(false);
      dispatch(clearCalledNumber(false));
      dispatch(updateRefundGameState(false));
      dispatch(resetClickCount(0));
      setIsPlaying(false);
      localStorage.removeItem(CALLED_NUMBERS);
      localStorage.removeItem(GAME_STARTED);
      setCalledNumbers([]);
    }
  }, [refundStatus]);

  useEffect(() => {
    if (patternsStatus) {
      const transformPattern = gamePatternsData.map((p) => {
        const options: IOption = {
          label: p.name,
          value: p.value,
        };
        return options;
      });
      setPatternOptions(transformPattern);
    }
  }, [patternsStatus]);

  useEffect(() => {
    if (dashboardStatus) {
      setIsOpenDashboard(true);
    }
  }, [dashboardStatus]);

  useEffect(() => {
    if (cashierShopDeposit !== null && cashierDepositStatus) {
      setIsShowStartNewGameModal(true);
    }
  }, [cashierDepositStatus, cashierShopDeposit]);

  useEffect(() => {
    if (isThereActiveGame) {
      dispatch(
        openNotification({
          isOpen: true,
          notificationType: 'error',
          title: 'Error',
          errorComponent: ShowErrorComponent.ERROR_MESSAGE,
          message: { noActiveMessage },
        }),
      );
      dispatch(updateEndGameState(false));
    }
  }, [isThereActiveGame]);

  useEffect(() => {
    if (cashierBingoShopStatus) {
      const games = cashierBingoShopData.agentShop.games;
      // if all numbers are called
      if (games.length > 0 && games[0].calledNumbers.length >= 75) {
        setIsPlaying(false);
        dispatch(handleGameStarted(false));
        localStorage.removeItem(GAME_STARTED);
      }
    }
  }, [cashierBingoShopData, cashierBingoShopStatus]);

  const onPlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      const offlineAccountId = getOfflineAccountId();
      if (offlineAccountId !== null) {
        void updateOfflineGame(offlineAccountId, (game) => { game.isCalling = false; });
      }
      setIsShowCheckWinnerModal(true);
    } else {
      setIsPlaying(true);
      const offlineAccountId = getOfflineAccountId();
      if (offlineAccountId !== null) {
        void updateOfflineGame(offlineAccountId, (game) => { game.isCalling = true; });
      }
      storeItemOnLocalstorage(GAME_STARTED, 'true');
      dispatch(handleGameStarted(true));
      const speakerAudioFiles = audioFiles.find(
        (l) => l.code === speaker,
      )?.audioFile;

      if (speakerAudioFiles?.['game_started']) {
        dispatch(
          handlePlay({
            play: true,
            audioSrc: speakerAudioFiles['game_started'],
          }),
        );
      }
    }
  };

  const playCalledNumber = (calledBingoNumber: number) => {
    const offlineAccountId = getOfflineAccountId();
    if (offlineAccountId !== null) {
      void appendOfflineCalledNumber(offlineAccountId, calledBingoNumber);
    }
    const letter = ['b', 'i', 'n', 'g', 'o'][
      Math.floor((calledBingoNumber - 1) / 15)
    ];
    const fileIndex = `${letter}_${calledBingoNumber}`;

    const speakerAudioFiles = audioFiles.find(
      (l: IAudioFile) => l.code === speaker,
    )?.audioFile;

    if (speakerAudioFiles) {
      const audioFileName = speakerAudioFiles[fileIndex];
      dispatch(
        updateLatestCalledNumber({
          letter: letter,
          calledNumber: calledBingoNumber,
        }),
      );
      dispatch(addCalled(calledBingoNumber));
      dispatch(
        handlePlay({
          play: true,
          audioSrc: audioFileName,
        }),
      );
    }
  };

  const onStartNewGame = () => {
    dispatch(getCashierBingoShopDepositAPI());
  };

  const onCheckWinner = () => {
    setIsShowCheckWinnerModal(true);
  };

  const onHandleClear = () => {
    setIsShowConfirmationModal(true);
  };

  const onCloseChekWinnerModal = () => {
    dispatch(updateBingoGameWinnerResult(false));
    setIsShowCheckWinnerModal(false);
  };

  const onShuffleBoard = () => {
    const speakerAudioFiles = audioFiles.find(
      (l) => l.code === speaker,
    )?.audioFile;
    if (speakerAudioFiles) {
      dispatch(
        handlePlay({
          play: true,
          audioSrc: speakerAudioFiles['jark'],
        }),
      );
    }
  };

  type LabelRender = SelectProps['labelRender'];

  const labelRender: LabelRender = ({ label, value }) => {
    // Check if the value is 'all', then render the custom label
    if (value === 'all') {
      return <span>Default Patterns</span>;
    }

    // Default behavior: render the label if it's provided
    return <span>{label}</span>;
  };

  const onHandleOkConfirmation = () => {
    dispatch(endBingoGameAPI({ winnerCartellas: winnerCartellas }));
    dispatch(handleGameStarted(false));
  };

  const clearAllGameResults = () => {
    setIsShowCheckWinnerModal(false);
    dispatch(updateEndGameState(false));
    dispatch(addMultipleCartella([]));
    dispatch(removeCalledNumber([]));
    dispatch(updateBingoGameWinnerResult(false));
    setIsShowConfirmationModal(false);
    dispatch(clearCalledNumber(false));
    dispatch(updateRefundGameState(false));
    dispatch(resetClickCount(0));
    dispatch(handleDisableCartella(false));
    dispatch(handleGameStarted(false));
    localStorage.removeItem(CALLED_NUMBERS);
    localStorage.removeItem(GAME_STARTED);
    setCalledNumbers([]);
  };

  const onOpenDashboard = () => {
    if (isTauri() && localStorage.getItem(LOCAL_SESSION)) {
      setIsOpenDashboard(true);
      return;
    }
    dispatch(bingoCashierDashboardAPI());
  };

  const onSelectPattern = (value: string) => {
    localStorage.setItem(SELECTED_PATTERN, value);
    dispatch(changePattern(value));

    const pattern = gamePatternsData.find((p) => p.value === value);
    if (pattern) {
      dispatch(changePatternAPI({ patternId: pattern?.id }));
      dispatch(changePatternId(pattern?.id));
      const offlineAccountId = getOfflineAccountId();
      if (offlineAccountId !== null) {
        void setOfflineGamePattern(offlineAccountId, pattern);
      }
    }
  };

  const onSlideChangeCompleted = (values: number) => {
    const minimizedTimeIntervals = 10 - values;
    const lastIntervalTime =
      minimizedTimeIntervals >= 2 ? minimizedTimeIntervals : 2;
    storeItemOnLocalstorage(INTERVAL_TIME, lastIntervalTime.toString());
    setSpeedTime(lastIntervalTime);
    dispatch(
      updateBingoGameTimeIntervalAPI({
        intervalTime: Number(lastIntervalTime),
      }),
    );
    dispatch(changeIntervalTime(Number(lastIntervalTime)));
  };

  const onChangeSpeaker = (value: string) => {
    dispatch(changeSpeaker(value));
    storeSelectedLanguage(value);
  };

  if (isPatternLoading && cashierBingoShopLoading) {
    return <span>Loaidng...</span>;
  }

  return (
    <div className="bingo-footer-container flex items-center justify-between w-full p-2">
      <div className="flex items-center justify-center gap-2">
        <Select
          onChange={onSelectPattern}
          labelRender={labelRender}
          value={selectedPattern}
          placeholder="Patterns"
          options={patternOptions}
          showSearch={false}
          dropdownStyle={{
            color: 'black',
            fontWeight: 'bold',
            width: '200px',
          }}
        />
        <Button
          disabled={isGameStarted}
          size="small"
          onClick={onShuffleBoard}
          className="flex items-center justify-center p-4 font-bold capitalize"
          icon={<Icon icon={'mingcute:shuffle-fill'} fontSize={28} />}
        >
          Shuffle
        </Button>
        <div className="flex flex-col items-start justify-start gap-0">
          <div className="flex items-center justify-between w-full px-1">
            <div className="flex items-center justify-center gap-1 text-white">
              <Icon icon={'fluent:slow-mode-24-filled'} fontSize={25} />
              <span>Slow</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-white">
              <Icon icon={'mdi:run-fast'} fontSize={25} />
              <span>Fast</span>
            </div>
          </div>
          <Slider
            onChangeComplete={onSlideChangeCompleted}
            max={10}
            defaultValue={5}
            disabled={false}
            className="custom-slider"
            style={{ width: '160px' }}
          />
        </div>

        <div className="flex flex-col items-start justify-center gap-1 ml-2">
          <span className="capitalize text-white font-bold text-sm">
            speaker
          </span>
          <Select
            onChange={onChangeSpeaker}
            labelRender={labelRender}
            value={speaker}
            placeholder="Speaker"
            options={languageOptions}
            showSearch={false}
            dropdownStyle={{
              color: 'black',
              fontWeight: 'bold',
              width: '200px',
              padding: '5px !important',
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-around gap-4">
        <Button
          disabled={isGameStarted}
          onClick={onStartNewGame}
          className="flex items-center justify-between font-bold capitalize"
          icon={<Icon icon={'dashicons:games'} fontSize={32} />}
        >
          new game
        </Button>
        <PlayPauseButton isPlaying={isPlaying} togglePlayPause={onPlayPause} />
        <Button
          disabled={selectedCartella.length <= 0}
          className="flex items-center justify-center font-bold capitalize"
          onClick={onCheckWinner}
          icon={<Icon icon={'material-symbols:check'} fontSize={32} />}
        >
          Check
        </Button>
      </div>
      <div className="flex items-center justify-between gap-1">
        <Button
          onClick={() => window.location.reload()}
          size="small"
          className="flex items-center justify-center py-4 font-bold capitalize"
          icon={<Icon icon={'material-symbols:refresh'} fontSize={28} />}
        >
          Refresh
        </Button>
        <Button
          disabled={isPlaying}
          onClick={onHandleClear}
          size="small"
          className="flex items-center justify-center py-4 font-bold capitalize"
          icon={<Icon icon={'ic:baseline-clear'} fontSize={28} />}
        >
          Clear all
        </Button>
        <Button
          onClick={onOpenDashboard}
          className="flex items-center justify-center py-4 font-bold capitalize"
          icon={<Icon icon={'material-symbols:dashboard'} fontSize={28} />}
        >
          Dashboard
        </Button>
      </div>

      <ModalDialog
        isOpen={isShowStartNewGameModal}
        width={900}
        title="New Game"
        onCloseIcon={() => setIsShowStartNewGameModal(false)}
      >
        <StartNewGame />
      </ModalDialog>

      <ModalDialog
        isOpen={isShowCheckWinnerModal}
        width={600}
        title="Check winner"
        onCloseIcon={onCloseChekWinnerModal}
      >
        <CheckWinner />
      </ModalDialog>

      <ModalDialog
        isOpen={isShowConfirmationModal}
        title="Confirmation"
        onCloseIcon={() => setIsShowConfirmationModal(false)}
      >
        <Confirmation
          message="Are you sure. Clear all includes deleting Active game "
          onOk={onHandleOkConfirmation}
          onCancel={() => setIsShowConfirmationModal(false)}
        />
      </ModalDialog>

      <Drawer
        open={isOpenDashboard}
        title={'Dashboard'}
        placement="left"
        onClose={() => setIsOpenDashboard(false)}
        closable={true}
        style={{ padding: 0, backgroundColor: '#F8F7F1' }}
        closeIcon={
          <Icon
            icon={'material-symbols:close'}
            fontSize={32}
            color="black"
            cursor={'pointer'}
            style={{
              position: 'absolute',
              top: 10,
              right: 30,
              fontSize: '35px',
              color: '#000',
            }}
            onClick={() => setIsOpenDashboard(false)}
          />
        }
        width="100%"
      >
        <BingoDashboard onBackToGame={() => setIsOpenDashboard(false)} />
      </Drawer>
    </div>
  );
};

export default BingoFooter;
