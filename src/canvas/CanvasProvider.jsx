import React, { createContext, useEffect, useMemo, useRef, useState } from 'react'
import * as fabricNamespace from 'fabric'
import debounce from 'lodash.debounce'
import { ensureSceneExists, listenToScene, saveScene } from '../lib/firestoreService'

const fabric = fabricNamespace
export const CanvasContext = createContext(null)

const GRID = 20

export function CanvasProvider({ sceneId, viewOnly, templateKey, children }) {
  const canvasRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [fillColor, setFillColor] = useState('#60a5fa')
  const [strokeWidth, setStrokeWidth] = useState(1)
  const [selectionType, setSelectionType] = useState('')
  const [snap, setSnap] = useState(true)

  // undo/redo stacks
  const undoStack = useRef([])
  const redoStack = useRef([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const localChange = useRef(false)
  const lastLoadedJSON = useRef('')

  useEffect(() => {
    const el = document.getElementById('editor-canvas')
    if (!el) return

     // Dispose old canvas if any (important to avoid double init)
  if (canvasRef.current) {
    canvasRef.current.dispose()
    canvasRef.current = null
  }

    const c = new fabric.Canvas(el, {
      backgroundColor: '#fff',
      selection: !viewOnly,
      preserveObjectStacking: true,
    })
    canvasRef.current = c   

    // Ensure freeDrawingBrush exists to avoid undefined error
if (!c.freeDrawingBrush) {
  c.freeDrawingBrush = new fabric.PencilBrush(c)
}


    c.isDrawingMode = false
    c.freeDrawingBrush.width = 3

    // Snap to grid while moving objects
    const onMove = (e) => {
      if (!snap) return
      const obj = e.target
      if (!obj) return
      obj.set({
        left: Math.round(obj.left / GRID) * GRID,
        top: Math.round(obj.top / GRID) * GRID,
      })
    }
    c.on('object:moving', onMove)

    // Update selection type for UI
    const updateSelection = () => {
      const active = c.getActiveObject()
      setSelectionType(active ? active.type : '')
    }
    c.on('selection:created', updateSelection)
    c.on('selection:updated', updateSelection)
    c.on('selection:cleared', () => setSelectionType(''))

    // Debounced save function
    const debouncedSave = debounce(async () => {
      if (!canvasRef.current || viewOnly) return
      localChange.current = true
      const json = canvasRef.current.toJSON([
        'selectable',
        'lockMovementX',
        'lockMovementY',
        'lockScalingX',
        'lockScalingY',
        'lockRotation',
        'id',
      ])
      lastLoadedJSON.current = JSON.stringify(json)
      try {
        await saveScene(sceneId, json)
      } catch (e) {
        console.error(e)
      }
      setTimeout(() => {
        localChange.current = false
      }, 80)
    }, 900)

    // Push to undo stack
    const pushHistory = () => {
      const snap = JSON.stringify(c.toJSON(['selectable']))
      if (undoStack.current.at(-1) !== snap) {
        undoStack.current.push(snap)
        redoStack.current.length = 0
        setCanUndo(undoStack.current.length > 0)
        setCanRedo(redoStack.current.length > 0)
      }
    }

    const onChange = () => {
      if (!viewOnly) {
        pushHistory()
        debouncedSave()
      }
    }

    c.on('object:added', onChange)
    c.on('object:modified', onChange)
    c.on('object:removed', onChange)

    let unsub = () => {}
    ;(async () => {
      await ensureSceneExists(sceneId)

      // Load template if fresh and templateKey is given
      if (templateKey) {
        try {
          const tpl = await import(`../templates/${templateKey}.json`)
          c.loadFromJSON(tpl.default, c.renderAll.bind(c))
          debouncedSave.flush?.()
        } catch (e) {
          console.warn('Template load failed', e)
        }
      }

      unsub = listenToScene(sceneId, (data) => {
        if (!data?.canvas) return
        const incoming = JSON.stringify(data.canvas)
        if (localChange.current) return
        if (incoming !== lastLoadedJSON.current) {
          c.loadFromJSON(data.canvas, c.renderAll.bind(c))
          lastLoadedJSON.current = incoming
        }
      })

      setIsReady(true)
      pushHistory()
    })()

    return () => {
      debouncedSave.cancel()
      try {
        unsub()
      } catch {}
      c.dispose()
    }
  }, [sceneId, viewOnly, templateKey, snap])

  // Actions

  const addRect = () => {
    if (viewOnly) return
    const c = canvasRef.current
    const rect = new fabric.Rect({
      left: 80,
      top: 60,
      width: 160,
      height: 100,
      fill: fillColor,
    })
    c.add(rect).setActiveObject(rect)
    c.requestRenderAll()
  }

  const addCircle = () => {
    if (viewOnly) return
    const c = canvasRef.current
    const circle = new fabric.Circle({
      left: 200,
      top: 120,
      radius: 60,
      fill: fillColor,
    })
    c.add(circle).setActiveObject(circle)
    c.requestRenderAll()
  }

  const addText = () => {
    if (viewOnly) return
    const c = canvasRef.current
    const text = new fabric.IText('Edit me', {
      left: 160,
      top: 40,
      fontSize: 22,
      fill: fillColor,
    })
    c.add(text).setActiveObject(text)
    c.requestRenderAll()
  }

  const togglePen = (enabled) => {
    if (viewOnly) return
    const c = canvasRef.current
    c.isDrawingMode = enabled
    if (c.freeDrawingBrush) c.freeDrawingBrush.width = Math.max(1, strokeWidth)
  }

  const del = () => {
    const c = canvasRef.current
    const activeObjects = c.getActiveObjects()
    activeObjects.forEach((o) => c.remove(o))
    c.discardActiveObject()
    c.requestRenderAll()
  }

  const updateFill = (color) => {
    setFillColor(color)
    const c = canvasRef.current
    const active = c.getActiveObject()
    if (active && active.set) {
      active.set('fill', color)
      c.requestRenderAll()
    }
  }

  const updateStrokeWidth = (w) => {
    setStrokeWidth(w)
    const c = canvasRef.current
    const active = c.getActiveObject()
    if (active && active.set) {
      active.set('strokeWidth', w)
      active.set('stroke', active.stroke || '#111')
      c.requestRenderAll()
    }
  }

  const lockSelected = () => {
    const c = canvasRef.current
    const active = c.getActiveObject()
    if (!active) return
    active.lockMovementX = active.lockMovementY = active.lockScalingX = active.lockScalingY = active.lockRotation = true
    active.selectable = false
    active.evented = false
    c.discardActiveObject()
    c.requestRenderAll()
  }

  const unlockSelected = () => {
    const c = canvasRef.current
    c.forEachObject((o) => {
      o.selectable = true
      o.evented = true
      o.lockMovementX = o.lockMovementY = o.lockScalingX = o.lockScalingY = o.lockRotation = false
    })
    c.requestRenderAll()
  }

  const exportPNG = () => {
    const c = canvasRef.current
    const data = c.toDataURL({ format: 'png', multiplier: 2 })
    const a = document.createElement('a')
    a.href = data
    a.download = 'canvas.png'
    a.click()
  }

  const exportSVG = () => {
    const c = canvasRef.current
    const data = c.toSVG()
    const blob = new Blob([data], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'canvas.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  const undo = () => {
    const c = canvasRef.current
    if (!undoStack.current.length) return
    redoStack.current.push(JSON.stringify(c.toJSON(['selectable'])))
    const prev = JSON.parse(undoStack.current.pop())
    c.loadFromJSON(prev, c.renderAll.bind(c))
    setCanUndo(undoStack.current.length > 0)
    setCanRedo(redoStack.current.length > 0)
  }

  const redo = () => {
    const c = canvasRef.current
    if (!redoStack.current.length) return
    undoStack.current.push(JSON.stringify(c.toJSON(['selectable'])))
    const next = JSON.parse(redoStack.current.pop())
    c.loadFromJSON(next, c.renderAll.bind(c))
    setCanUndo(undoStack.current.length > 0)
    setCanRedo(redoStack.current.length > 0)
  }

  const shareLink = async () => {
    const url = location.href
    try {
      await navigator.clipboard.writeText(url)
      alert('Link copied!')
    } catch {
      prompt('Copy this link', url)
    }
  }

  const value = useMemo(
    () => ({
      viewOnly,
      snap,
      setSnap,
      isReady,
      isDrawing,
      togglePen: (v) => {
        setIsDrawing(v)
        togglePen(v)
      },
      addRect,
      addCircle,
      addText,
      del,
      fillColor,
      setFillColor: updateFill,
      strokeWidth,
      setStrokeWidth: updateStrokeWidth,
      selectionType,
      lockSelected,
      unlockSelected,
      exportPNG,
      exportSVG,
      undo,
      redo,
      canUndo,
      canRedo,
      shareLink,
    }),
    [viewOnly, isReady, isDrawing, fillColor, strokeWidth, selectionType, canUndo, canRedo, snap]
  )

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
}
