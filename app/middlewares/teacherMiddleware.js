module.exports = function teacherMiddleware(req,res,next) {

    if(!(req.session.user.role===2))
        return res.json({msg:'error!!'});
    next();
}