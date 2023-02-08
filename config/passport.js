import { Strategy, ExtractJwt } from "passport-jwt";
import { User } from "../model/userModel.js";

export function passportStrategy(passport) {
  const options = {
    usernameField: "email",
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };
  // The JWT payload is passed into the verify callback
  passport.use(
    new Strategy(options, function (jwt_payload, done) {
      // console.log(jwt_payload);

      //   We will assign the `sub` property on the JWT to the database ID of user
      User.findOne({ _id: jwt_payload.id }, function (err, user) {
        // This flow look familiar?  It is the same as when we implemented
        // the `passport-local` strategy
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
// export function checkAuthenticated(req, res, next) {
//   console.log(req.isAuthenticated());
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.redirect("/");
// }
