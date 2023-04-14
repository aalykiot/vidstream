import { For } from 'solid-js';
import classnames from 'classnames';
import BlocksIcon from './icons/BlocksIcon';
import VideoCard from './VideoCard';
import styles from './MainPanel.module.css';

function MainPanel(props) {
  return (
    <div class="flex-1 overflow-y-scroll">
      <div class="h-20 flex items-center">
        <span class="text-3xl ml-8 font-semibold text-white flex items-center">
          <BlocksIcon class="w-6 h-6" />
          <span class="ml-2">Videos</span>
        </span>
      </div>
      <div class={classnames('flex-1 text-white mx-5 mb-6', styles.videosGrid)}>
        <For each={props.videos}>
          {(video) => (
            <VideoCard
              thumbnail={video.thumbnail}
              duration={video.duration}
              title={video.title}
              views={video.views}
            />
          )}
        </For>
      </div>
    </div>
  );
}

export default MainPanel;
