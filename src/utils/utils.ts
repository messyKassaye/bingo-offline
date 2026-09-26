import { SELECTED_LANGUAGE, SETTING_ITEMS } from '../constants/constants';
import { ISettingItems } from '../models/ISettingItems';
import { IJWtPayload } from '../models/IJwtPayload.model';
import { jwtDecode } from 'jwt-decode';

export const storeItemOnLocalstorage = (token_type: string, token: string) => {
  localStorage.setItem(token_type, token);
};

export const getSelectedLanguage = () => {
  const selectedLanguage = localStorage.getItem(SELECTED_LANGUAGE);
  return typeof selectedLanguage === 'string' ? selectedLanguage : null;
};

export const storeSelectedLanguage = (language: string) => {
  localStorage.setItem(SELECTED_LANGUAGE, language);
};

export const storeSettingItems = (settingItems: ISettingItems) => {
  localStorage.setItem(SETTING_ITEMS, JSON.stringify(settingItems));
};

export const getSettingItems = () => {
  const selectedLanguage = localStorage.getItem(SETTING_ITEMS);
  return typeof selectedLanguage === 'string'
    ? JSON.parse(selectedLanguage)
    : null;
};

export const decodeJWT = (accessToken: string): IJWtPayload => {
  return jwtDecode(accessToken);
};
