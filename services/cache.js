const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys')

const redisUrl = keys.redisUrl;
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get)
const exec = mongoose.Query.prototype.exec;

// use it when you want to cache a query and it is only valid for that query
mongoose.Query.prototype.cache = function() {
  this.useCache = true;
  return this;
}

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return exec.apply(this, arguments)
  }

  console.log('I AM ABOUT TO CACHE QUERY');
  const key = JSON.stringify(Object.assign({}, this.getQuery,  {
    collection: this.mongooseCollection.name
  }))
  const cachedValue = await client.get(key)
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

  const result = await exec.apply(this, arguments)

  client.set(key, JSON.stringify(result), 'EX', 10)
  return result
}
