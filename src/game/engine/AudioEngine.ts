import { Howl, Howler } from 'howler';
import { useOptionsStore } from '../../state/optionsStore';

class AudioEngineClass {
  private sounds: Record<string, Howl> = {};
  private active: boolean = false;

  init() {
    if (this.active) return;
    this.active = true;
    
    const load = (src: string, loop = false, vol = 1) => {
      return new Howl({
        src: [src],
        loop: loop,
        volume: vol,
        preload: true
      });
    };

    this.sounds.click = load('/assets/sounds/switch2.ogg', false, 0.3);
    this.sounds.hover = load('/assets/sounds/switch2.ogg', false, 0.3);
    this.sounds.confirm = load('/assets/sounds/confirmation_001.ogg', false, 0.3);
    this.sounds.shoot = load('/assets/sounds/impactWood_heavy_003.ogg'); 
    this.sounds.cannon = load('/assets/sounds/impactWood_heavy_003.ogg');
    this.sounds.explosion = load('/assets/sounds/impactWood_heavy_003.ogg');
    this.sounds.damage = load('/assets/sounds/scratch_001.ogg');
    this.sounds.jingle = load('/assets/sounds/jingles_STEEL00.ogg');
    this.sounds.bgm = load('/assets/sounds/bgm.wav', true, 0.3);
    this.sounds.ambient = load('/assets/sounds/ambient.wav', true, 0.3);

    this.updateMuteState();
    useOptionsStore.subscribe(() => this.updateMuteState());
  }

  updateMuteState() {
    const isEnabled = useOptionsStore.getState().options.soundEnabled;
    Howler.mute(!isEnabled);
  }

  play(name: string, rate?: number) {
    const sound = this.sounds[name];
    if (sound) {
      if (sound.loop() && sound.playing()) {
        return;
      }
      const id = sound.play();
      if (rate !== undefined) {
        sound.rate(rate, id);
      }
    }
  }

  stop(name: string) {
    const sound = this.sounds[name];
    if (sound) {
      sound.stop();
    }
  }

  unlock() {
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume();
    }
  }
}

export const AudioEngine = new AudioEngineClass();
