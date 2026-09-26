import axios from 'axios';
import { refreshAccessToken } from './refreshToken.service';
import { ACCESS_TOKEN, BASE_URL } from '../../../constants/constants';
const AxiosService = () => {
  //create instance
  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(async (config) => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN) || '';

    if (accessToken) {
      config.headers.Authorization = accessToken ? `Bearer ${accessToken}` : '';
    }

    return config;
  });

  instance.interceptors.response.use(
    async (response) => {
      const currentTime = new Date().getTime();
      response.headers['request-started-at'] = currentTime;
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401) {
        console.log('refresh expired');
        originalRequest._retry = true;
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          return instance(originalRequest);
        } else {
          localStorage.clear();
          //window.location.href = '/';
        }
      }

      // A network failure is not an expired session. Keep local credentials
      // so cached shop data can be used while the desktop is offline.
      return Promise.reject(error.response?.data ?? error);
    },
  );

  return instance;
};

export default AxiosService;
