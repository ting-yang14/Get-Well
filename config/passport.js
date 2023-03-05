import { Strategy, ExtractJwt } from "passport-jwt";
import { User } from "../model/userModel.js";

export function passportStrategy(passport) {
  const options = {
    usernameField: "email",
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };
  passport.use(
    new Strategy(options, function (jwt_payload, done) {
      User.findOne({ _id: jwt_payload.id }, function (err, user) {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user.id);
        } else {
          return done(null, false);
        }
      });
    })
  );
}
