module.exports.KeyboardShortcuts = class KeyboardShortcuts {
  static configure() {
    const { DataStore } = require("../DataStore");
    const {
      updateCrosshairWindows,
      updateState,
      getState,
    } = require("../CrosshairControl/test");
    const { app, ipcMain, globalShortcut } = require("electron");

    globalShortcut.register("Alt+Shift+Left", () => {
      const oldX = DataStore.getStore().get("crosshairOffset").x;
      const oldY = DataStore.getStore().get("crosshairOffset").y;

      // if (
      //   oldX <= -150 &&
      //   DataStore.getStore().get("isUsingExclusiveFullscreen")
      // )
      //   return;

      try {
      require("../MenuWindow")
        .MenuWindow.getWindow()
        .webContents.send("setCrosshairOffset", -1, null);
      const newX = oldX - 1;
      const newY = oldY;


      updateState({
        type: "SET_CROSSHAIR_POSITION",
        payload: { x: newX, y: newY },
      });
    } catch (error) {
      console.log(error);
    }
    });
      

    globalShortcut.register("Alt+Shift+Right", () => {
      const oldX = DataStore.getStore().get("crosshairOffset").x;
      const oldY = DataStore.getStore().get("crosshairOffset").y;

      // if (oldX >= 150 && DataStore.getStore().get("isUsingExclusiveFullscreen"))
      //   return;

      try {
      require("../MenuWindow")
        .MenuWindow.getWindow()
        .webContents.send("setCrosshairOffset", 1, null);
      } catch (error) {
        console.log(error);
      }

      const newX = oldX + 1;
      const newY = oldY;

      updateState({
        type: "SET_CROSSHAIR_POSITION",
        payload: { x: newX, y: newY },
      });
    });

    globalShortcut.register("Alt+Shift+Up", () => {
      const oldX = DataStore.getStore().get("crosshairOffset").x;
      const oldY = DataStore.getStore().get("crosshairOffset").y;

      // if (oldY >= 150 && DataStore.getStore().get("isUsingExclusiveFullscreen"))
      //   return;

      try {

      require("../MenuWindow")
        .MenuWindow.getWindow()
        .webContents.send("setCrosshairOffset", null, 1);
      } catch (error) {
        console.log(error);
      }


      const newX = oldX;
      const newY = oldY + 1;

      updateState({
        type: "SET_CROSSHAIR_POSITION",
        payload: { x: newX, y: newY },
      });
    });

    globalShortcut.register("Alt+Shift+Down", () => {
      const oldX = DataStore.getStore().get("crosshairOffset").x;
      const oldY = DataStore.getStore().get("crosshairOffset").y;

      // if (
      //   oldY <= -150 &&
      //   DataStore.getStore().get("isUsingExclusiveFullscreen")
      // )
      //   return;

      try {
      require("../MenuWindow")
        .MenuWindow.getWindow()
        .webContents.send("setCrosshairOffset", null, -1);
      } catch (error) {
        console.log(error);
      }

      const newX = oldX;
      const newY = oldY - 1;

      updateState({
        type: "SET_CROSSHAIR_POSITION",
        payload: { x: newX, y: newY },
      });
    });

    function registerShortcuts(modifiers, keycodes) {
      keycodes.forEach((keycode) => {
        globalShortcut.register(`${modifiers}+${keycode}`, () => {
          if (DataStore.getStore().get("isKeyboardToggleEnabled")) {
            updateState({
              type: "TOGGLE_CROSSHAIR_HIDDEN",
              payload: null,
            });
          }
        });
      });
    }

    function getKeysToRegister(key) {
      switch (key) {
        case " ":
          return ["Space"];

        case "+":
          return ["Plus", "numadd"];

        case "-":
          return [key, "numsub"];

        case "/":
          return [key, "numdiv"];

        case "*":
          return [key, "nummult"];

        case ".":
          return [key, "numdec"];
      }

      if (key.match(/[0-9]/)) {
        return [key, `num${key}`];
      }

      if (key.match(/[a-z]/i)) {
        return [key.toLowerCase(), key.toUpperCase()];
      }

      return [key];
    }

    function unregisterShortcuts(modifiers, keycodes) {
      keycodes.forEach((keycode) =>
        globalShortcut.unregister(`${modifiers}+${keycode}`)
      );
    }

    const isDeprecatedToggleShortcut =
      DataStore.getStore().get("shortcuts").isDeprecated;
    const deprecatedToggleShortcut =
      DataStore.getStore().get("shortcuts").toggle;

    if (!isDeprecatedToggleShortcut && deprecatedToggleShortcut) {
      if (
        deprecatedToggleShortcut.match(
          /[a-z0-9!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~\\\s]/i
        )
      ) {
        DataStore.getStore().set("shortcuts", {
          isDeprecated: true,
          toggle: deprecatedToggleShortcut,
        });

        const newShortcut = DataStore.getStore().get("toggleShortcut");
        DataStore.getStore().set("toggleShortcut", {
          modifiers: [...newShortcut.modifiers],
          key: deprecatedToggleShortcut,
        });
      }
    }

    const savedShortcut = DataStore.getStore().get("toggleShortcut");
    const savedModifier = savedShortcut.modifiers.join("+");
    const savedKeys = getKeysToRegister(savedShortcut.key);
    registerShortcuts(savedModifier, savedKeys);

    ipcMain.handle("setToggleShortcut", (event, arg) => {
      const toggleShortcut = JSON.parse(arg);

      const oldShortcut = DataStore.getStore().get("toggleShortcut");
      const oldModifierString = oldShortcut.modifiers.join("+");
      const oldKeys = getKeysToRegister(oldShortcut.key);

      unregisterShortcuts(oldModifierString, oldKeys);

      DataStore.getStore().set("toggleShortcut", toggleShortcut);
      const newModifierString = toggleShortcut.modifiers.join("+");
      const newKeys = getKeysToRegister(toggleShortcut.key);
      registerShortcuts(newModifierString, newKeys);
    });
  }
};
