const categorySchema = require('../models/Category');
const subcategorySchema = require('../models/Subcategory');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
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
        if(req.body.username ==='admin'&& req.body.password ==='admin'){
            
            req.session.role=3;
            req.app.locals.role = 3;
            res.json('true')
        }
        else{
            res.json('false');
        }
        
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

    teachers(req,res,next) {
        Promise.all([Teacher.find({ $or:[ {'stt':2}, {'stt':1} ]}),
            Student.find()])
            .then(([teachers,students]) => {
                res.render('admin/teachers',{
                    layout:'admin',
                    teachers: multipleMongooseToObject(teachers),
                    students: multipleMongooseToObject(students),
                });
            })
    }

    courses(req,res) {
        var options ={status: 0};
        if(req.query.category)
            options.catid = req.query.category;
        if(req.query.subcategory)
            options.subcatid = req.query.subcategory;
        if(req.query.teacher)
            options.course_author = req.query.teacher;
        console.log(options)
        Promise.all([Course.find(options).populate('course_author'),Teacher.find({ $or:[ {'stt':2}, {'stt':1} ]}),categorySchema.find()])
            .then(([courses,teachers,categories]) => {
                res.render('admin/courses',{
                    layout:'admin',
                    courses:multipleMongooseToObject(courses),
                    teachers:multipleMongooseToObject(teachers),
                    categories:multipleMongooseToObject(categories),
                    delete:0
                });
            })
        
    };

    trash(req,res) {
        Course.find({status:-1})
            .then(courses => {
                // console.log(courses)
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
            layout:'admin',
            

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
     addcatPost(req, res) {
        
        var newName= req.body.CatName.trim().replace(/\s+/g, ' ');
        Promise.all([categorySchema.find(),subcategorySchema.find()])
            .then(([categories,subCategories]) => {
                if(!categories.some(category => category.CatName.toUpperCase() === newName.toUpperCase()) && 
                !subCategories.some(subCategory => subCategory.SubCatName.toUpperCase()=== newName.toUpperCase()))
                    return new categorySchema({CatName:newName}).save()
                else
                    return new Promise(function(resolve,reject){
                        reject('Đã tồn tại Category or SubCategory có tên như vậy')
                    })
            })
            .then(category => {
                console.log('trap2',category);
                res.json('true')})
            .catch(err => res.json(err))

    };
     addsubPost(req, res) {
        console.log(req.body)
        var newName= req.body.SubCatName.trim().replace(/\s+/g, ' ');
        Promise.all([categorySchema.find(),subcategorySchema.find()])
            .then(([categories,subCategories]) => {
                if(!categories.some(category => category.CatName.toUpperCase() === newName.toUpperCase()) && 
                !subCategories.some(subCategory => subCategory.SubCatName.toUpperCase()=== newName.toUpperCase()))
                    return new subcategorySchema({SubCatName:newName,CatID:req.body.CatId}).save()
                else
                    return new Promise(function(resolve,reject){
                        reject('Đã tồn tại Category or SubCategory có tên như vậy')
                    })
            })
            .then(category => {
                console.log(category)
                res.json('true')})
            .catch(err => res.json(err))

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
     del(req, res) {
        console.log(req.body)
        Course.findOne({catid: req.body._id})
            .then(course =>{
                if(course)
                    return new Promise(function(resolve,reject){
                        reject('Bn k đc xóa Category đã có khóa hc')
                    })
                else 
                    return categorySchema.deleteOne({ _id: req.body._id })
            })
            .then(category => {
                res.json('true')})
            .catch(err => res.json(err))
            
        
            
    }

    subdel(req, res) {
        
        Course.findOne({subcatid: req.body._id})
        .then(course =>{
            if(course)
            res.json('Bn k dc xoa subcategory da co khoa hc')
            else 
            return subcategorySchema.deleteOne({ _id: req.body._id })
        })
        .then(category => {
            res.json('true')})
        .catch(err => res.json(err))
    }
    
    patch(req, res) {
        console.log(req.body);
        var newName= req.body.CatName.trim().replace(/\s+/g, ' ');
        Promise.all([categorySchema.find(),subcategorySchema.find()])
            .then(([categories,subCategories]) => {
                if(!categories.some(category => category.CatName.toUpperCase() === newName.toUpperCase()) && 
                !subCategories.some(subCategory => subCategory.SubCatName.toUpperCase()=== newName.toUpperCase()))
                    return categorySchema.updateOne({ _id: req.body._id }, { CatName: newName })
                else
                    return new Promise(function(resolve,reject){
                        reject('Đã tồn tại Category or SubCategory có tên như vậy')
                    })
            })
            .then(category => {
                console.log('sentttt')
                res.json("true");})
            .catch(err => {console.log(err);res.json(err)})

        
    }
    async subpatch(req, res) {
        var newName= req.body.SubCatName.trim().replace(/\s+/g, ' ');
        Promise.all([categorySchema.find(),subcategorySchema.find()])
            .then(([categories,subCategories]) => {
                
                if(!categories.some(category => category.CatName.toUpperCase() === newName.toUpperCase()) && 
                !subCategories.some(subCategory => subCategory.SubCatName.toUpperCase()=== newName.toUpperCase()))
                    return subcategorySchema.updateOne({ _id: req.body._id }, { SubCatName: newName })
                else
                    return new Promise(function(resolve,reject){
                        reject('Đã tồn tại Category or SubCategory có tên như vậy')
                    })
            })
            .then(category => {
                console.log('sentttt')
                res.json("true");})
            .catch(err => {console.log(err);res.json(err)})
    }





}

module.exports = new AdminController;