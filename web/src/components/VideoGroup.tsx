import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import VideoCard from './VideoCard';
import styles from './styles/VideoGroup.module.css';
import { ReactComponent as BlocksIcon } from './icons/blocks-icon.svg';
import { getVideos } from '../store/features/videos';

function VideoGroup() {
  const videos = useSelector(getVideos);
  return (
    <div className="flex-1 overflow-y-scroll">
      <div className="h-20 flex items-center">
        <span className="text-3xl ml-8 font-semibold text-white flex items-center">
          <BlocksIcon className="w-6 h-6" />
          <span className="ml-2">Videos</span>
        </span>
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
