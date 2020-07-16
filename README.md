# Quantum Router

An app that replaces the default Huawei router interface.

The default UI on a Huawei router is outdated and difficult to use;

![Screenshot of MTN router interface](img/mtn_router.png?raw=true)

This app aims to offer a sleeker and more modern alternative UI to the router while adding some new features;

![Screenshot of Quantum Router settings page](img/quantum_router_settings.png?raw=true)
Router settings page

![Screenshot of Quantum Router USSD page](img/quantum_router_sms.png?raw=true)
SMS manager. Supports sending, filtering and automatic labelling of messages as well as native notifications.

![Screenshot of Quantum Router USSD page](img/quantum_router_services2.png?raw=true)
USSD services page. Allows the user to query network carrier services over USSD and automatically parses the responses to create a form-based interface.

![Screenshot of Quantum Router homepage](img/quantum_router_home.png?raw=true)
Homepage showing real-time data usage

## Features

- Manage SMS messages
- Send USSD commands
- Graph usage data (basic)
- Real-time SMS notifications

## Planned New Features

- Smart SMS analysis. E.g. automatic advert deletion
- Task automation
- Sync usage data with other computers

## Notable Missing Features

- Change all router settings
- Detailed statistics

## Building

Until I publish `huawei-router-api` to NPM, building this is a bit of a pain. You will need to download [huawei-router-api](https://github.com/nextgensparx/huawei-router-api/) and add it as a dependency;

```json
// package.json
"huawei-router-api": "link:/path/to/huawei-router-api"
```

Alternatively, download [huawei-router-api]([huawei-router-api](https://github.com/nextgensparx/huawei-router-api/)), then run `yarn link` in huawei-router-api and `yarn link "huawei-router-api"` in this repository.

### Project setup

```bash
yarn install
```

### Compiles and hot-reloads for development

```bash
yarn serve
```

### Compiles and minifies for production

```bash
# Build for current platform
yarn build
# Build for specific platforms
yarn build --mac --windows --linux
```

### Lints and fixes files

```bash
yarn lint
```

If you encounter any bugs, which you almost certainly will, please report them on the issues page.
