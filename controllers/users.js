'use strict';
module.exports = function(_, passport, User){
    return {
        SetRouting: function(router){
            router.get('/', this.getIndexPage);
            router.get('/signup', this.getSignUp);
            router.post('/', User.LoginValidation, this.postLogin);
            router.post('/signup', User.SignUpValidation, this.postSignUp);
        },

        getIndexPage: function(req, res){
            const errors = req.flash('error');
            return res.render('index', {title: 'WhiteBoard | Login', messages: errors, hasErrors: errors.length > 0});
        },

        postLogin: passport.authenticate('local.login', {
            successRedirect: '/home',
            failureRedirect: '/',
            failureFlash: true
        }),

        getSignUp: function(req, res){
            const errors = req.flash('error');
            return res.render('signup', {title: 'WhiteBoard | SignUp', messages: errors, hasErrors: errors.length > 0});
        },

        postSignUp: passport.authenticate('local.signup', {
            successRedirect: '/home',
            failureRedirect: '/signup',
            failureFlash: true
        }),
    }
}