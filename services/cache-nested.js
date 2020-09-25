const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util')

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget)
const exec = mongoose.Query.prototype.exec;

// use it when you want to cache a query and it is only valid for that query
// options is for the top level key of nested mapping (hash)
mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  return this;
}

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return exec.apply(this, arguments)
  }


  const key = JSON.stringify(Object.assign({}, this.getQuery,  {
    collection: this.mongooseCollection.name
  }))
  const cachedValue = await client.hget(this.hashKey, key)
  if (cachedValue) {
    //return cached value
    console.log('RETURN CACHED VALUE')
    const doc = JSON.parse(cachedValue)
    return Array.isArray(doc)
    ? doc.map(d => new this.model(d))
    : new this.model(doc)
    // the following works as well
    // return cachedValue
  }

  console.log('I CACHE QUERY');
  const result = await exec.apply(this, arguments)

  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10)
  return result
}

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey))
  }
}
