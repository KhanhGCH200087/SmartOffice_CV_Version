var express = require('express');
var router = express.Router();

var SubjecTableModel = require('../../models/SubjectTableModel');
var DeviceModel = require('../../models/DeviceModel');
var MainRoomModel = require('../../models/RoomTableBookedModel');

//Phần này đã được xử lý trong room_table_booked.js
//list of table
router.get('/', async(req, res) => {
    try{
        var list = await SubjecTableModel.find({}).populate('device').populate('room_table_booked');
        if(list.length === 0){
            const empty_data = process.env.EMPTY_DATA + ": list of table";
            res.render('admin/library/subject_table/index', {success: false, empty_data});
        }
        res.render('admin/library/subject_table/index', {success: true, list});
    } catch (error) {
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA + ": list of table";
        res.render('admin/library/subject_table/index', {success: false, errors});

    }
});

//delete
router.get('/delete/:id', async(req, res) => {
    var list = await SubjecTableModel.find({}).populate('device').populate('room_table_booked');
    try{
        var id = req.params.id;
        const data = await SubjecTableModel.findById(id);
        if(data){
            await SubjecTableModel.deleteOne(data);
            res.redirect('/subjecttable');
        } else {
            const error = process.env.ERROR_DELETING_DATA;
            res.render('admin/library/subject_table/index', {success: false, error, list});
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DELETING_DATA;
        res.render('admin/library/subject_table/index', {success: false, errors, list});
    }
});

//add
router.get('/add', async(req, res)=> {
    var list = await SubjecTableModel.find({}).populate('device').populate('room_table_booked');
    try{
        var mainRoomList = MainRoomModel.find({});
        var deviceList = DeviceModel.find({type: table});
        if(mainRoomList.length === 0 || deviceList.length === 0){
            const error = process.env.EMPTY_DATA + 'device and main room logic';
            res.render('admin/library/subject_table/add', {success: false, error});
        }
        res.render('admin/library/subject_table/add', {success: true, mainRoomList, deviceList});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/library/subject_table/index', {success: false, errors, list});
    }
});

router.get('/add', async(req, res)=> {
    var list = await SubjecTableModel.find({}).populate('device').populate('room_table_booked');
    try{
        const main_room_id = req.body.main_room_id;
        const table_name = req.body.table_name;
        const status = 1;
        const QR_code = 'Table is Free';
        const device = req.body.device;
        
        const findRoom = await MainRoomModel.findById(main_room_id);
        const findDevice = await DeviceModel.findById(device);
        const checkDevice = await SubjecTableModel.find({booked_table_device_id: device});
        if(!findDevice || !findRoom || checkDevice){
            const error = process.env.ERROR_SHOWING_DATA + ' device ';
            res.render('admin/library/subject_table/index', {success: false, error, list});
        }

        const newTable = await SubjecTableModel.create({
            main_room_id: main_room_id,
            table_name: table_name,
            status: status,
            QR_code: QR_code,
            booked_table_device_id: device
        });
        if(newTable){res.redirect('/subjecttable');}
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/library/subject_table/index', {success: false, errors, list});
    }
});

//edit
router.get('/edit/:id', async(req, res)=> {
    var list = await SubjecTableModel.find({}).populate('device').populate('room_table_booked');
    try{
        const id = req.params.id;
        const mainData = await SubjecTableModel.findById(id);
        if(!mainData){
            const errors = process.env.ERROR_EDIT_DATA;
            res.render('admin/library/subject_table/index', {success: false, errors, list});
        }
        var mainRoomList = MainRoomModel.find({});
        var deviceList = DeviceModel.find({type: table});
        if(mainRoomList.length === 0 || deviceList.length === 0){
            const error = process.env.EMPTY_DATA + 'device and main room logic';
            res.render('admin/library/subject_table/edit', {success: false, error, mainData});
        }
        res.render('admin/library/subject_table/edit', {success: true, mainRoomList, deviceList, mainData});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/library/subject_table/index', {success: false, errors, list});
    }
});

router.get('/edit/:id', async(req, res)=> {
    var list = await SubjecTableModel.find({}).populate('device').populate('room_table_booked');
    try{
        const id = req.params.id;
        const mainData = await SubjecTableModel.findById(id);
        if(!mainData){
            const errors = process.env.ERROR_EDIT_DATA;
            res.render('admin/library/subject_table/index', {success: false, errors, list});
        }

        const main_room_id = req.body.main_room_id;
        const table_name = req.body.table_name;
        const status = req.body.status;
        const QR_code = req.body.QR_code;
        const device = req.body.device;
        
        const findRoom = await MainRoomModel.findById(main_room_id);
        const findDevice = await DeviceModel.findById(device);
        if(!findDevice || !findRoom){
            const error = process.env.EMPTY_DATA + ' device or room ';
            res.render('admin/library/subject_table/index', {success: false, error, list});
        }

        const editTable = await SubjecTableModel.findByIdAndUpdate(id,{
            main_room_id: main_room_id,
            table_name: table_name,
            status: status,
            QR_code: QR_code,
            booked_table_device_id: device
        });
        if(editTable){res.redirect('/subjecttable');}
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_EDIT_DATA;
        res.render('admin/library/subject_table/index', {success: false, errors, list});
    }
});




module.exports = router;