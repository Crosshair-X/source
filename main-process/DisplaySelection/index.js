module.exports.DisplaySelection = class DisplaySelection {
  static configure() {
    const { app, ipcMain, screen } = require("electron");
    // const fs = require('fs');
    const { DataStore } = require("../DataStore");
    // const { debounce, delay } = require('./utils.js');

    (async () => {
      // every 5 seconds, print the size of the current window
      setInterval(() => {
        try {
          const win = require("../CrosshairWindow").CrosshairWindow.getWindow();
          if (win) {
            // if the windows not full screen, then set it to full screen
            if (!win.isFullScreen()) {
              win.setFullScreen(true);
            }

            // if the window is not on top, then set it to on top
            if (!win.isAlwaysOnTop()) {
              win.setAlwaysOnTop(true, "screen-saver");
            }
          }
        } catch (error) {
          console.log(error);
        }
      }, 3000);

      //  Set store
      await DataStore.getStore().set("lastrun", Date.now());

      //  Wait app to ready
      await app.whenReady();

      //  Create windows
      let mainWin = require("../MenuWindow").MenuWindow.getWindow();
      let secondWin = require("../CrosshairWindow").CrosshairWindow.getWindow();

      // mainWin.webContents.openDevTools();

      //  Get display list
      await this.getAllDisplay();

      //  Center to last
      let target = this.displayList[0];
      let lastTarget = await DataStore.getStore().get("last_target");
      console.log("get last_target: ", lastTarget);
      if (lastTarget && this.displayListMap[lastTarget]) {
        target = this.displayListMap[lastTarget];
      }

      await this.centerWindow(secondWin, target); // first monitor for now

      //  Show second window
      try {
        secondWin.show();
      } catch (error) {
        console.log(error);
      }

      //  ipc handler
      ipcMain.on("get-display", async (e) => {
        await this.getAllDisplay();
        e.sender.send("display-update", await this.getDisplayPreview());
      });

      ipcMain.on("move-to", async (e, displayId) => {
        //  Get target screen
        let targetDisplay = this.displayListMap[displayId];
        if (!targetDisplay) {
          console.log("Display selected not found");
          return;
        }

        this.centerWindow(secondWin, targetDisplay);
        await DataStore.getStore().set("last_target", targetDisplay.id);
        console.log(
          "get last_target: ",
          await DataStore.getStore().get("last_target")
        );
      });

      //  monitor state change
      screen.on("display-added", async () => {
        try {
          console.log("display add");

          await this.getAllDisplay();

          let lastTarget = await DataStore.getStore().get("last_target");
          console.log("get last_target: ", lastTarget);
          if (lastTarget && this.displayListMap[lastTarget]) {
            await this.centerWindow(secondWin, this.displayListMap[lastTarget]);
          }

          //  Send black screen
          mainWin.webContents.send(
            "display-update",
            await this.getDisplayWithoutPreview()
          );

          //  Wait monitor ready to capture
          // await delay(5);

          // //  update
          mainWin.webContents.send(
            "display-update",
            await this.getDisplayPreview()
          );
        } catch (error) {
          console.log(error);
        }
      });
      screen.on("display-removed", async () => {
        try {
          console.log("display remove");

          //  Wait monitor ready
          await this.getAllDisplay();
          mainWin.webContents.send(
            "display-update",
            await this.getDisplayWithoutPreview()
          );
        } catch (error) {
          console.log(error);
        }

        //  update
        // await delay(15);
        // mainWin.webContents.send('display-update', await getDisplayPreview());
      });
      screen.on("display-metrics-changed", async () => {
        try {
          console.log("display change");
          //  Reload monitor list
          await this.getAllDisplay();
          mainWin.webContents.send(
            "display-update",
            await this.getDisplayWithoutPreview()
          );

          let lastTarget = await DataStore.getStore().get("last_target");
          console.log("get last_target: ", lastTarget);
          if (lastTarget && this.displayListMap[lastTarget]) {
            await this.centerWindow(secondWin, this.displayListMap[lastTarget]);
          }

          //  Update preview
          // mainWin.webContents.send('display-update', await getDisplayPreview());
        } catch (error) {
          console.log(error);
        }
      });
    })();
  }

  static async getAllDisplay() {
    const { screen } = require("electron");
    console.log("getAllDisplay()");

    //  Get all display
    this.displayList = screen.getAllDisplays();

    //  Map display list
    this.displayListMap = {};
    for (let item of this.displayList) {
      this.displayListMap[item.id] = item;
    }

    console.log(this.displayListMap);
    console.log("---");
  }

  static async getDisplayPreview() {
    const { desktopCapturer } = require("electron");
    console.log("getDisplayPreview()");
    console.log(this.displayListMap);

    let _displayList = [];
    try {
      //  Get all available screen
      let screenList = await desktopCapturer.getSources({
        types: ["screen"],
      });

      for (let _screen of screenList) {
        let _display = this.displayListMap[_screen.display_id];
        if (_display) {
          console.log(_display);
          _displayList.push({
            id: _screen.display_id,
            size: _display.size,
            bounds: _display.bounds,
            thumbnail: _screen.thumbnail.toDataURL(),
          });
        }
      }
    } catch (error) {
      console.log(error);
    }

    console.log("---");

    return _displayList;
  }

  static async getDisplayWithoutPreview() {
    console.log("getDisplayWithoutPreview()");
    let _displayList = [];
    try {
      for (let [key, _display] of Object.entries(this.displayListMap)) {
        console.log(_display);
        _displayList.push({
          id: _display.id,
          size: _display.size,
          bounds: _display.bounds,
        });
      }
    } catch (error) {
      console.log(error);
    }

    console.log("---");

    return _displayList;
  }

  static async centerWindow(win, target) {
    try {
      console.log("centerWindow()");
      if (!target) return;
      const { screen } = require("electron");

      // width: Math.ceil(width),
      // height: Math.ceil(height),
      // x: Math.ceil(width / 2),
      // y: Math.ceil(height / 2),

      win.setBounds({
        width: Math.ceil(target.size.width),
        height: Math.ceil(target.size.height),
        x: Math.ceil(target.bounds.x),
        y: Math.ceil(target.bounds.y),
      });

      let winBounds = win.getBounds();
      let targetBounds = target.bounds;
      let targetSize = target.size;

      console.log(
        Math.ceil(targetBounds.x) +
          Math.ceil(targetSize.width - winBounds.width)
      );
      win.setPosition(
        Math.ceil(targetBounds.x) +
          Math.ceil((targetSize.width - winBounds.width) / 2),
        Math.ceil(targetBounds.y) +
          Math.ceil((targetSize.height - winBounds.height) / 2)
      );
      win.setFullScreen(true);
      win.setAlwaysOnTop(true, "screen-saver");
    } catch (error) {
      console.log(error);
    }
  }
};
