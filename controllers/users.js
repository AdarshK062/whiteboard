'use strict';

module.exports = function(_, passport, User){

    return {
        SetRouting: function(router){
            router.get('/', this.getIndexPage);
            router.get('/signup', this.getSignUp);
            router.get('/auth/facebook', this.getFacebookLogin);
            router.get('/auth/facebook/callback',this.facebookLogin);
            router.get('/auth/google', this.getGoogleLogin);
            router.get('/auth/google/callback', this.googleLogin);
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
        /*}, (req, res) => {
            const err = validator.validationResult(req);
            //console.log('error');*/
        }),

        getFacebookLogin: passport.authenticate('facebook',{
            scope: 'email'
        }),

        getGoogleLogin: passport.authenticate('google', {
           //scope: 'email'
            scope: ['https://www.googleapis.com/auth/plus.me', 'https://www.googleapis.com/auth/userinfo.email',]
        }),
        googleLogin: passport.authenticate('google', {
            successRedirect: '/home',
            failureRedirect: '/signup',
            failureFlash: true
        }),
        facebookLogin:passport.authenticate('facebook', {
            successRedirect: '/home',
            failureRedirect: '/signup',
            failureFlash: true
        })
    }
}