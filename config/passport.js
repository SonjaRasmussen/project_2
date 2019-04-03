var LocalStrategy = require("passport-local").Strategy;

var db = require("../models");

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.uuid);
  });

  passport.deserializeUser(function(uuid, done) {
    db.User.findById(uuid).then(function(user) {
      if (user) {
        done(null, user.get());
      } else {
        done(user.errors, null);
      }
    });
  });

  //Register for an account
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "username",
        emailField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      function(req, email, password, done) {
        process.nextTick(function() {
          db.User.findOne({
            where: {
              email: email
            }
          }).then(function(user, err) {
            if (err) {
              console.log("err", err);
              return done(err);
            }
            if (user) {
              console.log(
                "signupMessage",
                "Sorry... that username is already taken."
              );
              return done(
                null,
                false,
                req.flash(
                  "signupMessage",
                  "Sorry... that username is already taken."
                )
              );
            } else {
              db.User.create({
                username: req.body.username,
                email: req.body.email,
                password: db.User.generateHash(password)
              })
                .then(function(dbUser) {
                  return done(null, dbUser);
                })
                .catch(function(err) {
                  console.log(err);
                });
            }
          });
        });
      }
    )
  );

  //log in to your account
  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      function(req, email, password, done) {
        db.User.findOne({
          where: {
            username: req.body.email
          }
        }).then(function(user, err) {
          if (!user) {
            console.log("no user found");
            return done(
              null,
              false,
              req.flash(
                "loginMessage",
                "It looks like that email doesn't exist!"
              )
            );
          }
          if (user && !user.validPassword(req.body.password)) {
            return done(
              null,
              false,
              req.flash("loginMessage", "Oops! Wrong password.")
            );
          }
          return done(null, user);
        });
      }
    )
  );
};