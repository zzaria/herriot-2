const { app, BrowserWindow, BrowserView,ipcMain  } = require('electron');
const path = require('path')
//const { exec } = require('node:child_process');
//exec('node .output/server/index.mjs');

function createWindow() {
    let appWindow = new BrowserWindow({
        minWidth: 350,
        icon: path.join(__dirname, '/assets/icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    ipcMain.handle('ping', () => 'pong');

    const view = new BrowserView();
    ipcMain.on('problemBrowserView',(e,problemLink)=>{
        appWindow.addBrowserView(view);
        const size=appWindow.getContentBounds();
        view.webContents.on("did-finish-load", () => view.setBounds({ x: 100, y: 100, width:Math.round(size.width*0.4), height: Math.round(size.height*0.8)}))
        view.setBackgroundColor('#rgba(0,0,0,0.5)');
        view.setAutoResize({horizontal:true,vertical:true});
        console.log(problemLink,size);
        view.webContents.loadURL(problemLink);
    });
    ipcMain.on('closeBrowserView',()=>{
        appWindow.setBrowserView(null);
    });

    //appWindow.loadURL('http://localhost:3000');
    appWindow.loadURL('https://herriot.tk');


    appWindow.once('ready-to-show', () => {
        appWindow.maximize();
    })
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})