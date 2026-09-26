import { Button, Form, Input } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useState } from 'react';
import { ILogin } from '../../../models/ILogin';
import { useAppDispatch } from '../../../store/redux-hooks/redux-hooks';
import { decodeJWT, storeItemOnLocalstorage } from '../../../utils/utils';
import axios, { AxiosError } from 'axios';
import {
  ACCESS_TOKEN,
  BASE_URL,
  LOCAL_SESSION,
  REFRESH_TOKEN,
} from '../../../constants/constants';
import { backend_url } from '../../../utils/backend_routes';
import { IJWtPayload } from '../../../models/IJwtPayload.model';
import { Games, Roles } from '../../../models/enums';
import { changeSelectedGame } from '../../../slices/SettingSlice';
import { isTauri } from '@tauri-apps/api/core';
import {
  authenticateLocalAccount,
  registerLocalAccount,
} from '../../../config/db/services/CashierShopCache';

type FormValues = ILogin & { shopName?: string };

const Login = () => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const dispatch = useAppDispatch();

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    setMessage('');

    if (mode === 'signup') {
      try {
        await registerLocalAccount({
          shopName: values.shopName ?? '',
          username: values.username,
          password: values.password,
        });
        form.resetFields();
        setMode('login');
        setMessage('Offline account created. Sign in with your new credentials.');
      } catch (error) {
        setMessage(
          error instanceof Error && error.message.includes('UNIQUE')
            ? 'That username is already registered on this desktop.'
            : 'Could not create the offline account. Please try again.',
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isTauri()) {
      try {
        const account = await authenticateLocalAccount(
          values.username,
          values.password,
        );
        if (account) {
          localStorage.setItem(LOCAL_SESSION, JSON.stringify(account));
          dispatch(changeSelectedGame(Games.Bingo));
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Offline sign in failed:', error);
        setMessage('Unable to check the offline account on this desktop.');
        setLoading(false);
        return;
      }
    }

    axios
      .post(`${BASE_URL}${backend_url.signIn}`, values)
      .then((response) => {
        setLoading(false);
        const { accessToken, refreshToken, status, message } = response.data;
        if (status) {
          const { roleId }: IJWtPayload = decodeJWT(accessToken);
          storeItemOnLocalstorage(ACCESS_TOKEN, accessToken || '');
          storeItemOnLocalstorage(REFRESH_TOKEN, refreshToken);
          if (roleId === Roles.BingoCashier) {
            dispatch(changeSelectedGame(Games.Bingo));
          } else if (roleId === Roles.BingoDepositor) {
            dispatch(changeSelectedGame(Games.DEPOSITOR));
          } else {
            setMessage('Incorrect username or password is used');
          }
        } else {
          setMessage(message);
        }
      })
      .catch((err) => {
        setLoading(false);
        if (err instanceof AxiosError) {
          if (err.code === AxiosError.ERR_NETWORK) {
            setMessage('Network error. Check your connection or offline account.');
          } else {
            setMessage('Incorrect username or password is used');
          }
        } else {
          setMessage('Something went wrong. Please try again');
        }
      });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6">
      <div className="flex flex-col items-center justify-center w-[380px] h-full mt-10 md:px-2 px-10">
        <h2 className="capitalize mb-2 text-center login-label">
          {mode === 'signup' ? 'Create Offline Account' : 'Sign In'}
        </h2>
        <span className="secondary-text-color">
          {mode === 'signup'
            ? 'Create a local account for this desktop'
            : 'Please enter your username and password'}
        </span>

        <Form
          name="login"
          layout="vertical"
          className="w-full mt-8"
          form={form}
          onFinish={onFinish}
          requiredMark={false}
        >
          {mode === 'signup' && (
            <>
              <label style={{ fontWeight: 'bold' }}>Shop name</label>
              <Form.Item
                name="shopName"
                rules={[{ required: true, message: 'Please enter a shop name.' }]}
              >
                <Input className="p-2" placeholder="Your shop name" />
              </Form.Item>
            </>
          )}

          <label style={{ fontWeight: 'bold' }}>Username</label>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input className="p-2" placeholder="Your username" />
          </Form.Item>

          <label style={{ fontWeight: 'bold' }}>Password</label>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              ...(mode === 'signup'
                ? [{ min: 8, message: 'Use at least 8 characters.' }]
                : []),
            ]}
          >
            <Input.Password
              placeholder="Your password"
              className="p-2"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <div className="flex items-center justify-center w-full p-2">
            <span className="text-center text-red-600">{message}</span>
          </div>
          <Form.Item>
            <Button
              type="primary"
              className="rounded-full p-5 font-bold"
              htmlType="submit"
              loading={loading}
              block
            >
              {mode === 'signup' ? 'Create account' : 'Sign in'}
            </Button>
          </Form.Item>
        </Form>

        {isTauri() && (
          <div className="flex flex-col items-center gap-2 w-full">
            <Button
              type="link"
              onClick={() => {
                form.resetFields();
                setMessage('');
                setMode(mode === 'login' ? 'signup' : 'login');
              }}
            >
              {mode === 'login' ? 'Create offline account' : 'Back to sign in'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
