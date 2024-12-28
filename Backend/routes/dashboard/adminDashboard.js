var express = require('express');
var router = express.Router();

const AccessLogModel = require('../../models/AccessLogModel');
const BookModel = require('../../models/BookDataModel');
const BookedRoomModel = require('../../models/BookedRoomModel');
const DepartmentModel = require('../../models/DepartmentModel');
const DeviceModel = require('../../models/DeviceModel');
const LogicPartModel = require('../../models/LogicPartModel');
const RoomModel = require('../../models/RoomModel');
const RoomTableBookedModel = require('../../models/RoomTableBookedModel');
const SubjectTableModel = require('../../models/SubjectTableModel');
const SwitchLogicModel = require('../../models/SwitchLogicModel');
const UserModel = require('../../models/UserStaffModel');

router.get('/', async(req, res) => {
    try{
        var listRoom = await RoomModel.find({}).populate('department').populate({path: 'device.device_id', model: 'device'});
        if(listRoom.length === 0){
            const message = process.env.EMPTY_DATA;
            res.render('admin/dashboard', {success: true, message, layout:'layoutAdminNoReload'});
        }
        res.render('admin/dashboard', {success: true, listRoom, layout:'layoutAdminNoReload'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA;
        res.render('admin/dashboard', {success: false, errors, layout:'layoutAdminNoReload'});
    }
});

// router.get('/listUserRoom/:id', async(req, res)=> {
//     try{
//         const roomId = req.params.id;
//         const listUser = await UserModel.find({room_id: roomId});
//         res.render('admin/dashboard', {success: true, listUser, layout:'layoutAdminNoReload'});
//     }catch(error){
//         console.error("Error: ", error);
//         const errors = process.env.ERROR_SHOWING_DATA;
//         res.render('admin/dashboard', {success: false, errors, layout:'layoutAdminNoReload'});
//     }
// });

// router.get('/detailDevice/:idDevice', async(req, res) => {
//     try{    
//         const deviceId = req.params.idDevice;
//         const detailDevice = await DeviceModel.findById(deviceId);
//         let arrayLog = detailDevice.device_log
//         const deviceLogLength = detailDevice.device_log.length();
//         const lastLog = arrayLog[deviceLogLength];

//         res.render('admin/dashboard', {success: true, detailDevice, lastLog, layout:'layoutAdmin'});

//     }catch(error){
//         console.error("Error: ", error);
//         const errors = process.env.ERROR_SHOWING_DATA;
//         res.render('admin/dashboard', {success: false, errors, layout:'layoutAdmin'});
//     }
// })






















module.exports = router;