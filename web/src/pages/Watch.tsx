import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Animate } from 'react-simple-animate';
import { useParams } from 'react-router-dom';
import ClipLoader from 'react-spinners/ClipLoader';
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
  const [loading, setLoading] = useState(true);
  const [showThumb, setShowThumb] = useState(false);

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
          <Animate
            play={showThumb}
            start={{ opacity: 0 }}
            end={{ opacity: 0.8 }}
            duration={1.5}
          >
            <img
              className="max-w-full max-h-screen object-cover"
              src={meta?.thumbnail}
              alt="The thumbnail of the video"
              onLoad={() => setShowThumb(true)}
            />
          </Animate>
          <div className="absolute top-0 left-0 flex h-screen w-full justify-center items-center">
            <Animate play start={{ opacity: 0 }} end={{ opacity: 1 }}>
              <ClipLoader
                color="white"
                size={80}
                speedMultiplier={0.5}
                className="drop-shadow"
              />
            </Animate>
          </div>
        </div>
      )}
      {!loading && <Player />}
    </>
  );
}

export default WatchPage;
