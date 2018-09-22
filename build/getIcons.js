const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const yaml = require('js-yaml');

function saveAsJson(id, data) {
  return new Promise((resolve, reject) => {
    // TODO: Output the generated icon meta data files to a better location
    fs.writeFile(path.join(__dirname, `${id}-icons.json`), JSON.stringify(data), (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function convertMaterialDesignIcons(icons) {
  return icons.map((icon) => {
      return {
        name: icon.name,
        id: icon.name,
        unicode: icon.codepoint,
        created: icon.version,
        filter: icon.aliases,
        categories: icon.tags,
      };
  });
}

async function getMaterialDesignIcons() {
  // TODO: Get MDI version from package.json
  const mdiVersion = '2.7.94';
  console.log('Downloading Material Design Community icons...');
  const res = await fetch(`http://cdn.materialdesignicons.com/${mdiVersion}/meta.json`);
  const json = await res.json();
  return convertMaterialDesignIcons(json);
}

async function getFontAwesomeIcons() {
  console.log('Downloading FontAwesome icons...');
  const res = await fetch(`https://raw.githubusercontent.com/FortAwesome/Font-Awesome/v4.7.0/src/icons.yml`);
  const body = await res.text();
  return yaml.safeLoad(body).icons;
}

async function createIconFiles() {
  saveAsJson('fa', await getFontAwesomeIcons());
  saveAsJson('mdi', await getMaterialDesignIcons());
  console.log('Finished downloading all icons.');
}

createIconFiles();
