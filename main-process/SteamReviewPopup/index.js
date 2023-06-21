module.exports.SteamReviewPopup = class SteamReviewPopup {
  static configure() {
    const { DataStore } = require("../DataStore");
    const { ipcMain, app } = require("electron");
    ipcMain.on("dismissReviewBox", (event) => {
      DataStore.getStore().set("hasDismissedReviewBox", true);
    });

    ipcMain.on("new-window", function (e, url) {
      e.preventDefault();
      require("electron").shell.openExternal(url);
    });

    ipcMain.on("open-review", function (e) {
      e.preventDefault();

      // require appEnv
      const appEnv = require("../../config/environmentVariables/envVars.json");
      // if not packaged app (Steam) then open url to Steam review page
      if (appEnv.DISTRIBUTION === "steam") {
        require("electron").shell.openExternal("steam://openurl/https://store.steampowered.com/app/1366800/Crosshair_X/");
      } else if (appEnv.DISTRIBUTION === "microsoftstore") {
        // otherwise open up microsoft store review prompt for Crosshair X by opening up a new window
        // the new window will be a blank window with a url to the microsoft store review page using the microsoft protocol
        require("electron").shell.openExternal("ms-windows-store://review/?ProductId=9P8PRDD1ZM6L");

      }




    });
  }

  static incrementNumberOfAppLaunches(menuWindow) {
    const appEnv = require("../../config/environmentVariables/envVars.json");
    const { DataStore } = require("../DataStore");
    if (DataStore.getStore().get("numberOfAppLaunches") > 10) {
      if (
        !DataStore.getStore().get("hasDismissedReviewBox")
      ) {
        menuWindow.webContents.send("showReviewBox", "steam");
      }
    } else {
      const numberOfAppLaunches = DataStore.getStore().get(
        "numberOfAppLaunches"
      );
      DataStore.getStore().set("numberOfAppLaunches", 1 + numberOfAppLaunches);
    }
  }
};
