import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SidePanel from '../components/SidePanel';
import VideoGroup from '../components/VideoGroup';
import UploadModal from '../components/UploadModal';
import { fetchVideosAsync, getStatus } from '../store/features/videos';
import { showModal, setShowModal } from '../store/features/upload';
import { AppDispatch } from '../store/store';

function BrowsePage() {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(getStatus);
  const shouldShowModal = useSelector(showModal);

  // Load videos from the API.
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchVideosAsync());
    }
  }, []);

  return (
    <div className="flex bg-gray-900 h-screen">
      {shouldShowModal && (
        <UploadModal onExit={() => dispatch(setShowModal(false))} />
      )}
      <SidePanel />
      <VideoGroup />
    </div>
  );
}

export default BrowsePage;
