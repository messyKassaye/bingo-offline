import amAudioFiles from './amAudioFiles';
import trAudioFiles from './trAudiFiles';
import aoAudioFiles from './aoAudioFiles';
import { IAudioFile } from '../models/IAudioFiles';
import woAudioFiles from './woAudioFiles';

const audioFiles: IAudioFile[] = [
  {
    code: 'am',
    audioFile: amAudioFiles,
  },
  {
    code: 'tr',
    audioFile: trAudioFiles,
  },
  {
    code: 'ao',
    audioFile: aoAudioFiles,
  },
  {
    code: 'wo',
    audioFile: woAudioFiles,
  },
];

export default audioFiles;
