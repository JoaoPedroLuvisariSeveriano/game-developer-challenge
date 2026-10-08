/**
 * Declarative description of the asset tree required by the challenge.
 *
 * This is the single source of truth for `scripts/generate-assets.js`.
 * Paths are POSIX-style and relative to `public/assets/`.
 *
 * Ranges are expanded programmatically (e.g. `ship_1..ship_24`) so the manifest stays
 * readable while still producing the exact filenames the challenge expects.
 */

/** @param {string} prefix @param {number} count @param {string} [ext] */
const seq = (prefix, count, ext = '.png') =>
  Array.from({ length: count }, (_, i) => `${prefix}${i + 1}${ext}`)

/** @param {string[]} names @param {string} [ext] */
const files = (names, ext = '.png') => names.map((name) => `${name}${ext}`)

/**
 * PNG groups, relative to `png/<variant>/`.
 * The same tree exists for every variant (1x `default` and 2x `retina`).
 * @type {Record<string, string[]>}
 */
const PNG_GROUPS = {
  effects: [...seq('explosion_', 3), ...seq('fire_', 2)],
  ship_parts: [
    ...files(['cannon', 'cannon_ball', 'cannon_loose', 'cannon_mobile']),
    ...seq('crew_', 6),
    ...seq('flag_', 6),
    ...seq('hull_large_', 4),
    ...seq('hull_small_', 4),
    ...files(['nest', 'pole']),
    ...seq('sail_large_', 24),
    ...seq('sail_small_', 13),
    ...seq('wood_', 4),
  ],
  ships: [...seq('dinghy_large_', 3), ...seq('dinghy_small_', 3), ...seq('ship_', 24)],
  tiles: seq('tile_', 96),
  'ui/controls': files([
    'button_round_hover',
    'button_round_normal',
    'button_round_pressed',
    'icon_close',
    'icon_fire_front',
    'icon_fire_left',
    'icon_fire_right',
    'icon_forward',
    'icon_home',
    'icon_minus',
    'icon_pause',
    'icon_play',
    'icon_plus',
    'icon_restart',
    'icon_settings',
    'icon_turn_left',
    'icon_turn_right',
  ]),
  'ui/hud': files([
    'counter_panel',
    'enemy_health_fill_green',
    'enemy_health_fill_red',
    'enemy_health_frame',
    'health_fill_amber',
    'health_fill_green',
    'health_fill_red',
    'health_frame',
    'icon_heart',
    'icon_score',
    'icon_time',
  ]),
  'ui/menu': files([
    'button_primary_disabled',
    'button_primary_hover',
    'button_primary_normal',
    'button_primary_pressed',
    'button_secondary_normal',
    'button_secondary_pressed',
    'panel_menu',
    'title_pirate_battle',
  ]),
}

export const PNG_VARIANTS = ['default', 'retina']

const SOUNDS = [
  'cannon_broadside',
  ...seq('cannon_fire_', 3, ''),
  ...seq('cannonball_water_hit_', 2, ''),
  'game_complete',
  'game_over',
  'game_pause',
  'game_resume',
  'game_start',
  'health_low',
  'ocean_ambience_loop',
  'score_point',
  'ship_collision',
  ...seq('ship_explosion_', 2, ''),
  'ship_sailing_loop',
  'ship_sinking',
  ...seq('ship_wood_hit_', 2, ''),
  'time_warning',
  'ui_back',
  'ui_click',
  'ui_close',
  'ui_hover',
  'ui_open',
]

/** @returns {string[]} Every asset path (relative to `public/assets/`), sorted. */
export function buildAssetPaths() {
  const paths = []

  for (const variant of PNG_VARIANTS) {
    for (const [group, names] of Object.entries(PNG_GROUPS)) {
      for (const name of names) paths.push(`png/${variant}/${group}/${name}`)
    }
  }

  for (const sound of SOUNDS) paths.push(`sounds/${sound}.wav`)

  paths.push(
    'spritesheet/ships_miscellaneous_sheet.png',
    'spritesheet/ships_miscellaneous_sheet.xml',
    'spritesheet/ships_miscellaneous_sheet_retina.png',
    'spritesheet/ships_miscellaneous_sheet_retina.xml',
    'spritesheet/ui_sheet.json',
    'spritesheet/ui_sheet.png',
    'spritesheet/ui_sheet_retina.json',
    'spritesheet/ui_sheet_retina.png',
    'tilesheet/tiles_sheet.png',
    'tilesheet/tiles_sheet_retina.png',
    'tilesheet/tilesheets.txt',
    'vector/logo_jungle_gaming.svg',
  )

  // Reference images (ASSUMPTION: they live at the root of `assets/`; adjust here if not).
  paths.push(
    'preview.png',
    'sample.png',
    'sample_history.png',
    'sample_menu.png',
    'sample_options.png',
    'sample_pause.png',
    'sample_ranking.png',
  )

  return paths.sort()
}

/** Expected total, used by the generator as a sanity check against typos in this file. */
export const EXPECTED_ASSET_COUNT = 514
