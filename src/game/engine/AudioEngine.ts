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

    this.sounds.click = load('/assets/sounds/click.wav');
    this.sounds.hover = load('/assets/sounds/hover.wav', false, 0.5);
    this.sounds.shoot = load('/assets/sounds/shoot.wav'); 
    this.sounds.cannon = load('/assets/sounds/cannon.wav');
    this.sounds.explosion = load('/assets/sounds/explosion.wav');
    this.sounds.damage = load('/assets/sounds/damage.wav');
    this.sounds.bgm = load('/assets/sounds/bgm.wav', true, 0.3);
    this.sounds.ambient = load('/assets/sounds/ambient.wav', true, 0.3);

    this.updateMuteState();
    useOptionsStore.subscribe(() => this.updateMuteState());
  }

  updateMuteState() {
    const isEnabled = useOptionsStore.getState().options.soundEnabled;
    Howler.mute(!isEnabled);
  }

  play(name: string) {
    const sound = this.sounds[name];
    if (sound) {
      if (sound.loop() && sound.playing()) {
        return;
      }
      sound.play();
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
