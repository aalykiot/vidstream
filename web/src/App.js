import { useState } from 'react';
import SidePanel from './components/SidePanel';
import MainPanel from './components/MainPanel';
import data from './data/videos.json';

const App = () => {
  const [videos] = useState(data);
  return (
    <div className="flex bg-gray-900 h-screen">
      <SidePanel />
      <MainPanel videos={videos} />
    </div>
  );
};

export default App;
