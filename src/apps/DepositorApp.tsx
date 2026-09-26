import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../module/common/HOC/ProtectedRoute';
import { ACCESS_TOKEN } from '../constants/constants';
import DepositorContainer from '../module/depositor/DepositorContainer';
import DepositorDashboard from '../module/depositor/components/DepositorDashboard/DepositorDashboard';
import DepositListPage from '../module/depositor/pages/DepositListPage/DepositListPage';

const Depositor = () => {
  const isAuthenticated = Boolean(localStorage.getItem(ACCESS_TOKEN)); // Example: Check for a token
  return (
    <Suspense>
      <Routes>
        <Route
          key={'urlLogin'}
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DepositorContainer />
            </ProtectedRoute>
          }
          path={'/'}
        >
          <Route key={'dashboard'} index element={<DepositorDashboard />} />
          <Route
            key={'depositList'}
            element={<DepositListPage />}
            path="/depositList"
          />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default Depositor;
