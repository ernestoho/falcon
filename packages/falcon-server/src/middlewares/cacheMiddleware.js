const Logger = require('@deity/falcon-logger');
const GraphQLCacheDirective = require('../schemaDirectives/GraphQLCacheDirective');

/**
 * @typedef {object} CacheTagEntry
 * @property {string} type Entity Type
 * @property {string} id Entity ID
 */

/**
 * Cache middleware for handling web-hooks to flush the cache by tags
 * @param {import('@deity/falcon-server-env').Cache} cache Cache component
 * @return {import('koa').Middleware} Koa middleware callback
 */
const cacheMiddleware = cache => async ctx => {
  /** @type {Array<CacheTagEntry>} List of posted cache tag entries to invalidate */
  const requestTags = ctx.request.body;
  if (ctx.request.get('content-type') !== 'application/json') {
    throw new Error('Invalid Content-Type, must be "application/json"');
  }
  if (!Array.isArray(requestTags)) {
    throw new Error('Invalid POST data');
  }

  /** @type {Array<string>} List of cache tags */
  const tags = requestTags
    .map(({ id, type }) => (id && type ? GraphQLCacheDirective.generateTagNames(type, id) : type))
    .filter(value => value);

  Logger.debug(`Flushing cache tags: ${tags.join(', ')}`);
  await cache.delete(tags);
  ctx.body = 'ok';
};

module.exports = cacheMiddleware;
