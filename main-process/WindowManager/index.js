const { BrowserWindow } = require('electron');

// Create a wins singleton to track windows against
const wins = {};

// Wrapper for electrons own window create
const registerWin = (opts, type) => {
  // Create a new browser window with normal electron opts
  const win = new BrowserWindow(opts);

  // Set the window in the singleton
  wins[type] = win;

  // Event listen for window close and clear the singleton
  win.on('closed', () => {
    wins[type] = null;
  });

  // Return the window and its ID
  return { win, type };
};

const getWin = type => wins[type];
const killWin = type => wins[type].close();
const purgeCache = async type => new Promise(resolve =>
  wins[type].webContents.session.clearStorageData({}, () => {
    console.log(`Cleared cache for ${type}`);
    resolve();
  }));

module.exports = {
  registerWin, getWin, killWin, purgeCache,
};