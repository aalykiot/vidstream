import { ReactComponent as PlayIcon } from '../components/icons/play-icon.svg';

function ErrorPage() {
  return (
    <div className="flex w-full h-screen bg-gray-900 text-gray-200 justify-center items-center">
      <div className="flex items-center">
        <PlayIcon className="w-28 h-28 text-green-400" />
        <div className="font-bold text-8xl">404</div>
      </div>
    </div>
  );
}

export default ErrorPage;
