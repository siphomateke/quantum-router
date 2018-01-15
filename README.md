# Quantum Router

A chrome extension that replaces the default Huawei router interface.

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

``` bash
# install dependencies
npm install

# watch .js and .vue files
npm run dev

# build for production with minification
npm run build
```

Once you have built the project, open the extensions page (chrome://extensions/) and then enable developer mode.

Press load unpacked extension and select the dist/ folder.

If you encounter any bugs, which you almost certainly will, please report them on the issues page.
