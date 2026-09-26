import SpinnerWrapper from './SpinnerWrapper';

const GenericSpinner = () => {
  return (
    <SpinnerWrapper>
      <div
        className={`spinner-event games-swiper"
        `}
      >
        <div className="content">
          <div className="spinner" />
          <span className={'title text-black mt-5'}>{'Loading...'}</span>
        </div>
      </div>
    </SpinnerWrapper>
  );
};

export default GenericSpinner;
