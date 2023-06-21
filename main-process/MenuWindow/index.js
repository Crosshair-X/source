const { registerWin, getWin } = require("../WindowManager");

module.exports.MenuWindow = class MenuWindow {
  static getWindow() {
    const type = "menu";
    const target = getWin(type);

    if (!target) {
      // console.log("Creating new menu window");
      return false;
    } else {
      // console.log("Returning existing menu window");
      return target;
    }
  }

  static initializeWindow = (cb) => {
    const { DataStore } = require("../DataStore");
    const { incrementNumberOfAppLaunches } = require("../SteamReviewPopup").SteamReviewPopup;
    const windowStateKeeper = require("electron-window-state");
    const path = require("path");
    const { BrowserWindow, ipcMain, app, Menu, Tray, nativeImage } = require("electron");

    // Create the browser window.
    const iconPath = app.isPackaged ? path.join(__dirname, "../../../app.asar.unpacked/assets/logo_Jvr_icon.ico") : path.join(__dirname, "../Logo/logo_Jvr_icon.ico");
    console.log(iconPath);

    let menuWindowState = windowStateKeeper({
      defaultWidth: 1280,
      defaultHeight: 720,
    });

    const opts = {
      icon: iconPath,
      minWidth: 400,
      minHeight: 500,
      x: menuWindowState.x,
      y: menuWindowState.y,
      width: menuWindowState.width,
      height: menuWindowState.height,
      show: false,
      frame: false,
      backgroundColor: "#1c1c1c",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false

      },
    };

    const type = "menu";

    const target = registerWin(opts, type).win;

    // target.openDevTools();

    menuWindowState.manage(target);

    target.hide();

    // and load the index.html of the app.
    if (process.env.NODE_ENV === "test") {
      target.loadURL("http://localhost:3000");
    } else {
      target.loadFile("build/index.html");
    }

    target.webContents.once("did-finish-load", () => {
      console.log("Menu window finished loading!");
  
          require("../CrosshairControl/test").configure();

          const { CrosshairWindow } = require("../CrosshairWindow");
          const { SplashWindow } = require("../SplashWindow");

          incrementNumberOfAppLaunches(target);

          if (DataStore.getStore().get("minimizeOnLaunch") === false) {
            target.show();
          } else {
            target.minimize();
          }

          // try to destroy the splash window if it exists and hasnt been closed yet
          const splashWindow = SplashWindow.getWindow();
          if (splashWindow) {
            splashWindow.destroy();
          }
          

          // Test
          const image = nativeImage.createFromPath(iconPath)

          const appIcon = new Tray(image);

          const contextMenu = Menu.buildFromTemplate([
            {
              label: "Exit",
              click: () => {
                const { CrosshairWindow } = require("../CrosshairWindow");
                try {
                  MenuWindow.getWindow().destroy();
                } catch (e) {
                  console.log(e);
                }
              },
            },
          ]);

          appIcon.setToolTip("Crosshair X");
          appIcon.setContextMenu(contextMenu);
          appIcon.on("double-click", (event, bounds) => {
            try {
              target.show();
            } catch (e) {
              console.log(e);
            }
          });


          try {
            CrosshairWindow.getWindow().show();
            CrosshairWindow.getWindow().hide();
            CrosshairWindow.getWindow().show();
  
            CrosshairWindow.getWindow().setAlwaysOnTop(true, "screen-saver");
          } catch (e) {
            console.log(e);
          }


          cb();

          return target;
    });

    target.on("closed", function () {
      console.log("Menu window on closed!");

      // Destroy all BrowserWindows and quit the app
      app.quit();

    
    });

    target.on("maximize", () => {
      target.webContents.send("maximize");
    });

    target.on("unmaximize", () => {
      target.webContents.send("unmaximize");
    });

    ipcMain.on("minimize-app", (evt, arg) => {
      target.minimize();
    });

    ipcMain.on("unmaximize-app", (evt, arg) => {
      target.unmaximize();
    });

    ipcMain.on("maximize-app", (evt, arg) => {
      target.maximize();
    });

    ipcMain.on("close-app", (evt, arg) => {
      target.hide();
    });

    ipcMain.on("getMaximized", (event, arg) => {
      event.returnValue = target.isMaximized();
    });
  };
};
