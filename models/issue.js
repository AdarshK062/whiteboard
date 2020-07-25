const mongoose = require('mongoose');
var issueSchema = mongoose.Schema({
    group: {type: String},
    issue: {type: String},
    victim: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    victimName: {type: String},
    victimImage: {type: String, default: 'default.png'},
    createdAt: {type: Date, default: Date.now}
});
module.exports= mongoose.model('Issue', issueSchema);