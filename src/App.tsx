import { PixiCanvas } from './components/game/PixiCanvas';
import { MainMenu } from './components/menus/MainMenu';
import { OptionsMenu } from './components/menus/OptionsMenu';
import { GameOver } from './components/menus/GameOver';
import { PauseMenu } from './components/menus/PauseMenu';
import { CaptainsLog } from './components/menus/CaptainsLog';
import { HUD } from './components/game/HUD';
import { useMatchStore } from './state/matchStore';
import { AudioEngine } from './game/engine/AudioEngine';
import { useEffect } from 'react';
import { useOptionsStore } from './state/optionsStore';

export default function App() {
  const status = useMatchStore(s => s.status);
  const matchId = useMatchStore(s => s.matchId);

  const { soundEnabled } = useOptionsStore(s => s.options);

  useEffect(() => {
    AudioEngine.init();
    
    const handleInteraction = () => {
      AudioEngine.play('ambient');
    };
    
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  useEffect(() => {
    if (soundEnabled) {
      AudioEngine.play('ambient');
    } else {
      AudioEngine.stop('ambient');
    }
  }, [soundEnabled]);

  const isPlaying = status === 'playing' || status === 'paused' || status === 'gameover';

  return (
    <main className="w-full h-full overflow-hidden bg-transparent relative">
      <PixiCanvas key={matchId} />
      {isPlaying && <HUD />}
      
      {status === 'menu' && <MainMenu />}
      {status === 'options' && <OptionsMenu />}
      {(status === 'ranking' || status === 'history') && <CaptainsLog defaultTab={status} />}
      {status === 'paused' && <PauseMenu />}
      {status === 'gameover' && <GameOver />}
    </main>
  );
}
