module.exports.CustomImages = class CustomImages {
  static configure() {
    const { DataStore } = require("../DataStore");
    const { ipcMain } = require("electron");

    // when ipcMain receives the "getB64" event, it will return the base64 string of the file at the path specified in the event's second argument
    ipcMain.handle("getB64", (event, path) => {
      const fs = require("fs");
      console.log(path);
      
      const b64 = fs.readFileSync(path, { encoding: "base64" });

      return b64;
    });

    ipcMain.handle('copyImageToAppData', (event, oldPath) => {
      const fs = require('fs');
      const { app } = require('electron');
      const { v4: uuidv4 } = require('uuid');
      const path = require('path');

      const extension = oldPath.split('.').pop();
      const appDataPath = app.getPath('appData');
      const crosshairImagesPath = path.join(appDataPath, 'CrosshairX', 'CustomImages');
      const newImagePath = path.join(crosshairImagesPath, uuidv4() + '.' + extension);

      if (!fs.existsSync(crosshairImagesPath)) {
        fs.mkdirSync(crosshairImagesPath);
      }

      fs.copyFileSync(oldPath, newImagePath);
      console.log(newImagePath)
      return newImagePath;
    });

    ipcMain.handle("uploadImage", async (event, crosshairStr) => {
      const { DataStore } = require("../DataStore");
      const { v4 } = require("uuid");
      const axios = require("axios");

      const eventId = v4();
      const uuid = DataStore.getStore().get("uuid");

      const messageToSend = {
        uuid,
        eventId,
        eventType: "CROSSHAIR_SELECT"
      };

      if (crosshairStr) {
        messageToSend.content = crosshairStr;
      }

    
      // handle if its a success or failure
      // success should have a 200 status code and a data object with an imageId property
      // failure should have a 400 status code and a data object with an error property
      try {
        await axios.post(
          "https://khzlht5mv7.execute-api.us-east-1.amazonaws.com/Prod/customimages/",
          messageToSend
        )
    } catch (e) {
      console.log(e);
    }
    });

    // return imageDimensions
    ipcMain.handle("getImageDimensions", (event, path) => {
      const { imageSize } = require("image-size");
      const dimensions = imageSize(path);
      return dimensions;
    });


  }
};
