import {ipcRenderer} from 'electron';

export async function removeAllListeners(ListenerType: string) {
  ipcRenderer.removeAllListeners(ListenerType);
}
export async function openNewPDF(pdf: string | null) {
  ipcRenderer.send('openNewPDF', pdf);
}

export async function newWindow(file: string) {
  ipcRenderer.send('newWindow', file);
}

export async function togglePrinting(value: boolean) {
  ipcRenderer.send('togglePrinting', value);
}
export async function resizeWindow(value: string | null) {
  ipcRenderer.send('resizeWindow', value);
}
