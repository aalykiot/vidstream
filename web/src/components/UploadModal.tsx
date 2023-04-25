import { motion } from 'framer-motion';
import { ReactComponent as CancelIcon } from './icons/cancel-icon.svg';
import { ReactComponent as InfoIcon } from './icons/info-icon.svg';

type Props = {
  onExit: Function;
};

function UploadModal({ onExit }: Props) {
  return (
    <>
      <div className="absolute h-screen w-full bg-black opacity-90 z-10" />
      <div className="absolute flex w-screen h-screen z-20 items-center justify-center">
        <motion.div
          className="bg-gray-900 p-6 rounded w-1/2 h-2/3 drop-shadow flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center">
            <div className="text-white text-2xl flex-1">Upload new video</div>
            <CancelIcon
              className="w-8 h-8 text-gray-500 bg-gray-800 rounded cursor-pointer hover:text-gray-400 hover:bg-gray-700"
              onClick={() => onExit()}
            />
          </div>
          <div className="flex flex-1 mt-8 flex-col">
            <div className="flex bg-gray-700 rounded items-center">
              <InfoIcon className="w-7 h-7 text-gray-400 ml-2" />
              <input
                type="text"
                className="outline-none h-10 bg-gray-700 flex-1 text-white ml-2 mr-3"
                placeholder="Give a title to the video..."
              />
            </div>
            <div className="flex text-white flex-1 items-center justify-center mt-4 border-4 border-gray-700 rounded border-dashed">
              <span className="text-gray-700 font-bold">Drag & Drop</span>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default UploadModal;
