import classnames from 'classnames';
import { useSelector } from 'react-redux';
import styles from './styles/MainPanel.module.css';
import VideoCard from './VideoCard';
import { ReactComponent as BlocksIcon } from './icons/blocks-icon.svg';
import { getVideos } from '../store/videosSlice';

const MainPanel = () => {
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
        {videos.map((video, idx) => (
          <VideoCard
            key={idx}
            thumbnail={video.thumbnail}
            duration={video.duration}
            title={video.title}
            views={video.views}
          />
        ))}
      </div>
    </div>
  );
};

export default MainPanel;
