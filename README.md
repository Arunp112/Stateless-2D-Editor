# 🖼️ Stateless 2D Editor

A lightweight, web-based canvas editor inspired by “mini Canva” — built to be stateless, collaborative, and easily shareable without requiring login.

> 🔗 [Live Demo](https://stateless-2-d-editor.vercel.app/)  
> 📂 [GitHub Repository](https://github.com/Arunp112/Stateless-2D-Editor)

---

## ✨ Features

### 🖌️ Canvas Editor (powered by Fabric.js)
- Add shapes: **Rectangles**, **Circles**, **Text**, and a **Freehand Pen Tool**
- Edit: Move, resize, rotate, delete
- Customize: Change color and text content
- Auto-resize and smooth manipulation

### 🗂️ Scene Management (Stateless URL System)
- Visiting `/` generates a new canvas with a unique scene ID
- Each canvas is saved under `/canvas/:id` in **Firebase Firestore**
- Auto-save enabled (debounced to optimize writes)
- Real-time updates across sessions

### 🔗 Shareable Canvas
- "Share Canvas" button copies the URL to clipboard
- Anyone with the link can view and edit the canvas
- No login/authentication required

---

## 🌟 Bonus Features

| Feature         | Status | Notes |
|----------------|--------|-------|
| Undo/Redo       | ✅     | Basic undo/redo supported |
| Export (PNG/SVG)| ✅     | Canvas can be exported as PNG |
| View-only Mode  | ✅     | `?viewOnly=true` disables editing |


---

## 🛠️ Tech Stack

- **React** – UI and component logic
- **Fabric.js** – Canvas manipulation and drawing
- **Firebase Firestore** – Stateless scene storage and real-time syncing
- **Vercel** – Deployed live demo

---

## 🧠 Trade-offs & Design Decisions

- **Debounced Auto-save**: To reduce Firestore writes, canvas updates are debounced. This improves performance but may risk very recent changes not being saved in case of sudden exit.
- **No Authentication**: To maintain simplicity and comply with the “stateless” brief, user auth was skipped. This enables easier collaboration but lacks version control.
- **Live Collaboration**: True live multi-user editing is not implemented (would require WebSockets or Firestore listeners).
- **Feature Focus**: Prioritized core canvas functionality and clean UX over bonus features like templates or object locking due to time constraints.

---

## 🚀 Getting Started Locally

```bash
git clone https://github.com/Arunp112/Stateless-2D-Editor.git
cd Stateless-2D-Editor
npm install
npm start
