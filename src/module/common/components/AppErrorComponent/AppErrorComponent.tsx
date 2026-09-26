import { ShowErrorComponent } from '../../../../constants/constants';
import { useAppSelector } from '../../../../store/redux-hooks/redux-hooks';

const AppErrorComponent = () => {
  const { errorComponent, message } = useAppSelector(
    (state) => state.DialogSlice.notificationDialog,
  );
  if (errorComponent === ShowErrorComponent.ERROR_MESSAGE) {
    return <span>{message}</span>;
  }
  return <div>Something went wrong</div>;
};

export default AppErrorComponent;
