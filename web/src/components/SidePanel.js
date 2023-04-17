import classnames from 'classnames';
import styles from './styles/SidePanel.module.css';
import { ReactComponent as PlayIcon } from './icons/play-icon.svg';
import { ReactComponent as SettingsIcon } from './icons/settings-icon.svg';
import { ReactComponent as LogoutIcon } from './icons/logout-icon.svg';
import { ReactComponent as HomeIcon } from './icons/home-icon.svg';
import { ReactComponent as CardIcon } from './icons/card-icon.svg';
import { ReactComponent as MessageIcon } from './icons/message-icon.svg';
import { ReactComponent as HeartIcon } from './icons/heart-icon.svg';

function SidePanel() {
  return (
    <div
      className={classnames(
        'w-20 border-r border-gray-800 flex flex-col text-gray-300',
        styles.panel
      )}
    >
      <div className="h-20 flex justify-center items-center">
        <PlayIcon className="w-14 h-14 text-green-400" />
      </div>
      <div className="flex-1 flex flex-col items-center">
        <HomeIcon className="w-6 h-6 mt-8 text-green-300" />
        <CardIcon className="w-6 h-6 mt-12" />
        <MessageIcon className="w-6 h-6 mt-12" />
        <HeartIcon className="w-6 h-6 mt-12" />
      </div>
      <div className="flex flex-col justify-center items-center border-t border-gray-800">
        <SettingsIcon className="w-6 h-6 mt-12" />
        <LogoutIcon className="w-6 h-6 mt-12 mb-12" />
      </div>
    </div>
  );
}

export default SidePanel;
