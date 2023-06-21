const { registerWin, getWin } = require("../WindowManager");

module.exports.CrosshairWindow = class CrosshairWindow {
  static crosshairWindow;

  static getWindow() {
    const type = "crosshair";
    const target = getWin(type);
    if (!target) {
      // console.log("Creating new crosshair window");
      return false;
    } else {
      // console.log("Returning existing crosshair window");
      return target;
    }
  }

  static inititializeWindow = (cb) => {
    const { screen } = require("electron");
    const path = require("path");
    const width = screen.getPrimaryDisplay().size.width,
      height = screen.getPrimaryDisplay().size.height;

    const opts = {
      skipTaskbar: true,
      width: Math.ceil(width),
      height: Math.ceil(height),
      x: Math.ceil(width / 2),
      y: Math.ceil(height / 2),
      transparent: true,
      alwaysOnTop: true,
      frame: false,
      show: false,
      minimizable: false,
      focusable: false,
      fullscreen: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        transparent: true,
      },
    };

    console.log("Initializing crosshair window");
    const type = "crosshair";

    const target = registerWin(opts, type).win;
    target.setIgnoreMouseEvents(true);

    target.setAlwaysOnTop(true, "screen-saver");

    // and load the index.html of the app.
    target.loadFile(path.join(__dirname, "crosshair.html"));
    // target.webContents.openDevTools();

    screen.addListener(
      "display-metrics-changed",
      (event, display, changedMetrics) => {
        try {
          console.log("Display metrics changed");
          target.center();
          console.log("Centered crosshair window");
          const width = screen.getPrimaryDisplay().size.width,
            height = screen.getPrimaryDisplay().size.height;

          target.setBounds({
            width: Math.ceil(width),
            height: Math.ceil(height),
            x: Math.ceil(width / 2),
            y: Math.ceil(height / 2),
          });
          target.center();

          target.setAlwaysOnTop(true, "screen-saver");
        } catch (e) {
          const Sentry = require("@sentry/electron");
          Sentry.captureMessage("Something went wrong display metrics changed");
        }
      }
    );

    screen.addListener("display-added", (event, newDisplay) => {
      try {
        console.log("Display added");
        target.center();
        console.log("Centered crosshair window");

        const width = screen.getPrimaryDisplay().size.width,
          height = screen.getPrimaryDisplay().size.height;

        target.setBounds({
          width: Math.ceil(width),
          height: Math.ceil(height),
          x: Math.ceil(width / 2),
          y: Math.ceil(height / 2),
        });
        target.center();

        target.setAlwaysOnTop(true, "screen-saver");
      } catch (e) {
        const Sentry = require("@sentry/electron");
        Sentry.captureMessage("Something went wrong display added");
      }
    });

    screen.addListener("display-removed", (event, oldDisplay) => {
      try {
        console.log("Display removed");
        target.center();
        console.log("Centered crosshair window");

        const width = screen.getPrimaryDisplay().size.width,
          height = screen.getPrimaryDisplay().size.height;

        target.setBounds({
          width: Math.ceil(width),
          height: Math.ceil(height),
          x: Math.ceil(width / 2),
          y: Math.ceil(height / 2),
        });
        target.center();
        target.setAlwaysOnTop(true, "screen-saver");
      } catch (e) {
        const Sentry = require("@sentry/electron");
        Sentry.captureMessage("Something went wrong display removed");
      }
    });

    target.webContents.on(
      "console-message",
      (event, level, message, line, sourceId) => {
        console.log(message + " " + sourceId + " (" + line + ")");
      }
    );

    target.webContents.once("did-finish-load", () => {
      console.log("Crosshair Window Finished loading!");
      if (cb) cb();
    });


  };
};
