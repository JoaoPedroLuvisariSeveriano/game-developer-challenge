import { PixiCanvas } from './components/game/PixiCanvas';
import { MainMenu } from './components/menus/MainMenu';
import { OptionsMenu } from './components/menus/OptionsMenu';
import { GameOver } from './components/menus/GameOver';
import { PauseMenu } from './components/menus/PauseMenu';
import { CaptainsLog } from './components/menus/CaptainsLog';
import { HUD } from './components/game/HUD';
import { useMatchStore } from './state/matchStore';

export default function App() {
  const status = useMatchStore(s => s.status);
  const matchId = useMatchStore(s => s.matchId);

  // When quitting to menu, we unmount the PixiCanvas entirely so it gets destroyed.
  const isPlaying = status === 'playing' || status === 'paused' || status === 'gameover';

  return (
    <main className="w-full h-full overflow-hidden bg-black relative">
      {isPlaying && <PixiCanvas key={matchId} />}
      {isPlaying && <HUD />}
      
      {status === 'menu' && <MainMenu />}
      {status === 'options' && <OptionsMenu />}
      {(status === 'ranking' || status === 'history') && <CaptainsLog defaultTab={status} />}
      {status === 'paused' && <PauseMenu />}
      {status === 'gameover' && <GameOver />}
    </main>
  );
}
