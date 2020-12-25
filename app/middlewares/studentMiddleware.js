module.exports = function studentMiddleware(req,res,next) {

    if(!(req.session.role===1))
        return res.json({msg:'Bn phai la student!!'});
    next();
}