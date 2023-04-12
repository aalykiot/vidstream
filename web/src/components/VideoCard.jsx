import EyeIcon from './icons/EyeIcon';
import { toMinuteSeconds } from '../utils/time';

function VideoCard(props) {
  return (
    <div class="cursor-pointer group">
      <div class="relative">
        <img
          src={props.thumbnail}
          class="rounded-md w-auto h-60 w-full object-cover h-60 brightness-90 group-hover:brightness-100"
        />
        <div class="bg-gray-800 py-0.5 px-3 text-sm rounded-md inline absolute bottom-3 right-3">
          {toMinuteSeconds(props.duration)}
        </div>
      </div>
      <div class="flex py-4 items-center">
        <div class="flex-1 text-gray-400 text-sm group-hover:text-white">
          {props.title}
        </div>
        <div class="font-bold text-sm">{props.views}</div>
        <EyeIcon class="w-5 h-5 ml-1" />
      </div>
    </div>
  );
}

export default VideoCard;
