var express = require('express');
var router = express.Router();

var BookModel = require('../../models/BookDataModel');
var UserModel = require('../../models/UserStaffModel');
//list of book book //done
router.get('/', async(req, res) => {
    try{
        var list = await BookModel.find({});
        var active_list = await BookModel.find({active: 2});
        var deactive_list = await BookModel.find({active: 1});
        if(list.length === 0){
            const empty_data = process.env.EMPTY_DATA + ": book list";
            res.render('admin/library/book_data/index', {success: false, empty_data,layout:'layoutAdmin'});
        }
        res.render('admin/library/book_data/index', {success: true, list, active_list, deactive_list,layout:'layoutAdmin'});
    } catch (error) {
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA + ": list of book";
        res.render('admin/library/book_data/index', {success: false, errors,layout:'layoutAdmin'});

    }
});

//delete //done
router.get('/delete/:id', async(req, res) => {
    var list = await BookModel.find({});
    var active_list = await BookModel.find({active: 2});
    var deactive_list = await BookModel.find({active: 1});
    try{
        var id = req.params.id;
        const data = await BookModel.findById(id);
        if(data){
            if(data.active === 1){
                const userHasBook = await UserModel.findOne({"borrow_book.book_id": id});
                if(!userHasBook){
                    const error = process.env.ERROR_DELETING_DATA;
                    return res.render('admin/library/book_data/index', {success: false, error, list, active_list, deactive_list, layout:'layoutAdmin'});
                }
                const updateUserData = await UserModel.findByIdAndUpdate(userHasBook,{
                    $pull: {
                      borrow_book: { book_id: id }
                    }
                  }, {new: true});
                if(updateUserData){
                    await BookModel.deleteOne(data);
                    return res.redirect('/bookdata');
                } 
            }
            await BookModel.deleteOne(data);
            return res.redirect('/bookdata');
        } else {
            const error = process.env.ERROR_DELETING_DATA;
            res.render('admin/library/book_data/index', {success: false, error, list, active_list, deactive_list, layout:'layoutAdmin'});
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DELETING_DATA;
        res.render('admin/library/book_data/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
    }
});

//deactive //done
router.get('/deactive/:id', async(req, res)=> {
    var list = await BookModel.find({});
    var active_list = await BookModel.find({active: 2});
    var deactive_list = await BookModel.find({active: 1});
    try{
        const id = req.params.id;
        const subject = await BookModel.findById(id);
        if(!subject){
            const errors = process.env.ERROR_SHOWING_DATA;
            res.render('admin/library/book_data/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
        }
        const deactive = 1;
        const deactiveSubject = await BookModel.findByIdAndUpdate(id, {active: deactive });
        if(deactiveSubject){
            res.redirect('/bookdata');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DEACTIVE;
        res.render('admin/library/book_data/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
    }

});

//active //done
router.get('/active/:id', async(req, res)=> {
    var list = await BookModel.find({});
    var active_list = await BookModel.find({active: 2});
    var deactive_list = await BookModel.find({active: 1});
    try{
        const id = req.params.id;
        const subject = await BookModel.findById(id);
        if(!subject){
            const errors = process.env.ERROR_SHOWING_DATA;
            res.render('admin/library/book_data/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
        }
        const deactive = 2;
        const deactiveSubject = await BookModel.findByIdAndUpdate(id, {active: deactive });
        if(deactiveSubject){
            res.redirect('/bookdata');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DEACTIVE;
        res.render('admin/library/book_data/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
    }
});

//add new //done
router.get('/add', async(req, res) => {
    var list = await BookModel.find({});
    var active_list = await BookModel.find({active: 2});
    var deactive_list = await BookModel.find({active: 1});
    try{
        res.render('admin/library/book_data/add',{success: true,layout:'layoutAdminNoReload'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/library/book_data/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdminNoReload'});
    }
});

router.post('/add', async(req, res) => {
    var list = await BookModel.find({});
    var active_list = await BookModel.find({active: 2});
    var deactive_list = await BookModel.find({active: 1});
    try{
        const name = req.body.name;
        const rfid_book = req.body.rfid_book;
        const active = 2;
        const note = req.body.note;
        
        const newBook = await BookModel.create({
            name: name,
            rfid_book: rfid_book,
            active: active,
            note: note
        })
        if(newBook){
            res.redirect('/bookdata');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/library/book_data/index', {success: false, errors, list, active_list, deactive_list,layout:'layoutAdminNoReload'});
    }
});

//edit //done
router.get('/edit/:id', async(req, res) => {
    var list = await BookModel.find({});
    var active_list = await BookModel.find({active: 2});
    var deactive_list = await BookModel.find({active: 1});
    try{
        const id = req.params.id;
        const bookData = await BookModel.findById(id);
        if(!bookData){
            const error = process.env.ERROR_SHOWING_DATA + ' book to edit';
            res.render('admin/library/book_data/index', {success: false, error, list});
        }
        res.render('admin/library/book_data/edit',{success: true, bookData,layout:'layoutAdminNoReload'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_EDIT_DATA;
        res.render('admin/library/book_data/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdminNoReload'});
    }
});

router.post('/edit/:id', async(req, res) => {
    var list = await BookModel.find({});
    var active_list = await BookModel.find({active: 2});
    var deactive_list = await BookModel.find({active: 1});
    try{
        const id = req.params.id;
        const bookData = await BookModel.findById(id);
        if(!bookData){
            const error = process.env.ERROR_SHOWING_DATA + ' book to edit';
            res.render('admin/library/book_data/index', {success: false, error, list, active_list, deactive_list, layout:'layoutAdminNoReload'});
        }
        const name = req.body.name;
        const rfid_book = req.body.rfid_book;
        const active = req.body.active;
        const note = req.body.note;
        
        const newBook = await BookModel.findByIdAndUpdate(id,{
            name: name,
            rfid_book: rfid_book,
            active: active,
            note: note
        })
        if(newBook){
            res.redirect('/bookdata');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_EDIT_DATA;
        res.render('admin/library/book_data/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdminNoReload'});
    }
});






module.exports = router;