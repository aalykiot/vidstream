import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { ReactComponent as LeftArrowIcon } from '../components/icons/left-arrow-icon.svg';
import { ReactComponent as DownloadIcon } from '../components/icons/download-icon.svg';
import { AppDispatch } from '../store';
import {
  getSource,
  getMetadata,
  getMetadataStatus,
  fetchMetadataAsync,
} from '../store/features/player';

function WatchPage() {
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const meta = useSelector(getMetadata);
  const metaStatus = useSelector(getMetadataStatus);
  const source = useSelector(getSource);

  useEffect(() => {
    dispatch(fetchMetadataAsync(params.id as string));
  }, [params]);

  return (
    <div>
      {metaStatus === 'succeeded' && (
        <div className="flex relative h-screen w-full bg-black justify-center items-center">
          <video controls={false} autoPlay className="max-h-full">
            <track kind="captions" />
            <source src={source!} type={meta!.mimetype} />
          </video>
          <div className="flex absolute top-0 left-0 right-0 py-6 px-8 items-center justify-between">
            <Link to="/browse">
              <LeftArrowIcon className="text-white w-9 h-9 drop-shadow-md" />
            </Link>
            <div className="text-2xl text-white drop-shadow-md">
              {String(meta!.title).toUpperCase()}
            </div>
            <DownloadIcon className="text-white w-9 h-9 drop-shadow-md" />
          </div>
        </div>
      )}
    </div>
  );
}

export default WatchPage;
