import { useEffect, useRef, useState } from 'react';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../store/redux-hooks/redux-hooks';
import { handlePlay } from '../../../games/bingo/slices/AudioSlice';

const AudioPlayer = () => {
  const { intevalTime } = useAppSelector((state) => state.AudioSlice);
  const { play, audioSrc } = useAppSelector(
    (state) => state.AudioSlice.audioState,
  );
  const [isUserInteracted, setIsUserInteracted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const enableAudio = () => setIsUserInteracted(true);
    document.addEventListener('click', enableAudio, { once: true });

    return () => {
      document.removeEventListener('click', enableAudio);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && intevalTime) {
      const newRate = intevalTime / 1000;
      const clampedRate = Math.min(Math.max(newRate, 0.1), 3);
      audioRef.current.playbackRate = parseFloat(clampedRate.toString());
    }
  }, [intevalTime]);

  useEffect(() => {
    if (play && isUserInteracted) {
      audioRef.current
        ?.play()
        .catch((error) => console.error('Audio playback error:', error));
    }
  }, [play, audioSrc, isUserInteracted]);

  const handleAudioEnd = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      dispatch(
        handlePlay({
          play: false,
          audioSrc: '',
        }),
      );
    }
  };
  return (
    <audio
      ref={audioRef}
      src={audioSrc}
      onEnded={handleAudioEnd}
      preload="auto"
    />
  );
};

export default AudioPlayer;
