import React from 'react'

export default function ColorPicker({ value, onChange }){
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={e=>onChange(e.target.value)} className="h-8 w-10 p-0 border rounded" />
      <input type="text" value={value} onChange={e=>onChange(e.target.value)} className="px-2 py-1 border rounded w-28" />
    </div>
  )
} 