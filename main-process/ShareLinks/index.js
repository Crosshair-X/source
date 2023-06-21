const { default: axios } = require("axios");
const { default: base64url } = require("base64url");
const { setCurrentActiveCrosshair } = require("../CrosshairControl/test");

module.exports.ShareLinks = class ShareLinks {
  static configureCustomLaunchProtocol() {
    const { app, ipcMain } = require("electron");
    const path = require("path");

    // If we are running a non-packaged version of the app && on windows
    if (process.defaultApp) {
      // Set the path of electron.exe and your app.
      // These two additional parameters are only available on windows.
      app.setAsDefaultProtocolClient("crosshair-x", process.execPath, [
        path.resolve(process.argv[1]),
      ]);
    } else {
      app.setAsDefaultProtocolClient("crosshair-x");
    }

    ipcMain.handle("getCrosshairFromShareCode", async (event, args) => {
      // args is the share code

      let returnMessage = "";
      let shareCode = args;


      try {
        // Call this API using axios to get the crosshair data
        // https://8yy0fp6ycd.execute-api.us-east-1.amazonaws.com/Prod/fetchsharedcrosshair?linkId=1ox5sh3koq
        const response = await axios.get(
          `https://8yy0fp6ycd.execute-api.us-east-1.amazonaws.com/Prod/fetchsharedcrosshair?linkId=${shareCode}`
        );



        if (response.data) {
          // decode then parse
          const crosshairModel = JSON.parse(
            Buffer.from(response.data.crosshairModel, "base64").toString("utf-8")
          );

          const name = response.data.name
            ? Buffer.from(response.data.name, "base64").toString("utf-8")
            : shareCode;

      
            returnMessage = {
              crosshairModel,
              name,
            };
          
        } else {
          returnMessage = { error: "Share code not found" };
        }
      } catch (err) {
        returnMessage = { error: err.message };
      }

      return JSON.stringify(returnMessage);
    });

    ipcMain.handle('saveSharedCrosshairImage', (event, args) => {
      const crosshairObj = JSON.parse(args);

      // save the image to the users app data folder
      const fs = require('fs');
      const path = require('path');
      const app = require('electron').app;
      
      const appDataPath = app.getPath('appData');
      const crosshairXPath = path.join(appDataPath, 'CrosshairX', 'CustomImages');

      // generate image path with a random name using uuid and extract the extension from the image type
      const imageExtension = crosshairObj.imageType.split('/')[1];
      const uuid = require('uuid').v4();
      const imagePath = path.join(crosshairXPath, `${uuid}.${imageExtension}`);

      // create the folder if it doesn't exist
      if (!fs.existsSync(crosshairXPath)) {
        fs.mkdirSync(crosshairXPath);
      }

      // write the image to the file
      fs.writeFileSync(imagePath, crosshairObj.b64, 'base64');

      // return the path to the image
      return imagePath;
    })

    ipcMain.handle("generateShareCode",  async (event, args, name) => {
      // We have to handle errors better here
      // wrap everything in a promise with resolve and reject

      // create the promise and await it
      // if there is an error, reject the promise with the error message
      // if there is no error, resolve the promise with the share code

      return await new Promise((resolve, reject) => {
        console.log(name);
        let shareId = base64url(JSON.stringify(args).replace(/\s+/g, ""));
      
        // Call API with b64 URL
         axios.post(
            `https://8yy0fp6ycd.execute-api.us-east-1.amazonaws.com/Prod/createshare?cxid=${shareId}${
              name ? `&name=${base64url(name.trim())}` : ""
            }`
          ).then((res) => {
            if (res.data) {
              resolve({shareCode: res.data.message})
            }}).catch((err) => {
              console.log(err);
              resolve({error: err.message})
            })
  
      });
    


      
      
      
 

      // success: shareId: centerpoint.gg/s/{retUrl}
    });
  }

  static appLaunchedFromCustomProtocol(args) {
    if (args && args.length > 0) {
      for (const cmd of args) {
        if (cmd.startsWith("crosshair-x://")) {
          const remainder = cmd.split("crosshair-x://")[1];
          if (remainder.endsWith("/")) {
            return remainder.substring(0, remainder.length - 1);
          }
        }
      }
    }

    console.log("Not opened through share");
    return null;
  }

  string_to_b64_url(str) {
    return Buffer.from(str).toString("base64");
  }

  static configureAppFromCustomProtocol(args) {
    try {
    console.log("Test")
    const extractedFromCustomProtocol =
      this.appLaunchedFromCustomProtocol(args);

    if (extractedFromCustomProtocol) {
      const crosshair = extractedFromCustomProtocol.split("&")[0];
      const name = extractedFromCustomProtocol.split("&")[1];
      const image = extractedFromCustomProtocol.split("&")[2];

      console.log("Crosshair opened with:", { crosshair, name });
      const base64url = require("base64url");
      const crosshairData = base64url.decode(crosshair);
      const crosshairDataJson = JSON.parse(crosshairData);
      const { DataStore } = require("../DataStore");

        setCurrentActiveCrosshair(
          "model",
          DataStore,
          crosshairDataJson,
          { type: "shared" },
          name
        );

        require("../MenuWindow")
          .MenuWindow.getWindow()
          .webContents.send(
            "navigateTo",
            JSON.stringify({
              page: "designer",
              name: base64url.decode(name),
              crosshair: base64url.decode(crosshair),
            })
          );
      
    }
  } catch (err) {
    console.log(err)
  } 

  }
};
