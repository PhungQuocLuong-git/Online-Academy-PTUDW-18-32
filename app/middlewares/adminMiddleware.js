module.exports = function adminMiddleware(req,res,next) {
    if(!(req.app.locals.role===3))
        return res.json({msg:'Bn phai la admin!!'});
    next();
}