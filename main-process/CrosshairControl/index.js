module.exports.CrosshairControl = class CrosshairControl {
  static processDesignerModel(event, crosshairStr, source, name, shouldSendEvent) {
    const { sendEvent, eventTypes } = require("../CloudEvents");
    const { render } = require("../../main-process/CrosshairDrawing/generateSVG");

    // Bunch of legacy clean up shit
    const newCrosshair = (typeof crosshairStr === 'string' || crosshairStr instanceof String) ? JSON.parse(crosshairStr) : crosshairStr;
    // console.log(newCrosshair)
    if (
      newCrosshair.firingOptions.duration === null ||
      (newCrosshair.firingOptions.duration === undefined &&
        (newCrosshair.firingOptions.tShapeWhenFiring ||
          newCrosshair.firingOptions.firingOffset > 0))
    ) {
      console.log("Setting duration to 0.3");
      newCrosshair.firingOptions.duration = 0.3;
    }

    if (
      newCrosshair.firingOptions.startDelay === null ||
      (newCrosshair.firingOptions.startDelay === undefined &&
        (newCrosshair.firingOptions.tShapeWhenFiring ||
          newCrosshair.firingOptions.firingOffset > 0))
    ) {
      console.log("Setting startDelay to 0.1");
      newCrosshair.firingOptions.startDelay = 0.1;
    }

    if (!newCrosshair.line.shape) {
      newCrosshair.line.shape = "rectangle";
    }

    if (!newCrosshair.dot.shape) {
      newCrosshair.dot.shape = "square";
    }

    // if the crosshair model doesnt have a blur value under line dot or outline, set it to 0. Also do it for line rotation
    if (!newCrosshair.line.blur) {
      newCrosshair.line.blur = 0;
    }

    if (!newCrosshair.dot.blur) {
      newCrosshair.dot.blur = 0;
    }

    if (!newCrosshair.outline.blur) {
      newCrosshair.outline.blur = 0;
    }

    if (!newCrosshair.line.rotation) {
      newCrosshair.line.rotation = 0;
    }

    // Sending cloud event
    const content = {
      drawing: newCrosshair,
    };

    if (name) {
      content.name = name;
    }

    if (source && shouldSendEvent) {
      content.source = source;
      sendEvent(eventTypes.CROSSHAIR_SELECT, content);

      if (event && event.type == "shared") {
        sendEvent(eventTypes.CROSSHAIR_SHARE, content);
      }
    }

    // Actually rendering the SVG
    const svg = render(newCrosshair, 0, 1);
    return {
      drawing: svg,
      model: JSON.stringify(newCrosshair)
    }
  }
};
