import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { nanoid } from 'nanoid';

const templates = [
  { key: null, label: 'New Blank', description: 'Start with an empty canvas.', color: 'bg-black text-white' },
  { key: 'posterA', label: 'Poster A', description: 'A simple poster layout.', color: 'bg-white text-black' },
  { key: 'moodboard', label: 'Moodboard', description: 'Create an aesthetic moodboard.', color: 'bg-white text-black' }
];

export default function Home() {
  const navigate = useNavigate();
  const [search] = useSearchParams();

  const start = (tpl) => {
    const id = nanoid(10);
    const qp = new URLSearchParams(search);
    if (tpl) qp.set('template', tpl);
    navigate(`/canvas/${id}?${qp.toString()}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 space-y-8">
        <h1 className="text-3xl font-bold text-center">Stateless 2D Editor</h1>
        <p className="text-center text-gray-600">
          Create a fresh, shareable canvas instantly. No login required.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map(({ key, label, description, color }) => (
            <button
              key={label}
              onClick={() => start(key)}
              className={`p-4 rounded-xl border border-gray-300 hover:shadow-lg transition ${color}`}
            >
              <h2 className="font-semibold">{label}</h2>
              <p className="text-xs text-gray-500">{description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
