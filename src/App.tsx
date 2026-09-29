import { Header } from './components/layout/Header';

export default function App() {
  return (
    <div className="gg-shell h-dvh w-full flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 min-h-0 relative bg-canvas" />
    </div>
  );
}