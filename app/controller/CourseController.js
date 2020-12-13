module.exports = {
    list(req, res){
        res.render('courses/list',{
            layout:false,
        });
    }

};

