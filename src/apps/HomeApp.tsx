import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from '../module/home/pages/HomePage/HomePage';
import Login from '../module/home/components/Login';

const PlayInMobilePage = lazy(
  () => import('../module/games/bingo/pages/PlayInMobilePage'),
);

const HomeApp = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route key={'urlLogin'} element={<HomePage />} path={'/'}>
          <Route index element={<Login />} />
        </Route>
        <Route
          key={'mobilePlaye'}
          element={<PlayInMobilePage />}
          path="/playInMobile/:id/:isCompany/*"
        />
      </Routes>
    </Suspense>
  );
};

export default HomeApp;
