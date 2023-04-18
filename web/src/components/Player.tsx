import { useSelector } from 'react-redux';
import PlayerControls from './PlayerControls';
import { getSource, getMetadata } from '../store/features/player';

function Player() {
  const meta = useSelector(getMetadata);
  const source = useSelector(getSource);

  return (
    <div className="flex relative h-screen w-full bg-black justify-center items-center">
      <video controls={false} autoPlay className="max-h-full">
        <track kind="captions" />
        <source src={source!} type={meta!.mimetype} />
      </video>
      <PlayerControls title={meta!.title} duration={meta!.duration} />
    </div>
  );
}

export default Player;
