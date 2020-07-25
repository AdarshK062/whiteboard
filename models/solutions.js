const mongoose = require('mongoose');
var solutionSchema = mongoose.Schema({
    solverId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},  
    solverName: {type: String, default: ''},
    solverImage: {type: String, default: 'default.png'},
    solution: {type: String, default:''},
    createdAt: {type: Date, default: Date.now},
    issue: {type: String, default: ''},
    group: {type: String, default: ''},
});
module.exports= mongoose.model('Solution', solutionSchema);