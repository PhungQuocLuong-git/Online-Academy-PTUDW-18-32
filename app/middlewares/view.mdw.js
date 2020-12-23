const exphbs = require('express-handlebars');

module.exports = function (app) {
    app.engine('hbs', exphbs({
        defaultLayout: 'main.hbs',
        extname: '.hbs',
        helpers: require('../../heleprs/handlebars')
    }));
    app.set('view engine', 'hbs');

}