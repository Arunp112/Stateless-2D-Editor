import React from 'react'
import { useCanvas } from '../canvas/useCanvas'
import ColorPicker from './ColorPicker'

export default function Toolbar(){
  const { viewOnly, addRect, addCircle, addText, togglePen, isDrawing, del, fillColor, setFillColor, lockSelected, unlockSelected, setStrokeWidth, strokeWidth, selectionType } = useCanvas()

  return (
    <div className="space-y-4">
      <div className="font-semibold">Tools</div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={addRect} disabled={viewOnly} className="px-3 py-2 border rounded">Rectangle</button>
        <button onClick={addCircle} disabled={viewOnly} className="px-3 py-2 border rounded">Circle</button>
        <button onClick={addText} disabled={viewOnly} className="px-3 py-2 border rounded">Text</button>
        <label className="px-3 py-2 border rounded flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={isDrawing} onChange={e=>togglePen(e.target.checked)} disabled={viewOnly} />
          Pen
        </label>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Fill</div>
        <ColorPicker value={fillColor} onChange={setFillColor} />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Stroke width</div>
        <input type="range" min={0} max={10} value={strokeWidth} onChange={e=>setStrokeWidth(+e.target.value)} className="w-full" />
        <div className="text-xs text-neutral-600">{strokeWidth}px</div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Selection</div>
        <div className="text-xs text-neutral-600">{selectionType || 'None'}</div>
        <div className="flex gap-2">
          <button onClick={lockSelected} className="px-3 py-1.5 border rounded" disabled={viewOnly}>Lock</button>
          <button onClick={unlockSelected} className="px-3 py-1.5 border rounded" disabled={viewOnly}>Unlock</button>
          <button onClick={del} className="px-3 py-1.5 border rounded text-red-600" disabled={viewOnly}>Delete</button>
        </div>
      </div>
    </div>
  )
}