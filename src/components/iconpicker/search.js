/**
 * @typedef Icon
 * @property {string} name Human readable name
 * @property {string} id Unique code identifying this icon
 * @property {string} unicode
 * @property {string} created Version that this icon was added in
 * @property {string[]} filter Aliases of this icon used when filtering
 * @property {string[]} categories Categories this icon belongs to
 */

/**
 * @typedef {Icon[]} IconPack
 */

/**
 * @typedef {Object} IconSearchOptions
 * @property {string[]} [props] Icon properties to check when searching
 */

/**
 * @typedef {string} CacheId
 * Unique cache identifier for this search. Typically contains icon pack ID.
 */

const searchProps = ['id', 'name', 'filter', 'categories'];

/**
 * Creates an easily searchable string containing icon metadata for each icon.
 * @param {Icon[]} icons
 * @param {IconSearchOptions} options
 * @returns {string[]} Array of lowercase strings containing metadata of each icon
 */
function generateIconSearchIndex(icons, options) {
  options = Object.assign({
    props: searchProps,
  }, options);
  return icons.map((icon) => {
    let toSearch = [];
    for (const prop of options.props) {
      if (icon[prop]) {
        if (typeof icon[prop] === 'string') {
          toSearch.push(icon[prop]);
        } else if (Array.isArray(icon[prop])) {
          toSearch = toSearch.concat(icon[prop]);
        }
      }
    }
    return toSearch.join('|').toLowerCase();
  });
}

const iconSearchIndex = {};
/**
 * Generates an icon search index or retrieves one from the cache based on the passed parameters.
 * @param {CacheId} cacheId
 * @param {Icon[]} icons
 * @param {boolean} fresh Whether to force re-generating the search index
 * @param {IconSearchOptions} options
 */
function getIconSearchIndex(cacheId, icons, fresh, options) {
  if (iconSearchIndex[cacheId] && !fresh) {
    return iconSearchIndex[cacheId];
  }

  const index = generateIconSearchIndex(icons, options);
  iconSearchIndex[cacheId] = index;
  return index;
}

/**
 * Creates a cache ID from an icon pack ID and {@link IconSearchOptions}
 * @param {Object} options
 * @param {string} options.iconPackId
 * @param {IconSearchOptions} [options.options={}]
 * @returns {CacheId}
 */
export function generateCacheId({ iconPackId, options = {} }) {
  let id = iconPackId;
  if (options.props) {
    id += JSON.stringify(options.props);
  }
  return id;
}

/**
 * Forcibly re-generates the icon search index.
 * This should only be called when the icon packs are changed.
 * @param {CacheId} cacheId
 * @param {Icon[]} icons
 * @param {IconSearchOptions} options
 */
export function refreshIconSearchIndex(cacheId, icons, options) {
  return getIconSearchIndex(cacheId, icons, true, options);
}

/**
 * Searches a list of icons using a search query.
 * @param {CacheId} cacheId
 * @param {Icon[]} icons
 * @param {string} query Lowercase search text
 * @param {IconSearchOptions} [options]
 */
export function searchIcons(cacheId, icons, query, options) {
  const iconSearchIndex = getIconSearchIndex(cacheId, icons, false, options);
  return icons.filter((icon, i) => iconSearchIndex[i].includes(query));
}
