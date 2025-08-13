import React, { createContext, useEffect, useMemo, useRef, useState } from "react";
import * as fabricNamespace from "fabric";
import debounce from "lodash.debounce";
import { ensureSceneExists, listenToScene, saveScene } from "../lib/firestoreService";

const fabric = fabricNamespace;
export const CanvasContext = createContext(null);

const GRID = 20;
const HISTORY_LIMIT = 20;

export function CanvasProvider({ sceneId, viewOnly = false, templateKey, children }) {
  const canvasRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [fillColor, setFillColor] = useState("#60a5fa");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [selectionType, setSelectionType] = useState("");
  const [snap, setSnap] = useState(true);

  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const localChange = useRef(false);
  const lastLoadedJSON = useRef("");

  useEffect(() => {
    const el = document.getElementById("editor-canvas");
    if (!el) return;

    if (canvasRef.current) {
      canvasRef.current.dispose();
    }

    const c = new fabric.Canvas(el, {
      backgroundColor: "#fff",
      selection: !viewOnly,
      preserveObjectStacking: true,
    });
    canvasRef.current = c;

    // Ensure drawing brush
    if (!c.freeDrawingBrush) c.freeDrawingBrush = new fabric.PencilBrush(c);
    c.freeDrawingBrush.width = strokeWidth;

    // Grid snap
    const onMove = (e) => {
      if (!snap) return;
      const obj = e.target;
      if (!obj) return;
      obj.set({
        left: Math.round(obj.left / GRID) * GRID,
        top: Math.round(obj.top / GRID) * GRID,
      });
    };
    c.on("object:moving", onMove);

    // Selection listener
    const updateSelection = () => {
      const active = c.getActiveObject();
      setSelectionType(active ? active.type : "");
    };
    c.on("selection:created", updateSelection);
    c.on("selection:updated", updateSelection);
    c.on("selection:cleared", () => setSelectionType(""));

    // Debounced save
    const debouncedSave = debounce(async () => {
      if (!canvasRef.current || viewOnly) return;
      localChange.current = true;
      const json = canvasRef.current.toJSON([
        "selectable",
        "lockMovementX",
        "lockMovementY",
        "lockScalingX",
        "lockScalingY",
        "lockRotation",
        "id",
      ]);
      lastLoadedJSON.current = JSON.stringify(json);
      try {
        await saveScene(sceneId, json);
      } catch (e) {
        console.error("Save failed:", e);
      }
      setTimeout(() => (localChange.current = false), 80);
    }, 800);

    // History handler
    const pushHistory = debounce(() => {
      const snapshot = JSON.stringify(c.toJSON(["selectable"]));
      if (undoStack.current.at(-1) !== snapshot) {
        undoStack.current.push(snapshot);
        if (undoStack.current.length > HISTORY_LIMIT) undoStack.current.shift();
        redoStack.current.length = 0;
        setCanUndo(undoStack.current.length > 0);
        setCanRedo(false);
      }
    }, 300);

    const onChange = () => {
      if (!viewOnly) {
        pushHistory();
        debouncedSave();
      }
    };

    c.on("object:added", onChange);
    c.on("object:modified", onChange);
    c.on("object:removed", onChange);

    let unsub = () => {};
    (async () => {
      await ensureSceneExists(sceneId);

      if (templateKey) {
        try {
          const tpl = await import(`../templates/${templateKey}.json`);
          c.loadFromJSON(tpl.default, c.renderAll.bind(c));
          debouncedSave.flush?.();
        } catch (e) {
          console.warn("Template load failed:", e);
        }
      }

      unsub = listenToScene(sceneId, (data) => {
        if (!data?.canvas) return;
        const incoming = JSON.stringify(data.canvas);
        if (localChange.current) return;
        if (incoming !== lastLoadedJSON.current) {
          c.loadFromJSON(data.canvas, c.renderAll.bind(c));
          lastLoadedJSON.current = incoming;
        }
      });

      setIsReady(true);
      pushHistory();
    })();

    return () => {
      debouncedSave.cancel();
      pushHistory.cancel();
      try {
        unsub();
      } catch {}
      c.dispose();
    };
  }, [sceneId, viewOnly, templateKey, snap, strokeWidth]);

  // Actions
  const addShape = (type) => {
    if (viewOnly) return;
    const c = canvasRef.current;
    let shape;
    switch (type) {
      case "rect":
        shape = new fabric.Rect({ left: 80, top: 60, width: 160, height: 100, fill: fillColor });
        break;
      case "circle":
        shape = new fabric.Circle({ left: 200, top: 120, radius: 60, fill: fillColor });
        break;
      case "text":
        shape = new fabric.IText("Edit me", { left: 160, top: 40, fontSize: 22, fill: fillColor });
        break;
      default:
        return;
    }
    c.add(shape).setActiveObject(shape);
    c.requestRenderAll();
  };

  const togglePen = (enabled) => {
    if (viewOnly) return;
    const c = canvasRef.current;
    c.isDrawingMode = enabled;
    if (c.freeDrawingBrush) c.freeDrawingBrush.width = strokeWidth;
  };

  const deleteObjects = () => {
    const c = canvasRef.current;
    c.getActiveObjects().forEach((o) => c.remove(o));
    c.discardActiveObject();
    c.requestRenderAll();
  };

  const updateFill = (color) => {
    setFillColor(color);
    const c = canvasRef.current;
    const active = c.getActiveObject();
    if (active) {
      active.set("fill", color);
      c.requestRenderAll();
    }
  };

  const updateStroke = (width) => {
    setStrokeWidth(width);
    const c = canvasRef.current;
    const active = c.getActiveObject();
    if (active) {
      active.set("strokeWidth", width);
      if (!active.stroke) active.set("stroke", "#111");
      c.requestRenderAll();
    }
  };

  const lockSelected = () => {
    const active = canvasRef.current.getActiveObject();
    if (!active) return;
    ["lockMovementX", "lockMovementY", "lockScalingX", "lockScalingY", "lockRotation"].forEach(
      (prop) => (active[prop] = true)
    );
    active.selectable = false;
    active.evented = false;
    canvasRef.current.discardActiveObject().requestRenderAll();
  };

  const unlockAll = () => {
    const c = canvasRef.current;
    c.forEachObject((o) => {
      ["lockMovementX", "lockMovementY", "lockScalingX", "lockScalingY", "lockRotation"].forEach(
        (prop) => (o[prop] = false)
      );
      o.selectable = true;
      o.evented = true;
    });
    c.requestRenderAll();
  };

  const exportPNG = () => {
    const data = canvasRef.current.toDataURL({ format: "png", multiplier: 2 });
    const a = document.createElement("a");
    a.href = data;
    a.download = "canvas.png";
    a.click();
  };

  const exportSVG = () => {
    const data = canvasRef.current.toSVG();
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "canvas.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const undo = () => {
    if (!undoStack.current.length) return;
    redoStack.current.push(JSON.stringify(canvasRef.current.toJSON(["selectable"])));
    const prev = JSON.parse(undoStack.current.pop());
    canvasRef.current.loadFromJSON(prev, canvasRef.current.renderAll.bind(canvasRef.current));
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(redoStack.current.length > 0);
  };

  const redo = () => {
    if (!redoStack.current.length) return;
    undoStack.current.push(JSON.stringify(canvasRef.current.toJSON(["selectable"])));
    const next = JSON.parse(redoStack.current.pop());
    canvasRef.current.loadFromJSON(next, canvasRef.current.renderAll.bind(canvasRef.current));
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(redoStack.current.length > 0);
  };

  const shareLink = async () => {
    const url = location.href;
    try {
      await navigator.clipboard.writeText(url);
      console.log("Link copied!");
    } catch {
      console.log("Copy this link manually:", url);
    }
  };

  const value = useMemo(
    () => ({
      viewOnly,
      snap,
      setSnap,
      isReady,
      isDrawing,
      togglePen: (v) => {
        setIsDrawing(v);
        togglePen(v);
      },
      addShape,
      deleteObjects,
      fillColor,
      setFillColor: updateFill,
      strokeWidth,
      setStrokeWidth: updateStroke,
      selectionType,
      lockSelected,
      unlockAll,
      exportPNG,
      exportSVG,
      undo,
      redo,
      canUndo,
      canRedo,
      shareLink,
    }),
    [viewOnly, isReady, isDrawing, fillColor, strokeWidth, selectionType, canUndo, canRedo, snap]
  );

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
}
