import { useState, MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { Circle } from 'rc-progress';
import { ReactComponent as CancelIcon } from './icons/cancel-icon.svg';
import { ReactComponent as UploadIcon } from './icons/upload-icon.svg';
import { AppDispatch } from '../store/store';
import {
  setShowModal,
  uploadVideoAsync,
  getUploadStatus,
  getProgress,
  getUploadError,
  reset,
} from '../store/features/upload';

function UploadModal() {
  // Set drop-zone options.
  const [filename, setFilename] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(getUploadStatus);
  const progress = useSelector(getProgress);
  const error = useSelector(getUploadError);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      const formData = new FormData();
      formData.append('video', acceptedFiles[0]);
      setFilename(acceptedFiles[0].name);
      dispatch(uploadVideoAsync(formData));
    },
  });

  const handleExit = (event: MouseEvent) => {
    event.stopPropagation();
    dispatch(setShowModal(false));
    dispatch(reset());
  };

  return (
    <>
      <div className="absolute h-screen w-full bg-black opacity-90 z-10" />
      <div className="absolute flex w-screen h-screen z-20 items-center justify-center">
        <motion.div
          className="bg-gray-900 p-2 rounded w-1/2 h-2/3 drop-shadow flex flex-col border-4 border-gray-700 border-dashed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-1 flex-col">
            <div className="flex justify-end">
              <CancelIcon
                className="w-8 h-8 text-gray-500 bg-gray-800 cursor-pointer hover:text-gray-400 hover:bg-gray-700 rounded"
                onClick={handleExit}
              />
            </div>
            {status === 'idle' && (
              <div
                {...getRootProps()} /* eslint-disable-line */
                className="flex flex-1 flex-col"
              >
                <div className="flex flex-1 items-center justify-center flex-col">
                  {/* eslint-disable-next-line */}
                  <input {...getInputProps()} />
                  <UploadIcon className="w-40 h-40 text-gray-300" />
                  <p className="text-gray-700 font-bold text-center mt-8">
                    {isDragActive
                      ? 'Drop the file here ...'
                      : "Drag 'n' drop to upload"}
                  </p>
                  <button
                    type="button"
                    className="text-white flex items-center bg-green-400 px-24 py-2 rounded cursor-pointer mt-6 hover:bg-green-500"
                  >
                    <span className="text-lg">Upload</span>
                  </button>
                </div>
              </div>
            )}
            {status !== 'idle' && (
              <div className="flex flex-1 flex-col items-center justify-center">
                <Circle
                  percent={progress}
                  strokeWidth={2}
                  strokeColor={status === 'failed' ? '#F46165' : '#35DA7C'}
                  className="w-72 h-72"
                />
                {status === 'failed' && (
                  <div className="text-red-400 mt-8 text-center">{error}</div>
                )}
                {status !== 'failed' && (
                  <div className="text-gray-400 mt-8 text-center">
                    Once the processing is complete, the video
                    <br />
                    will appear automatically.
                  </div>
                )}
              </div>
            )}
            <div className="font-semibold text-gray-700 text-center mb-4">
              {status === 'idle'
                ? 'AVI, MP4, OGG, WEBM are supported'
                : filename}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default UploadModal;
