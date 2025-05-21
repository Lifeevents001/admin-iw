const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/User");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "phone" }, // Login with phone number
      async (phone, password, done) => {
        try {
          const user = await User.findOne({ phone });
          if (!user) return done(null, false, { message: "User not found" });

          // Only allow admin users to log in
          if (!user.admin || user.admin <= 0) {
            return done(null, false, { message: "Access denied. Not an admin user." });
          }

          // Check if mobile number is verified before login
          if (!user.isVerified) {
            return done(null, false, { message: "Mobile number not verified. Complete OTP verification first." });
          }

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) return done(null, false, { message: "Incorrect password" });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
