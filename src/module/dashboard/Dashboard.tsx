import { ReactNode, useEffect, useState } from 'react';
import { useAppSelector } from '../../store/redux-hooks/redux-hooks';
import { Games } from '../../models/enums';
import BingoGame from '../games/bingo/BingoGame';

const Dashboard = () => {
  const { selectedGame } = useAppSelector((state) => state.SettingSlice);
  const [currentGame, setCurrentGame] = useState<ReactNode | null>(null);

  useEffect(() => {
    if (selectedGame === Games.Bingo) {
      setCurrentGame(<BingoGame />);
    }
  }, [selectedGame]);
  return <div>{currentGame}</div>;
};

export default Dashboard;
