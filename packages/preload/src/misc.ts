import {ipcRenderer} from 'electron';

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getPath(filePath: any) {
  return await ipcRenderer.invoke('getPath', filePath);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function on(eventName: string, callback: any) {
  ipcRenderer.on(eventName, callback);
}
