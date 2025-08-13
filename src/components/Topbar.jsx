import React from 'react';
import { useCanvas } from '../canvas/useCanvas';
import { Undo2, Redo2, Image, Share2, Plus } from 'lucide-react';
import Button from './Button';

export default function Topbar({ sceneId, viewOnly }) {
  const { exportPNG, exportSVG, shareLink, undo, redo, canUndo, canRedo, snap, setSnap } = useCanvas();

  return (
    <div className="w-full bg-gray-900 text-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between shadow-md gap-3">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="text-lg font-bold">Stateless Canvas</div>
        <span className="text-xs opacity-70">{sceneId}</span>
        <label className="ml-4 text-xs flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-white"
            checked={snap}
            onChange={(e) => setSnap(e.target.checked)}
          />
          Snap to grid
        </label>
        {viewOnly && (
          <span className="ml-3 text-xs bg-white/10 rounded px-2 py-0.5">View Only</span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Button icon={Undo2} onClick={undo} disabled={!canUndo} />
        <Button icon={Redo2} onClick={redo} disabled={!canRedo} />
        <Button icon={Image} label="PNG" onClick={exportPNG} />
        <Button icon={Image} label="SVG" onClick={exportSVG} />
        <Button icon={Share2} label="Share" onClick={shareLink} variant="primary" />
        <a href="/" className="flex items-center gap-1 px-3 py-2 rounded border hover:bg-gray-800">
          <Plus size={16} /> New
        </a>
      </div>
    </div>
  );
}
