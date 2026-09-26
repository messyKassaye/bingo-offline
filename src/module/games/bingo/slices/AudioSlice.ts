import { createSlice } from '@reduxjs/toolkit';
import { IAudioState } from './states/IAudioState';

const initialState: IAudioState = {
  audioState: {
    play: false,
    audioSrc: '',
  },
  intevalTime: 4,
  speaker: 'am',
};

const audioSlice = createSlice({
  name: 'audioSlice',
  initialState,
  reducers: {
    handlePlay: (state, action) => {
      state.audioState = action.payload;
    },
    changeIntervalTime: (state, action) => {
      state.intevalTime = Number(action.payload);
    },
    changeSpeaker: (state, action) => {
      state.speaker = action.payload;
    },
  },
});

export const { handlePlay, changeIntervalTime, changeSpeaker } =
  audioSlice.actions;
export default audioSlice.reducer;
