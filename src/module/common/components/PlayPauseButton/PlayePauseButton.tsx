import { Icon } from '@iconify/react';
import { useAppSelector } from '../../../../store/redux-hooks/redux-hooks';
type Props = {
  togglePlayPause: () => void;
  isPlaying: boolean;
};
const PlayPauseButton = ({ togglePlayPause, isPlaying }: Props) => {
  const { selectedCartella } = useAppSelector((state) => state.CartellaSlice);
  return (
    <button
      disabled={selectedCartella.length <= 0}
      className="dj-button"
      onClick={togglePlayPause}
    >
      {isPlaying ? (
        <div className="pause-icon flex items-center justify-center w-full">
          <Icon icon={'material-symbols:pause'} fontSize={32} color="white" />
        </div>
      ) : (
        <div className="play-icon flex items-center justify-center w-full">
          <Icon icon={'mdi:play'} fontSize={32} color="white" />
        </div>
      )}
    </button>
  );
};

export default PlayPauseButton;
