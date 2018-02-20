# Quantum Router

An extension that replaces the default Huawei router interface.

### Important: This project is still very young. As of yet there are no releases.

The default UI on a Huawei router is outdated and difficult to use;

![Screenshot of MTN router interface](img/mtn_router.png?raw=true)

This extension aims to offer a sleeker and more modern alternative UI to the router while adding some new features;

![Screenshot of QuantumRouter interface](img/quantum_router.png?raw=true)

![Screenshot of QuantumRouter USSD page](img/quantum_router_ussd.png?raw=true)

![Screenshot of QuantumRouter homepage](img/quantum_router_graph.png?raw=true)

## Features

- Manage SMS messages
- Send USSD commands
- Graph usage data (basic)

## Planned New Features

- Smart SMS analysis. E.g. automatic advert deletion
- Task automation
- Sync usage data with other computers
- Live native notifications

## Notable Missing Features

- Change settings
- Sending SMS messages
- Statistics

## Build Setup

Until I publish `huawei-router-api` to NPM, building this is a bit of a pain. You will need to download [huawei-router-api](https://github.com/nextgensparx/huawei-router-api/) and add it as a dependency;

```bash
npm i /path/to/huawei-router-api
```

``` bash
# install dependencies
npm install

# watch .js and .vue files
npm run dev # firefox, edge
npm run dev-chrome # chrome, opera

# build for production with minification
npm run build # firefox, edge
npm run build-chrome # chrome, opera
```

To use in Chrome: open `chrome://extensions`, enable developer mode, press load unpacked extension and select `dist/manifest.json`.

To use in Firefox: generate a random GUID and add the following to `static/browser-manifest.json`:
```json
"applications": {
  "gecko": {
    "id": "{YOUR_GUID}"
  }
},
```
Then open `about:debugging`, press load temporary addon and select `dist/manifest.json`.

If you encounter any bugs, which you almost certainly will, please report them on the issues page.
