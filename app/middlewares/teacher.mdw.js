module.exports = function teacherMiddleware(req,res,next) {

    if(!(req.app.locals.role===2))
        return res.json({msg:'error!!'});
    next();
}