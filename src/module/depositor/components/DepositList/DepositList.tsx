import { useEffect, useState } from 'react';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../store/redux-hooks/redux-hooks';
import { cashierDepositListAPI } from '../../slice/depositSlice';
import { Table } from 'antd';
import DepositListColumn from './Column/DepositListColumn';

const DepositList = () => {
  const { loading: meLoading, data: user } = useAppSelector(
    (state) => state.UserSlice.user,
  );
  const { loading, data: depositList } = useAppSelector(
    (state) => state.DepositSlice.depositList,
  );
  const [page, setPage] = useState(50);
  const [current, setCurrent] = useState(1);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      cashierDepositListAPI({
        userId: user.id, // Assuming 0 is the cashier ID, adjust as necessary
      }),
    );
  }, []);

  if (loading || meLoading) {
    return <span>Loading...</span>;
  }
  return (
    <>
      <Table
        className="w-full relative"
        columns={DepositListColumn()}
        dataSource={depositList}
        rowKey={'id'}
        pagination={{
          pageSize: page,
          current: current,
          onChange(newPage: number, newPageSize: number) {
            setPage(newPageSize);
            setCurrent(page !== newPageSize ? 1 : newPage);
          },
          position: ['bottomLeft'],
          style: {
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
          },
        }}
        scroll={{ x: 'max-content' }}
      />
    </>
  );
};

export default DepositList;
