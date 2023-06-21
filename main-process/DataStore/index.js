module.exports.DataStore = class DataStore {
  static store;

  static getStore() {
    if (! this.store) {
      this.configure();
    }
    return this.store;
  }

  static configure() {
    {
      const Store = require("electron-store");
      const { v4 } = require('uuid');
      const { emptyCrosshair } = require('../CrosshairModel');
      const { ipcMain, app } = require('electron');
    
      // default state of the app
      this.store = new Store({
        name: "crosshairx-user-preferences",
        defaults: {
          lastRanLocation: false,
          extensionVersion: false,
          hasGameBarConnected: false,
          languagePref: 'en',
          steamLocation: false,
          shortcuts: {
            toggle: 'Z',
            isDeprecated: false
          },
          toggleShortcut: {
            modifiers: ["Alt", "Shift"], // Alt, Shift, Ctrl, Win
            key: 'Z' // A-Z, 0-9
          },
          crosshairOffset: {
            x: 0,
            y: 0,
          },
          uuid: v4(),
          savedCrosshairs: [],
          tutorial: {
            hasCompletedTutorial: false,
          },
          currentActiveCrosshair: emptyCrosshair.drawing,
          launchOnStartup: false,
          minimizeOnLaunch: false,
          numberOfAppLaunches: 0,
          doesRightClickHideCrosshair:false,
          doesRightClickShowCrosshair:false,
          discordEnabled: true,
          hasDismissedReviewBox: false,
          isUsingExclusiveFullscreen: false,
          crosshairImage: JSON.stringify(emptyCrosshair.drawing),
          crosshairType: "model",
          isHoldToggleEnabled: false,
          isSingleClickToggleEnabled: false,
          isKeyboardToggleEnabled: true,
        },
        migrations: {
          '>=4.3.0': store => {
            // crosshairImage is now the stringified version of currentActiveCrosshair
            // grab the value of currentActiveCrosshair and turn it into a string
            const currentActiveCrosshair = store.get('currentActiveCrosshair');
            if (currentActiveCrosshair) {
              const stringifiedCrosshair = JSON.stringify(currentActiveCrosshair);
              // set the value of crosshairImage to the stringified version of currentActiveCrosshair
              store.set('crosshairImage', stringifiedCrosshair);
            }
          } 
        }
      });
    


      ipcMain.handle("getStoreValue", (event, key) => {
        return  DataStore.getStore().get(key);
      });
    
      ipcMain.handle("setStoreValue", (event, key, value) => {
        return DataStore.getStore().set(key, value);
      });
    
      ipcMain.handle("getWholeStore", (event) => {
        const CrosshairControl = require('../CrosshairControl/test.js');
        const appEnv = require('../../config/environmentVariables/envVars.json');
    
        return Object.assign({}, {...DataStore.getStore().store}, {isCrosshairHidden: CrosshairControl.getState().isCrosshairHidden, distribution: appEnv.DISTRIBUTION, appVersion: require('../../package.json').version});
      });

      ipcMain.handle("getUserDataPath", (event, key, value) => {

        if (app.getPath("userData")) {
          return app.getPath("userData");
        } else {
          return "";
        }
        
      });
    }
  }
}