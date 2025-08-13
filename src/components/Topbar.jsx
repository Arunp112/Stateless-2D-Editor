import React from 'react'
import classNames from 'classnames'
import { useCanvas } from '../canvas/useCanvas'

export default function Topbar({ sceneId, viewOnly }){
  const { exportPNG, exportSVG, shareLink, undo, redo, canUndo, canRedo, snap, setSnap } = useCanvas()

  return (
    <div className="w-full bg-black text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="font-semibold">Stateless Canvas</div>
        <span className="text-xs opacity-70">{sceneId}</span>
        <label className="ml-4 text-xs flex items-center gap-2">
          <input type="checkbox" className="accent-white" checked={snap} onChange={e=>setSnap(e.target.checked)} />
          Snap to grid
        </label>
        {viewOnly && <span className="ml-3 text-xs bg-white/10 rounded px-2 py-0.5">View Only</span>}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={undo} disabled={!canUndo} className={classNames('px-3 py-1.5 rounded border', {'opacity-50': !canUndo})}>Undo</button>
        <button onClick={redo} disabled={!canRedo} className={classNames('px-3 py-1.5 rounded border', {'opacity-50': !canRedo})}>Redo</button>
        <button onClick={exportPNG} className="px-3 py-1.5 rounded border">Export PNG</button>
        <button onClick={exportSVG} className="px-3 py-1.5 rounded border">Export SVG</button>
        <button onClick={shareLink} className="px-3 py-1.5 rounded bg-white text-black rounded-md">Share</button>
        <a href="/" className="px-3 py-1.5 rounded border">New</a>
      </div>
    </div>
  )
}