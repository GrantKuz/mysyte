import React from 'react';

export interface WorkImage {
  renderUrl: string;
  wireframeUrl?: string;
}

export interface Work {
  id: string;
  title: string;
  titleRu?: string;
  project: string;
  projectRu?: string;
  polygons: string;
  description: string;
  descriptionRu?: string;
  thumbnail: string;
  renderUrl: string;
  wireframeUrl: string;
  images?: WorkImage[];
  modelUrl?: string; // URL to .glb file
  type: 'prop' | 'cinematic';
  videoUrl?: string;
}

export type GalleryTab = 'props' | 'cinematics';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        'camera-controls'?: string | boolean;
        'auto-rotate'?: string | boolean;
        'shadow-intensity'?: string;
        'environment-image'?: string;
        exposure?: string;
        style?: React.CSSProperties;
      };
    }
  }
}
