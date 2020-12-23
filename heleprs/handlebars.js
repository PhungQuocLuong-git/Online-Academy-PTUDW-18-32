const hbs_sections = require('express-handlebars-sections');
const numeral = require('numeral');


module.exports = {
    sum: (a,b) => a + b,
    ifcond(v1, v2, options) {
        if(v1 === v2) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      section: hbs_sections(),
      format(val) {
          return numeral(val).format('0,0');
      }
}