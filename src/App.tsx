import { Canvas } from './canvas/Canvas';
import { Header } from './components/layout/Header';
import { SavedBanner } from './components/layout/SavedBanner';
import { ComponentsPanel } from './components/panel/ComponentsPanel';

export default function App() {
  return (
    <div className="gg-shell h-dvh w-full flex flex-col overflow-hidden">
      <Header />
      <SavedBanner />
      <main className="flex-1 min-h-0 relative bg-canvas flex">
        <ComponentsPanel />
        <div className="flex-1 min-w-0 relative">
          <Canvas />
        </div>
      </main>
    </div>
  );
}