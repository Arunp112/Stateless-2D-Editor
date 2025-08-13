import React from 'react';

export default function ColorPicker({ value, onChange }) {
  const handleChange = (val) => {
    if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
      onChange(val);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer border rounded-md shadow-sm hover:scale-105 transition"
        />
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="px-3 py-2 border rounded-md w-28 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
        placeholder="#60a5fa"
      />
    </div>
  );
}
