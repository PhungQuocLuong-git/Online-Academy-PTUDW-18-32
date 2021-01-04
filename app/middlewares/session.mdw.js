const session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);

var store = new MongoDBStore({
  uri: 'mongodb+srv://dbUser2:dbUser2@cluster0.krhp6.mongodb.net/doanweb?retryWrites=true&w=majority',
  collection: 'session',
  databaseName: 'doanweb'
});

store.on('error', function(error) {
  console.log(error);
});

module.exports = function(app) {
    app.use(
        session({
          resave: false, // don't save session if unmodified
          saveUninitialized: false, // don't create session until something stored
          secret: "SECRET!",
          store:store
        })
    );
}

