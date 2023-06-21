module.exports.AutoLaunch = class AutoLaunch {
  static configure() {
    const configureAutoLaunch = this.configureAutoLaunch;

    require("electron").ipcMain.handle(
      "set-launch-on-startup",
      function (e, val) {
        require("../DataStore").DataStore.getStore().set("launchOnStartup", val);
        configureAutoLaunch();
      }
    );
  }

  static configureAutoLaunch() {
    const appEnv = require("../../config/environmentVariables/envVars.json");
    const { app } = require("electron");
    const Sentry = require("@sentry/electron");
    const { DataStore } = require("../DataStore");

    // if (false) {
    if (appEnv.DISTRIBUTION === "steam" && process.env.NODE_ENV !== "test") {
      const steamLocation = `"${process.execPath}"`;
      DataStore.getStore().set("steamLocation", steamLocation);

      app.setLoginItemSettings({
        openAtLogin: DataStore.getStore().get("launchOnStartup"),
        path: steamLocation,
        args: ["-silent"],
        name: "CrosshairX",
      });
      // } else {
    } else if (
      appEnv.DISTRIBUTION === "microsoftstore" &&
      process.env.NODE_ENV !== "test"
    ) {
      const steamLocation =  DataStore.getStore().get("steamLocation");

      if (steamLocation !== false) {
        const loginObj = app.getLoginItemSettings({
          path: steamLocation,
        });

        if (loginObj && loginObj.launchItems && loginObj.launchItems.length > 0)
          for (const index in loginObj.launchItems) {
            const item = loginObj.launchItems[index];

            if (
              item &&
              item.name &&
              item.name == "CrosshairX" &&
              item.scope &&
              item.enabled
            ) {
              // Disable the steam launch
              try {
                const Registry = require("winreg"),
                  regKey = new Registry({
                    // new operator is optional
                    hive: item.scope == "user" ? Registry.HKCU : Registry.HKLM, // open registry hive HKEY_CURRENT_USER
                    key: "\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", // key containing autostart programs
                  });

                regKey.valueExists("CrosshairX", (err, exists) => {
                  if (err != null) {
                    console.log(
                      "Error checking if value exists in registry",
                      item
                    );
                    Sentry.captureException(err);
                  } else {
                    if (exists) {
                      regKey.remove("CrosshairX", (err) => {
                        if (err != null) {
                          const postRemoveLoginObj = app.getLoginItemSettings({
                            path: steamLocation,
                          });
                          console.log("Login Obj", loginObj);

                          console.log(
                            "Post Remove Login Obj",
                            postRemoveLoginObj
                          );

                          Sentry.captureException(err);
                        } else {
                          DataStore.getStore().set("steamLocation", false);
                        }
                      });
                    } else {
                      console.log("Value doesnt exist in Registry", item);
                    }
                  }
                });
              } catch (e) {
                console.log(loginObj);
                Sentry.captureException(e);
              }
            }
          }
      }

      const {
        WindowsStoreAutoLaunch,
      } = require("electron-winstore-auto-launch");

      try {
        if ( DataStore.getStore().get("launchOnStartup")) {
          WindowsStoreAutoLaunch.enable().then(
            (res) => {},
            (err) => {
              Sentry.captureException(err);
            }
          );
        } else {
          WindowsStoreAutoLaunch.disable().then(
            (res) => {},
            (err) => {
              Sentry.captureException(err);
            }
          );
        }
      } catch (e) {
        Sentry.captureException(e);
      }
    }
  }
};
