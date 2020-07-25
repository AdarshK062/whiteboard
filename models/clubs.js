const mongoose = require('mongoose');
const companyNames = mongoose.Schema({
    name: {type: String, default: ''},
    country: {type: String, default: ''},
    city:{type: String, default:''},
    image: {type: String, default: 'default.png'}
});
module.exports = mongoose.model('Company', companyNames);