import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useIdleTimer } from 'react-idle-timer';
import PlayerControls from './PlayerControls';
import { getSource, getMetadata } from '../store/features/player';

export type Status = 'PLAYING' | 'PAUSED' | 'DONE';

function Player() {
  const [status, setStatus] = useState<Status>('PLAYING');
  const [remaining, setRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);
  const [fullScreen, setFullScreen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const meta = useSelector(getMetadata);
  const source = useSelector(getSource);
  const video = useRef<HTMLVideoElement>(null);
  const statusRef = useRef(status);

  useIdleTimer({
    timeout: 3500,
    onPresenceChange: (event) => setIsIdle(event.type === 'idle'),
  });

  const onTimeUpdate = () => {
    const currentTime = video.current?.currentTime || 0;
    const duration = video.current?.duration || 1;
    setProgress((currentTime / duration) * 100);
    setRemaining(duration - currentTime);
  };

  const setPlayerStatus = (value: Status) => {
    if (value === 'PLAYING') video.current?.play();
    if (value === 'PAUSED') video.current?.pause();
    setStatus(value);
    statusRef.current = value;
  };

  const onFullScreenChange = () => {
    setFullScreen((prevValue) => !prevValue);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      const { current } = statusRef;
      setPlayerStatus(current === 'PLAYING' ? 'PAUSED' : 'PLAYING');
    }
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', onFullScreenChange, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', onFullScreenChange);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div className="flex relative h-screen w-full bg-black justify-center items-center">
      <video
        controls={false}
        ref={video}
        autoPlay
        className="max-h-full"
        onTimeUpdate={onTimeUpdate}
        onEnded={() => setStatus('DONE')}
        muted={muted}
      >
        <track kind="captions" />
        <source src={source!} type={meta!.mimetype} />
      </video>
      {!isIdle && (
        <PlayerControls
          title={meta!.title}
          status={status}
          muted={muted}
          fullScreen={fullScreen}
          progress={progress}
          remaining={remaining}
          setPlayerStatus={setPlayerStatus}
          setMuted={setMuted}
        />
      )}
    </div>
  );
}

export default Player;
