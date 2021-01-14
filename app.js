const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
require('express-async-errors');


var app = express();
const db = require('./config/db');

// Connect to DB
db.connect();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'));


// Session
require('./app/middlewares/session.mdw')(app);
// view engine setup
require('./app/middlewares/view.mdw')(app);
// Routes
require('./routes')(app);


module.exports = app;
