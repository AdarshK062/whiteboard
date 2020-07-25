const mongoose = require('mongoose');
var groupMessage = mongoose.Schema({
    message: {type: String},
    body: {type: String},
    name: {type: String},
    sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    createdAt: {type: Date, default: Date.now}
});
module.exports= mongoose.model('GroupMessage', groupMessage);