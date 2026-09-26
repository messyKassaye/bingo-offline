import Logo from '../../../depositor/components/Logo/Logo';
import Menus from '../Menus/Menus';
const SideNavigation = () => {
  return (
    <div className="flex flex-col items-center justify-start h-screen side-nav-container pt-10">
      <div className="mb-10">
        <Logo size="large" />
      </div>
      <Menus />
    </div>
  );
};

export default SideNavigation;
