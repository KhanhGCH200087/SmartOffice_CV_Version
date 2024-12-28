var express = require('express');
var router = express.Router();
const { formatDate, formatTime, isValidTimeRange, getRoomsWithDeviceType, isDayLaterThanToday, converTime} = require('../code_function');

var BookedRoomModel = require('../../models/BookedRoomModel');
var UserModel = require('../../models/UserStaffModel');
var RoomModel = require('../../models/RoomModel');
var DeviceModel = require('../../models/DeviceModel');

//*********************Admin part***************************** */
//list of booked room //done
router.get('/', async(req, res) => {
    try{
        var list = await BookedRoomModel.find({}).populate('room');
        var active_list = await BookedRoomModel.find({active: 2}).populate('room');
        var deactive_list = await BookedRoomModel.find({active: 1}).populate('room');
        if(list.length === 0){
            const message = process.env.EMPTY_DATA;
            res.render('admin/booked_room/index', {success: true, message, layout:'layoutAdmin'});
        }
        res.render('admin/booked_room/index', {success: true, list, active_list, deactive_list, layout:'layoutAdmin'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA;
        res.render('admin/booked_room/index', {success: false, errors, layout:'layoutAdmin'});
    }
});

//detail of booked room //done
router.get('/detail/:id', async(req, res) => {
    const id = req.params.id;
    try{
        const detail = await BookedRoomModel.findById(id).populate('room').populate({path: 'user_staff.user', model: 'user_staff'});
        if(!detail){
            const message = process.env.EMPTY_DATA;
            res.render('admin/booked_room/detail', {success: true, message, layout:'layoutAdmin'});
        }
        res.render('admin/booked_room/detail', {success: false, detail, layout:'layoutAdmin'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA;
        res.render('admin/booked_room/detail/' + id, {success: false, errors, layout:'layoutAdmin'});
    }
});

//delete //done
router.get('/delete/:id', async(req, res) => {
    var list = await BookedRoomModel.find({}).populate('room');
    var active_list = await BookedRoomModel.find({active: 2}).populate('room');
    var deactive_list = await BookedRoomModel.find({active: 1}).populate('room');
    try{
        var id = req.params.id;
        const data = await BookedRoomModel.findById(id);
        if(data){
            await BookedRoomModel.findByIdAndDelete(id);
            res.redirect('/bookedroom');
        } else {
            const error = process.env.ERROR_DELETING_DATA;
            res.render('admin/booked_room/index', {success: false, error, list, active_list, deactive_list, layout:'layoutAdmin'});
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DELETING_DATA;
        res.render('admin/booked_room/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
    }
});

//deactive room //done
router.get('/deactive/:id', async(req, res)=> {
    var list = await BookedRoomModel.find({}).populate('room');
    var active_list = await BookedRoomModel.find({active: 2}).populate('room');
    var deactive_list = await BookedRoomModel.find({active: 1}).populate('room');
    try{
        const id = req.params.id;
        const subject = await BookedRoomModel.findById(id);
        if(!subject){
            const errors = process.env.ERROR_SHOWING_DATA;
            res.render('admin/booked_room/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
        }
        const deactive = 1;
        const deactiveSubject = await BookedRoomModel.findByIdAndUpdate(id, {active: deactive });
        if(deactiveSubject){
            res.redirect('/bookedroom');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DEACTIVE;
        res.render('admin/booked_room/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
    }

});

//active room //done
router.get('/active/:id', async(req, res)=> {
    var list = await BookedRoomModel.find({}).populate('room');
    var active_list = await BookedRoomModel.find({active: 2}).populate('room');
    var deactive_list = await BookedRoomModel.find({active: 1}).populate('room');
    try{
        const id = req.params.id;
        const subject = await BookedRoomModel.findById(id);
        if(!subject){
            const errors = process.env.ERROR_SHOWING_DATA;
            res.render('admin/booked_room/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
        }
        const deactive = 2;
        const deactiveSubject = await BookedRoomModel.findByIdAndUpdate(id, {active: deactive });
        if(deactiveSubject){
            res.redirect('/bookedroom');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DEACTIVE;
        res.render('admin/booked_room/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
    }

});

//add new //done
router.get('/add', async(req, res) => {
    try{
        var userList = await UserModel.find({});
        const deviceType = 'booked_room';
        var roomList = await getRoomsWithDeviceType(deviceType);
        if(!userList || !roomList){
            const error = process.env.ERROR_SHOWING_DATA + "list of user or list of room";
            res.render('admin/booked_room/add', {success: false, error, layout:'layoutAdminNoReload'}); 
        }
        res.render('admin/booked_room/add', {success: true, userList, roomList, layout:'layoutAdminNoReload'}); 
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/booked_room/add', {success: false, errors, layout:'layoutAdminNoReload'});
    }
    
});

router.post('/add', async(req, res) => {
    const deviceType = 'booked_room';
    var roomList = await getRoomsWithDeviceType(deviceType);
    try{
        const room_used_id = req.body.room;
        const note = req.body.note;
        const active = 2;

        const user = req.session.admin_id;
        const userData = await UserModel.findById(user);

        const day = req.body.day;
        const time_start_input = req.body.time_start;
        const time_end_input = req.body.time_end;

        if (!isValidTimeRange(time_start_input, time_end_input)) {
            const error = 'Start time must be earlier than end time.';
            return res.render('admin/booked_room/add', { success: false, roomList, error , layout:'layoutAdminNoReload'});
        } else if(!isDayLaterThanToday(day)){
            const error = 'The selected day is later than the current day.';
            return res.render('admin/booked_room/add', { success: false, roomList, error , layout:'layoutAdminNoReload'});
        }

        const time_start_input_convert = converTime(time_start_input);
        const time_end_input_convert = converTime(time_end_input);
        const availableBookedRoom = await BookedRoomModel.find({active: active, day: day, room: room_used_id});

        let length_bookedRoom = availableBookedRoom.length;
        if(length_bookedRoom > 0){ //check điều kiện thời gian đặt phòng 
            for(let i = 0; i <= length_bookedRoom; i++){
                const time_start_origin = converTime(availableBookedRoom[i].time_start);
                const time_end_origin = converTime(availableBookedRoom[i].time_end);
                const roomData = await RoomModel.findById(availableBookedRoom[i].room);

                if(time_start_origin < time_start_input_convert < time_end_origin){ //thời gian đặt phòng mới trùng với khoảng thời gian đang họp, chưa xong 
                    const error = 'Room ' + roomData.name + ' is not free at '+ time_start_input + ' to '+ time_end_input;
                    return res.render('admin/booked_room/add', { success: false, roomList, error , layout:'layoutAdminNoReload'});
                } else if(time_start_origin < time_end_input_convert < time_end_origin) { // cần kết thúc buổi họp trước time_start_origin để bắt đầu cuộc họp mới
                    const error = 'Room ' + roomData.name + ' is not free at '+ time_start_input + ' to '+ time_end_input;
                    return res.render('admin/booked_room/add', { success: false, roomList, error , layout:'layoutAdminNoReload'});
                }
            }
        }
        
        const QR_code = 'Room is booked in ' + day + ' Start at '+ time_start_input + ' and end at ' + time_end_input + '. Contact '+ userData.name + ' at ' + userData.email + ' for more information.';

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
                return res.render('admin/booked_room/add', { success: false, roomList, error , layout:'layoutAdminNoReload'});
            }
        }

        const newBooked = await BookedRoomModel.create({
            room: room_used_id,
            day: day,
            time_start: time_start_input,
            time_end: time_end_input,
            QR_code: QR_code,
            note: note,
            active: active,
            user_staff: userArray
        });
        const level = 1;
        newBooked.user_staff.push({user, level});
        const finalNewBooked = await newBooked.save();
        if(newBooked && finalNewBooked){
            res.redirect('/bookedroom');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/booked_room/add', {success: false, roomList, errors, layout:'layoutAdminNoReload'});
    }
});

//edit //done
router.get('/edit/:id', async(req, res) => {
    try{
        const id = req.params.id;
        const deviceType = 'booked_room';
        var roomList = await getRoomsWithDeviceType(deviceType);
        const bookedData = await BookedRoomModel.findById(id).populate('room');
        if(!roomList){
            const error = process.env.ERROR_SHOWING_DATA + "list of room";
            res.render('admin/booked_room/edit', {success: false, error, bookedData, layout:'layoutAdminNoReload'}); 
        } else if(!bookedData){
            res.redirect('/bookedroom');
        }
        res.render('admin/booked_room/edit', {success: true, bookedData, roomList, layout:'layoutAdminNoReload'}); 
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/booked_room/add', {success: false, errors, layout:'layoutAdminNoReload'});
    }
});

router.post('/edit/:id', async(req, res) => {
    const id = req.params.id;
    const bookedData = await BookedRoomModel.findById(id).populate('room');
    const deviceType = 'booked_room';
    var roomList = await getRoomsWithDeviceType(deviceType);
    try{
        const room = req.body.room;
        const note = req.body.note;

        const user = req.session.admin_id;
        const userData = await UserModel.findById(user);

        const day = req.body.day;
        const time_start_input = req.body.time_start;
        const time_end_input = req.body.time_end;

        if (!isValidTimeRange(time_start_input, time_end_input)) {
            const error = 'Start time must be earlier than end time.';
            return res.render('admin/booked_room/edit', {success: false, roomList, bookedData, error, layout:'layoutAdminNoReload'});
        } else if(!isDayLaterThanToday(day)){
            const error = 'The selected day is later than the current day.';
            return res.render('admin/booked_room/edit', {success: false, roomList, bookedData, error, layout:'layoutAdminNoReload'});
        }

        const time_start_input_convert = converTime(time_start_input);
        const time_end_input_convert = converTime(time_end_input);
        const availableBookedRoom = await BookedRoomModel.find({active: 2, day: day, room: room});

        let length_bookedRoom = availableBookedRoom.length;
        if(length_bookedRoom > 0){ //check điều kiện thời gian đặt phòng 
            for(let i = 0; i <= length_bookedRoom; i++){
                const time_start_origin = converTime(availableBookedRoom[i].time_start);
                const time_end_origin = converTime(availableBookedRoom[i].time_end);
                const roomData = await RoomModel.findById(availableBookedRoom[i].room);

                if(time_start_origin < time_start_input_convert < time_end_origin){ //thời gian đặt phòng mới trùng với khoảng thời gian đang họp, chưa xong 
                    const error = 'Room ' + roomData.name + ' is not free at '+ time_start_input + ' to '+ time_end_input;
                    return res.render('admin/booked_room/edit', {success: false, roomList, bookedData, error, layout:'layoutAdminNoReload'});
                } else if(time_start_origin < time_end_input_convert < time_end_origin) { // cần kết thúc buổi họp trước time_start_origin để bắt đầu cuộc họp mới
                    const error = 'Room ' + roomData.name + ' is not free at '+ time_start_input + ' to '+ time_end_input;
                    return res.render('admin/booked_room/edit', {success: false, roomList, bookedData, error, layout:'layoutAdminNoReload'});
                }
            }
        }

        const QR_code = 'Room is booked in ' + day + ' Start at '+ time_start_origin + ' and end at ' + time_end_origin + '. Contact '+ userData.name + ' at ' + userData.email + ' for more information.';

        if(room){
            const newBooked = await BookedRoomModel.findByIdAndUpdate(id,{
                room: room,
                day: day,
                time_start: time_start_input,
                time_end: time_end_input,
                QR_code: QR_code,
                note: note,
            });
            if(newBooked){
                return res.redirect('/bookedroom');
            }
        } else if(!room){
            const newBooked = await BookedRoomModel.findByIdAndUpdate(id,{
                day: day,
                time_start: time_start_input,
                time_end: time_end_input,
                QR_code: QR_code,
                note: note,
            });
            if(newBooked){
                return res.redirect('/bookedroom');
            }
        }
        
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/booked_room/edit', {success: false, roomList, bookedData, errors, layout:'layoutAdminNoReload'});
    }
});

//Remove User //done
router.get('/removeUser/:userId/:roomId', async(req, res) => {
    const userId = req.params.userId;
    const roomId = req.params.roomId;
    console.log("User ID: ", userId);
    console.log("Main Room ID: ", roomId);
    try{
        const bookedRoom = await BookedRoomModel.findById(roomId);
        if(!bookedRoom){
            return res.redirect('/bookedroom');
        }
        bookedRoom.user_staff = bookedRoom.user_staff.filter(user_staff => user_staff.user.toString() !== userId);
        await bookedRoom.save();
        res.redirect('/bookedroom/detail/' + roomId);
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_REMOVE_DATA + ' user of the booked room';
        res.render('admin/booked_room/detail/' + roomId, {success: false, errors, layout:'layoutAdmin'});
    }
});

//Add User to booked room //done
router.get('/addUser/:roomId', async(req, res) => {
    const roomId = req.params.roomId;
    try{
        res.render('admin/booked_room/addUser', {success: true, roomId, layout:'layoutAdminNoReload'});
    }catch(error){
        console.error("Error: ", error);
        res.redirect('/bookedroom/detail/' + roomId);
    }
});

router.post('/addUser/:roomId', async(req, res) => {
    const roomId = req.params.roomId;
    try{
        const mainRoom = await BookedRoomModel.findById(roomId);
        const user_email = req.body.user_email;
        console.log("User Email: ", user_email);
        const userData = await UserModel.findOne({email: user_email});
        if(!userData){ //check if email exist in the database
            console.log("User is not exist in the system");
            const error = process.env.EMPTY_DATA + ': user with email ' + user_email;
            return res.render('admin/booked_room/addUser', {success: false, error, roomId, layout:'layoutAdminNoReload'});
        }
        
        const existingUser = await BookedRoomModel.findOne({ 
            _id: roomId,
            'user_staff.user': userData._id
        });

        if(existingUser){   //check if user is already in the list
            console.log("User already exist in the room");
            const error = process.env.EXIST_DATA;
            return res.render('admin/booked_room/addUser', {success: false, error, roomId, layout:'layoutAdminNoReload'});
        }

        //Save data to database
        const user = userData._id;
        const level = 2;
        mainRoom.user_staff.push({user, level});
        await mainRoom.save();
        res.redirect('/bookedroom/detail/' + roomId);
        
    }catch(error){
        console.error("Error: ", error);
        res.redirect('/bookedroom/detail/' + roomId);
    }
});




module.exports = router;