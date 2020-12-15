


class AdminController{

    // [GET] /admin
    power(req,res) {
        
        res.render('admin/power');
    }
}

module.exports = new AdminController;