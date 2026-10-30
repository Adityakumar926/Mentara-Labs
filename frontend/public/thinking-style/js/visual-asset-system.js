/**
 * Mentp Learning Compass | Complete Visual Asset System
 * 
 * Features:
 * - 8+ Distinct Character Cast for the 8 Assessment Missions:
 *   1. Pip the Compass Navigator (Global Guide)
 *   2. Orion the Pattern Scout (Mission 1: Pattern Planet)
 *   3. Bramble the Forest Guardian (Mission 2: Memory Forest)
 *   4. Dr. Ada the Kinetic Inventor (Mission 3: Switch Lab)
 *   5. Captain Lyra the Storyfarer (Mission 4: Story Ship)
 *   6. Milo the Creative Maker (Mission 5: Inventor's Workshop)
 *   7. Flora the Heart-Gardener (Mission 6: Feelings Garden)
 *   8. Leo & Kai the Collaborative Duo (Mission 7: Friendship and Fairness)
 *   9. Barnaby the Learning Detective (Mission 8: The Learning Detective)
 * 
 * - 8+ Animated Functional States:
 *   'welcome', 'idle', 'thinking', 'pointing', 'building', 'reading', 'celebrate', 'encouraging', 'transition', 'presenting'
 * 
 * - Integration with Three.js 3D WebGL scenes & Lottie runtimes
 */

import { Three3DScene } from './three-3d-scene.js';

export const VisualAssetSystem = {
  /**
   * Character registry metadata
   */
  characters: {
    pip: {
      name: 'Pip',
      title: 'Expedition Guide',
      missionId: 'global',
      accentColor: '#177A53',
      badgeBg: '#DDF5E9'
    },
    orion: {
      name: 'Orion',
      title: 'Pattern Scout',
      missionId: 'mission-pattern-planet',
      accentColor: '#2EA879',
      badgeBg: '#DFF4EA'
    },
    bramble: {
      name: 'Bramble',
      title: 'Forest Guardian',
      missionId: 'mission-memory-forest',
      accentColor: '#267A4F',
      badgeBg: '#D5EEDB'
    },
    ada: {
      name: 'Dr. Ada',
      title: 'Kinetic Inventor',
      missionId: 'mission-switch-lab',
      accentColor: '#C78B12',
      badgeBg: '#FFF0BE'
    },
    lyra: {
      name: 'Captain Lyra',
      title: 'Story Navigator',
      missionId: 'mission-story-ship',
      accentColor: '#2B7BC7',
      badgeBg: '#DFEDFF'
    },
    milo: {
      name: 'Milo',
      title: 'Creative Maker',
      missionId: 'mission-inventors-workshop',
      accentColor: '#E07338',
      badgeBg: '#FFE4D6'
    },
    flora: {
      name: 'Flora',
      title: 'Heart-Gardener',
      missionId: 'mission-feelings-garden',
      accentColor: '#7C5CDB',
      badgeBg: '#EAE4FF'
    },
    leo_kai: {
      name: 'Leo & Kai',
      title: 'Collaborative Duo',
      missionId: 'mission-friendship-fairness',
      accentColor: '#D95D3E',
      badgeBg: '#FEEDDE'
    },
    barnaby: {
      name: 'Barnaby',
      title: 'Learning Detective',
      missionId: 'mission-learning-detective',
      accentColor: '#375965',
      badgeBg: '#E4ECF0'
    }
  },

  /**
   * Renders the distinct animated character SVG for a given character and state
   */
  renderCharacterSvg(characterKey = 'pip', state = 'idle', size = 96) {
    switch (characterKey) {
      case 'orion':
        return this.renderOrionSvg(state, size);
      case 'bramble':
        return this.renderBrambleSvg(state, size);
      case 'ada':
        return this.renderAdaSvg(state, size);
      case 'lyra':
        return this.renderLyraSvg(state, size);
      case 'milo':
        return this.renderMiloSvg(state, size);
      case 'flora':
        return this.renderFloraSvg(state, size);
      case 'leo_kai':
        return this.renderLeoKaiSvg(state, size);
      case 'barnaby':
        return this.renderBarnabySvg(state, size);
      case 'pip':
      default:
        return this.renderPip3D(state, size);
    }
  },

  /* --------------------------------------------------------------------------
     1. PIP THE EXPEDITION GUIDE (3D Robot Bunny Astronaut Mascot)
     -------------------------------------------------------------------------- */
  renderPip3D(state = 'welcome', size = 96) {
    let imgSrc = 'assets/3d/pip-welcome.png';
    let altText = 'Pip the robotic bunny astronaut guide waving';

    if (state === 'thinking' || state === 'hint') {
      imgSrc = 'assets/3d/pip-thinking.png';
      altText = 'Pip pondering with hand on chin';
    } else if (state === 'celebrate' || state === 'transition' || state === 'report') {
      imgSrc = 'assets/3d/pip-celebrate.png';
      altText = 'Pip joyously celebrating with open arms';
    }

    return `
      <div class="pip-3d-wrapper anim-pip-float" style="width: ${size}px; height: ${size}px; display: inline-flex; align-items: center; justify-content: center; position: relative;" title="Pip • Explorer Guide">
        <img src="${imgSrc}" alt="${altText}" style="width: 100%; height: 100%; object-fit: contain; display: block;" loading="eager" />
      </div>
    `;
  },
  renderPipSvg(state = 'welcome', size = 96) {
    let animClass = 'anim-mascot-idle';
    let armLeft = '<path d="M26 62C20 66 14 74 18 80" stroke="#78BFA5" stroke-width="4" stroke-linecap="round" fill="none" />';
    let armRight = '<path d="M74 62C80 66 86 74 82 80" stroke="#78BFA5" stroke-width="4" stroke-linecap="round" fill="none" />';
    let accessory = '';

    if (state === 'welcome') {
      animClass = 'anim-mascot-wave';
      armRight = '<path d="M74 58C84 46 88 32 82 26" stroke="#78BFA5" stroke-width="4.5" stroke-linecap="round" fill="none" />';
    } else if (state === 'thinking') {
      animClass = 'anim-mascot-think';
      armRight = '<path d="M74 62C78 54 70 46 62 48" stroke="#78BFA5" stroke-width="4" stroke-linecap="round" fill="none" />';
      accessory = '<polygon points="80,18 83,24 89,26 84,30 85,36 80,33 75,36 76,30 71,26 77,24" fill="#F5A623" class="anim-sparkle" />';
    } else if (state === 'celebrate') {
      animClass = 'anim-mascot-celebrate';
      armLeft = '<path d="M26 58C18 42 12 30 18 24" stroke="#78BFA5" stroke-width="4.5" stroke-linecap="round" fill="none" />';
      armRight = '<path d="M74 58C82 42 88 30 82 24" stroke="#78BFA5" stroke-width="4.5" stroke-linecap="round" fill="none" />';
      accessory = '<circle cx="86" cy="20" r="4" fill="#E29B63" class="anim-sparkle"/><circle cx="14" cy="22" r="3.5" fill="#9275D9" class="anim-sparkle"/>';
    } else if (state === 'encouraging') {
      accessory = `
        <g transform="translate(70, 48) scale(0.65)" class="anim-lantern-glow">
          <rect x="5" y="8" width="16" height="22" rx="4" fill="#FFE4D6" stroke="#E29B63" stroke-width="2" />
          <circle cx="13" cy="19" r="6" fill="#F5A623" />
        </g>
      `;
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pip the Expedition Guide (${state})" class="${animClass}">
        <!-- Shadow -->
        <ellipse cx="50" cy="88" rx="26" ry="6" fill="rgba(67, 73, 112, 0.12)" />
        
        <!-- Arms -->
        ${armLeft}
        ${armRight}

        <!-- Round Body / Face -->
        <circle cx="50" cy="50" r="30" fill="#DDF5E9" stroke="#177A53" stroke-width="2.5" />
        
        <!-- Cheeks -->
        <circle cx="34" cy="56" r="4.5" fill="#FFC9B2" opacity="0.75" />
        <circle cx="66" cy="56" r="4.5" fill="#FFC9B2" opacity="0.75" />

        <!-- Eyes -->
        <ellipse cx="40" cy="48" rx="3.5" ry="4.5" fill="#293347" />
        <ellipse cx="60" cy="48" rx="3.5" ry="4.5" fill="#293347" />
        <circle cx="41.5" cy="46.5" r="1.3" fill="#FFFFFF" />
        <circle cx="61.5" cy="46.5" r="1.3" fill="#FFFFFF" />

        <!-- Smile -->
        <path d="M43 58Q50 65 57 58" stroke="#293347" stroke-width="2.2" stroke-linecap="round" fill="none" />

        <!-- Explorer Cap -->
        <path d="M28 32C32 20 68 20 72 32Z" fill="#FFE4D6" stroke="#E07338" stroke-width="2" />
        <circle cx="50" cy="20" r="4" fill="#FFF1BD" stroke="#C78B12" stroke-width="1.5" />

        <!-- Accessory -->
        ${accessory}
      </svg>
    `;
  },

  /* --------------------------------------------------------------------------
     2. ORION THE PATTERN SCOUT (Mission 1: Pattern Planet)
     -------------------------------------------------------------------------- */
  renderOrionSvg(state = 'idle', size = 96) {
    let animClass = 'anim-mascot-idle';
    let prop = '';

    if (state === 'thinking' || state === 'inspecting') {
      animClass = 'anim-mascot-think';
      prop = '<polygon points="80,24 82,28 86,29 83,32 84,36 80,34 76,36 77,32 74,29 78,28" fill="#FFF1BD" stroke="#2EA879" stroke-width="1" class="anim-sparkle" />';
    } else if (state === 'pointing') {
      prop = '<line x1="72" y1="52" x2="88" y2="40" stroke="#2EA879" stroke-width="3.5" stroke-linecap="round" />';
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Orion the Pattern Scout (${state})" class="${animClass}">
        <!-- Shadow -->
        <ellipse cx="50" cy="88" rx="26" ry="6" fill="rgba(67, 73, 112, 0.12)" />
        
        <!-- Astro Cape / Collar -->
        <path d="M26 66 Q50 82 74 66 L78 84 Q50 92 22 84 Z" fill="#DDF5E9" stroke="#177A53" stroke-width="2" />

        <!-- Body & Face -->
        <circle cx="50" cy="48" r="28" fill="#F4FAF7" stroke="#2EA879" stroke-width="2.5" />

        <!-- Stargazer Visor / Celestial Headband -->
        <rect x="24" y="38" width="52" height="15" rx="7.5" fill="#DFEDFF" stroke="#2B7BC7" stroke-width="2" />
        <ellipse cx="40" cy="45.5" rx="5" ry="3.5" fill="#2B7BC7" opacity="0.6" />
        <ellipse cx="60" cy="45.5" rx="5" ry="3.5" fill="#2B7BC7" opacity="0.6" />
        <circle cx="41" cy="44.5" r="1.5" fill="#FFFFFF" />
        <circle cx="61" cy="44.5" r="1.5" fill="#FFFFFF" />

        <!-- Cheeks & Smile -->
        <circle cx="33" cy="57" r="3.5" fill="#FFE4D6" />
        <circle cx="67" cy="57" r="3.5" fill="#FFE4D6" />
        <path d="M44 59 Q50 65 56 59" stroke="#293347" stroke-width="2" stroke-linecap="round" fill="none" />

        <!-- Cosmic Star Goggles Antenna -->
        <line x1="50" y1="20" x2="50" y2="10" stroke="#2EA879" stroke-width="2" />
        <polygon points="50,4 52,8 56,9 53,12 54,16 50,14 46,16 47,12 44,9 48,8" fill="#FFF1BD" stroke="#2EA879" stroke-width="1" />

        ${prop}
      </svg>
    `;
  },

  /* --------------------------------------------------------------------------
     3. BRAMBLE THE FOREST GUARDIAN (Mission 2: Memory Forest)
     -------------------------------------------------------------------------- */
  renderBrambleSvg(state = 'idle', size = 96) {
    let animClass = 'anim-mascot-idle';
    let prop = '';

    if (state === 'thinking' || state === 'reading') {
      animClass = 'anim-mascot-think';
      prop = `
        <!-- Bramble's Leaf Log Notebook -->
        <g transform="translate(62, 55)">
          <rect x="0" y="0" width="22" height="26" rx="4" fill="#D5EEDB" stroke="#267A4F" stroke-width="1.8" />
          <line x1="4" y1="7" x2="18" y2="7" stroke="#267A4F" stroke-width="1.5" stroke-linecap="round" />
          <line x1="4" y1="13" x2="15" y2="13" stroke="#267A4F" stroke-width="1.5" stroke-linecap="round" />
        </g>
      `;
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bramble the Forest Guardian (${state})" class="${animClass}">
        <!-- Shadow -->
        <ellipse cx="50" cy="88" rx="26" ry="6" fill="rgba(67, 73, 112, 0.12)" />

        <!-- Owl Feather Tufts / Ears -->
        <polygon points="26,30 36,16 42,32" fill="#D5EEDB" stroke="#267A4F" stroke-width="2" />
        <polygon points="74,30 64,16 58,32" fill="#D5EEDB" stroke="#267A4F" stroke-width="2" />

        <!-- Body -->
        <ellipse cx="50" cy="54" rx="29" ry="30" fill="#FAF6ED" stroke="#267A4F" stroke-width="2.5" />
        
        <!-- Big Wise Forest Spectacles -->
        <circle cx="39" cy="46" r="12" fill="#FFFFFF" stroke="#C78B12" stroke-width="2" />
        <circle cx="61" cy="46" r="12" fill="#FFFFFF" stroke="#C78B12" stroke-width="2" />
        <line x1="51" y1="46" x2="49" y2="46" stroke="#C78B12" stroke-width="2" />

        <!-- Eyes inside spectacles -->
        <circle cx="40" cy="46" r="4.5" fill="#293347" />
        <circle cx="60" cy="46" r="4.5" fill="#293347" />
        <circle cx="41.5" cy="44.5" r="1.5" fill="#FFFFFF" />
        <circle cx="61.5" cy="44.5" r="1.5" fill="#FFFFFF" />

        <!-- Beak -->
        <polygon points="46,55 54,55 50,62" fill="#E29B63" stroke="#C78B12" stroke-width="1.5" />

        <!-- Green Leaf Satchel Strap -->
        <path d="M25 45 Q50 72 75 75" stroke="#78BFA5" stroke-width="3" fill="none" />

        ${prop}
      </svg>
    `;
  },

  /* --------------------------------------------------------------------------
     4. DR. ADA / SPARK (Mission 3: Switch Lab)
     -------------------------------------------------------------------------- */
  renderAdaSvg(state = 'idle', size = 96) {
    let animClass = 'anim-mascot-idle';
    let prop = '';

    if (state === 'building' || state === 'experimenting') {
      animClass = 'anim-mascot-think';
      prop = `
        <!-- Wrench in Hand -->
        <g transform="translate(68, 48) rotate(20)">
          <line x1="0" y1="0" x2="18" y2="18" stroke="#647184" stroke-width="3.5" stroke-linecap="round" />
          <circle cx="20" cy="20" r="5" fill="none" stroke="#647184" stroke-width="2" />
        </g>
      `;
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dr. Ada the Kinetic Inventor (${state})" class="${animClass}">
        <!-- Shadow -->
        <ellipse cx="50" cy="88" rx="26" ry="6" fill="rgba(67, 73, 112, 0.12)" />

        <!-- Lab Coat Collar -->
        <path d="M30 68 L50 82 L70 68 L76 86 L24 86 Z" fill="#FFFFFF" stroke="#C78B12" stroke-width="2" />

        <!-- Robot/Scientist Head (Rounded Square) -->
        <rect x="25" y="24" width="50" height="46" rx="14" fill="#FFFDF5" stroke="#C78B12" stroke-width="2.5" />

        <!-- Rotating Brass Gear Antenna -->
        <line x1="50" y1="24" x2="50" y2="12" stroke="#C78B12" stroke-width="2.5" />
        <circle cx="50" cy="10" r="5" fill="#FFF0BE" stroke="#C78B12" stroke-width="1.5" />

        <!-- Scientist Goggles -->
        <rect x="30" y="34" width="40" height="16" rx="8" fill="#FFE4D6" stroke="#E07338" stroke-width="2" />
        <circle cx="40" cy="42" r="5.5" fill="#293347" />
        <circle cx="60" cy="42" r="5.5" fill="#293347" />
        <circle cx="41.5" cy="40.5" r="1.5" fill="#FFFFFF" />
        <circle cx="61.5" cy="40.5" r="1.5" fill="#FFFFFF" />

        <!-- Determined Smile -->
        <path d="M44 57 Q50 63 56 57" stroke="#293347" stroke-width="2.2" stroke-linecap="round" fill="none" />

        ${prop}
      </svg>
    `;
  },

  /* --------------------------------------------------------------------------
     5. CAPTAIN LYRA (Mission 4: Story Ship)
     -------------------------------------------------------------------------- */
  renderLyraSvg(state = 'idle', size = 96) {
    let animClass = 'anim-mascot-idle';
    let prop = '';

    if (state === 'pointing' || state === 'guiding') {
      animClass = 'anim-mascot-wave';
      prop = `
        <!-- Telescope in Hand Pointing at Narrative Stars -->
        <g transform="translate(66, 44) rotate(-25)">
          <rect x="0" y="0" width="22" height="7" rx="2" fill="#FFF1BD" stroke="#C78B12" stroke-width="1.5" />
          <rect x="18" y="-1.5" width="8" height="10" rx="2" fill="#2B7BC7" stroke="#C78B12" stroke-width="1.5" />
        </g>
      `;
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Captain Lyra the Storyfarer (${state})" class="${animClass}">
        <!-- Shadow -->
        <ellipse cx="50" cy="88" rx="26" ry="6" fill="rgba(67, 73, 112, 0.12)" />

        <!-- Mariner Jacket -->
        <path d="M26 66 Q50 78 74 66 L78 86 L22 86 Z" fill="#DFEDFF" stroke="#2B7BC7" stroke-width="2" />

        <!-- Head -->
        <circle cx="50" cy="48" r="28" fill="#FFF8F3" stroke="#2B7BC7" stroke-width="2.5" />

        <!-- Sailor Captain's Bicorne / Beret -->
        <path d="M22 32 C30 18 70 18 78 32 C65 30 35 30 22 32 Z" fill="#2B7BC7" stroke="#104273" stroke-width="2" />
        <circle cx="50" cy="24" r="3.5" fill="#FFF1BD" stroke="#C78B12" stroke-width="1" />

        <!-- Eyes & Cheeks -->
        <ellipse cx="40" cy="47" rx="3.5" ry="4" fill="#293347" />
        <ellipse cx="60" cy="47" rx="3.5" ry="4" fill="#293347" />
        <circle cx="41.5" cy="45.5" r="1.2" fill="#FFFFFF" />
        <circle cx="61.5" cy="45.5" r="1.2" fill="#FFFFFF" />
        <circle cx="33" cy="54" r="3.5" fill="#FFE4D6" />
        <circle cx="67" cy="54" r="3.5" fill="#FFE4D6" />

        <!-- Smile -->
        <path d="M43 56 Q50 63 57 56" stroke="#293347" stroke-width="2" stroke-linecap="round" fill="none" />

        ${prop}
      </svg>
    `;
  },

  /* --------------------------------------------------------------------------
     6. MILO THE CREATIVE MAKER (Mission 5: Inventor's Workshop)
     -------------------------------------------------------------------------- */
  renderMiloSvg(state = 'idle', size = 96) {
    let animClass = 'anim-mascot-idle';
    let prop = '';

    if (state === 'building') {
      animClass = 'anim-mascot-think';
      prop = `
        <!-- Mallet & Creative Clay Block -->
        <g transform="translate(68, 52)">
          <rect x="0" y="0" width="14" height="14" rx="3" fill="#FFE4D6" stroke="#E07338" stroke-width="1.5" />
        </g>
      `;
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Milo the Maker (${state})" class="${animClass}">
        <!-- Shadow -->
        <ellipse cx="50" cy="88" rx="26" ry="6" fill="rgba(67, 73, 112, 0.12)" />

        <!-- Maker Apron -->
        <path d="M28 66 L72 66 L68 86 L32 86 Z" fill="#FFE4D6" stroke="#E07338" stroke-width="2" />

        <!-- Head -->
        <circle cx="50" cy="46" r="28" fill="#FFFBF5" stroke="#E07338" stroke-width="2.5" />

        <!-- Artist Beret tilted -->
        <ellipse cx="46" cy="22" rx="24" ry="10" transform="rotate(-12 46 22)" fill="#FFF1BD" stroke="#C78B12" stroke-width="2" />
        
        <!-- Drafting Pencil Behind Ear -->
        <line x1="68" y1="28" x2="80" y2="18" stroke="#E07338" stroke-width="3.5" stroke-linecap="round" />
        <polygon points="80,18 84,15 82,21" fill="#293347" />

        <!-- Eyes & Cheeks -->
        <ellipse cx="41" cy="45" rx="3.5" ry="4" fill="#293347" />
        <ellipse cx="59" cy="45" rx="3.5" ry="4" fill="#293347" />
        <circle cx="42" cy="43.5" r="1.3" fill="#FFFFFF" />
        <circle cx="60" cy="43.5" r="1.3" fill="#FFFFFF" />
        <circle cx="34" cy="53" r="3.5" fill="#FFD2C0" />
        <circle cx="66" cy="53" r="3.5" fill="#FFD2C0" />

        <!-- Curious Open Grin -->
        <path d="M43 55 Q50 63 57 55" stroke="#293347" stroke-width="2.2" stroke-linecap="round" fill="none" />

        ${prop}
      </svg>
    `;
  },

  /* --------------------------------------------------------------------------
     7. FLORA THE HEART-GARDENER (Mission 6: Feelings Garden)
     -------------------------------------------------------------------------- */
  renderFloraSvg(state = 'idle', size = 96) {
    let animClass = 'anim-mascot-idle';
    let prop = '';

    if (state === 'encouraging' || state === 'listening') {
      animClass = 'anim-mascot-wave';
      prop = `
        <!-- Gentle Watering Can with Sprout -->
        <g transform="translate(66, 50) scale(0.8)">
          <rect x="0" y="8" width="16" height="14" rx="4" fill="#EAE4FF" stroke="#7C5CDB" stroke-width="1.8" />
          <line x1="14" y1="12" x2="22" y2="6" stroke="#7C5CDB" stroke-width="2" stroke-linecap="round" />
        </g>
      `;
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Flora the Heart-Gardener (${state})" class="${animClass}">
        <!-- Shadow -->
        <ellipse cx="50" cy="88" rx="26" ry="6" fill="rgba(67, 73, 112, 0.12)" />

        <!-- Floral Dress -->
        <path d="M30 68 Q50 78 70 68 L76 86 L24 86 Z" fill="#EAE4FF" stroke="#7C5CDB" stroke-width="2" />

        <!-- Head -->
        <circle cx="50" cy="48" r="28" fill="#FFF9FB" stroke="#7C5CDB" stroke-width="2.5" />

        <!-- Botanical Blossom Crown -->
        <circle cx="36" cy="22" r="5" fill="#FFF1BD" stroke="#C78B12" stroke-width="1.2" />
        <circle cx="50" cy="20" r="6" fill="#DDF5E9" stroke="#177A53" stroke-width="1.2" />
        <circle cx="64" cy="22" r="5" fill="#FFE4D6" stroke="#E07338" stroke-width="1.2" />

        <!-- Soft Gentle Eyes -->
        <path d="M36 46 Q40 42 44 46" stroke="#293347" stroke-width="2.2" stroke-linecap="round" fill="none" />
        <path d="M56 46 Q60 42 64 46" stroke="#293347" stroke-width="2.2" stroke-linecap="round" fill="none" />
        <circle cx="34" cy="54" r="3.5" fill="#FFC9D9" />
        <circle cx="66" cy="54" r="3.5" fill="#FFC9D9" />

        <!-- Warm Empathetic Smile -->
        <path d="M44 57 Q50 63 56 57" stroke="#293347" stroke-width="2" stroke-linecap="round" fill="none" />

        ${prop}
      </svg>
    `;
  },

  /* --------------------------------------------------------------------------
     8. LEO & KAI (Mission 7: Friendship and Fairness)
     -------------------------------------------------------------------------- */
  renderLeoKaiSvg(state = 'idle', size = 96) {
    let animClass = 'anim-mascot-idle';

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Leo & Kai the Collaborative Duo (${state})" class="${animClass}">
        <!-- Double Shadow -->
        <ellipse cx="50" cy="88" rx="34" ry="6" fill="rgba(67, 73, 112, 0.12)" />

        <!-- Kai (Left Friend - Blue) -->
        <g transform="translate(32, 48)">
          <circle cx="0" cy="0" r="18" fill="#DFEDFF" stroke="#2B7BC7" stroke-width="2" />
          <ellipse cx="-4" cy="-1" rx="2" ry="2.5" fill="#293347" />
          <ellipse cx="4" cy="-1" rx="2" ry="2.5" fill="#293347" />
          <path d="M-3 6 Q0 10 3 6" stroke="#293347" stroke-width="1.6" stroke-linecap="round" fill="none" />
          <path d="M-12 18 C-12 30 12 30 12 18 Z" fill="#DDF5E9" stroke="#177A53" stroke-width="1.8" />
        </g>

        <!-- Leo (Right Friend - Peach) -->
        <g transform="translate(68, 48)">
          <circle cx="0" cy="0" r="18" fill="#FFE4D6" stroke="#E07338" stroke-width="2" />
          <ellipse cx="-4" cy="-1" rx="2" ry="2.5" fill="#293347" />
          <ellipse cx="4" cy="-1" rx="2" ry="2.5" fill="#293347" />
          <path d="M-3 6 Q0 10 3 6" stroke="#293347" stroke-width="1.6" stroke-linecap="round" fill="none" />
          <path d="M-12 18 C-12 30 12 30 12 18 Z" fill="#EAE4FF" stroke="#7C5CDB" stroke-width="1.8" />
        </g>

        <!-- Shared Golden Star Block Passed Between Hands -->
        <polygon points="50,56 52,60 56,61 53,64 54,68 50,66 46,68 47,64 44,61 48,60" fill="#FFF1BD" stroke="#C78B12" stroke-width="1.2" />
      </svg>
    `;
  },

  /* --------------------------------------------------------------------------
     9. BARNABY THE LEARNING DETECTIVE (Mission 8: The Learning Detective)
     -------------------------------------------------------------------------- */
  renderBarnabySvg(state = 'idle', size = 96) {
    let animClass = 'anim-mascot-idle';
    let prop = '';

    if (state === 'thinking' || state === 'inspecting' || state === 'presenting') {
      animClass = 'anim-mascot-think';
      prop = `
        <!-- Magnifying Glass Looking at Clue -->
        <g transform="translate(64, 42) rotate(-15)">
          <circle cx="0" cy="0" r="10" fill="none" stroke="#375965" stroke-width="2" />
          <line x1="8" y1="8" x2="16" y2="16" stroke="#375965" stroke-width="3" stroke-linecap="round" />
        </g>
      `;
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Barnaby the Learning Detective (${state})" class="${animClass}">
        <!-- Shadow -->
        <ellipse cx="50" cy="88" rx="26" ry="6" fill="rgba(67, 73, 112, 0.12)" />

        <!-- Detective Trenchcoat Collar -->
        <path d="M26 66 L50 80 L74 66 L78 86 L22 86 Z" fill="#E4ECF0" stroke="#375965" stroke-width="2" />

        <!-- Head -->
        <circle cx="50" cy="48" r="28" fill="#FFFDF8" stroke="#375965" stroke-width="2.5" />

        <!-- Houndstooth Detective Deerstalker Cap -->
        <path d="M22 34 C30 14 70 14 78 34 Z" fill="#FFE4D6" stroke="#E07338" stroke-width="2" />
        <ellipse cx="50" cy="34" rx="28" ry="5" fill="#FFE4D6" stroke="#E07338" stroke-width="1.5" />
        <polygon points="50,18 52,22 48,22" fill="#E07338" />

        <!-- Observant Detective Eyes -->
        <ellipse cx="40" cy="46" rx="3.5" ry="4" fill="#293347" />
        <ellipse cx="60" cy="46" rx="3.5" ry="4" fill="#293347" />
        <circle cx="41.5" cy="44.5" r="1.2" fill="#FFFFFF" />
        <circle cx="61.5" cy="44.5" r="1.2" fill="#FFFFFF" />
        <circle cx="34" cy="54" r="3.5" fill="#FFE6D5" />
        <circle cx="66" cy="54" r="3.5" fill="#FFE6D5" />

        <!-- Pondering Detective Smirk -->
        <path d="M45 56 Q50 61 55 57" stroke="#293347" stroke-width="2" stroke-linecap="round" fill="none" />

        ${prop}
      </svg>
    `;
  },

  /**
   * Helper to initialize Lottie animation in an element
   */
  mountLottie(container, animationType = 'welcome-character') {
    if (!container || !window.lottie) return null;
    const animationPath = `assets/animations/${animationType}.json`;

    try {
      return window.lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: animationPath
      });
    } catch (e) {
      console.warn('Lottie mount error, falling back to SVG:', e);
      return null;
    }
  },

  /**
   * Helper to mount 3D WebGL scene
   */
  mount3D(container, objectType = 'aurora-compass', options = {}) {
    return Three3DScene.mount(container, objectType, options);
  }
};
