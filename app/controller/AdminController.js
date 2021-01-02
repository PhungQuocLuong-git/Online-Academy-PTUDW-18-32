const categorySchema = require('../models/Category');
const subcategorySchema = require('../models/Subcategory');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');



class AdminController {

    // [GET] /admin
    login(req, res) {

        res.render('admin/login',{
            layout:false
        });
    };

    // [GET] /logout
    logout(req, res) {
        req.session.role = 0;
        req.app.locals.role = 0;

        res.redirect('/');
    };

    // [POST] /admin/check
    check(req, res) {
        console.log(req.body,req.body.username ==='admin',req.body.password ==='admin')
        if(req.body.username ==='admin'&& req.body.password ==='admin'){
            console.log('ok');
            req.session.role=3;
            req.app.locals.role = 3;
        }
        else{
            console.log('not ok')
        }
        console.log(req.app.locals.role)
        res.redirect('/admin');
        
    };

    home(req,res) {
        res.render('admin/admin',{
            layout:'admin'
        });
    };

    teacherQueue(req,res) {
        Teacher.find({stt:0})
            .then(teachers => {
                res.render('admin/teacher-queue',{
                    layout:'admin',
                    teachers: multipleMongooseToObject(teachers)
                });
            })
    };

    courses(req,res) {
        Course.find({status:0})
            .then(courses => {
                res.render('admin/courses',{
                    layout:'admin',
                    courses:multipleMongooseToObject(courses),
                    delete:0
                });
            })
        
    };

    trash(req,res) {
        Course.find({status:-1})
            .then(courses => {
                console.log(courses)
                res.render('admin/courses',{
                    layout:'admin',
                    courses:multipleMongooseToObject(courses),
                    delete:1
                });
            })
        
    };

    addcategory(req, res) {
        res.render('admin/addcategory',{
            layout:'admin'
        });
    };
    async addsubcategory(req, res) {
        const id = req.params.id;
        var catname = await categorySchema.find({ _id: id });
        catname = catname.map(mongoose => mongoose.toObject());
        res.render('admin/addsub', {
            id: id,
            catname:catname[0].CatName,
            layout:'admin'
        });
    };
    async categories(req, res) {
        var list = await categorySchema.find();
        list = list.map(mongoose => mongoose.toObject());

        const len = list.length;
        for (var i = 0; i < len; i++) {
            var sublist = await subcategorySchema.find({ CatID: list[i]._id });
            sublist = sublist.map(mongoose => mongoose.toObject());
            list[i]['sub'] = sublist;
        }

        
        res.render('admin/categories', {
            empty: list.length === 0,
            categories: list,
            layout:'admin'
        });

    };
    /* async subcategories(req, res) {
        const id = req.params.id;
        var list = await subcategorySchema.find({ CatID: id });
        var catname = await categorySchema.find({ _id: id });
        list = list.map(mongoose => mongoose.toObject());
        catname = catname.map(mongoose => mongoose.toObject());

        console.log(catname);
        res.render('admin/subcategories', {
            empty: list.length === 0,
            subcategories: list,
            catname: catname[0].CatName,
        });

    }; */
    async addcatPost(req, res) {
        res.render('admin/addcategory');
        
        const instance = new categorySchema(req.body);
        instance.save(function (err) {
        });

    };
    async addsubPost(req, res) {
        const id = req.params.id;
        var catname = await categorySchema.find({ _id: id });
        catname = catname.map(mongoose => mongoose.toObject());
        res.render('admin/addsub', {
            id: id,
            catname:catname[0].CatName,
        });
        
        const instance = new subcategorySchema(req.body);
        instance.save(function (err) {
        });

    };

    async editcategory(req, res) {
        const id = req.params.id;

        //console.log(id);
        var list = await categorySchema.find({ _id: id });
        list = list.map(mongoose => mongoose.toObject());


        res.render('admin/editcategory', {
            list: list[0],
            layout: 'admin'
        });
    };
    async editsubcategory(req, res) {
        const id = req.params.id;

        //console.log(id);
        var list = await subcategorySchema.find({ _id: id });
        list = list.map(mongoose => mongoose.toObject());


        res.render('admin/editsubcategory', {
            list: list[0],
            layout:'admin'
        });
    };
    async del(req, res) {
        
        categorySchema.deleteOne({ _id: req.body._id }, (err, data) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log(data);
            }
        });
        // categoriesSchema.findByIdAndDelete(req.body._id,(err,data)=> { 
        //         if(err)
        //     {
        //         console.log(err);
        //     }
        //     else{
        //         console.log(data);
        //     }
        //  });
        res.redirect('/admin/categories');
        // res.render('vwCategories/edit');
    }

    async patch(req, res) {
        // categoriesSchema.findByIdAndUpdate({_id: req.body._id},req.body,(err,data)=>{
        //     if(err)
        //     {
        //         console.log(err);
        //     }
        //     else{
        //         console.log(data);
        //     }
        // })
        categorySchema.updateOne({ _id: req.body._id }, { $set: req.body }, (err, data) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log(data);
            }
        });
        res.redirect('/admin/categories');
    }
    async subdel(req, res) {
        
        subcategorySchema.deleteOne({ _id: req.body._id }, (err, data) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log(data);
            }
        });
        // categoriesSchema.findByIdAndDelete(req.body._id,(err,data)=> { 
        //         if(err)
        //     {
        //         console.log(err);
        //     }
        //     else{
        //         console.log(data);
        //     }
        //  });
        res.redirect('/admin/categories');
        // res.render('vwCategories/edit');
    }

    async subpatch(req, res) {
        // categoriesSchema.findByIdAndUpdate({_id: req.body._id},req.body,(err,data)=>{
        //     if(err)
        //     {
        //         console.log(err);
        //     }
        //     else{
        //         console.log(data);
        //     }
        // })
        console.log("dddddddddddddddddddddddddddddddddddddddddddddddddddd");
        subcategorySchema.updateOne({ _id: req.body._id }, { $set: req.body }, (err, data) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log(data);
            }
        });
        res.redirect('/admin/categories');
    }





}

module.exports = new AdminController;