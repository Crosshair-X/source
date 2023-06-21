const { ipcMain } = require("electron");
const { render } = require("../../main-process/CrosshairDrawing/generateSVG");

module.exports.SaveCrosshairImage = class SaveCrosshairImage {
  static SVGToImage(svgString, name){
    try {
    // convert svg to png

    // first save the svg to a temp file using the temp module
    const temp = require("temp");

    // now create the temp file and save the path
    const tempFile = temp.openSync({ suffix: ".svg" });
    console.log(tempFile.path);

    // write the svg to the temp file
    const fs = require("fs");
    fs.writeFileSync(tempFile.path, svgString);

    // // now create another temp file path that we can write the png to
    // const tempFile2 = temp.openSync({ suffix: ".png" });
    // console.log(tempFile2.path);

    // now we can use the svg-to-png module to convert the svg to a png
      // now we can ask the user to save the png using the showSaveDialog module
      const { dialog } = require("electron");
      dialog
        .showSaveDialog({
          title: "Save PNG",
          defaultPath: `${name}.png`,
          filters: [{ name: "PNG", extensions: ["png"] }],
        })
        .then((filePath) => {
          if (filePath.filePath) {
            // show electron alert of "filePath"
            // write svg to filePath
            // get universal temp path
            const os = require("os");

            // get temp directory
            const tempDir = os.tmpdir(); // /tmp
           
            // convert the svg to a png using the convert-svg-to-png module
            const { convertFile}  = require('convert-svg-to-png');
            const inputFilePath = tempFile.path;

            const sharp =require('sharp');

            let srcfile = inputFilePath;
            let resizedest = filePath.filePath;
            
            let img = sharp(srcfile).toFile(resizedest);
        
              
          



          } else {
          }
        });
    
      } catch (err) {
      console.log(err);
      }
    
  }


  static configure() {
    // ipc main handler for download-svg
    ipcMain.on("download-svg", (event, svg, name) => {
      // svg is a string that we want to save as a file
      // we want to convert svg
      // use show save dialog to save svg to file
      const { dialog } = require("electron");
      dialog
        .showSaveDialog({
          title: "Save SVG",
          defaultPath: `${name}.svg`,
          filters: [{ name: "SVG", extensions: ["svg"] }],
        })
        .then((filePath) => {
          console.log(filePath);

          if (filePath.filePath) {
            // show electron alert of "filePath"
            // write svg to filePath
            const fs = require("fs");
            fs.writeFile(filePath.filePath, render(JSON.parse(svg).model), (err) => {
              if (err) {
                console.log(err);
              }
            });
          } else {
          }
        });
    });

    // ipc main handler for download-png
    ipcMain.on("download-png", (event, model, name) => {
      // converting model to a string that represents the svg
      const svgString = render(JSON.parse(model).model);

      // lets convert the svg to a png
      this.SVGToImage(svgString, name);

    });

    ipcMain.on("download-image", (event, model, name) => {
      const { dialog } = require("electron");
      const extentionOfFile = JSON.parse(model).image.localPath.split(".").pop();

      dialog
        .showSaveDialog({
          title: "Save Image",
          defaultPath: `${name}.${extentionOfFile}`,
          filters: [{ name: extentionOfFile, extensions: [extentionOfFile] }],
        })
        .then((filePath) => {
          console.log(filePath);

          if (filePath.filePath) {
            // write image to file path
            // content of image is in a base64 string stored in JSON.parse(model).b64
            // written image needs to be able to be opened by the user's image viewer
            const fs = require("fs");
            fs.writeFile(
              filePath.filePath,
              JSON.parse(model).image.b64,
              "base64",
              (err) => {
                if (err) {
                  console.log(err);
                }
              }
            );



          } else {
          }
        });
    });
  }
};
