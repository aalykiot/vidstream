import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SidePanel from '../components/SidePanel';
import VideoGroup from '../components/VideoGroup';
import UploadModal from '../components/UploadModal';
import { fetchVideosAsync, getStatus } from '../store/features/videos';
import { AppDispatch } from '../store/store';
import { showModal } from '../store/features/upload';

function BrowsePage() {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(getStatus);
  const show = useSelector(showModal);

  // Load videos from the API.
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchVideosAsync());
    }
  }, []);

  return (
    <div className="flex bg-gray-900 h-screen">
      {show && <UploadModal />}
      <SidePanel />
      <VideoGroup />
    </div>
  );
}

export default BrowsePage;
