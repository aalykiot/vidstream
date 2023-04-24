import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { motion, useAnimationControls } from 'framer-motion';
import { useParams } from 'react-router-dom';
import Player from '../components/Player';
import { AppDispatch } from '../store/store';
import { isSocketConnected, connect } from '../store/features/socket';
import {
  reset,
  getMetadata,
  getTrickPlayStatus,
  fetchMetadataAsync,
} from '../store/features/player';

function WatchPage() {
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const meta = useSelector(getMetadata);
  const trickStatus = useSelector(getTrickPlayStatus);
  const isSocketActive = useSelector(isSocketConnected);
  const controls = useAnimationControls();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchMetadataAsync(params.id as string));
  }, [params]);

  // Hack: The following makes the transition to the player a bit nicer.
  useEffect(() => {
    if (trickStatus === 'succeeded') {
      setTimeout(() => setLoading(false), 500);
    }
  }, [trickStatus]);

  // Connect to socket and purge data on unmount.
  useEffect(() => {
    if (!isSocketActive) dispatch(connect());
    return () => {
      dispatch(reset());
    };
  }, []);

  return (
    <>
      {loading && (
        <div className="flex h-screen text-white justify-center items-center">
          <motion.img
            initial={{ opacity: 0 }}
            animate={controls}
            transition={{ duration: 1.5 }}
            src={meta?.thumbnail}
            alt="The thumbnail of the video"
            className="max-w-full max-h-screen object-cover"
            onLoad={() => controls.start({ opacity: 0.8 })}
          />
          <div className="absolute top-0 left-0 flex h-screen w-full justify-center items-center">
            <ScaleLoader color="white" className="drop-shadow opacity-70" />
          </div>
        </div>
      )}
      {!loading && <Player />}
    </>
  );
}

export default WatchPage;
