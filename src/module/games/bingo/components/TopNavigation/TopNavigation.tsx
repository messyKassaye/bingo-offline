import Logo from '../Logo/Logo';

const TopNavigation = () => {
  return (
    <div className="flex flex-col items-start justify-start w-full">
      <div className="flex items-center justify-between w-full top-navigation">
        <Logo />
        <div className="flex items-center justify-around gap-1">{''}</div>
      </div>
    </div>
  );
};

export default TopNavigation;
