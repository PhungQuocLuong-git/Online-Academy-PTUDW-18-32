const categorySchema = require('../models/Category');
const subcategorySchema = require('../models/Subcategory');


class AdminController {

    // [GET] /admin
    power(req, res) {

        res.render('admin/power');
    };

    addcategory(req, res) {
        res.render('admin/addcategory');
    };
    async addsubcategory(req, res) {
        const id = req.params.id;
        var catname = await categorySchema.find({ _id: id });
        catname = catname.map(mongoose => mongoose.toObject());
        res.render('admin/addsub', {
            id: id,
            catname:catname[0].CatName,
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
            list: list[0]
        });
    };
    async editsubcategory(req, res) {
        const id = req.params.id;

        //console.log(id);
        var list = await subcategorySchema.find({ _id: id });
        list = list.map(mongoose => mongoose.toObject());


        res.render('admin/editsubcategory', {
            list: list[0]
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