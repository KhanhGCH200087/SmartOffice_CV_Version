var express = require('express');
var router = express.Router();

var RoomModel = require('../../models/RoomModel');
var DepartmentModel = require('../../models/DepartmentModel');
var DeviceModel = require('../../models/DeviceModel');
//list of room //done
router.get('/', async(req, res) => {
    try{
        var list = await RoomModel.find({}).populate('department').populate({path: 'device.device_id', model: 'device'});
        var active_list = await RoomModel.find({active: 2}).populate('department').populate({path: 'device.device_id', model: 'device'});
        var deactive_list = await RoomModel.find({active: 1}).populate('department').populate({path: 'device.device_id', model: 'device'});
        if(list.length === 0){
            const message = process.env.EMPTY_DATA;
            res.render('admin/building/room/index', {success: true, message, layout:'layoutAdmin'});
        }
        res.render('admin/building/room/index', {success: true, list, active_list, deactive_list, layout:'layoutAdmin'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA;
        res.render('admin/building/room/index', {success: false, errors, layout:'layoutAdmin'});
    }
});

//detail //done
router.get('/detail/:id', async(req, res) => {
    try{
        const id = req.params.id;
        const detail = await RoomModel.findById(id).populate('department').populate({path: 'device.device_id', model: 'device'});
        if(!detail){ 
            const message = process.env.EMPTY_DATA;
            res.render('admin/building/room/detail', {success: true, message, layout:'layoutAdmin'});
        }
        res.render('admin/building/room/detail', {success: false, detail, layout:'layoutAdmin'});
        // console.log(detail);
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA;
        res.render('admin/building/room/detail', {success: false, errors, layout:'layoutAdmin'});
    }
});

//delete //done
router.get('/delete/:id', async(req, res) => {
    var list = await RoomModel.find({}).populate('department').populate('device');
    var active_list = await RoomModel.find({active: 2}).populate('department').populate('device');
    var deactive_list = await RoomModel.find({active: 1}).populate('department').populate('device');
    try{
        var id = req.params.id;
        const data = await RoomModel.findById(id);
        if(data){
            const deviceList = data.device.length();
            if(deviceList > 0){
                const message = "Remove device from the room "+ data.name + " before delete the room";
                res.render('admin/building/room/index', {success: false, message, list, active_list, deactive_list, layout:'layoutAdmin'});
            }
            await RoomModel.findByIdAndDelete(id);
            res.redirect('/room');
        } else {
            const error = process.env.ERROR_DELETING_DATA;
            res.render('admin/building/room/index', {success: false, error, list, active_list, deactive_list, layout:'layoutAdmin'});
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DELETING_DATA;
        res.render('admin/building/room/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
    }
});

//deactive room //done
router.get('/deactive/:id', async(req, res)=> {
    var list = await RoomModel.find({}).populate('department').populate('device');
    var active_list = await RoomModel.find({active: 2}).populate('department').populate('device');
    var deactive_list = await RoomModel.find({active: 1}).populate('department').populate('device');
    try{
        const id = req.params.id;
        const subject = await RoomModel.findById(id);
        if(!subject){
            const errors = process.env.ERROR_SHOWING_DATA;
            res.render('admin/building/room/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
        }
        const deactive = 1;
        const deactiveSubject = await RoomModel.findByIdAndUpdate(id, {active: deactive , layout:'layoutAdmin'});
        if(deactiveSubject){
            res.redirect('/room');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DEACTIVE;
        res.render('admin/building/room/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
    }
});

//active room //done
router.get('/active/:id', async(req, res)=> {
    var list = await RoomModel.find({}).populate('department').populate('device');
    var active_list = await RoomModel.find({active: 2}).populate('department').populate('device');
    var deactive_list = await RoomModel.find({active: 1}).populate('department').populate('device');
    try{
        const id = req.params.id;
        const subject = await RoomModel.findById(id);
        if(!subject){
            const errors = process.env.ERROR_SHOWING_DATA;
            res.render('admin/building/room/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
        }
        const active = 2;
        const activeSubject = await RoomModel.findByIdAndUpdate(id, {active: active , layout:'layoutAdmin'});
        if(activeSubject){
            res.redirect('/room');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_ACTIVE;
        res.render('admin/building/room/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
    }
});

//add new room //done
router.get('/add', async(req, res)=>{
    try{
        const departmentList = await DepartmentModel.find({});
        const deviceList = await DeviceModel.find({});
        if(!departmentList || !deviceList){
            const message = process.env.EMPTY_DATA + "list of department or list of device";
            res.render('admin/building/room/add', {success: false, message, layout:'layoutAdminNoReload'});    
        }
        res.render('admin/building/room/add', {success: true, departmentList, deviceList, layout:'layoutAdminNoReload'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/building/room/add', {success: false, errors, layout:'layoutAdminNoReload'});
    }
});

router.post('/add', async(req, res)=>{
    try{
        const name = req.body.name;
        const floor = req.body.floor;
        const department_id = req.body.department_id;
        const active = 2;

        const devices = req.body.device;
        //array of device
        let deviceArray = [];
        if(devices){
            if(Array.isArray(devices)){
                deviceArray = devices;
            } else {
                deviceArray = [devices];
            }
        }
        if(deviceArray.length > 0){
            const foundDevice = await DeviceModel.find({_id: {$id: deviceArray}});
            if(foundDevice.length !== deviceArray.length){
                const error = process.env.ERROR_CREATE_DATA + 'because of data device';
                return res.render('admin/building/room/add', {success: false, error, layout:'layoutAdminNoReload'});
            }
        }

        const newRoom = await RoomModel.create({
            name: name,
            floor: floor,
            department: department_id,
            active: active,
            room_device: deviceArray
        });
        if(newRoom){
            res.redirect('/room');
        }

    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/building/room/add', {success: false, errors, layout:'layoutAdminNoReload'});
    }
});

//edit room //done
router.get('/edit/:id', async(req, res)=>{
    var list = await RoomModel.find({}).populate('department').populate('device');
    var active_list = await RoomModel.find({active: 2}).populate('department').populate('device');
    var deactive_list = await RoomModel.find({active: 1}).populate('department').populate('device');
    try{
        const id = req.params.id;
        const data = await RoomModel.findById(id).populate('department').populate('device');
        const department_origin = await DepartmentModel.findById(data.department);
        const departmentList = await DepartmentModel.find({_id:{ $ne: data.department}});
        const deviceList = await DeviceModel.find({});
        if(!departmentList || !deviceList ||!data){
            const message = process.env.EMPTY_DATA + "list of department or list of device or room data";
            res.render('admin/building/room/edit', {success: false, message, layout:'layoutAdminNoReload'});    
        }
        res.render('admin/building/room/edit', {success: true, departmentList, deviceList, data, department_origin, layout:'layoutAdminNoReload'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_EDIT_DATA;
        res.render('admin/building/room/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdminNoReload'});
    }
});

router.post('/edit/:id', async(req, res)=>{
    const id = req.params.id;
    const data = await RoomModel.findById(id).populate('department').populate('device');
    const department_origin = await DepartmentModel.findById(data.department);
    const departmentList = await DepartmentModel.find({_id:{ $ne: data.department}});
    const deviceList = await DeviceModel.find({});
    try{
        const name = req.body.name;
        const floor = req.body.floor;
        const department_id = req.body.department_id;

        if(department_id){
            const newRoom = await RoomModel.findByIdAndUpdate(id,{
                name: name,
                floor: floor,
                department: department_id,
            });
            if(newRoom){
                res.redirect('/room');
            }
        } else {
            const newRoom = await RoomModel.findByIdAndUpdate(id,{
                name: name,
                floor: floor,
            });
            if(newRoom){
                res.redirect('/room');
            }
        }
        
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_EDIT_DATA;
        res.render('admin/building/room/edit', {success: false, departmentList, deviceList, data, department_origin, errors, layout:'layoutAdminNoReload'});
    }
});

//Add new device to room //done
router.get('/addDevice/:id', async(req, res) => {
    var list = await RoomModel.find({}).populate('department').populate('device');
    var active_list = await RoomModel.find({active: 2}).populate('department').populate('device');
    var deactive_list = await RoomModel.find({active: 1}).populate('department').populate('device');
    try{
        const id = req.params.id;
        const free_device = 'no';
        const dataRoom = await RoomModel.findById(id).populate('department').populate('device');
        const deviceList = await DeviceModel.find({used: free_device})
        res.render('admin/building/room/addDevice', {success: true, dataRoom, deviceList, layout: 'layoutAdminNoReload'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA + ' ad new device to the room';
        res.render('admin/building/room/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdminNoReload'});
    }
});

router.post('/addDevice/:id', async (req, res) => {
    // Fetch the list of rooms
    var list = await RoomModel.find({}).populate('department').populate('device');
    var active_list = await RoomModel.find({ active: 2 }).populate('department').populate('device');
    var deactive_list = await RoomModel.find({ active: 1 }).populate('department').populate('device');
    try {
        const room_id = req.params.id; // Get room ID from parameters
        const device_id = req.body.device_id; // Get device ID from request body
        const note = req.body.note; // Get note from request body

        // Step 1: Validate if the room exists
        const roomData = await RoomModel.findById(room_id);
        if (!roomData) {
            throw new Error('Room not found');
        }

        // Step 2: Check if the device exists
        const deviceExists = await DeviceModel.findById(device_id);
        if (!deviceExists) {
            const message = "Device does not exist.";
            return res.render('admin/building/room/index', { success: false, errors: message, list, active_list, deactive_list, layout: 'layoutAdminNoReload' });
        }

        // Step 3: Add the new device to the room's device list
        const used = 'yes';
        await DeviceModel.findByIdAndUpdate(device_id, {used: used});
        roomData.device.push({ device_id, note }); // Push new device into the device array

        // Step 4: Save the updated room
        await roomData.save();

        // Step 5: Redirect or render a success message
        res.redirect(`/room/detail/${room_id}`); // Redirect to the room details page
    } catch (error) {
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA + ' adding new device to the room';
        res.render('admin/building/room/index', { success: false, errors, list, active_list, deactive_list, layout: 'layoutAdminNoReload' });
    }
});

//Remove device from room //done
router.get('/removeDevice/:deviceId/:roomId', async (req, res) => {
    
    var list = await RoomModel.find({}).populate('department').populate('device');
    var active_list = await RoomModel.find({ active: 2 }).populate('department').populate('device');
    var deactive_list = await RoomModel.find({ active: 1 }).populate('department').populate('device');

    try {
        // Get device ID and room ID from parameters
        const { deviceId, roomId } = req.params;
        console.log('Device ID: ', deviceId);
        console.log('Room ID: ', roomId);
        // Step 1: Find the room
        const roomData = await RoomModel.findById(roomId);
        if (!roomData) {
            const errors = process.env.ERROR_SHOWING_DATA; // Adjust this message as needed
            return res.render('admin/building/room/index', { success: false, errors, list, active_list, deactive_list, layout: 'layoutAdmin' });
        }

        // Step 2: Remove the device and edit the device
        const used = 'no';
        await DeviceModel.findByIdAndUpdate(deviceId, {used: used});
        roomData.device = roomData.device.filter(device => device.device_id.toString() !== deviceId);
        
        // Step 3: Save the updated room
        await roomData.save();

        // Step 4: Redirect back to the room detail page
        res.redirect(`/room/detail/${roomId}`);
    } catch (error) {
        console.error("Error: ", error);
        const errors = process.env.ERROR_REMOVE_DATA + ' removing device from the room';
        res.render('admin/building/room/index', { success: false, errors, list, active_list, deactive_list, layout: 'layoutAdmin' });
    }
});

module.exports = router;