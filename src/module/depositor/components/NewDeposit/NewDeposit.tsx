import { useEffect } from 'react';
import { NEW_DEPOSIT_FORM } from '../../../../constants/constants';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../store/redux-hooks/redux-hooks';
import LuckyNumberForm from '../../../common/hooks/useForm';
import { ICreateDeposit } from '../../model/ICreateDeposit';
import { createDepositAPI } from '../../slice/depositSlice';
import { meQuery } from '../../../common/slices/UserSlice';

const NewDeposit = () => {
  const { loading, data: user } = useAppSelector(
    (state) => state.UserSlice.user,
  );
  const { message } = useAppSelector(
    (state) => state.DepositSlice.createDeposit,
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(meQuery());
  }, []);

  const onSubmit = (values: ICreateDeposit) => {
    dispatch(createDepositAPI({ ...values, senderId: user.id }));
  };

  if (loading) {
    return <span className="font-bold">Loading...</span>;
  }
  return (
    <div className="flex items-center justify-center w-full">
      <LuckyNumberForm
        inputs={NEW_DEPOSIT_FORM}
        onSubmit={onSubmit}
        loading={false}
        successMessage={message}
        errorMessage={message}
        btnText={'Send'}
      />
    </div>
  );
};

export default NewDeposit;
