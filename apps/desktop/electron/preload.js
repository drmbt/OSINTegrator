import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("osintegrator", {
  platform: process.platform
});
