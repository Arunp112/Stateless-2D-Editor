import { useContext } from 'react'
import { CanvasContext } from './CanvasProvider'
export const useCanvas = () => useContext(CanvasContext)