// the default is 5 seconds to run a test, ended that time
// it throws error and stop the test
jest.setTimeout(30000)

require('../models/User')

const mongoose = require('mongoose')
const keys = require('../config/keys')

mongoose.Promise = global.Promise
mongoose.connect(keys.mongoURI, { useMongoClient: true })
