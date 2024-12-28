var express = require('express');
var router = express.Router();

var MainModel = require('../../models/RoomTableBookedModel');
var RoomModel = require('../../models/RoomModel');
var SubjecTableModel = require('../../models/SubjectTableModel');
var DeviceModel = require('../../models/DeviceModel');

//list of data //done
router.get('/', async(req, res) => {
    try{
        var list = await MainModel.find({}).populate('room');
        var active_list = await MainModel.find({active: 2}).populate('room');
        var deactive_list = await MainModel.find({active: 1}).populate('room');

        if(list.length === 0){
            const error = process.env.EMPTY_DATA + ": table";
            res.render('admin/library/room_table_booked/index', {success: false, error ,layout:'layoutAdmin' });
        }
        res.render('admin/library/room_table_booked/index', {success: true, list, active_list, deactive_list, layout:'layoutAdmin'});
    } catch (error) {
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA + ": list of table";
        res.render('admin/library/room_table_booked/index', {success: false, errors,layout:'layoutAdmin'});

    }
});

//delete //done
router.get('/delete/:id', async(req, res) => {
    var list = await MainModel.find({}).populate('room');
    var active_list = await MainModel.find({active: 2}).populate('room');
    var deactive_list = await MainModel.find({active: 1}).populate('room');
    try{
        var id = req.params.id;
        const data = await MainModel.findById(id);
        if(data){
            await MainModel.deleteOne(data);
            res.redirect('/roomtablebooked');
        } else {
            const error = process.env.ERROR_DELETING_DATA;
            res.render('admin/library/room_table_booked/index', {success: false, error, list, active_list, deactive_list, layout:'layoutAdmin'});
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DELETING_DATA;
        res.render('admin/library/room_table_booked/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
    }
});

//deactive //done
router.get('/deactive/:id', async(req, res)=> {
    var list = await MainModel.find({}).populate('room');
    var active_list = await MainModel.find({active: 2}).populate('room');
    var deactive_list = await MainModel.find({active: 1}).populate('room');    
    try{
        const id = req.params.id;
        const subject = await MainModel.findById(id);
        if(!subject){
            const errors = process.env.ERROR_SHOWING_DATA;
            res.render('admin/library/room_table_booked/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
        }
        const deactive = 1;
        const deactiveSubject = await MainModel.findByIdAndUpdate(id, {active: deactive });
        if(deactiveSubject){
            res.redirect('/roomtablebooked');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DEACTIVE;
        res.render('admin/library/room_table_booked/index', {success: false, errors, list, active_list, deactive_list,layout:'layoutAdmin'});
    }
});

//active //done
router.get('/active/:id', async(req, res)=> {
var list = await MainModel.find({}).populate('room');
        var active_list = await MainModel.find({active: 2}).populate('room');
        var deactive_list = await MainModel.find({active: 1}).populate('room');    
    try{
        const id = req.params.id;
        const subject = await MainModel.findById(id);
        if(!subject){
            const errors = process.env.ERROR_SHOWING_DATA;
            res.render('admin/library/room_table_booked/index', {success: false, errors, list, active_list, deactive_list,layout:'layoutAdmin'});
        }
        const deactive = 2;
        const deactiveSubject = await MainModel.findByIdAndUpdate(id, {active: deactive });
        if(deactiveSubject){
            res.redirect('/roomtablebooked');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DEACTIVE;
        res.render('admin/library/room_table_booked/index', {success: false, errors, list, active_list, deactive_list,layout:'layoutAdmin'});
    }
});

//add new //done
router.get('/add', async(req, res) => {
    var list = await MainModel.find({}).populate('room');
    var active_list = await MainModel.find({active: 2}).populate('room');
    var deactive_list = await MainModel.find({active: 1}).populate('room');    
    try{
        const roomList = await RoomModel.find({});
        if(roomList.length === 0){
            const error = process.env.EMPTY_DATA + ' list of room';
            res.render('admin/library/room_table_booked/add',{success: true, error,layout:'layoutAdminNoReload'});
        }
        res.render('admin/library/room_table_booked/add',{success: true, roomList,layout:'layoutAdminNoReload'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/library/room_table_booked/index', {success: false, errors, list, active_list, deactive_list,layout:'layoutAdminNoReload'});
    }
});

router.post('/add', async(req, res) => {
    var list = await MainModel.find({}).populate('room');
    var active_list = await MainModel.find({active: 2}).populate('room');
    var deactive_list = await MainModel.find({active: 1}).populate('room');    
    try{
        const roomList = await RoomModel.find({});
        const room_id = req.body.room_id;
        const table_quantity = req.body.table_quantity;
        const active = 2;
        const note = req.body.note;

        const checkRoom = await MainModel.find({room: room_id});
        
        if(checkRoom.length !== 0){
            const error = process.env.ERROR_CREATE_DATA + ' solution: choose other room';
            return res.render('admin/library/room_table_booked/add',{success: false, error, roomList,layout:'layoutAdminNoReload'});
        }

        const newRoom = await MainModel.create({
            room: room_id,
            table_quantity: table_quantity,
            note: note,
            active: active
        })
        if(newRoom){
            res.redirect('/roomtablebooked');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/library/room_table_booked/index', {success: false, errors, list, active_list, deactive_list,layout:'layoutAdminNoReload'});
    }
});

//edit //done
router.get('/edit/:id', async(req, res) => {
    var list = await MainModel.find({}).populate('room');
    var active_list = await MainModel.find({active: 2}).populate('room');
    var deactive_list = await MainModel.find({active: 1}).populate('room');    
    try{
        const id = req.params.id;
        const mainSubject = await MainModel.findById(id);
        if(!mainSubject){
            const error = process.env.ERROR_SHOWING_DATA + ' room table booked';
            res.render('admin/library/room_table_booked/index',{success: true, error, list, active_list, deactive_list,layout:'layoutAdminNoReload'});
        }
        const roomList = await RoomModel.find({_id:{ $ne: mainSubject.room}});
        const originRoom = await RoomModel.findById(mainSubject.room);
        if(roomList.length === 0){
            const error = process.env.EMPTY_DATA + ' list of room';
            res.render('admin/library/room_table_booked/edit',{success: true, error, mainSubject,originRoom, layout:'layoutAdminNoReload'});
        }
        res.render('admin/library/room_table_booked/edit',{success: true, roomList, mainSubject, originRoom, layout:'layoutAdminNoReload'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_EDIT_DATA;
        res.render('admin/library/room_table_booked/index', {success: false, errors, list, active_list, deactive_list,layout:'layoutAdminNoReload'});
    }
});

router.post('/edit/:id', async(req, res) => {
    var list = await MainModel.find({}).populate('room');
    var active_list = await MainModel.find({active: 2}).populate('room');
    var deactive_list = await MainModel.find({active: 1}).populate('room');    
    try{
        const id = req.params.id;
        const mainSubject = await MainModel.findById(id);
        const roomList = await RoomModel.find({_id:{ $ne: mainSubject.room}});
        const originRoom = await RoomModel.findById(mainSubject.room);
        if(!mainSubject){
            const error = process.env.ERROR_SHOWING_DATA + ' room table booked';
            res.render('admin/library/room_table_booked/index',{success: true, error, list, active_list, deactive_list,layout:'layoutAdminNoReload'});
        }
        const room_id = req.body.room_id;
        const table_quantity = req.body.table_quantity;
        const note = req.body.note;

        const checkRoom = await MainModel.find({room: room_id});
        if(!room_id && checkRoom.length === 0){
            const editRoom = await MainModel.findByIdAndUpdate(id,{
                table_quantity: table_quantity,
                note: note,
            })
            if(editRoom){
                return res.redirect('/roomtablebooked');
            }
        } if (room_id && checkRoom.length === 0){
            const editRoom = await MainModel.findByIdAndUpdate(id,{
                room: room_id,
                table_quantity: table_quantity,
                note: note,
            })
            if(editRoom){
                return res.redirect('/roomtablebooked');
            }
        } else {
            const error = process.env.ERROR_EDIT_DATA + ' solution: choose other room';
            res.render('admin/library/room_table_booked/edit',{success: true, error, roomList, mainSubject, originRoom, layout:'layoutAdminNoReload'});

        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_EDIT_DATA;
        res.render('admin/library/room_table_booked/index', {success: false, errors, list, active_list, deactive_list,layout:'layoutAdminNoReload'});
    }
});

//--------------------------------Subject Table---------------------------------------------
//list of table //done
router.get('/tableList/:id', async(req, res) => { 
    try{
        const id = req.params.id;
        const main_id = id;
        var list = await SubjecTableModel.find({room_table_booked: id}).populate('device');
        var active_list = await SubjecTableModel.find({room_table_booked: id, status: 2}).populate('device');
        var deactive_list = await SubjecTableModel.find({room_table_booked: id, status: 1}).populate('device');
        if(list.length === 0){
            const error = process.env.EMPTY_DATA + ": list of table";
            res.render('admin/library/subject_table/index', {success: false, error, main_id, layout:'layoutAdmin'});
        }
        res.render('admin/library/subject_table/index', {success: true, list, active_list, deactive_list, main_id,layout:'layoutAdmin'});
    } catch (error) {
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA + ": list of table";
        res.render('admin/library/subject_table/index', {success: false, errors,layout:'layoutAdmin'});
    }
});

//delete //flaw logic (fix later) //done
router.get('/deleteTable/:id', async(req, res) => {
    try{
        var delete_id = req.params.id;
        const data = await SubjecTableModel.findById(delete_id);
        if(data){
            const id_source = data.room_table_booked;
            const used = 'no';
            await DeviceModel.findByIdAndUpdate(data.device,{used: used });
            await SubjecTableModel.findByIdAndDelete(delete_id);
            res.redirect('/roomtablebooked/tableList/' + id_source);
        } 
    }catch(error){
        console.error("Error: ", error);        
    }
});

//add table //done
router.get('/addTable/:id', async(req, res)=> {
    const id_source = req.params.id;
    try{
        const type_device = "booked_table";
        const device_used = "no";
        var deviceList = await DeviceModel.find({type: type_device, used: device_used});
        console.log('Device List: ', deviceList);
        if(deviceList.length === 0){
            const error = process.env.EMPTY_DATA + '. Solution: add new device first';
            res.render('admin/library/subject_table/add', {success: false, id_source, deviceList, error, layout:'layoutAdminNoReload'});
        }
        res.render('admin/library/subject_table/add', {success: true, id_source, deviceList,layout:'layoutAdminNoReload'});
    }catch(error){
        console.error("Error: ", error);
        res.redirect('/roomtablebooked/tableList/' + id_source);
    }
});

router.post('/addTable/:id', async(req, res)=> {
    const id_source = req.params.id;
    try{
        const type_device = "booked_table";
        const device_used = "no";
        var deviceList = await DeviceModel.find({type: type_device, used: device_used});

        const main_room_id = id_source;
        const table_name = req.body.table_name;
        const status = 1;
        const device = req.body.device;
        
        const findRoom = await MainModel.findById(main_room_id);
        const findDevice = await DeviceModel.findById(device);
        const checkDevice = await SubjecTableModel.find({device: device});

        if(!findDevice || !findRoom || checkDevice.length !== 0){
            const error = process.env.ERROR_SHOWING_DATA + ' device ';
            return res.render('admin/library/subject_table/add', {success: true, id_source, deviceList, error ,layout:'layoutAdminNoReload'});
        }

        const newTable = await SubjecTableModel.create({
            room_table_booked: main_room_id,
            table_name: table_name,
            status: status,
            device: device
        });
        const editDevice = await DeviceModel.findByIdAndUpdate(device, {used: "yes"});
        if(newTable && editDevice){res.redirect('/roomtablebooked/tableList/' + id_source );}
    }catch(error){
        console.error("Error: ", error);
        res.redirect('/roomtablebooked/tableList/' + id_source);
    }
});

//editTable //done
router.get('/editTable/:id/:main_id', async(req, res)=> {
    const table_id = req.params.id;
    const room_id = req.params.main_id;  
    try{
        const tableData = await SubjecTableModel.findById(table_id);
        if(!tableData){
            res.redirect('/roomtablebooked/tableList/' + room_id);
        }
        const deviceData = await DeviceModel.findById(tableData.device);

        const type_device = "booked_table";
        const device_used = "no";
        var deviceList = await DeviceModel.find({type: type_device, used: device_used, _id:{ $ne: tableData.device}});

        if(deviceList.length === 0){
            const error = process.env.EMPTY_DATA + '. Solution: Create more device with type booked_table';
            res.render('admin/library/subject_table/edit', {success: false, table_id, room_id, tableData, deviceData, error, layout:'layoutAdminNoReload'});
        }
        res.render('admin/library/subject_table/edit', {success: false, table_id, room_id, tableData, deviceList, deviceData, layout:'layoutAdminNoReload'});
    }catch(error){
        console.error("Error: ", error);
        res.redirect('/roomtablebooked/tableList/' + room_id);
    }
});

router.post('/editTable/:id/:main_id', async(req, res)=> {
    const table_id = req.params.id;
    const room_id = req.params.main_id;  
    try{
        const tableData = await SubjecTableModel.findById(table_id);
        if(!tableData){
            res.redirect('/roomtablebooked/tableList/' + room_id);
        }

        const table_name = req.body.table_name;
        const device = req.body.device;
        
        if(device){
            const editOldDevice = await DeviceModel.findByIdAndUpdate(tableData.device, {used: "no"});
            const editNewDevice = await DeviceModel.findByIdAndUpdate(device, {used: "yes"});
            const editTable = await SubjecTableModel.findByIdAndUpdate(table_id, {
                table_name: table_name,
                device: device
            }); 
            if(editOldDevice && editNewDevice && editTable){return res.redirect('/roomtablebooked/tableList/' + room_id );}
        }
        const editTable = await SubjecTableModel.findByIdAndUpdate(table_id, {
            table_name: table_name,
        }); 
        if(editTable){return res.redirect('/roomtablebooked/tableList/' + room_id );}

    }catch(error){
        console.error("Error: ", error);
        res.redirect('/roomtablebooked/tableList/' + room_id);
    }
});
  
module.exports = router;