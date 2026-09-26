import { Outlet } from 'react-router-dom';
const HomePage = () => {
  return (
    <div className="h-screen w-full flex flex-col">
      <Outlet />
    </div>
  );
};

export default HomePage;
