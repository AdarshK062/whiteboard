module.exports = function(async, Company, _, Users, Message, FriendResult){
    return {
        SetRouting: function(router){
            router.get('/home', this.homePage);
            router.post('/home', this.postHomePage);
            router.get('/logout', this.logout);
        },
        
        homePage: function(req, res){
            async.parallel([

                function(callback){
                    Company.find({}, (err, result) => {
                        callback(err, result);
                    });
                },
                
                function(callback){
                    Company.aggregate([{
                        $group: {
                            _id: "$country"
                        }
                    }], (err, newResult) => {
                       callback(err, newResult) ;
                    });
                },
                
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
                        }

                    ]).exec(function(err, newResult){
                            const arr = [
                                {path: 'body.sender', model: 'User'},
                                {path: 'body.receiver', model: 'User'}
                                ];    
                            Message.populate(newResult, arr, (err, newResult1) => {
                                callback(err, newResult1);
                            });                    
                        })
                }
                
            ], (err, results) => {
                    const res1 = results[0];
                    const res2 = results[1];
                    const res3 = results[2];
                    const res4 = results[3];
                    const dataChunk  = [];
                    const chunkSize = 3;
                    for (let i = 0; i < res1.length; i += chunkSize){
                        dataChunk.push(res1.slice(i, i+chunkSize));
                    }
                    const classSort = _.sortBy(res2, '_id');
                    res.render('home', {title: 'WhiteBoard - Home', user:req.user, chunks: dataChunk, country: classSort, data:res3, chat:res4});// chunks: dataChunk, country: countrySort, data:res3, chat:res4});
                });
        },

        postHomePage: function(req, res){
            async.parallel([
                function(callback){
                    Company.update({
                        '_id':req.body.id,
                        'members.username': {$ne: req.user.username}
                        },
                        {
                            $push: {members: {
                                username: req.user.username,
                                email: req.user.email
                            }}
                        }, 
                        (err, count) => {
                            callback(err, count);
                        });
                },
               
            ], 
            (err, results) => {
                res.redirect('/home');
            });
            FriendResult.PostRequest(req, res, '/home');
        },
        
        logout: function(req, res){
            req.logout();
            req.session.destroy((err) => {
               res.redirect('/');
            });
        }
    }
}