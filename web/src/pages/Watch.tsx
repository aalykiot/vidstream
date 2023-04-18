import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import Player from '../components/Player';
import { AppDispatch } from '../store/store';
import {
  getMetadataStatus,
  fetchMetadataAsync,
} from '../store/features/player';

function WatchPage() {
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const metaStatus = useSelector(getMetadataStatus);

  useEffect(() => {
    dispatch(fetchMetadataAsync(params.id as string));
  }, [params]);

  return <div>{metaStatus === 'succeeded' && <Player />}</div>;
}

export default WatchPage;
