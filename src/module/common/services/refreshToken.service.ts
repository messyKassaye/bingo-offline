import axios from 'axios';

import {
  ACCESS_TOKEN,
  BASE_URL,
  REFRESH_TOKEN,
} from '../../../constants/constants';
import { backend_url } from '../../../utils/backend_routes';

export const refreshAccessToken = async () => {
  try {
    const refresh_token_from_localstorage = localStorage.getItem(REFRESH_TOKEN);
    const formData = {
      refresh: refresh_token_from_localstorage,
    };
    const response = await axios
      .post(`${BASE_URL}${backend_url.refreshToken}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(REFRESH_TOKEN)}`,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        localStorage.clear();
        //window.location.href = '/';
        return null;
      });
    const access_token = response?.accessToken;
    const refresh_token = response?.refreshToken;

    localStorage.setItem(ACCESS_TOKEN, access_token);
    localStorage.setItem(REFRESH_TOKEN, refresh_token);
    return access_token;
  } catch (err) {
    throw err;
  }
};
