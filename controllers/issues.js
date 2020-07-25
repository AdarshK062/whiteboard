module.exports = function(Users, async, Message, FriendResult, Solution, Issue){
    return {
        SetRouting: function(router){
            router.get('/group/issues/:name', this.groupIssuePage);
            router.post('/group/issues/:name', this.groupIssuePostPage);
        },
        
        groupIssuePage: function(req, res){
            const name = req.params.name;
            var resu = name.split("*");
            const group=resu[0].replace(/`7`/g," ");
            const issue=resu[1].replace(/`7`/g," ");
            async.parallel([

                function(callback){
                    Users.findOne({'username': req.user.username})
                        .populate('request.userId')
                        .exec((err, result) => {
                            callback(err, result);
                        })
                },
                
                function(callback){
                    const nameRegex = new RegExp("^" + req.user.username.toLowerCase(), "i")
                    Message.aggregate([
                        {$match:{$or:[{"senderName":nameRegex}, {"receiverName":nameRegex}]}},
                        {$sort:{"createdAt":-1}},
                        {
                            $group:{"_id":{
                                "last_message_between":{
                                    $cond:[
                                        {
                                            $gt:[
                                            {$substr:["$senderName",0,1]},
                                            {$substr:["$receiverName",0,1]}]
                                        },
                                        {$concat:["$senderName"," and ","$receiverName"]},
                                        {$concat:["$receiverName"," and ","$senderName"]}
                                    ]
                                }
                                },
                                "body": {$first:"$$ROOT"}
                            }
                        }, 
                    ]).exec(function(err, newResult){
                        const arr = [
                        {path: 'body.sender', model: 'User'},
                        {path: 'body.receiver', model: 'User'}
                        ];                    
                        Message.populate(newResult, arr, (err, newResult1) => {
                            callback(err, newResult1);
                        });
                    })
                },
                
                function(callback){
                    Solution.find({'issue': issue,'group':group})
                        .sort({"createdAt":1})
                        .exec((err, result) => {
                            callback(err, result);
                        })
                },

                function(callback){
                    Issue.findOne({'issue': issue,'group':group})
                        .exec((err, result) => {
                            callback(err,result);
                        })
                },

                function(callback){
                    Issue.find({'group':group, 'issue': {$ne: issue}})
                        .exec((err, result) => {
                            callback(err,result);
                        })
                }

            ], (err, results) => {
                const result1 = results[0];
                const result2 = results[1];
                const result3 = results[2];
                const result4 = results[3];
                const result5 = results[4];
                res.render('groupchat/issues', {title: 'WhiteBoard - Issues',user:req.user, groupName:group, data: result1, issue: issue ,issueData:result4, otherIssues:result5, chat: result2,solution: result3,issuename:name});
            });
        },
        
        groupIssuePostPage: function(req, res){
            const name = req.params.name;
            var resu = name.split("*");
            const group=resu[0].replace(/`7`/g," ");
            const issue=resu[1].replace(/`7`/g," ");
            FriendResult.PostRequest(req, res, '/group/issues/'+req.params.name);
            async.parallel([

                function(callback){
                    if(req.body.solution){
                        const sol = new Solution();
                        sol.solverId = req.user._id;
                        sol.issue=issue;
                        sol.group=group;
                        sol.solverName = req.user.username;
                        sol.solution = req.body.solution;
                        sol.solverImage = req.user.userImage;
                        sol.createdAt = new Date();
                        sol.save((err, msg) => {
                             callback(err, msg);
                         })
                    }
                }
            ], (err, results) => {
                res.redirect('/group/'+group);
            });
        }
    }
}