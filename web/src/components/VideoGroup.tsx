import classnames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import VideoCard from './VideoCard';
import styles from './styles/VideoGroup.module.css';
import { ReactComponent as BlocksIcon } from './icons/blocks-icon.svg';
import { ReactComponent as CameraIcon } from './icons/camera-icon.svg';
import { AppDispatch } from '../store/store';
import { getVideos } from '../store/features/videos';
import { setShowModal } from '../store/features/upload';

function VideoGroup() {
  const dispatch = useDispatch<AppDispatch>();
  const videos = useSelector(getVideos);

  return (
    <div className="flex-1 overflow-y-scroll">
      <div className="h-20 flex items-center justify-between mx-8">
        <div className="text-3xl font-semibold text-white flex items-center">
          <BlocksIcon className="w-6 h-6" />
          <span className="ml-2">Videos</span>
        </div>
        <button
          type="button"
          className="text-white flex items-center bg-green-400 px-4 py-2 rounded cursor-pointer hover:bg-green-500"
          onClick={() => dispatch(setShowModal(true))}
        >
          <CameraIcon className="w-6 h-6" />
          <span className="ml-2 text-lg">Upload</span>
        </button>
      </div>
      <div
        className={classnames('flex-1 text-white mx-5 mb-6', styles.videosGrid)}
      >
        {videos.map((video, index) => (
          <Link to={`/watch/${video.id}`} key={video.id}>
            <VideoCard
              thumbnail={video.thumbnail}
              duration={video.duration}
              title={video.title}
              views={video.views}
              index={index + 1}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default VideoGroup;
