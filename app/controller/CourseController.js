const { create } = require("../models/Account");

module.exports = {
    list(req, res){
        res.render('courses/list',{
            layout:false,
        });
    },
    create(req,res){
        // res.json({msg:'helo'});
        res.render('courses/create')
    }
};

