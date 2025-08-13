import React from 'react';
import { useCanvas } from '../canvas/useCanvas';
import ColorPicker from './ColorPicker';
import { Square, Circle, Type, PenTool, Lock, Unlock, Trash } from 'lucide-react';
import Button from './Button';

export default function Toolbar() {
  const {
    viewOnly,
    addShape,
    togglePen,
    isDrawing,
    del,
    fillColor,
    setFillColor,
    lockSelected,
    unlockSelected,
    setStrokeWidth,
    strokeWidth,
    selectionType
  } = useCanvas();

  return (
    <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md h-full flex flex-col">
      <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-200">Tools</h2>

      {/* Shape Tools */}
      <div className="grid grid-cols-2 gap-3">
        <Button icon={Square} label="Rectangle" onClick={() => addShape('rect')} disabled={viewOnly} />
        <Button icon={Circle} label="Circle" onClick={() => addShape('circle')} disabled={viewOnly} />
        <Button icon={Type} label="Text" onClick={() => addShape('text')} disabled={viewOnly} />
        <label
          className={`flex items-center justify-center gap-2 px-3 py-2 border rounded cursor-pointer select-none ${
            isDrawing ? 'bg-blue-500 text-white' : ''
          }`}
        >
          <input
            type="checkbox"
            checked={isDrawing}
            onChange={(e) => togglePen(e.target.checked)}
            disabled={viewOnly}
            className="hidden"
          />
          <PenTool size={16} /> Pen
        </label>
      </div>

      {/* Color Picker */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Fill Color</div>
        <ColorPicker value={fillColor} onChange={setFillColor} />
      </div>

      {/* Stroke Width */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Stroke Width</div>
        <input
          type="range"
          min={0}
          max={10}
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(+e.target.value)}
          className="w-full accent-blue-500"
        />
        <div className="text-xs text-gray-500">{strokeWidth}px</div>
      </div>

      {/* Selection */}
      <div className="space-y-3 mt-auto">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Selection</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">{selectionType || 'None'}</div>
        <div className="flex gap-2 flex-wrap">
          <Button icon={Lock} label="Lock" onClick={lockSelected} disabled={viewOnly} size="sm" />
          <Button icon={Unlock} label="Unlock" onClick={unlockSelected} disabled={viewOnly} size="sm" />
          <Button icon={Trash} label="Delete" onClick={del} disabled={viewOnly} size="sm" variant="danger" />
        </div>
      </div>
    </div>
  );
}
