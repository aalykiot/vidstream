import { createSignal } from 'solid-js';
import SidePanel from './components/SidePanel';
import MainPanel from './components/MainPanel';
import data from './data/videos.json';

function App() {
  const [videos] = createSignal(data);
  return (
    <div class="flex bg-gray-900 h-screen">
      <SidePanel />
      <MainPanel videos={videos()} />
    </div>
  );
}

export default App;
