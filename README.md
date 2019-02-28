# Quantum Router

An app that replaces the default Huawei router interface.

### Important: This project is still very young. As of yet there are no releases.

The default UI on a Huawei router is outdated and difficult to use;

![Screenshot of MTN router interface](img/mtn_router.png?raw=true)

This app aims to offer a sleeker and more modern alternative UI to the router while adding some new features;

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
- Statistics

## Building

Until I publish `huawei-router-api` to NPM, building this is a bit of a pain. You will need to download [huawei-router-api](https://github.com/nextgensparx/huawei-router-api/) and add it as a dependency;

```json
// package.json
"huawei-router-api": "link:/path/to/huawei-router-api"
```

Alternatively, download [huawei-router-api]([huawei-router-api](https://github.com/nextgensparx/huawei-router-api/)), then run `yarn link` in huawei-router-api and `yarn link "huawei-router-api"` in this repository.

### Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve:electron
```

### Compiles and minifies for production
```
yarn build:electron
```

### Lints and fixes files
```
yarn lint
```

If you encounter any bugs, which you almost certainly will, please report them on the issues page.
