const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

function configurePassport(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value.toLowerCase() : null;
          const googleId = profile.id;
          const profilePicture =
            profile.photos && profile.photos[0] && profile.photos[0].value ? profile.photos[0].value : '';

          if (!email) {
            return done(new Error('Google account did not provide an email.'), null);
          }

          let user = await User.findOne({ $or: [{ googleId }, { email }] });

          if (!user) {
            user = await User.create({
              email,
              googleId,
              profilePicture,
              progress: {}
            });
          } else {
            user.googleId = user.googleId || googleId;
            user.profilePicture = profilePicture || user.profilePicture;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

module.exports = configurePassport;
