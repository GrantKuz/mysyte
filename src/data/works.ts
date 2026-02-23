import { Work } from '../types';


export const works: Work[] = [
  {
    id: '1',
    title: 'Vintage Radio',
    titleRu: 'Винтажный радиоприемник',
    project: 'Old World Tech',
    projectRu: 'Old World Tech',
    polygons: '12,400',
    description: 'A detailed vintage radio from the 1940s. Textured in Substance Painter with a focus on wear and tear.',
    descriptionRu: 'Детализированный винтажный радиоприемник из 1940-х. Текстурирован в Substance Painter с акцентом на износ и следы эксплуатации.',
    thumbnail: '/img/plazma gen1_unw.png',
    renderUrl: '/img/plazma gen1_unw.png',
    wireframeUrl: '/img/wire_plazma1.png',
    images: [
      {
        renderUrl: '/img/plazma gen1_unw.png',
        wireframeUrl: '/img/wire_plazma1.png'
      },
      {
        renderUrl: '/img/plazma gen2_unw.png',
        wireframeUrl: '/img/wire_plazma2.png'
      }
    ],
    modelUrl: '/models/Plazma_Generator.glb',
    type: 'prop'
  },
  {
    id: '2',
    title: 'Cyberpunk Katana',
    titleRu: 'Киберпанк-катана',
    project: 'Neon Nights',
    projectRu: 'Neon Nights',
    polygons: '8,200',
    description: 'High-frequency blade with emissive details. Optimized for real-time engines.',
    descriptionRu: 'Высокотехнологичный клинок с эмиссивными элементами. Оптимизирован для real-time движков.',
    thumbnail: '/img/clock_unw.png',
    renderUrl: '/img/clock_unw.png',
    wireframeUrl: '/img/wire_clock.png',
    modelUrl: '/models/Volobueva M.A.glb',
    type: 'prop'
  },
  {
    id: '3',
    title: 'Medieval Chest',
    titleRu: 'Средневековый сундук',
    project: 'Dungeon Loot',
    projectRu: 'Dungeon Loot',
    polygons: '4,500',
    description: 'Stylized chest with hand-painted textures. Features a functional lock mechanism.',
    descriptionRu: 'Стилизованный сундук с hand-painted текстурами. Оснащен рабочим механизмом замка.',
    thumbnail: '/img/thermo plazma_unw.png',
    renderUrl: '/img/thermo plazma_unw.png',
    wireframeUrl: '/img/wire_thermo_plazma.png',
    modelUrl: '/models/ThermoPlasmaGen.glb',
    type: 'prop'
  },
  {
    id: '4',
    title: 'The Alchemist Lab',
    titleRu: 'Лаборатория алхимика',
    project: 'Personal Cinematic',
    projectRu: 'Персональная синематика',
    polygons: 'N/A',
    description: 'A short cinematic sequence showcasing lighting and atmosphere in Unreal Engine 5.',
    descriptionRu: 'Короткая синематик-сцена с упором на освещение и атмосферу в Unreal Engine 5.',
    thumbnail: 'https://picsum.photos/seed/lab/600/600',
    renderUrl: '',
    wireframeUrl: '',
    videoUrl: '/videos/Rayl_cinematic.mp4',
    type: 'cinematic'
  },
  {
    id: '5',
    title: 'Sci-Fi Crate',
    titleRu: 'Sci-Fi контейнер',
    project: 'Mars Colony',
    projectRu: 'Колония Марса',
    polygons: '2,100',
    description: 'Standard issue cargo container for off-world colonies.',
    descriptionRu: 'Стандартный грузовой контейнер для внеземных колоний.',
    thumbnail: 'https://picsum.photos/seed/crate/600/600',
    renderUrl: 'https://picsum.photos/seed/crate/1200/1200',
    wireframeUrl: 'https://picsum.photos/seed/crate-wire/1200/1200?grayscale',
    type: 'prop'
  },
  {
    id: '6',
    title: 'Abandoned Robot',
    titleRu: 'Заброшенный робот',
    project: 'Forgotten Future',
    projectRu: 'Забытое будущее',
    polygons: '45,000',
    description: 'A complex character prop with multiple UDIMs and high-detail mechanical parts.',
    descriptionRu: 'Сложный персонажный проп с несколькими UDIM-тайлами и детализированными механическими узлами.',
    thumbnail: 'https://picsum.photos/seed/robot/600/600',
    renderUrl: 'https://picsum.photos/seed/robot/1200/1200',
    wireframeUrl: 'https://picsum.photos/seed/robot-wire/1200/1200?grayscale',
    type: 'prop'
  }
];
