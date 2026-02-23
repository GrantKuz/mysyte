import { Work } from '../types';
const base = import.meta.env.BASE_URL;


export const works: Work[] = [
  {
    id: '1',
    title: 'Vintage Radio',
    project: 'Old World Tech',
    polygons: '12,400',
    description: 'A detailed vintage radio from the 1940s. Textured in Substance Painter with a focus on wear and tear.',
    thumbnail: base + '/img/plazma gen1_unw.png',
    renderUrl: base + '/img/plazma gen1_unw.png',
    wireframeUrl: base + '/img/wire_plazma1.png',
    images: [
      {
        renderUrl: base + '/img/plazma gen1_unw.png',
        wireframeUrl: base + '/img/wire_plazma1.png'
      },
      {
        renderUrl: base + '/img/plazma gen2_unw.png',
        wireframeUrl: base + '/img/wire_plazma2.png'
      }
    ],
    modelUrl: base + '/models/Plazma_Generator.glb',
    type: 'prop'
  },
  {
    id: '2',
    title: 'Cyberpunk Katana',
    project: 'Neon Nights',
    polygons: '8,200',
    description: 'High-frequency blade with emissive details. Optimized for real-time engines.',
    thumbnail: base + '/img/clock_unw.png',
    renderUrl: base + '/img/clock_unw.png',
    wireframeUrl: base + '/img/wire_clock.png',
    modelUrl: base + '/models/Volobueva M.A.glb',
    type: 'prop'
  },
  {
    id: '3',
    title: 'Medieval Chest',
    project: 'Dungeon Loot',
    polygons: '4,500',
    description: 'Stylized chest with hand-painted textures. Features a functional lock mechanism.',
    thumbnail: base + '/img/thermo plazma_unw.png',
    renderUrl: base + '/img/thermo plazma_unw.png',
    wireframeUrl: base + '/img/wire_thermo_plazma.png',
    modelUrl: base + '/models/ThermoPlasmaGen.glb',
    type: 'prop'
  },
  {
    id: '4',
    title: 'The Alchemist Lab',
    project: 'Personal Cinematic',
    polygons: 'N/A',
    description: 'A short cinematic sequence showcasing lighting and atmosphere in Unreal Engine 5.',
    thumbnail: 'https://picsum.photos/seed/lab/600/600',
    renderUrl: '',
    wireframeUrl: '',
    videoUrl: base + '/videos/Rayl_cinematic.mp4',
    type: 'cinematic'
  },
  {
    id: '5',
    title: 'Sci-Fi Crate',
    project: 'Mars Colony',
    polygons: '2,100',
    description: 'Standard issue cargo container for off-world colonies.',
    thumbnail: 'https://picsum.photos/seed/crate/600/600',
    renderUrl: 'https://picsum.photos/seed/crate/1200/1200',
    wireframeUrl: 'https://picsum.photos/seed/crate-wire/1200/1200?grayscale',
    type: 'prop'
  },
  {
    id: '6',
    title: 'Abandoned Robot',
    project: 'Forgotten Future',
    polygons: '45,000',
    description: 'A complex character prop with multiple UDIMs and high-detail mechanical parts.',
    thumbnail: 'https://picsum.photos/seed/robot/600/600',
    renderUrl: 'https://picsum.photos/seed/robot/1200/1200',
    wireframeUrl: 'https://picsum.photos/seed/robot-wire/1200/1200?grayscale',
    type: 'prop'
  }
];
