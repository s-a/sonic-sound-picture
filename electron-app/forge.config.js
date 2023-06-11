const path = require('path')
module.exports = {
  packagerConfig: {
    "icon": path.join(__dirname, "src", "images", "icon.ico")
  },

  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'sa',
          homepage: 'https://example.com'
        }
      }
    },

    {
      name: '@electron-forge/maker-dmg',
      config: {
        /* background: './assets/dmg-background.png', */
        format: 'ULFO'
      }
    },/* 
    {
      name: '@electron-forge/maker-zip'
    }, */
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        noMsi: true
      }
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.js',
              name: 'main_window',
              preload: {
                js: './src/preload.js',
              },
            },
          ],
        },
      },
    },
  ],
};
