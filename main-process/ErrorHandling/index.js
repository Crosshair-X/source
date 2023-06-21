module.exports.ErrorHandling = class ErrorHandling {
  static hasSentException = false;
  static hasSentRejection = false;


  static configure() {
    const displayAlert = this.displayAlert;

    process.on("uncaughtException", function (error) {
      console.log("Uncaught Exception ERROR", error);
      if (! this.hasSentException) {
        const Sentry = require("@sentry/electron");
        Sentry.captureMessage("Uncaught Exception")
        this.hasSentException = true;
      }
      displayAlert(error);
    });

    process.on("unhandledRejection", function (error) {
      console.log("Unhandled Rejection ERROR", error);
      if (! this.hasSentRejection) {
        const Sentry = require("@sentry/electron");
        Sentry.captureMessage("Uncaught Rejection")
        this.hasSentRejection = true;

      }
      displayAlert(error);
    });
  }

  static displayAlert(error) {
    const Alert = require("electron-alert");
    const { app } = require("electron");

    let alert = new Alert();

    let swalOptions = {
      title:
        '<h5 style="color: white; font-family: Arial, Helvetica, sans-serif;">An error occured using Crosshair X</h5>',
      html: `<div><p style="color: white; font-family: Arial, Helvetica, sans-serif;">The developer has been notified and the issue is being investigated.</p><br/><p style="color: white;">${error}</p></div>`,
      icon: "error",
      confirmButtonColor: "#ff8000",
      confirmButtonText: "Exit App",
      background: "#393f49",
    };
    let promise = alert.fireFrameless(swalOptions, null, true, false);
    promise.then((result) => {
      if (result.isConfirmed) {
        console.log(error);
        app.exit(1);
      } else {
        console.log("Dismiss Error");
      }
    });
  }
};
