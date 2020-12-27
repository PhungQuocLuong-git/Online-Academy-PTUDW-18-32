const hbs_sections = require('express-handlebars-sections');
const numeral = require('numeral');
const { mongooseToObject } = require('../util/mongoose');
const Course = require('../app/models/Course');


// const mongooseToObject = require('../util/mongoose')

module.exports = {
    sum: (a,b) => a + b,
    ifequal(v1, v2, options) {
        if(v1 === v2) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      ifgreater(v1, v2, options) {
        if(v1 > v2) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      section: hbs_sections(),
      format(val) {
          return numeral(val).format('0,0');
      },
    mon: (col,ind,field) => col[ind].course_id[field],
    mon2: (col,field) => col.course_id[field],
    dateFormat: (date) => {
      options = {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour12: false,
        timeZone: 'America/Los_Angeles'
      };
      return new Intl.DateTimeFormat('en-GB', options).format(date);
    }
}