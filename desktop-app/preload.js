/* ─── MindFirst Desktop · Preload (context bridge) ───────────── */
'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mf', {
  getData  : ()      => ipcRenderer.invoke('get-data'),
  setLimit : (mins)  => ipcRenderer.invoke('set-limit', mins),
  close    : ()      => ipcRenderer.invoke('close-dashboard'),
});
