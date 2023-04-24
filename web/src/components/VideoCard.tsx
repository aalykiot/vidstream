import { motion } from 'framer-motion';
import { ReactComponent as EyeIcon } from './icons/eye-icon.svg';
import timeUtils from '../utils/time';

type Props = {
  title: string;
  thumbnail: string;
  duration: number;
  views: number;
  index: number;
};

function VideoCard({ title, thumbnail, duration, views, index }: Props) {
  return (
    <motion.div
      className="cursor-pointer group"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
    >
      <div className="relative">
        <img
          src={thumbnail}
          alt="The thumbnail of the video"
          className="rounded-md h-60 w-full object-cover brightness-90 group-hover:brightness-100"
        />
        <div className="bg-gray-800 py-0.5 px-3 text-sm rounded-md inline absolute bottom-3 right-3">
          {timeUtils.toMinuteSeconds(duration)}
        </div>
      </div>
      <div className="flex py-4 items-center">
        <div className="flex-1 text-gray-400 text-sm group-hover:text-white">
          {String(title).toUpperCase()}
        </div>
        <div className="font-bold text-sm">{views}</div>
        <EyeIcon className="w-5 h-5 ml-1" />
      </div>
    </motion.div>
  );
}

export default VideoCard;
