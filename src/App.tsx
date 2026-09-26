import { IntlProvider } from 'react-intl';
import { lazy, Suspense, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './styles/main.scss';

import messages_am from './locale/am.json';
import messages_ao from './locale/or.json';
import messages_tr from './locale/tr.json';
import {
  useAppDispatch,
  useAppSelector,
} from './store/redux-hooks/redux-hooks';
import { useEffect } from 'react';
import { decodeJWT, getSelectedLanguage, getSettingItems } from './utils/utils';
import { changeSelectedGame, handleChangeSetting } from './slices/SettingSlice';
import { getItemFromLocalStorage } from './module/common/services/TokenService';
import {
  ACCESS_TOKEN,
  BET_AMOUNT,
  LOCAL_SESSION,
  SELECTED_PATTERN,
} from './constants/constants';
import { IJWtPayload } from './models/IJwtPayload.model';
import { Games, Roles } from './models/enums';
import { changePattern } from './module/games/bingo/slices/PatternSlice';
import { changeBetAmount } from './module/games/bingo/slices/BingoGameSlice';
import { changeSpeaker } from './module/games/bingo/slices/AudioSlice';

import GenericSpinner from './module/common/components/GenericSwipper/GenericSpinner';
import ErrorBoundary from './module/common/components/ErrorBoundary/ErrorBoundary';

const AsyncHomeApp = lazy(() => import('./apps/HomeApp'));
const AsyncBingoGameApp = lazy(() => import('./apps/BingGameApp'));
const AsyncDepositorApp = lazy(() => import('./apps/DepositorApp'));

const loader = <GenericSpinner />;

const homeApp = (
  <div>
    <AsyncHomeApp />
  </div>
);

const bingoGameApp = (
  <>
    <AsyncBingoGameApp />
  </>
);

const depositorApp = (
  <>
    <AsyncDepositorApp />
  </>
);

function App() {
  const messages = {
    am: messages_am,
    ao: messages_ao,
    tr: messages_tr,
  };

  const { selectedGame } = useAppSelector((state) => state.SettingSlice);
  const { selectedLanguage } = useAppSelector((state) => state.LanguageSlice);
  const locale = selectedLanguage.code || 'am';
  const [router, setRouter] = useState<JSX.Element | null>(null);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (getItemFromLocalStorage(LOCAL_SESSION)) {
      dispatch(changeSelectedGame(Games.Bingo));
    } else {
      const accessTokenFromLocalStorage = getItemFromLocalStorage(ACCESS_TOKEN);
      if (accessTokenFromLocalStorage) {
        const { roleId }: IJWtPayload = decodeJWT(accessTokenFromLocalStorage);
        if (roleId === Roles.BingoCashier) {
          dispatch(changeSelectedGame(Games.Bingo));
        }
      }
    }

    //default language
    const defaultLanguage = getSelectedLanguage();
    if (defaultLanguage) {
      dispatch(changeSpeaker(defaultLanguage));
    } else {
      dispatch(changeSpeaker('am'));
    }

    const settingItems = getSettingItems();
    if (settingItems) {
      dispatch(handleChangeSetting(settingItems));
    }

    // set default pattern
    const selectedPattern = getItemFromLocalStorage(SELECTED_PATTERN);
    if (selectedPattern) {
      dispatch(changePattern(selectedPattern));
    } else {
      dispatch(changePattern('default'));
    }

    //get stored bet amount
    const storedBetAmount = getItemFromLocalStorage(BET_AMOUNT);
    if (storedBetAmount) {
      dispatch(changeBetAmount(Number(storedBetAmount)));
    } else {
      dispatch(changeBetAmount(20));
    }
  }, []);

  useEffect(() => {
    if (selectedGame === Games.Bingo) {
      setRouter(bingoGameApp);
    } else if (selectedGame === Games.DEPOSITOR) {
      setRouter(depositorApp);
    } else {
      setRouter(homeApp);
    }
  }, [selectedGame]);

  return (
    <IntlProvider
      locale={locale}
      messages={messages[locale as keyof typeof messages]}
    >
      <BrowserRouter>
        <ErrorBoundary resetKeys={[selectedGame]}>
          <Suspense fallback={loader}>{router}</Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </IntlProvider>
  );
}

export default App;
