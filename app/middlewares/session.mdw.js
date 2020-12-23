const session = require('express-session');

module.exports = function(app) {
    app.use(
        session({
          resave: false, // don't save session if unmodified
          saveUninitialized: false, // don't create session until something stored
          secret: "SECRET!",
        })
    );
}