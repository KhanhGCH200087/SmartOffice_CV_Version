var express = require('express');
var router = express.Router();
const fs = require('fs');
const multer = require('multer');

const AccessLogModel = require('../models/AccessLogModel');
const BookModel = require('../models/BookDataModel');
const BookedRoomModel = require('../models/BookedRoomModel');
const DepartmentModel = require('../models/DepartmentModel');
const DeviceModel = require('../models/DeviceModel');
const LogicModel = require('../models/LogicPartModel');
const RoomModel = require('../models/RoomModel');
const RoomTableBookedModel = require('../models/RoomTableBookedModel');
const SubjectTableModel = require('../models/SubjectTableModel');
const SwitchLogicModel = require('../models/SwitchLogicModel');
const UserModel = require('../models/UserStaffModel');

const { formatDate, formatTime, isValidTimeRange, getRoomsWithDeviceType, isDayLaterThanToday} = require('./code_function');

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

//trang index hiển thị thông tin các thứ
router.get('/', async(req, res)=> {
    try{
        const staff_id =  req.session.staff_id;
        const accessLog = await AccessLogModel.find({user_id: staff_id}).populate('department_id');
        const userData = await UserModel.findById(staff_id).populate('room_id')
        .populate({path: 'borrow_book.book_id', model: 'book_data'})
        .populate({path: 'table_booked.subject_table_id', model: 'subject_table'});
        const switchList = await SwitchLogicModel.find({active: 2, 'user.user_id': staff_id}).populate('device_id');
        console.log('Switch', switchList);
        if(userData){
            res.render('staff/index', {success: true, userData, staff_id, accessLog, switchList, layout:'layoutStaff'});
        }
    }catch(errors){
        console.log("Error: ", errors);
        const error = process.env.ERROR_SHOWING_DATA;
        res.render('staff/index', {success: false, error, layout:'layoutStaff'});
    }
});

//trang edit
router.get('/editUser', async(req, res) => {
    const id = req.session.staff_id;
    try{    
        const userData = await UserModel.findById(id).populate('room_id');
        const roomList = await RoomModel.find({active: 2, _id:{ $ne: userData.room_id} });
        if(roomList.length === 0){
            const errors = "Room is empty. Need create room ";
            res.render('staff/editUser', {success: false, userData, errors, layout:'layoutStaff'});
        }
        res.render('staff/editUser', {success: true, userData, roomList, layout:'layoutStaff'});

    }catch(error){
        console.error("Error: ", error);
    }
});

router.post('/editUser', upload.single('image'), async(req, res) => {
   
    const id = req.session.staff_id;
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
                if(newUser){ return res.redirect('/staff');}
            } else if(!room){
                const newUser = await UserModel.findByIdAndUpdate(id,{email: email, password: password, rfid: rfid, name: name});
                if(newUser){ return res.redirect('/staff');}
            }
        } else if(image) {
            const imageData = fs.readFileSync(image.path);
            const base64Image = imageData.toString('base64'); //convert image data to base 64
            if(room){
                const newUser = await UserModel.findByIdAndUpdate(id,{image: base64Image, email: email, password: password, rfid: rfid, name: name, room_id: room});
                if(newUser){ return res.redirect('/staff');}
            } else if(!room){
                const newUser = await UserModel.findByIdAndUpdate(id,{image: base64Image, email: email, password: password, rfid: rfid, name: name});
                if(newUser){ return res.redirect('/staff');}
            }
        }
        
    }catch(error){
        console.error("Error: ", error);
    }
});

//*******************************Phần này xử lý switch******************************************************************** */
//turnOn Switch
router.get('/turnOn1/:deviceId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
        const statusOn = 2;
        const dataDevice = 'on';
        const deviceData = await DeviceModel.findById(deviceId);
        const switchData = await SwitchLogicModel.findOne({device_id: deviceId});
        if(deviceData && switchData){
            const updateDevice = await DeviceModel.findByIdAndUpdate(deviceId,{data: dataDevice});
            const updateSwitch = await SwitchLogicModel.findByIdAndUpdate(switchData._id,{status_on_off: statusOn});
            if(updateDevice && updateSwitch){
                return res.redirect(`/staff`);
            }
        }
    }catch(errors){
        console.log("Error Log: ",errors);
    }
});

router.get('/turnOff1/:deviceId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
        const statusOff = 1;
        const dataDevice = 'off';
        const deviceData = await DeviceModel.findById(deviceId);
        const switchData = await SwitchLogicModel.findOne({device_id: deviceId});
        if(deviceData && switchData){
            const updateDevice = await DeviceModel.findByIdAndUpdate(deviceId,{data: dataDevice});
            const updateSwitch = await SwitchLogicModel.findByIdAndUpdate(switchData._id,{status_on_off: statusOff});
            if(updateDevice && updateSwitch){
                return res.redirect(`/staff`);
            }
        }
    }catch(errors){
        console.log("Error Log: ",errors);
    }
});

//detail
router.get('/detailSwitch/:deviceId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
    
        const deviceData = await DeviceModel.findById(deviceId);
        const switchData = await SwitchLogicModel.findOne({device_id: deviceId}).populate({path:'user.user_id', model: 'user_staff'});
    
        const logicCountdown = await LogicModel.find({switch_logic_id: switchData._id, type: 'countdown'}).populate('switch_logic_id');
        const logicSchedule = await LogicModel.find({switch_logic_id: switchData._id, type: 'schedule'}).populate('switch_logic_id');
        const logicInching = await LogicModel.find({switch_logic_id: switchData._id, type: 'inching'}).populate('switch_logic_id');
    
        res.render('staff/switchDetail', {success: true, deviceData, switchData, logicCountdown, logicSchedule, logicInching, deviceId, layout: 'layoutStaff' });
    }catch(errors){
        console.log("Error Log:", errors);
    }
});

//turn device off and stay at switch detail page//done
router.get('/turnOn2/:deviceId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
        const statusOn = 2;
        const dataDevice = 'on';
        const deviceData = await DeviceModel.findById(deviceId);
        const switchData = await SwitchLogicModel.findOne({device_id: deviceId});
        if(deviceData && switchData){
            const updateDevice = await DeviceModel.findByIdAndUpdate(deviceId,{data: dataDevice});
            const updateSwitch = await SwitchLogicModel.findByIdAndUpdate(switchData._id,{status_on_off: statusOn});
            if(updateDevice && updateSwitch){
                return res.redirect('/staff/detailSwitch/'+ deviceId);
            }
        }
    }catch(errors){
        console.log("Error Log: ",errors);
    }
});

//turn device off and stay at switch detail page//done
router.get('/turnOff2/:deviceId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
    
        const statusOff = 1;
        const dataDevice = 'off';
        const deviceData = await DeviceModel.findById(deviceId);
        const switchData = await SwitchLogicModel.findOne({device_id: deviceId});
        if(deviceData && switchData){
            const updateDevice = await DeviceModel.findByIdAndUpdate(deviceId,{data: dataDevice});
            const updateSwitch = await SwitchLogicModel.findByIdAndUpdate(switchData._id,{status_on_off: statusOff});
            if(updateDevice && updateSwitch){
                return res.redirect('/staff/detailSwitch/'+ deviceId);
            }
        }
    }catch(errors){
        console.log("Error Log: ",errors);
    }
});

//Active Logic
router.get('/activeLogic/:deviceId/:logicId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
        const logicId = req.params.logicId;
        const logicData = await LogicModel.findByIdAndUpdate(logicId, {active: 2})
        if(logicData){
            return res.redirect('/staff/detailSwitch/'+ deviceId);
        }
    }catch(errors){
        console.log("Error Log:", errors);
    }
    
});

//deactive logic //done
router.get('/deactiveLogic/:deviceId/:logicId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
        const logicId = req.params.logicId;
        const logicData = await LogicModel.findByIdAndUpdate(logicId, {active: 1})
        if(logicData){
            return res.redirect('/staff/detailSwitch/'+ deviceId);
        }
    }catch(errors){
        console.log("Error Log:", errors);
    }
});

//editCountdown
router.get('/editCountdown/:deviceId/:logicId', async(req, res) => {
    const deviceId = req.params.deviceId;
    const switchId = req.params.switchId;
    const logicId = req.params.logicId;
    try{
        const logicData = await LogicModel.findById(logicId);
        res.render('staff/editCountdown', {success: true, deviceId, switchId, logicData,layout:'layoutStaff'})
    }catch(error){
        console.error("Error: ", error);
    }
});

router.post('/editCountdown/:deviceId/:logicId', async(req, res) => {
    const deviceId = req.params.deviceId;
    const logicId = req.params.logicId;
    try{
        const hours_origin = req.body.hours;
        const minutes_origin = req.body.minutes;
        if(hours_origin < 10){
            const hours_fix = '0'+hours_origin;
            if(minutes_origin < 10){
                const minutes_fix = '0'+minutes_origin;
                const time = hours_fix+':'+minutes_fix;
                const editlogic = await LogicModel.findByIdAndUpdate(logicId,{time: time});
                if(editlogic){return res.redirect('/staff/detailSwitch/'+ deviceId);}
            } else{
                const time = hours_fix+':'+minutes_origin;
                const editlogic = await LogicModel.findByIdAndUpdate(logicId,{time: time});
                if(editlogic){return res.redirect('/staff/detailSwitch/'+ deviceId);}
            }
        } else {
            if(minutes_origin < 10){
                const minutes_fix = '0'+minutes_origin;
                const time = hours_origin+':'+minutes_fix;
                const editlogic = await LogicModel.findByIdAndUpdate(logicId,{time: time});
                if(editlogic){return res.redirect('/staff/detailSwitch/'+ deviceId);}
            } else{
                const time = hours_origin+':'+minutes_origin;
                const editlogic = await LogicModel.findByIdAndUpdate(logicId,{time: time});
                if(editlogic){return res.redirect('/staff/detailSwitch/'+ deviceId);}
            }
        }

    }catch(error){
        console.error("Error: ", error);
    }
});

//delete a Logic
router.get('/deleteLogic/:deviceId/:logicId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
        const logicId = req.params.logicId;
    
        const logicData = await LogicModel.findById(logicId);
        if(logicData){
            await LogicModel.findByIdAndDelete(logicId);
            return res.redirect('/staff/detailSwitch/'+ deviceId);
        }
    }catch(errors){
        console.log("Error Log:", errors);
    }
    
});

//add new schedule
router.get('/addSchedule/:deviceId/:switchId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
        const switchId = req.params.switchId;
        res.render('staff/addSchedule', {success: true, deviceId, switchId,layout:'layoutStaff'});
    }catch(error){
        console.error("Error: ", error);
    }
});

router.post('/addSchedule/:deviceId/:switchId', async(req, res) => {
    const deviceId = req.params.deviceId;
    const switchId = req.params.switchId;
    try{
        const switch_logic_id = switchId;
        const active = 1;
        const device_status = req.body.status;
        const type = 'schedule';
        const day = req.body.day;
        const time = req.body.time;

        const newlogic = await LogicModel.create({
            switch_logic_id: switch_logic_id,
            active: active,
            device_status: device_status,
            type: type,
            day: day,
            time: time
        });
        if(newlogic){return res.redirect('/staff/detailSwitch/'+ deviceId);}
    }catch(error){
        console.error("Error: ", error);
    }
});

//***************************************Xử lý đặt phòng******************************************************** */
//Danh sách Booked Room bao gồm làm chủ và được mời
router.get('/listBookedRoom', async(req, res) => {
    try{
        var hostList = await BookedRoomModel.find({
            user_staff: { 
                $elemMatch: { 
                    level: 1, 
                    user: req.session.staff_id 
                }
            }
        }).populate('room');

        var inviterList = await BookedRoomModel.find({
            user_staff: { 
                $elemMatch: { 
                    level: 2, 
                    user: req.session.staff_id 
                }
            }
        }).populate('room');
        
        res.render('staff/listBookedRoom', {success: true, hostList, inviterList, layout:'layoutStaff'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA;
        res.render('staff/listBookedRoom', {success: false, errors, layout:'layoutStaff'});
    }
});

//chi tiết về phòng được Booked
router.get('/detailBookedRoom/:id', async(req, res) => {
    const id = req.params.id;
    try{
        const detail = await BookedRoomModel.findById(id).populate('room').populate({path: 'user_staff.user', model: 'user_staff'});
        if(!detail){
            const message = process.env.EMPTY_DATA;
            res.render('staff/detailBookedRoom', {success: true, message, layout:'layoutStaff'});
        }
        var checkHost = await BookedRoomModel.findOne({
            _id: detail._id,
            user_staff: { 
                $elemMatch: { 
                    level: 1, 
                    user: req.session.staff_id 
                }
            }
        }).populate('room');
        if(checkHost){
            const checkHost = "yes";
            res.render('staff/detailBookedRoom', {success: false, detail, checkHost, layout:'layoutStaff'});
        } else if(!checkHost){
            const checkHost = "no";
            res.render('staff/detailBookedRoom', {success: false, detail, checkHost, layout:'layoutStaff'});
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA;
        res.render('staff/detailBookedRoom' + id, {success: false, errors, layout:'layoutStaff'});
    }
});

//xóa phòng
router.get('/deleteBookedRoom/:id', async(req, res) => {
    var hostList = await BookedRoomModel.find({user_staff: { $elemMatch: { level: 1, user: req.session.staff_id }}}).populate('room');
    var inviterList = await BookedRoomModel.find({user_staff: { $elemMatch: { level: 2, user: req.session.staff_id }}}).populate('room');
    try{
        var id = req.params.id;
        const data = await BookedRoomModel.findById(id);
        if(data){
            await BookedRoomModel.findByIdAndDelete(id);
            res.redirect('/staff/listBookedRoom');
        } else {
            const error = process.env.ERROR_DELETING_DATA;
            res.render('staff/listBookedRoom', {success: true, hostList, inviterList, error, layout:'layoutStaff'});
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DELETING_DATA;
        res.render('staff/listBookedRoom', {success: true, hostList, inviterList, error, layout:'layoutStaff'});
    }
});

//deactive room //done
router.get('/deactiveBookedRoom/:id', async(req, res)=> {
    var hostList = await BookedRoomModel.find({user_staff: { $elemMatch: { level: 1, user: req.session.staff_id }}}).populate('room');
    var inviterList = await BookedRoomModel.find({user_staff: { $elemMatch: { level: 2, user: req.session.staff_id }}}).populate('room');
    try{
        const id = req.params.id;
        const subject = await BookedRoomModel.findById(id);
        if(!subject){
            const errors = process.env.ERROR_SHOWING_DATA;
            res.render('staff/listBookedRoom', {success: false, errors, hostList, inviterList, layout:'layoutStaff'});
        }
        const deactive = 1;
        const deactiveSubject = await BookedRoomModel.findByIdAndUpdate(id, {active: deactive });
        if(deactiveSubject){
            res.redirect('/staff/listBookedRoom');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DEACTIVE;
        res.render('staff/listBookedRoom', {success: false, errors, hostList, inviterList, layout:'layoutStaff'});
    }
});

//active
router.get('/activeBookedRoom/:id', async(req, res)=> {
    var hostList = await BookedRoomModel.find({user_staff: { $elemMatch: { level: 1, user: req.session.staff_id }}}).populate('room');
    var inviterList = await BookedRoomModel.find({user_staff: { $elemMatch: { level: 2, user: req.session.staff_id }}}).populate('room');
    try{
        const id = req.params.id;
        const subject = await BookedRoomModel.findById(id);
        if(!subject){
            const errors = process.env.ERROR_SHOWING_DATA;
            res.render('staff/listBookedRoom', {success: false, errors, hostList, inviterList, layout:'layoutStaff'});
        }
        const active = 2;
        const deactiveSubject = await BookedRoomModel.findByIdAndUpdate(id, {active: active });
        if(deactiveSubject){
            res.redirect('/staff/listBookedRoom');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DEACTIVE;
        res.render('staff/listBookedRoom', {success: false, errors, hostList, inviterList, layout:'layoutStaff'});
    }
});

//Thêm Booked Room OK
router.get('/addBookedRoom', async(req, res) => {
    try{
        var userList = await UserModel.find({});
        const deviceType = 'booked_room';
        var roomList = await getRoomsWithDeviceType(deviceType);
        if(!userList || !roomList){
            const error = process.env.ERROR_SHOWING_DATA + "list of user or list of room";
            res.render('staff/addBookedRoom', {success: false, error, layout:'layoutStaff'}); 
        }
        res.render('staff/addBookedRoom', {success: true, userList, roomList, layout:'layoutStaff'}); 
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('staff/addBookedRoom', {success: false, errors, layout:'layoutStaff'});
    }
    
});

router.post('/addBookedRoom', async(req, res) => {
    const deviceType = 'booked_room';
    var roomList = await getRoomsWithDeviceType(deviceType);
    try{
        const room_used_id = req.body.room;
        const note = req.body.note;
        const active = 2;

        const day = req.body.day;
        const time_start_origin = req.body.time_start;
        const time_end_origin = req.body.time_end;

        if (!isValidTimeRange(time_start_origin, time_end_origin)) {
            const error = 'Start time must be earlier than end time.';
            return res.render('staff/addBookedRoom', { success: false, roomList, error , layout:'layoutStaff'});
        } else if(!isDayLaterThanToday(day)){
            const error = 'The selected day is later than the current day.';
            return res.render('staff/addBookedRoom', { success: false, roomList, error , layout:'layoutStaff'});
        }

        const QR_code = 'Room is booked in ' + day + 'Start at '+ time_start_origin + ' and end at ' + time_end_origin;

        const users = req.body.user; //lấy thông tin user từ form
        //array of user
        let userArray = [];
         if (users) {
            if (Array.isArray(users)) {
                userArray = users;  // Use the provided array of users
            } else {
                userArray = [users];  // Wrap a single user ID in an array
            }
        }
        if (userArray.length > 0) {
            const foundUsers = await UserModel.find({ _id: { $in: userArray } });
            if (foundUsers.length !== userArray.length) {
                const error = process.env.ERROR_CREATE_DATA + 'because of data user';
                return res.render('staff/addBookedRoom', { success: false, roomList, error , layout:'layoutStaff'});
            }
        }

        const newBooked = await BookedRoomModel.create({
            room: room_used_id,
            day: day,
            time_start: time_start_origin,
            time_end: time_end_origin,
            QR_code: QR_code,
            note: note,
            active: active,
            user_staff: userArray
        });
        const level = 1;
        const user = req.session.staff_id;
        newBooked.user_staff.push({user, level});
        const finalNewBooked = await newBooked.save();
        if(newBooked && finalNewBooked){
            res.redirect('/staff/listBookedRoom');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('staff/addBookedRoom', {success: false, roomList, errors, layout:'layoutStaff'});
    }
});

//edit //done
router.get('/editBookedRoom/:id', async(req, res) => {
    try{
        const id = req.params.id;
        const deviceType = 'booked_room';
        var roomList = await getRoomsWithDeviceType(deviceType);
        const bookedData = await BookedRoomModel.findById(id).populate('room');
        if(!roomList){
            const error = process.env.ERROR_SHOWING_DATA + "list of room";
            res.render('staff/editBookedRoom', {success: false, error, bookedData, layout:'layoutStaff'}); 
        } else if(!bookedData){
            res.redirect('/staff/listBookedRoom');
        }
        res.render('staff/editBookedRoom', {success: true, bookedData, roomList, layout:'layoutStaff'}); 
    }catch(error){
        console.error("Error: ", error);
    }
});

router.post('/editBookedRoom/:id', async(req, res) => {
    const id = req.params.id;
    const bookedData = await BookedRoomModel.findById(id).populate('room');
    const deviceType = 'booked_room';
    var roomList = await getRoomsWithDeviceType(deviceType);
    try{
        const room = req.body.room;
        const note = req.body.note;

        const day = req.body.day;
        const time_start_origin = req.body.time_start;
        const time_end_origin = req.body.time_end;

        if (!isValidTimeRange(time_start_origin, time_end_origin)) {
            const error = 'Start time must be earlier than end time.';
            return res.render('staff/editBookedRoom', {success: false, roomList, bookedData, error, layout:'layoutStaff'});
        } else if(!isDayLaterThanToday(day)){
            const error = 'The selected day is later than the current day.';
            return res.render('staff/editBookedRoom', {success: false, roomList, bookedData, error, layout:'layoutStaff'});
        }

        const QR_code = 'Room is booked in ' + day + ' Start at '+ time_start_origin + ' and end at ' + time_end_origin;

        if(room){
            const newBooked = await BookedRoomModel.findByIdAndUpdate(id,{
                room: room,
                day: day,
                time_start: time_start_origin,
                time_end: time_end_origin,
                QR_code: QR_code,
                note: note,
            });
            if(newBooked){
                return res.redirect('/staff/listBookedRoom');
            }
        } else if(!room){
            const newBooked = await BookedRoomModel.findByIdAndUpdate(id,{
                day: day,
                time_start: time_start_origin,
                time_end: time_end_origin,
                QR_code: QR_code,
                note: note,
            });
            if(newBooked){
                return res.redirect('/staff/listBookedRoom');
            }
        }
        
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_EDIT_DATA;
        res.render('staff/editBookedRoom', {success: false, roomList, bookedData, errors, layout:'layoutStaff'});
    }
});

//remove user from booked room
router.get('/removeUserBookedRoom/:userId/:roomId', async(req, res) => {
    const userId = req.params.userId;
    const roomId = req.params.roomId;
    console.log("User ID: ", userId);
    console.log("Main Room ID: ", roomId);
    try{
        const bookedRoom = await BookedRoomModel.findById(roomId);
        if(!bookedRoom){
            return res.redirect('/staff/listBookedRoom');
        }
        bookedRoom.user_staff = bookedRoom.user_staff.filter(user_staff => user_staff.user.toString() !== userId);
        await bookedRoom.save();
        res.redirect('/staff/detailBookedRoom/' + roomId);

    }catch(error){
        console.error("Error: ", error);
    }
});

//add User to Booked Room
router.get('/addUserBookedRoom/:roomId', async(req, res) => {
    const roomId = req.params.roomId;
    try{
        res.render('staff/addUserBookedRoom', {success: true, roomId, layout:'layoutStaff'});
    }catch(error){
        console.error("Error: ", error);
        res.redirect('/staff/detailBookedRoom/' + roomId);
    }
});

router.post('/addUserBookedRoom/:roomId', async(req, res) => {
    const roomId = req.params.roomId;
    try{
        const mainRoom = await BookedRoomModel.findById(roomId);
        const user_email = req.body.user_email;
        console.log("User Email: ", user_email);
        const userData = await UserModel.findOne({email: user_email});
        if(!userData){ //check if email exist in the database
            console.log("User is not exist in the system");
            const error = process.env.EMPTY_DATA + ': user with email ' + user_email;
            return res.render('staff/addUserBookedRoom', {success: false, error, roomId, layout:'layoutStaff'});
        }
        
        const existingUser = await BookedRoomModel.findOne({ 
            _id: roomId,
            'user_staff.user': userData._id
        });

        if(existingUser){   //check if user is already in the list
            console.log("User already exist in the room");
            const error = process.env.EXIST_DATA;
            return res.render('staff/addUserBookedRoom', {success: false, error, roomId, layout:'layoutStaff'});
        }

        //Save data to database
        const user = userData._id;
        const level = 2;
        mainRoom.user_staff.push({user, level});
        await mainRoom.save();
        res.redirect('/staff/detailBookedRoom/' + roomId);
        
    }catch(error){
        console.error("Error: ", error);
        res.redirect('/staff/detailBookedRoom/' + roomId);
    }
});

//*********************Các trang phụ khác trông cho nó nhiều********************************** */
//trang xem sách đã mượn
router.get('/borrowBook', async(req, res) => {
    try{
        const staff_id =  req.session.staff_id;
        const userData = await UserModel.findById(staff_id).populate('room_id')
        .populate({path: 'borrow_book.book_id', model: 'book_data'})
        .populate({path: 'table_booked.subject_table_id', model: 'subject_table'});
        res.render('staff/borrowBook', {userData, layout:'layoutStaff'});
    } catch (error){
        console.error("Error: ", error);
        res.redirect('/staff');
    }
});

//trang xem Bàn đã đặt
router.get('/tableBooked', async(req, res) => {
    try{
        const staff_id =  req.session.staff_id;
        const userData = await UserModel.findById(staff_id).populate('room_id')
        .populate({path: 'borrow_book.book_id', model: 'book_data'})
        .populate({path: 'table_booked.subject_table_id', model: 'subject_table'});
        res.render('staff/tableBooked', {userData, layout:'layoutStaff'});
    } catch (error){
        console.error("Error: ", error);
        res.redirect('/staff');
    }
});

//trang xem thông tin truy cập
router.get('/accessLog', async(req, res) => {
    try{
        const staff_id =  req.session.staff_id;
        const accessLogOrigin = await AccessLogModel.find({user_id: staff_id}).populate('department_id');
        const accessLog = accessLogOrigin.slice().reverse();
        res.render('staff/accessLog', {accessLog, layout:'layoutStaff'});
    } catch (error){
        console.error("Error: ", error);
        res.redirect('/staff');
    }
});





module.exports = router;