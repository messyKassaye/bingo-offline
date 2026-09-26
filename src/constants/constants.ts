import { IFormElement } from '../models/IFormElement';
import { GameMap } from '../models/IGameMapper';
import { ILanguage } from '../models/ILanguage';
import { IRules } from '../module/games/bingo/model/IRules';
import { getRuntimeConfig } from '../config/runtime-config';

/**
 * Read once, at module load. This module is therefore import-time sensitive:
 * it must not be pulled in before loadRuntimeConfig() has resolved, which is
 * why index.tsx imports App and the store dynamically rather than statically.
 */
const config = getRuntimeConfig();

export const ACCESS_TOKEN = 'access_token';
export const REFRESH_TOKEN = 'refresh_token';
export const LOCAL_SESSION = 'offline_session';

export const SELECTED_LANGUAGE = 'selected_language';
export const SETTING_ITEMS = 'settings';
export const BET_AMOUNT = 'bet_amount';
export const INTERVAL_TIME = 'interval_time';
export const GAME_STARTED = 'emag_detrats';
export const CALLED_NUMBERS = 'numbers_dellac';

export const ONLINE_BINGO_URL = config.VITE_ONLINE_BINGO_URL;
export const BALANCE_SIGNING_PUBLIC_KEY =
  config.VITE_BALANCE_SIGNING_PUBLIC_KEY;
export const BASE_URL = config.VITE_API_URL;
export const SELECTED_PATTERN = 'selected_pattern';

export const GAME_PATTERNS: IRules[] = [
  {
    name: 'Horizontal',
  },
  {
    name: 'Vertical',
  },
  {
    name: 'Corners',
  },
  {
    name: 'FullHouse',
  },
  {
    name: 'TopLeftDiagonal',
  },
  {
    name: 'TopRightDialgonal',
  },
];

export const SUPPORTED_LANGUAGES: ILanguage[] = [
  {
    id: 1,
    name: 'አማርኛ',
    code: 'am',
  },
  {
    id: 2,
    name: 'ትግርኛ',
    code: 'tr',
  },
  {
    id: 3,
    name: 'Afaan Oromo',
    code: 'ao',
  },
  {
    id: 4,
    name: 'ወላይተኛ',
    code: 'wo',
  },
];

export enum ShowErrorComponent {
  TRANSFER_MONEY,
  ERROR_MESSAGE,
}

export const SETTING_FORM: IFormElement[] = [
  {
    name: 'serverAddress',
    label: 'serverAddress',
    placeholder: 'serverAddressPlaceholder',
    type: 'text',
    is_required: true,
    required_message: 'serverAddressErrorMessage',
  },
  {
    name: 'cashierUsername',
    label: 'cashierUserName',
    placeholder: 'cashierUsernamePlaceholder',
    type: 'text',
    is_required: true,
    required_message: 'cashierUsernameErrorMessage',
  },
  {
    name: 'cashierPassword',
    label: 'cashierPassword',
    placeholder: 'cashierPasswordPlaceholder',
    type: 'password',
    is_required: true,
    required_message: 'cashierPasswordErrorMessage',
  },
];

export const NEW_DEPOSIT_FORM: IFormElement[] = [
  {
    name: 'phone',
    label: 'Phone',
    placeholder: 'Phone',
    type: 'text',
    is_required: true,
    required_message: 'Please enter phone number',
  },
  {
    name: 'amount',
    label: 'Amount',
    placeholder: 'Amount',
    type: 'text',
    is_required: true,
    required_message: 'Deposit amount',
  },
];

export const GAMES: GameMap = {
  keno: {
    id: 1,
    name: 'Keno',
  },
  bingo: {
    id: 2,
    name: 'Bingo',
  },
  miniBingo: {
    id: 3,
    name: 'MiniBingo',
  },
};
