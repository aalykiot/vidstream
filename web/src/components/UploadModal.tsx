import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { ReactComponent as CancelIcon } from './icons/cancel-icon.svg';
import { ReactComponent as InfoIcon } from './icons/info-icon.svg';
import { setShowModal, uploadVideoAsync } from '../store/features/upload';
import { AppDispatch } from '../store/store';

function UploadModal() {
  const [title, setTitle] = useState('');
  const dispatch = useDispatch<AppDispatch>();

  // Set drop-zone options.
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      const formData = new FormData();
      formData.append('title', title || acceptedFiles[0].name);
      formData.append('video', acceptedFiles[0]);
      dispatch(uploadVideoAsync(formData));
    },
  });

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
              onClick={() => dispatch(setShowModal(false))}
            />
          </div>
          <div className="flex flex-1 mt-8 flex-col">
            <div className="flex bg-gray-700 rounded items-center">
              <InfoIcon className="w-7 h-7 text-gray-400 ml-2" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="outline-none h-10 bg-gray-700 flex-1 text-white ml-2 mr-3"
                placeholder="Give a title to the video..."
              />
            </div>
            <div
              {...getRootProps()} /* eslint-disable-line */
              className="flex text-white flex-1 items-center justify-center mt-4 border-4 border-gray-700 rounded border-dashed"
            >
              {/* eslint-disable-next-line */}
              <input {...getInputProps()} />{' '}
              <p className="text-gray-700 font-bold text-center">
                {isDragActive
                  ? 'Drop the file here ...'
                  : "Drag 'n' drop a video here."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default UploadModal;
