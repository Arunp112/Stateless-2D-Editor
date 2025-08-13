import React from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { CanvasProvider } from '../canvas/CanvasProvider'
import Topbar from '../components/Topbar'
import Toolbar from '../components/Toolbar'

export default function CanvasPage(){
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const viewOnly = searchParams.get('viewOnly') === 'true'
  const template = searchParams.get('template') || undefined

  return (
    <CanvasProvider sceneId={id} viewOnly={viewOnly} templateKey={template}>
      <div className="min-h-screen grid grid-rows-[auto,1fr]">
        <Topbar sceneId={id} viewOnly={viewOnly} />
        <div className="grid grid-cols-[280px,1fr] gap-3 p-3">
          <div className="bg-white rounded-xl shadow p-3"><Toolbar /></div>
          <div className="bg-white rounded-xl shadow p-3">
            {/* Canvas host injected by provider */}
            <div id="canvas-host" className="w-full overflow-auto">
              <canvas id="editor-canvas" className="max-w-full border border-neutral-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </CanvasProvider>
  )
}