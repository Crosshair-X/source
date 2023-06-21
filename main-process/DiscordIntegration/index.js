module.exports.DiscordIntegration = class DiscordIntegration {
  static configure() {
    const { DataStore } = require("../DataStore");
    const { ipcMain } = require("electron");

    ipcMain.handle("enableDiscord", (event, enableDiscord) => {
      DataStore.getStore().set("discordEnabled", enableDiscord);
      this.reconfigureDiscord();
    });

    this.reconfigureDiscord();
  }

  static reconfigureDiscord() {
    const { DataStore } = require("../DataStore");
    const RPC = require("discord-rpc");
    const clientId = "807684325927157790";

    let client = null;

    if (DataStore.getStore().get("discordEnabled")) {
      client = new RPC.Client({ transport: "ipc" });

      client.on("ready", () => {
        console.log("Authed to Discord");
      });

      client.on("connected", () => {
        console.log("Connected to Discord");
        try {
          client.setActivity({
            state: "Using Custom Crosshair",
            largeImageKey: "crosshairx_transparent",
            instance: false,
          });
        } catch (e) {
          console.log(e);
        }
      });

      // Log in to RPC with client id
      client.login({ clientId }).catch((e) => {
        console.log("Connecting to Discord", e);
      });
    } else {
      if (client !== null) {
        try {
          client.destroy().catch((e) => {
            console.log("Destroying Discord Client Instance", e);
          });
          client = null;
        } catch (e1) {
          console.log(e1);
        }
      }
    }
  }
};
