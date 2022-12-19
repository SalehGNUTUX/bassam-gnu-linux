require('v8-compile-cache');
const { BrowserWindow, app, Tray, Menu, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs-extra');

let win,
    tray,
    contextMenu

function homeWindow() {
    win = new BrowserWindow({
        width: 1000,
        height: 600,
        show: false,
        center: true,
        title: 'بسّام',
        icon: path.join(__dirname, './build/logo.png'),
        webPreferences: {
            nodeIntegration: true,
            sandbox: false,
        }
    });

    win.removeMenu();

    win?.loadURL('https://bassam.social')

    win?.once('ready-to-show', () => {
        win?.show();
    });

    win?.on('closed', (event) => {

        event?.preventDefault();
        tray = null
        contextMenu = null
        win = null
        app?.quit()
    });

    contextMenu = Menu.buildFromTemplate([
        {
            label: 'عرض التطبيق', click: function () {
                win?.isVisible() ? win?.hide() : win?.show()
            }
        },
        {
            label: 'إغلاق', click: function () {
                if (win !== null) {
                    win?.close();
                }
                else if (win === null) homeWindow()
                app.isQuiting = true;
                app?.quit();
            }
        }
    ]);

    tray = new Tray(path.join(__dirname, './build/logo.png'));
    tray?.setContextMenu(contextMenu);
    tray?.setToolTip("بسّام");
    globalShortcut?.register('Ctrl+shift+B', () => {

        if (win?.isVisible()) {
            win?.hide()
        }
        else {
            win?.show()
        }

    });

    app?.on('before-quit', function () {
        tray?.destroy();
    });
}

app.on('ready', (e) => {

    e.preventDefault();
    let homePath = app?.getPath('home');
    let desktop = fs.existsSync(`${homePath}/.config/autostart/bassam-social.desktop`);

    if (desktop === false && process.platform === 'linux') {

        let data = `[Desktop Entry]
Name= bassam-social
Icon=org.bassam.social
Exec= bassam-social
Terminal=false
Type=Application
Comment=Bassam Social Desktop Application
Categories=Social;`

        fs.writeFileSync(`${homePath}/.config/autostart/bassam-social.desktop`, data);
    }
    homeWindow()
    app.setAppUserModelId("org.bassam.social");

});

app.setLoginItemSettings({
    openAtLogin: true,
    path: path.join(process.resourcesPath, '../bassam-social.exe'),
    args: ['--hidden']
});