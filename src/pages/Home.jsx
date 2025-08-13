import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { nanoid } from 'nanoid'

export default function Home(){
  const nav = useNavigate()
  const [search] = useSearchParams()

  const start = (tpl) => {
    const id = nanoid(10)
    const qp = new URLSearchParams(search)
    if (tpl) qp.set('template', tpl)
    nav(`/canvas/${id}?${qp.toString()}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Stateless 2D Editor</h1>
        <p className="text-sm text-neutral-600">Create a fresh, shareable canvas. No login required.</p>
        <div className="flex gap-3">
          <button onClick={()=>start()} className="px-4 py-2 rounded-lg border bg-black text-white">New Blank</button>
          <button onClick={()=>start('posterA')} className="px-4 py-2 rounded-lg border">Poster A</button>
          <button onClick={()=>start('moodboard')} className="px-4 py-2 rounded-lg border">Moodboard</button>
        </div>
      </div>
    </div>
  )
}