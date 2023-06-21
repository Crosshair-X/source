const { emptyCrosshair } = require("../CrosshairModel");

module.exports.SaveCrosshair = class SaveCrosshair {
  static configure = () => {
    const { ipcMain } = require("electron");
    const { DataStore } = require("./index");
    const { sendEvent, eventTypes } = require("../CloudEvents");

    ipcMain.on("saveNewCrosshair", (evt, crosshairId, source, name) => {
      const savedCrosshairs = DataStore.getStore().get("savedCrosshairs");

      const newCrosshair = 
        {
          name,
          pos: {
            x: 0,
            y: 0,
          },
        };

        if (source) {
          if (source !== "customimages") {
            newCrosshair.model = JSON.parse(crosshairId)
          } else {
            newCrosshair.model = emptyCrosshair.drawing;
            newCrosshair.image = JSON.parse(crosshairId);
          }
        }


      savedCrosshairs.push(newCrosshair);

      const content = {
        drawing: JSON.parse(crosshairId),
      };

      if (name) {
        content.name = name;
      }

      if (source) {
        content.source = source;

        if (source != "customimages") {
          sendEvent(eventTypes.CROSSHAIR_SAVE, content);
        } else {

        }
      }

      DataStore.getStore().set("savedCrosshairs", savedCrosshairs);
    });
  };
};
