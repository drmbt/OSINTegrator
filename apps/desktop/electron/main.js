import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1460,
    height: 940,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: "#0d1017",
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? "http://127.0.0.1:5173";

  if (!app.isPackaged) {
    win.loadURL(devServerUrl);
    win.webContents.openDevTools({ mode: "detach" });
    return;
  }

  win.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
