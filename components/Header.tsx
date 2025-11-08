import React from 'react';
import { HeartIcon } from './IconComponents';

export const Header: React.FC = () => {
  return (
    <header className="bg-black/50 border-b border-cyan-500/20 shadow-lg backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center gap-4">
          <HeartIcon className="w-8 h-8 text-cyan-400" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-cyan-300">
            CareVision
          </h1>
        </div>
      </div>
    </header>
  );
};