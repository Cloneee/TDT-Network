const passport = require('passport')
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser((user, done) => {
    done(null, user)
})

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    done(null, profile)
}
));
