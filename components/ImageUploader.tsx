import React from 'react';
import { VideocamIcon } from './IconComponents';

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isMonitoring: boolean;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ videoRef, isMonitoring }) => {
  return (
    <div className="relative flex justify-center items-center w-full h-64 lg:h-80 border-2 border-dashed border-gray-600 rounded-lg bg-black/20 overflow-hidden">
        <video
          ref={videoRef}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isMonitoring ? 'opacity-100' : 'opacity-0'}`}
          muted
          playsInline
        />
        {!isMonitoring && (
           <div className="absolute text-center text-gray-400">
            <VideocamIcon className="mx-auto h-12 w-12" />
            <p className="mt-2">Camera feed is offline</p>
            <p className="text-xs text-gray-500">Click "Start Monitoring" to begin</p>
          </div>
        )}
    </div>
  );
};