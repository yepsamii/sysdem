import { Canvas } from './canvas/Canvas';
import { Header } from './components/layout/Header';
import { SavedBanner } from './components/layout/SavedBanner';
import { CookieConsent } from './components/overlays/CookieConsent';
import { ComponentsPanel } from './components/panel/ComponentsPanel';
import { ComponentsTogglePill } from './components/panel/ComponentsTogglePill';

export default function App() {
  return (
    <div className="gg-shell h-dvh w-full flex flex-col overflow-hidden">
      <Header />
      <SavedBanner />
      <ComponentsTogglePill />
      <main className="flex-1 min-h-0 relative bg-canvas flex">
        <ComponentsPanel />
        <div className="flex-1 min-w-0 relative">
          <Canvas />
          <CookieConsent />
        </div>
      </main>
    </div>
  );
}