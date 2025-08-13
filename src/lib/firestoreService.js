import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

const scenes = (id)=> doc(db, 'scenes', id)

export async function ensureSceneExists(id){
  const ref = scenes(id)
  const snap = await getDoc(ref)
  if (!snap.exists()){
    await setDoc(ref, { canvas: {}, updatedAt: serverTimestamp() })
  }
  return ref
}

export function listenToScene(id, onUpdate){
  const ref = scenes(id)
  return onSnapshot(ref, (snap)=>{ if(snap.exists()) onUpdate(snap.data()) })
}

export async function saveScene(id, canvasJson){
  const ref = scenes(id)
  await setDoc(ref, { canvas: canvasJson, updatedAt: serverTimestamp() }, { merge:true })
}