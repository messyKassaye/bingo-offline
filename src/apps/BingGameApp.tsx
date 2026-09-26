import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import BingoGame from '../module/games/bingo/BingoGame';
import { ACCESS_TOKEN, LOCAL_SESSION } from '../constants/constants';
import ProtectedRoute from '../module/common/HOC/ProtectedRoute';

const BingoGameApp = () => {
  const isAuthenticated = Boolean(
    localStorage.getItem(ACCESS_TOKEN) || localStorage.getItem(LOCAL_SESSION),
  );

  return (
    <Suspense>
      <Routes>
        <Route
          key={'urlLogin'}
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <BingoGame />
            </ProtectedRoute>
          }
          path={'/'}
        />
      </Routes>
    </Suspense>
  );
};

export default BingoGameApp;
