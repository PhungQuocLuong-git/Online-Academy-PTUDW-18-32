const exphbs = require('express-handlebars');

module.exports = function (app) {
    app.engine('hbs', exphbs({
        defaultLayout: 'main.hbs',
        extname: '.hbs',
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true
          },
        helpers: require('../../heleprs/handlebars')
    }));
    app.set('view engine', 'hbs');
    
    

}