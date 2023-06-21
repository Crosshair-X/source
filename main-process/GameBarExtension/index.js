const {
  getState,
  updateCrosshairWindows,
} = require("../CrosshairControl/test");
// Going to let the service live underneath
// - Try to send. If we have to connect, connect and then send
// - If we have to connect, we have to wait for the connection to be established

module.exports.GameBarExtension = class GameBarExtension {
  // Variable to store the Game Bar Extension connection
  static connection = null;

  // Latest game bar status
  static disconnectedStatus = {
    isPinned: false,
    isVisible: false,
    isClickthough: false,
    isUsingExclusiveFullscreen: false,
  };

  static gameBarStatus = this.disconnectedStatus;

  // Function to connect to the Game Bar Extension
  static connect(callback) {
    // Create a new connection to the Game Bar Extension using NodeRT and the Windows Application Model for Node.js
    // First require the windows.applicationmodel.appservice from nodert
    const {
      AppServiceConnection,
      AppServiceConnectionStatus,
    } = require("@nodert-win10-rs4/windows.applicationmodel.appservice");
    // Create a new connection to the Game Bar Extension
    GameBarExtension.connection = new AppServiceConnection();
    // Set the AppServiceName to the name of the AppService in the Game Bar Extension
    GameBarExtension.connection.appServiceName = "com.microsoft.prosight";
    // Set the PackageFamilyName to the PackageFamilyName of the Game Bar Extension
    GameBarExtension.connection.packageFamilyName =
      "47492CenterpointGaming.ProSightCrosshairExtension_rz8d8f65gztyc";
    // Listen for the connection to the Game Bar Extension to be closed
    GameBarExtension.connection.on("ServiceClosed", (sender, args) => {
      // console.log("Connection to Game Bar Extension closed");
      GameBarExtension.closeConnection();
    });
    // Listen for messages from the Game Bar Extension
    GameBarExtension.connection.on("RequestReceived", (sender, args) => {
      try {
        const {
          IPropertyValue,
        } = require("@nodert-win10-rs4/windows.foundation");

        var messageDeferral = args.getDeferral();
        var f = args.request.message.first();
        while (f.hasCurrent) {
          var ipvt = IPropertyValue.castFrom(f.current.value);
          var ipvts = ipvt.getString();
          // console.log(f.current.key + ": " + ipvts);
          switch (f.current.key) {
            case "V5":
              // console.log("V5 Message: " + ipvts);

              if (require("../MenuWindow").MenuWindow.getWindow()) {
                GameBarExtension.gameBarStatus = JSON.parse(ipvts);
                require("../MenuWindow")
                  .MenuWindow.getWindow()
                  .webContents.send("gameBarStatus", JSON.parse(ipvts));
              }

              if (
                require("../MenuWindow").MenuWindow.getWindow() &&
                JSON.parse(ipvts).version
              ) {
                require("../MenuWindow")
                  .MenuWindow.getWindow()
                  .webContents.send(
                    "setCurrentVersion",
                    JSON.parse(ipvts).version
                  );
              }

              if (
                require("../DataStore")
                  .DataStore.getStore()
                  .get("isUsingExclusiveFullscreen") === false
              ) {
                // console.log("isUsingExclusiveFullscreen is false, setting to true and re-centering");

                if (JSON.parse(ipvts).hasDisplayModeChanged) {
                  console.log("Setting to true and re-centering");

                  require("../DataStore")
                    .DataStore.getStore()
                    .set("isUsingExclusiveFullscreen", true);

                  require("../MenuWindow")
                    .MenuWindow.getWindow()
                    .webContents.send("setUsingExclusiveFullscreen", true);

                  require("../MenuWindow")
                    .MenuWindow.getWindow()
                    .webContents.send("setCrosshairOffset", 0, 0);

                  // Update crosshair offset in the state in CrosshairControl
                  require("../CrosshairControl/test").updateState({
                    payload: { x: 0, y: 0 },
                    type: "SET_CROSSHAIR_POSITION",
                  });
                }
              }

              // TODO: Handle the V5 message from the Game Bar Extension
              // UpdateStatus(ipvts);
              break;
            default:
              console.log("Unknown message: " + ipvts);

              // Send outOfDateStatus
              if (require("../MenuWindow").MenuWindow.getWindow()) {
                GameBarExtension.gameBarStatus = JSON.parse(ipvts);
                require("../MenuWindow")
                  .MenuWindow.getWindow()
                  .webContents.send("gameBarStatus", JSON.parse(ipvts));
                require("../MenuWindow")
                  .MenuWindow.getWindow()
                  .webContents.send(
                    "setCurrentVersion",
                    JSON.parse(ipvts).version
                  );
              }

              // TODO: Handle unknown messages from the Game Bar Extension
              break;
          }
          f.moveNext();
        }
        messageDeferral.complete();
      } catch (e) {}
    });

    // Open the connection to the Game Bar Extension
    // console.log("Opening connection to Game Bar Extension");
    try {
      GameBarExtension.connection.openAsync((error, result) => {

        if (error) {
          console.log(error)
          GameBarExtension.closeConnection();

          return;
        } else if (result !== AppServiceConnectionStatus.success) {
          // console.error(
          //   "Error 2 opening connection to Game Bar Extension: " + result
          // );
          GameBarExtension.closeConnection();

          return;
        } else if (result === AppServiceConnectionStatus.success) {
          // This doesn't mean we are connected, it just means we have opened the connection
          // We'll know we are connected if ServiceClosed is not called immediately after this
          // console.log("Potential connection to Game Bar Extension established");
          if (callback) {
            callback();
          }
        } else {
          // console.log("Resulted!")
          GameBarExtension.closeConnection();
        }
      });
    } catch (e) {
      console.log(e);
      GameBarExtension.closeConnection();
    }
  }

  static configure() {
    const { ipcMain } = require("electron");

    // Every second we're going to try to send a message to the Game Bar Extension
    setInterval(() => {
      // If we don't have a connection to the Game Bar Extension, try to connect
      if (!GameBarExtension.connection) {
        GameBarExtension.Send(getState());
      }
    }, 1000);

    ipcMain.handle("gameBarStatus", (event, arg) => {
      return GameBarExtension.gameBarStatus;
    });

    ipcMain.handle("useExclusiveFullscreen", (event, arg) => {
      const { DataStore } = require("../DataStore");

      if (
        DataStore.getStore().get("isUsingExclusiveFullscreen") === true &&
        arg == false
      ) {
      } else if (
        DataStore.getStore().get("isUsingExclusiveFullscreen") === false &&
        arg == true
      ) {
        // Update crosshair offset in menu and the data store
      }

      DataStore.getStore().set("isUsingExclusiveFullscreen", arg);
      updateCrosshairWindows();
    });
  }

  static closeConnection() {
    console.log("Attempting to close connection to Game Bar Extension");
    try {
      if (GameBarExtension.connection) {
        GameBarExtension.connection.close();
        GameBarExtension.connection = null;
        console.log("Connection to Game Bar Extension closed");
        // Send a message to the Game Bar Health Check to let it know we are disconnected

        if (
          JSON.stringify(GameBarExtension.gameBarStatus) !=
          JSON.stringify(GameBarExtension.disconnectedStatus)
        ) {
          console.log("Sending disconnected status to Game Bar Health Check");
          GameBarExtension.disconnectedStatus.version = require("../DataStore")
            .DataStore.getStore()
            .get("extensionVersion");
          GameBarExtension.gameBarStatus = GameBarExtension.disconnectedStatus;

          require("../MenuWindow")
            .MenuWindow.getWindow()
            .webContents.send("gameBarStatus", GameBarExtension.gameBarStatus);
        } else {
          console.log(
            "Not sending disconnected status to Game Bar Health Check"
          );
        }
      } else {
        console.log("No connection to close");
      }
    } catch (e) {
      console.log("Error closing connection to Game Bar Extension");
      console.log(e);
    }
  }

  static Send(objToSend) {
    try {
      if (GameBarExtension.connection) {
        // Call the service.
        const {
          IPropertyValue,
          PropertyValue,
        } = require("@nodert-win10-rs4/windows.foundation");
        const {
          ValueSet,
        } = require("@nodert-win10-rs4/windows.foundation.collections");
        const {
          AppServiceResponseStatus,
        } = require("@nodert-win10-rs4/windows.applicationmodel.appservice");

        var message = new ValueSet();
        message.insert(
          `V5`,
          PropertyValue.createString(JSON.stringify(objToSend))
        );

        try {
          GameBarExtension.connection.sendMessageAsync(
            message,
            (error, response) => {
              if (error) {
                // console.error("Error sending message to Game Bar Extension: " + error);
                return;
              }

              if (response.status !== AppServiceResponseStatus.success) {
                // console.error("Error sending message to Game Bar Extension: " + response.status);
                return;
              } else {
                // console.log("Message sent to Game Bar Extension");
              }
            }
          );
        } catch (e) {
          // console.error("Error sending message to Game Bar Extension: " + e);
        }
      } else {
        GameBarExtension.connect(() => {
          objToSend.firstMessage = true;
          GameBarExtension.Send(objToSend);
          objToSend.firstMessage = false;
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
};
