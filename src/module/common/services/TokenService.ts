import { ACCESS_TOKEN, LOCAL_SESSION } from '../../../constants/constants';

export const storeItemOnLocalstorage = (token_type: string, token: string) => {
  localStorage.setItem(token_type, token);
};

export const getAccessToken: any = async () => {
  const access_token = await localStorage.getItem(ACCESS_TOKEN);
  if (access_token) {
    return access_token;
  }
  return null;
};

export const logOut = () => {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(LOCAL_SESSION);
};

export const isUserLoggedIn = () => {
  const access_token = localStorage.getItem(ACCESS_TOKEN);
  return (
    access_token !== null || localStorage.getItem(LOCAL_SESSION) !== null
  );
};

export const getItemFromLocalStorage = (key: string) => {
  const localItem = localStorage.getItem(key);
  return localItem ? localItem : null;
};
