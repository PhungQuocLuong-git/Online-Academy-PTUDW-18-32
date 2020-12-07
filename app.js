const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');



const exphbs = require('express-handlebars');

var app = express();

const db = require('./config/db');

// Connect to DB
db.connect();

// view engine setup
app.engine('hbs', exphbs({
  extname: '.hbs'
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


// Session
app.use(
  session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: "Dam Linh",
  })
);


// Routes
// const usersRouter = require('./routes/users');
const siteRouter = require('./routes/site');
// const meRouter = require('./routes/me');
const accountRouter = require('./routes/account');
// const coursesRouter = require('./routes/courses');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', siteRouter);
// app.use('/home', siteRouter);
app.use('/account', accountRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.get('/home', (req, res) => {
  res.render('home');

})

module.exports = app;
