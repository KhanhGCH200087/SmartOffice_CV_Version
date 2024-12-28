var express = require('express');
var router = express.Router();
const fs = require('fs');
const multer = require('multer');
//************************************************************************** */
const UserModel = require('../../models/UserStaffModel');
const BookModel = require('../../models/BookDataModel');
const SubjectTableModel = require('../../models/SubjectTableModel');
const RoomModel = require('../../models/RoomModel');
const SwitchLogicModel = require('../../models/SwitchLogicModel');
const BookedRoomModel = require('../../models/BookedRoomModel');

//******************************************************************************** */
// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/') // Set the destination folder where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now()) // Set the filename to avoid name conflicts
    }
});
const upload = multer({ storage: storage });
//**************************************************************************************************** */

//list of user //done
router.get('/', async(req, res) => {
    try{    
        const active_user = await UserModel.find({active: 2}).populate('room_id');
        const deactive_user = await UserModel.find({active: 1}).populate('room_id');
        res.render('admin/user_data/user_staff/index', {success: true, active_user, deactive_user, layout:'layoutAdmin'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA;
        res.render('admin/user_data/user_staff/index', {success: false, errors, layout:'layoutAdmin'});
    }
});

//delete user //done
router.get('/delete/:id', async(req, res) => {
    const active_user = await UserModel.find({active: 2}).populate('room_id');
    const deactive_user = await UserModel.find({active: 1}).populate('room_id');
    try{
        var id = req.params.id;
        const data = await UserModel.findById(id);
        if(data){
            // let borrowBook = data.borrow_book.length();
            // let borrowTable = data.table_booked.length();
            // if(borrowBook > 0 || borrowTable > 0){
            //     const message = "Notify user "+data.name+ " return borrowed book or used table before delete";
            //     return res.render('admin/user_data/user_staff/index', {success: false, message, active_user, deactive_user, layout:'layoutAdmin'});
            // }
            // const allowSwitchLogic = await SwitchLogicModel.find({"user.user_id": id});
            // if(allowSwitchLogic.length > 0){
            //     const message = "Remove user "+data.name+ " from using switch first before delete";
            //     return res.render('admin/user_data/user_staff/index', {success: false, message, active_user, deactive_user, layout:'layoutAdmin'});
            // }
            //const availableBookedRoom = await BookedRoomModel.find({"user_staff.user": id});//cần check phần booked room nữa
            
            await UserModel.findByIdAndDelete(id);
            return res.redirect('/userstaff');
        } else {
            const error = process.env.ERROR_DELETING_DATA;
            res.render('admin/user_data/user_staff/index', {success: false, error, active_user, deactive_user, layout:'layoutAdmin'});
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DELETING_DATA;
        res.render('admin/user_data/user_staff/index', {success: false, errors, active_user, deactive_user, layout:'layoutAdmin'});

    }
});

//create user //done
router.get('/add', async(req, res) => {
    const active_user = await UserModel.find({active: 2}).populate('room_id');
    const deactive_user = await UserModel.find({active: 1}).populate('room_id');
    try{    
        const roomList = await RoomModel.find({active: 2});
        if(roomList.length === 0){
            const errors = "Room is empty. Need create room first";
            res.render('admin/user_data/user_staff/index', {success: false, active_user, deactive_user, errors, layout:'layoutAdminNoReload'});
        }
        res.render('admin/user_data/user_staff/add', {success: true, roomList, layout:'layoutAdminNoReload'});

    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/user_data/user_staff/index', {success: false, active_user, deactive_user, errors, layout:'layoutAdminNoReload'});
    }
});

router.post('/add', upload.single('image'), async(req, res) => {
    const active_user = await UserModel.find({active: 2}).populate('room_id');
    const deactive_user = await UserModel.find({active: 1}).populate('room_id');
    const roomList = await RoomModel.find({active: 2});
    try{    
        const email = req.body.email; 
        const password = req.body.password;
        const rfid = req.body.rfid;
        const name = req.body.name;
        const role = 'staff';
        const active = 2;
        const image = req.file;
        const room = req.body.room;
        let borrow_book = [];
        let table_booked = [];

        const checkEmail = await UserModel.findOne({email: email});
        const checkRFID = await UserModel.findOne({rfid: rfid});

        if(checkEmail || checkRFID ){
            const error = process.env.EXIST_DATA + ' Email or RFID'
            return res.render('admin/user_data/user_staff/add', {success: false, error, roomList, layout:'layoutAdminNoReload'});
        }
        if(!image){
            const image = process.env.DEFAULT_BASE64_IMAGE;
            const newUser = await UserModel.create({
                email: email,
                password: password,
                rfid: rfid,
                name: name,
                role: role,
                active: active,
                image: image,
                room_id: room,
                borrow_book: borrow_book,
                table_booked: table_booked
            });
            if(newUser){
                return res.redirect('/userstaff');
            }
        } else {
            const imageData = fs.readFileSync(image.path);
            //convert image data to base 64
            const base64Image = imageData.toString('base64');
            const newUser = await UserModel.create({
                email: email,
                password: password,
                rfid: rfid,
                name: name,
                role: role,
                active: active,
                image: base64Image,
                room_id: room,
                borrow_book: borrow_book,
                table_booked: table_booked
            });
            if(newUser){
                return res.redirect('/userstaff');
            }
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/user_data/user_staff/index', {success: false, active_user, deactive_user, errors, layout:'layoutAdminNoReload'});
    }
});

//edit user //done //note: need condtion for email and rfid
router.get('/edit/:id', async(req, res) => {
    const active_user = await UserModel.find({active: 2}).populate('room_id');
    const deactive_user = await UserModel.find({active: 1}).populate('room_id');
    const id = req.params.id;
    try{    
        const userData = await UserModel.findById(id).populate('room_id');
        if(!userData){
            const errors = process.env.EMPTY_DATA;
            res.render('admin/user_data/user_staff/index', {success: false, active_user, deactive_user, errors, layout:'layoutAdminNoReload'});
        }
        const roomList = await RoomModel.find({active: 2, _id:{ $ne: userData.room_id} });
        if(roomList.length === 0){
            const errors = "Room is empty. Need create room ";
            res.render('admin/user_data/user_staff/edit', {success: false, userData, errors, layout:'layoutAdminNoReload'});
        }
        res.render('admin/user_data/user_staff/edit', {success: true, userData, roomList, layout:'layoutAdminNoReload'});

    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_EDIT_DATA;
        res.render('admin/user_data/user_staff/index', {success: false, active_user, deactive_user, errors, layout:'layoutAdminNoReload'});
    }
});

router.post('/edit/:id', upload.single('image'), async(req, res) => {
    const active_user = await UserModel.find({active: 2}).populate('room_id');
    const deactive_user = await UserModel.find({active: 1}).populate('room_id');
    const id = req.params.id;
    const userData = await UserModel.findById(id).populate('room_id');
    const roomList = await RoomModel.find({active: 2, _id:{ $ne: userData.room_id} });
    try{    
        const email = req.body.email; 
        const password = req.body.password;
        const rfid = req.body.rfid;
        const name = req.body.name;
        const image = req.file;
        const room = req.body.room;
        if(!image){
            if(room){
                const newUser = await UserModel.findByIdAndUpdate(id,{email: email, password: password, rfid: rfid, name: name, room_id: room});
                if(newUser){ return res.redirect('/userstaff');}
            } else if(!room){
                const newUser = await UserModel.findByIdAndUpdate(id,{email: email, password: password, rfid: rfid, name: name});
                if(newUser){ return res.redirect('/userstaff');}
            }
        } else if(image) {
            const imageData = fs.readFileSync(image.path);
            const base64Image = imageData.toString('base64'); //convert image data to base 64
            if(room){
                const newUser = await UserModel.findByIdAndUpdate(id,{image: base64Image, email: email, password: password, rfid: rfid, name: name, room_id: room});
                if(newUser){ return res.redirect('/userstaff');}
            } else if(!room){
                const newUser = await UserModel.findByIdAndUpdate(id,{image: base64Image, email: email, password: password, rfid: rfid, name: name});
                if(newUser){ return res.redirect('/userstaff');}
            }
        }
        
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_EDIT_DATA;
        res.render('admin/user_data/user_staff/index', {success: false, active_user, deactive_user, errors, layout:'layoutAdminNoReload'});
    }
});

//deactive user //done
router.get('/deactive/:id', async(req, res)=> {
    const active_user = await UserModel.find({active: 2}).populate('room_id');
    const deactive_user = await UserModel.find({active: 1}).populate('room_id');
    try{
        const id = req.params.id;
        const subject = await UserModel.findById(id);
        if(!subject){
            const errors = process.env.ERROR_SHOWING_DATA;
            res.render('admin/user_data/user_staff/index', {success: false, active_user, deactive_user, errors, layout:'layoutAdmin'});
        }
        const deactive = 1;
        const deactiveSubject = await UserModel.findByIdAndUpdate(id, {active: deactive , layout:'layoutAdmin'});
        if(deactiveSubject){
            res.redirect('/userstaff');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DEACTIVE;
        res.render('admin/user_data/user_staff/index', {success: false, active_user, deactive_user, errors, layout:'layoutAdmin'});
    }
});

//active user //done
router.get('/active/:id', async(req, res)=> {
    const active_user = await UserModel.find({active: 2}).populate('room_id');
    const deactive_user = await UserModel.find({active: 1}).populate('room_id');
    try{
        const id = req.params.id;
        const subject = await UserModel.findById(id);
        if(!subject){
            const errors = process.env.ERROR_SHOWING_DATA;
            res.render('admin/user_data/user_staff/index', {success: false, active_user, deactive_user, errors, layout:'layoutAdmin'});
        }
        const deactive = 2;
        const deactiveSubject = await UserModel.findByIdAndUpdate(id, {active: deactive , layout:'layoutAdmin'});
        if(deactiveSubject){
            res.redirect('/userstaff');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_ACTIVE;
        res.render('admin/user_data/user_staff/index', {success: false, active_user, deactive_user, errors, layout:'layoutAdmin'});
    }
});

//detail of user //done
router.get('/detail/:id', async(req, res) => {
    const active_user = await UserModel.find({active: 2}).populate('room_id');
    const deactive_user = await UserModel.find({active: 1}).populate('room_id');
    try{    
        const id = req.params.id;
        const userData = await UserModel.findById(id).populate('room_id')
        .populate({path: 'borrow_book.book_id', model: 'book_data'})
        .populate({path: 'table_booked.subject_table_id', model: 'subject_table'});
        if(!userData){
            const errors = process.env.EMPTY_DATA;
            res.render('admin/user_data/user_staff/index', {success: false,active_user, deactive_user, errors, layout:'layoutAdmin'});
        }
        res.render('admin/user_data/user_staff/detail', {success: true, userData, layout:'layoutAdmin'});

    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA;
        res.render('admin/user_data/user_staff/index', {success: false,active_user, deactive_user, errors, layout:'layoutAdmin'});
    }
});




module.exports = router;