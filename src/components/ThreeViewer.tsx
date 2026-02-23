import '@google/model-viewer/dist/model-viewer.min.js';
import { useRef } from 'react';
import { RotateCcw } from 'lucide-react';

export default function ThreeViewer({ modelUrl }: { modelUrl: string }) {
  const viewerRef = useRef<any>(null);

  const handleReset = () => {
    if (viewerRef.current) {
      viewerRef.current.cameraOrbit = 'auto auto auto';
      viewerRef.current.cameraTarget = 'auto auto auto';
      viewerRef.current.fieldOfView = 'auto';
      viewerRef.current.jumpCameraToGoal();
    }
  };

  return (
    <div className="w-full h-full overflow-hidden relative flex items-center justify-center group">
      <model-viewer
        ref={viewerRef}
        src={modelUrl}
        camera-controls
        auto-rotate
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1"
        style={{ width: '100%', height: '100%' }}
      ></model-viewer>
      
      <button 
        onClick={handleReset}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
        title="Reset View"
      >
        <RotateCcw size={18} />
      </button>

      <div className="absolute bottom-4 right-4 text-[10px] text-white/30 uppercase tracking-widest pointer-events-none">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
