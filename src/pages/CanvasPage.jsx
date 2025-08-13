import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CanvasProvider } from '../canvas/CanvasProvider';
import Topbar from '../components/Topbar';
import Toolbar from '../components/Toolbar';
import { Menu } from 'lucide-react';

export default function CanvasPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const viewOnly = searchParams.get('viewOnly') === 'true';
  const template = searchParams.get('template') || undefined;

  return (
    <CanvasProvider sceneId={id} viewOnly={viewOnly} templateKey={template}>
      <div className="min-h-screen flex flex-col">
        {/* Topbar */}
        <Topbar sceneId={id} viewOnly={viewOnly} />

        {/* Main Content */}
        <div className="flex flex-1 p-3 gap-3 bg-gray-100">
          {/* Sidebar */}
          <div className="w-72 bg-white rounded-xl shadow p-3">
            <Toolbar />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-white rounded-xl shadow p-3 flex">
            <div id="canvas-host" className="w-full h-full">
              <canvas
                id="editor-canvas"
                className="w-full h-full border border-neutral-200 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </CanvasProvider>
  );
}

