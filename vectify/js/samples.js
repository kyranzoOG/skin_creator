/**
 * Vectify - Built-in Sample Image Generators
 * Generates crisp, retro pixel-art images on-the-fly for instant testing
 */

const SampleImages = {
  // 1. Arcade Retro Hero (16x16 scaled to 32x32)
  getArcadeHero() {
    const size = 32;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Background transparent
    ctx.clearRect(0, 0, size, size);

    // 16x16 pixel art definition scaled 2x
    const pixels = [
      "....RRRRRR......",
      "...RRRRRRRRR....",
      "...BBBPPPB......",
      "..BPBPPPPPB.....",
      "..BPBPPPPPB.....",
      "..BPPPPPBBB.....",
      "....PPPPPPP.....",
      "...RRRRRR.......",
      "..RRRBYBRRR.....",
      ".RRRRBYBRRRR....",
      ".RRRRBBBRRRR....",
      ".RR.BBBBBB.RR...",
      "....BBBBBB......",
      "...BBB..BBB.....",
      "..KKK....KKK....",
      ".KKKK....KKKK..."
    ];

    const colorMap = {
      'R': '#ef4444', // Red shirt / hat
      'B': '#3b82f6', // Blue overalls / cap visor
      'P': '#fcd34d', // Skin tone
      'Y': '#fbbf24', // Yellow buttons
      'K': '#78350f', // Brown shoes
      '.': null       // Transparent
    };

    for (let y = 0; y < pixels.length; y++) {
      for (let x = 0; x < pixels[y].length; x++) {
        const char = pixels[y][x];
        const color = colorMap[char];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * 2, y * 2, 2, 2);
        }
      }
    }

    return {
      name: 'arcade_hero.png',
      dataUrl: canvas.toDataURL('image/png'),
      width: size,
      height: size,
      title: 'Arcade Hero (32x32)'
    };
  },

  // 2. 8-Bit Cyber Heart (32x32)
  getCyberHeart() {
    const size = 32;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const pattern = [
      "................................",
      "................................",
      "......OOOOOO........OOOOOO......",
      "....OOEEEEEEEO....OOEEEEEEEO....",
      "...OEEEEEEEEEEEO.OEEEEEEEEEEEO..",
      "..OEEWWEEEEEEEEEOEEEEEEWWEEEEEO.",
      "..OEWWWWEEEEEEEEECEEEWWWWEEEEEO.",
      ".OEEWWEEEEEEEEEEECCEEEEWWEEEEEEO",
      ".OEEEEEEEEEEEECCCCCEEEEEEEEEEEEO",
      ".OEEEEEEEEEECCCCCCCEEEEEEEEEEEO.",
      ".OEEEEEEEEECCCCCCCCCLEEEEEEEEEO.",
      ".OEEEEEEEECCCCCCCCCCCLEEEEEEEEO.",
      "..OEEEEEECCCCCCCCCCCCCLEEEEEEEO.",
      "..OEEEEECCCCCCCCCCCCCCLEEEEEEO..",
      "...OEEEECCCCCCCCCCCCCCLEEEEEO...",
      "....OEEECCCCCCCCCCCCCCLEEEEO....",
      ".....OEECCCCCCCCCCCCCCLEEEO.....",
      "......OEECCCCCCCCCCCCLEEEO......",
      ".......OEECCCCCCCCCCLEEEO.......",
      "........OEECCCCCCCCLEEEO........",
      ".........OEECCCCCCLEEEO.........",
      "..........OEECCCCLEEEO..........",
      "...........OEECCLEEEO...........",
      "............OEECLEEO............",
      ".............OELEEO.............",
      "..............OEEO..............",
      "...............OO...............",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ];

    const colorMap = {
      'O': '#4c0519', // Dark border
      'E': '#f43f5e', // Rose neon
      'W': '#ffffff', // Specular highlight
      'C': '#ec4899', // Pink inner glow
      'L': '#9d174d', // Deep shadow
      '.': null
    };

    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const char = pattern[y] ? pattern[y][x] : '.';
        const color = colorMap[char];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    return {
      name: 'cyber_heart.png',
      dataUrl: canvas.toDataURL('image/png'),
      width: size,
      height: size,
      title: 'Cyber Heart (32x32)'
    };
  },

  // 3. Pixel Magic Potion (48x48)
  getMagicPotion() {
    const size = 48;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Draw a stylized potion bottle with bubbling liquid
    // Cork
    ctx.fillStyle = '#b45309';
    ctx.fillRect(20, 4, 8, 6);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(20, 8, 8, 2);

    // Glass neck
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(19, 10, 10, 8);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(20, 10, 3, 8);

    // Glass body (rounded flask)
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(14, 18, 20, 4);
    ctx.fillRect(10, 22, 28, 4);
    ctx.fillRect(8, 26, 32, 14);
    ctx.fillRect(10, 40, 28, 4);
    ctx.fillRect(14, 44, 20, 2);

    // Liquid inside (Emerald Green Mana)
    ctx.fillStyle = '#059669';
    ctx.fillRect(10, 28, 28, 12);
    ctx.fillRect(12, 40, 24, 2);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(11, 28, 26, 8);
    ctx.fillStyle = '#34d399';
    ctx.fillRect(12, 30, 10, 5);
    ctx.fillStyle = '#6ee7b7';
    ctx.fillRect(14, 32, 3, 2);

    // Bubbles
    ctx.fillStyle = '#a7f3d0';
    ctx.fillRect(25, 34, 2, 2);
    ctx.fillRect(28, 30, 3, 3);
    ctx.fillRect(18, 24, 2, 2);

    // Glass shine highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 26, 2, 10);
    ctx.fillRect(13, 24, 2, 2);
    ctx.fillRect(10, 37, 2, 2);

    return {
      name: 'magic_potion.png',
      dataUrl: canvas.toDataURL('image/png'),
      width: size,
      height: size,
      title: 'Magic Potion (48x48)'
    };
  },

  // 4. Colorful Retro Logo (64x64)
  getRetroLogo() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Isometric pixel cube with vibrant 3D shading
    const colors = {
      top: '#06b6d4',      // Cyan
      topLight: '#67e8f9',
      left: '#6366f1',     // Indigo
      leftDark: '#4338ca',
      right: '#a855f7',    // Purple
      rightDark: '#7e22ce',
      accent: '#f59e0b',   // Gold
      white: '#ffffff'
    };

    // Draw isometric grid art
    // Top face
    for (let r = 0; r < 14; r++) {
      const w = r * 2;
      const x = 32 - r;
      const y = 8 + r;
      ctx.fillStyle = (r % 3 === 0) ? colors.topLight : colors.top;
      ctx.fillRect(x, y, w, 1);
    }
    for (let r = 0; r < 14; r++) {
      const w = (13 - r) * 2;
      const x = 19 + r;
      const y = 22 + r;
      ctx.fillStyle = (r % 2 === 0) ? colors.topLight : colors.top;
      ctx.fillRect(x, y, w, 1);
    }

    // Left face
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 13; x++) {
        const px = 19 + x;
        const py = 22 + x + y;
        ctx.fillStyle = ((x + y) % 4 === 0) ? colors.leftDark : colors.left;
        ctx.fillRect(px, py, 1, 1);
      }
    }

    // Right face
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 13; x++) {
        const px = 32 + x;
        const py = 35 - x + y;
        ctx.fillStyle = ((x + y) % 3 === 0) ? colors.rightDark : colors.right;
        ctx.fillRect(px, py, 1, 1);
      }
    }

    // Glowing core pixel star
    ctx.fillStyle = colors.accent;
    ctx.fillRect(30, 24, 4, 4);
    ctx.fillStyle = colors.white;
    ctx.fillRect(31, 25, 2, 2);

    return {
      name: 'vectify_logo.png',
      dataUrl: canvas.toDataURL('image/png'),
      width: size,
      height: size,
      title: 'Vectify Cube (64x64)'
    };
  }
};
