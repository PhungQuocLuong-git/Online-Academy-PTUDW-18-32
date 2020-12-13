module.exports = {
    profile(req, res, next) {
        res.render('users/edit-profile', {
            layout: false,
        })
    },
    account(req, res, next) {
        res.render('users/edit-account', {
            layout: false,
        })
    },


};

