const hbs_sections = require('express-handlebars-sections');
const numeral = require('numeral');
// const { mongooseToObject } = require('../util/mongoose');
const Course = require('../app/models/Course');
var Handlebars=require('handlebars');
var paginate = require('handlebars-paginate');
 
Handlebars.registerHelper('paginate', paginate);

// const mongooseToObject = require('../util/mongoose')

module.exports = {
  sum: (a, b) => a + b,
  ifequal(v1, v2, options) {
    if (v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  ifgreater(v1, v2, options) {
    if (v1 > v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  section: hbs_sections(),
  format(val) {
    return numeral(val).format('0,0');
  },
  mon: (col, ind, field) => col[ind].course_id[field],
  mon2: (col, field) => col.course_id[field],
  dateFormat: (date) => {
    options = {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour12: false,
      timeZone: 'America/Los_Angeles'
    };
    return new Intl.DateTimeFormat('en-GB', options).format(date);
  },
  ifCond(v1,operator,v2,options) {
    switch (operator) {
      case '==':
          return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '!=':
          return (v1 != v2) ? options.fn(this) : options.inverse(this);
      case '!==':
          return (v1 !== v2) ? options.fn(this) : options.inverse(this);
      case '<':
          return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=':
          return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>':
          return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=':
          return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      case '&&':
          return (v1 && v2) ? options.fn(this) : options.inverse(this);
      case '||':
          return (v1 || v2) ? options.fn(this) : options.inverse(this);
      default:
          return options.inverse(this);
  }
  },
  paginate: paginate,
  
}