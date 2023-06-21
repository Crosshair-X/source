const convertToWindowsStore = require('electron-windows-store');
const electronWindowsStoreUtils = require('electron-windows-store/lib/utils');
var fs = require('fs');
var path = require('path');

const windowsKitPath = `C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.18362.0\\x64`;
// This is how electron-windows-store seems to behave
const appxPath = path.join(__dirname, '../../../output' ,'CrosshairX.appx');

const APPXBUNDLE_FILEPATH = '.\\CrosshairX.appxbundle';

const TMP_APPXBUNDLE_MAP_FILEPATH = path.join(__dirname,'AppxBundle.map');

// https://docs.microsoft.com/en-us/windows/msix/package/create-app-package-with-makeappx-tool#mapping-files
fs.writeFileSync(TMP_APPXBUNDLE_MAP_FILEPATH, [
    '[Files]',
    `"${appxPath}" "CrosshairX.appx"`,  // Note: the filename within the .appxbundle seems to be unimportant?
    ].join("\n"));

// This makes an unsigned bundle ...

(async () => {const makeappx = path.join(windowsKitPath, 'makeappx.exe');
await electronWindowsStoreUtils.executeChildProcess(makeappx, 
    ['bundle', '/f', TMP_APPXBUNDLE_MAP_FILEPATH, '/p', APPXBUNDLE_FILEPATH, '/o']);

// ... so we have to sign it with:
const signtool = path.join(windowsKitPath, 'signtool.exe');
await electronWindowsStoreUtils.executeChildProcess(signtool, 
    ['sign', '-f', 'C:\\Users\\Jurko\\AppData\\Roaming\\electron-windows-store\\747CF5E3-AC1C-4505-8387-083BCE1B82DC\\747CF5E3-AC1C-4505-8387-083BCE1B82DC.pfx', '-p', '', '-fd', 'SHA256', '-v', APPXBUNDLE_FILEPATH]);})();