module.exports.OperatingSystemHandler = class OperatingSystemHandler {
  static isUserRunningWindows10() {
    const os = require("os");
    const osName = require("os-name");
    const [majorVersion, minorVersion] = os.release().split(".");

    return (
      majorVersion === "10" ||
      os.version().includes("Windows 10") ||
      osName().includes("Windows 10") ||
      os.version().includes("Windows 11") ||
      osName().includes("Windows 11")
    );
  }

  static displayIncorrectVersionWindow() {
    const { app, BrowserWindow, ipcMain } = require("electron");
  
    const path = require("path");
    function createWindow() {
      const iconPath = path.join(__dirname, "../Logo/logo_Jvr_icon.ico");
  
      const win = new BrowserWindow({
        icon: iconPath,
        width: 550,
        height: 550,
        resizable: false,
        frame: false,
        center: true,
        webPreferences: {
          nodeIntegration: true,
          preload: path.join(__dirname, "preload.js"),
        },
      });
  
      win.loadFile(path.join(__dirname, "not-windows-10.html"));
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
        process.exit()
      }
    });
  
    ipcMain.handle("quit-app", () => {
      process.exit(0);
    });
  };
}