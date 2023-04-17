import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SidePanel from '../components/SidePanel';
import MainPanel from '../components/MainPanel';
import { fetchVideosAsync, getStatus } from '../store/videosSlice';

function BrowsePage() {
  const dispatch = useDispatch();
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
      <MainPanel />
    </div>
  );
}

export default BrowsePage;
