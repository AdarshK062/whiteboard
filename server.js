const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const http = require('http');
const container = require('./container');
const cookieParser = require('cookie-parser');
const validator = require('express-validator');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const socketIO = require('socket.io');
const {Users} = require('./helpers/UsersClass');
const {Global} = require('./helpers/Global');
const compression = require('compression');
const helmet = require('helmet');

container.resolve(function(users, _, admin, home, group, results, privatechat, profile, issues){
    mongoose.Promise = global.Promise;
    //mongoose.connect('mongodb://localhost/whiteboard');
    mongoose.connect("mongodb+srv://test:adarsh123abc@whiteboard-btzns.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true });
    // mongoose.connect("mongodb://test:adarsh123abc@main-shard-00-00-03xkr.mongodb.net:27017,main-shard-00-01-03xkr.mongodb.net:27017,main-shard-00-02-03xkr.mongodb.net:27017/main?ssl=true&replicaSet=Main-shard-0&authSource=admin&retryWrites=true", { useNewUrlParser: true });
    const app= SetupExpress();

    function SetupExpress(){
        const app = express();
        const server = http.createServer(app);
        const io = socketIO(server);
        server.listen(process.env.PORT || 7090, function(){
            console.log('Listening on port 7090');
        });
        ConfigureExpress(app);

        require('./socket/groupchat')(io, Users);
        require('./socket/friend')(io);
        require('./socket/globalroom')(io, Global, _);
        require('./socket/privatemessage')(io);
        require('./socket/issues')(io);
        
        const router = require('express-promise-router')();
        users.SetRouting(router);
        admin.SetRouting(router);
        home.SetRouting(router);
        group.SetRouting(router);
        results.SetRouting(router);
        privatechat.SetRouting(router);
        profile.SetRouting(router);
        issues.SetRouting(router);

        app.use(router);
        app.use(function(req, res){
            res.render('404');
        });
    }
    
    function ConfigureExpress(app){
        app.use(compression());
        app.use(helmet());
        require('./passport/passport-local');
        app.use(express.static('public'));
        app.use(cookieParser());
        app.set('view engine','ejs');
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(validator());
        app.use(session({
            secret:'thisissecret',
            resave: true,
            saveUninitialized: true,
            store: new MongoStore({mongooseConnection: mongoose.connection})
        }));
        app.use(flash());
        app.use(passport.initialize());
        app.use(passport.session());
        app.locals._ =_;
    }
});