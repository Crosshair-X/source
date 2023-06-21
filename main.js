// Determining if user is running Windows 10 or not. Display explanation screen if not.
console.log("start")
const { OperatingSystemHandler } = require('./main-process/NotWindows10/index.js');


if (! OperatingSystemHandler.isUserRunningWindows10()) {
  OperatingSystemHandler.displayIncorrectVersionWindow();
} else {
/* Main electron import */
const { app, Menu, protocol } = require('electron')
app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('no-sandbox')
app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('disable-software-rasterizer')
app.commandLine.appendSwitch('disable-gpu-compositing')
app.commandLine.appendSwitch('disable-gpu-rasterization')
app.commandLine.appendSwitch('disable-gpu-sandbox')
app.disableHardwareAcceleration();

// Prevents instances of the same app running 
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  console.log("App already running, quitting")
  app.quit();
} else {
  console.log("App not running, starting")
  // Debugging errors and desktop resource usage to the cloud
  const Sentry = require("@sentry/electron");
  Sentry.init({ dsn: "https://10d476d8bbe64b2f8096c320691c317e@o1007577.ingest.sentry.io/6009453" });

  console.log("Sentry initialized test")
  /* Libraries for features */
  const { DataStore } = require('./main-process/DataStore');
  console.log("DataStore initialized")
  const { AutoLaunch } = require('./main-process/AutoLaunch');
  console.log("AutoLaunch initialized")
  const { ErrorHandling } = require('./main-process/ErrorHandling');
  console.log("ErrorHandling initialized")
  const { CrosshairWindow } = require('./main-process/CrosshairWindow')
  console.log("CrosshairWindow initialized")
  const { SplashWindow } = require('./main-process/SplashWindow')
  console.log("SplashWindow initialized")
  const { MenuWindow } = require('./main-process/MenuWindow')
  console.log("MenuWindow initialized")
  const { ShareLinks } = require('./main-process/ShareLinks/index.js');
  console.log("ShareLinks initialized")
  const { DisplaySelection } = require('./main-process/DisplaySelection');
  console.log("DisplaySelection initialized")
  const { DiscordIntegration } = require('./main-process/DiscordIntegration');
  console.log("DiscordIntegration initialized")
  const { SteamReviewPopup } = require('./main-process/SteamReviewPopup');
  console.log("SteamReviewPopup initialized")
  const { KeyboardShortcuts } = require('./main-process/KeyboardShortcuts');
  console.log("KeyboardShortcuts initialized")
  const { MouseEvents } = require('./main-process/MouseEvents');
  console.log("MouseEvents initialized")
  const { SaveCrosshair } = require('./main-process/DataStore/saveCrosshair.js');
  console.log("SaveCrosshair initialized")
  const { SaveCrosshairImage } = require('./main-process/SaveCrosshairImage/index.js');
  console.log("SaveCrosshairImage initialized")
  const { CustomImages } = require('./main-process/CustomImages/index.js');
  console.log("CustomImages initialized")
  const { GameBarExtension } = require('./main-process/GameBarExtension/index.js');
  console.log("GameBarExtension initialized")

  console.log("Libraries imported")
  // Features outside of App Window Lifecycle
  ErrorHandling.configure();
  DataStore.configure();

  console.log("Error handling configured")
  app.on('child-process-gone', (event, details) => {
    console.log('child-process-gone', details);
    if (details && details.exitCode != 0 && details.exitCode != 1) {
      Sentry.captureMessage('child-process-gone');
    }
  })
  console.log("Child process gone configured")

  app.whenReady().then(() => setTimeout(() => {
    console.log("App ready")
    // protocol.registerFileProtocol('file', (request, callback) => {
    //   const pathname = decodeURI(request.url.replace('file:///', ''));
    //   console.log("Pathname: " + pathname);
    //   callback(pathname);
    // });

    ShareLinks.configureCustomLaunchProtocol();

    Sentry.setUser({id: DataStore.getStore().get("uuid")});

    // Initialize App Windows
    CrosshairWindow.inititializeWindow(() => {
      GameBarExtension.configure();

     SplashWindow.initializeWindow(() => {
        MenuWindow.initializeWindow(() => {
          
          Menu.setApplicationMenu(null);
          
          app.on('second-instance', (event, commandLine, workingDirectory) => {
            ShareLinks.configureAppFromCustomProtocol(commandLine)
            
            console.log("Second instance");

            // Someone tried to run a second instance, we should focus our window.
            try {
            if (MenuWindow.getWindow()) {
              MenuWindow.getWindow().show();
              if (MenuWindow.getWindow().isMinimized()) MenuWindow.getWindow().restore()
              MenuWindow.getWindow().focus();
            }
            } catch (e) {
              console.log(e);
            }
          })
    
          ShareLinks.configureAppFromCustomProtocol(process.argv)
      
          // Configures remaining features of the app
          DisplaySelection.configure();
          SaveCrosshair.configure();
          KeyboardShortcuts.configure();
          MouseEvents.configure();
          SteamReviewPopup.configure();
          DiscordIntegration.configure();
          AutoLaunch.configure();
          SaveCrosshairImage.configure();
          CustomImages.configure();

          // Every 30 seconds make sure the crosshair window is on top with a try catch
          setInterval(() => {
            try {
              CrosshairWindow.getWindow().setAlwaysOnTop(true, "screen-saver");
            } catch (e) {
              console.log("Error setting crosshair window on top")
            }
          }, 30000)
          

        });
      });
    });
  }, 500));

  console.log("App ready configured")

  app.on('open-url', (event, url) => {
    console.log("Open URL");
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      console.log("All windows closed, quitting")
      app.quit()
    }
  })
}

}