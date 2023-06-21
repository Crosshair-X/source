const { updateState, getState } = require("../CrosshairControl/test");
const { DataStore } = require("../DataStore");

module.exports.MouseEvents = class MouseEvents {
  static configure() {
    try {
    const mouseEvents = require("global-mouse-events");

    mouseEvents.on("mousedown", (event) => {
      if (event.button == 1) {
        updateState({ type: "SET_LEFT_MOUSE_STATE", payload: {action: "mousedown"} });
      }

      if (event.button == 2) {
        updateState({ type: "SET_RIGHT_MOUSE_STATE", payload: {action: "mousedown"} });

        if (
          getState().rightClickCrosshairToggle.isSingleClickToggleEnabled
        ) {
          updateState({
            type: "TOGGLE_CROSSHAIR_HIDDEN",
            payload: null,
          });
        }

        if (getState().rightClickCrosshairToggle.isHoldToggleEnabled) {
          if (getState().rightClickCrosshairToggle.doesRightClickHideCrosshair) {
            updateState({
              type: "SET_CROSSHAIR_HIDDEN",
              payload: true,
            });
          } else if (getState().rightClickCrosshairToggle.doesRightClickShowCrosshair) {
            updateState({
              type: "SET_CROSSHAIR_HIDDEN",
              payload: false,
            });
          }
        }
      }
    });

    mouseEvents.on("mouseup", (event) => {

      if (event.button == 1) {
        updateState({ type: "SET_LEFT_MOUSE_STATE", payload: {action: "mouseup"} });
      }


      if (event.button == 2) {
        updateState({ type: "SET_RIGHT_MOUSE_STATE", payload: {action: "mouseup"} });

        if (
          getState().rightClickCrosshairToggle.isHoldToggleEnabled
        ) {
          if (getState().rightClickCrosshairToggle.doesRightClickHideCrosshair) {
            updateState({
              type: "SET_CROSSHAIR_HIDDEN",
              payload: false,
            });
          } else if (getState().rightClickCrosshairToggle.doesRightClickShowCrosshair) {
            updateState({
              type: "SET_CROSSHAIR_HIDDEN",
              payload: true,
            });
          }
        }
      }


    });
  } catch (e) {
    console.log("Mouse events not configured");
    console.log(e);
  }
  }
};
