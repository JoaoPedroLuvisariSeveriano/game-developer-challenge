import { useOptionsStore } from '../../state/optionsStore';

class AudioEngineClass {
  private sounds: Record<string, HTMLAudioElement> = {};
  private active: boolean = false;

  init() {
    if (this.active) return;
    this.active = true;
    
    const load = (src: string, loop = false, vol = 1) => {
      const audio = new Audio(src);
      audio.loop = loop;
      audio.volume = vol;
      return audio;
    };

    this.sounds.click = load('/assets/sounds/click.wav');
    this.sounds.hover = load('/assets/sounds/hover.wav', false, 0.5);
    this.sounds.cannon = load('/assets/sounds/cannon.wav');
    this.sounds.explosion = load('/assets/sounds/explosion.wav');
    this.sounds.damage = load('/assets/sounds/damage.wav');
    this.sounds.ambient = load('/assets/sounds/ambient.wav', true, 0.3);
  }

  play(name: string) {
    const isEnabled = useOptionsStore.getState().options.soundEnabled;
    if (!isEnabled) {
      if (name === 'ambient') this.stop('ambient');
      return;
    }
    
    const sound = this.sounds[name];
    if (sound) {
      if (name === 'ambient') {
        sound.play().catch(() => {});
      } else {
        const clone = sound.cloneNode() as HTMLAudioElement;
        clone.volume = sound.volume;
        clone.play().catch(() => {});
      }
    }
  }

  stop(name: string) {
    const sound = this.sounds[name];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }
}

export const AudioEngine = new AudioEngineClass();
