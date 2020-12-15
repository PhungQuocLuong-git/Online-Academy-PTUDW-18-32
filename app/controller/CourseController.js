const { create } = require("../models/Account");

module.exports = {
    list(req, res){
        res.render('courses/list',{
            script:'/public/javascripts/home.js'
        });
    },
    search(req, res){
        res.render('courses/search',{
            script:'/public/javascripts/home.js'
        });
    },
   
    create(req,res){
        // res.json({msg:'helo'});
        res.render('courses/create',{
            layout:false,
        })
    }
};

