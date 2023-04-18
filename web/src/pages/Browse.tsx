import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SidePanel from '../components/SidePanel';
import VideoGroup from '../components/VideoGroup';
import { fetchVideosAsync, getStatus } from '../store/features/videos';
import { AppDispatch } from '../store/store';

function BrowsePage() {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(getStatus);

  // Load videos from the API.
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchVideosAsync());
    }
  }, []);

  return (
    <div className="flex bg-gray-900 h-screen">
      <SidePanel />
      <VideoGroup />
    </div>
  );
}

export default BrowsePage;
