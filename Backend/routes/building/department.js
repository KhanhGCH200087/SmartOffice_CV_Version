var express = require('express');
var router = express.Router();

var DepartmentModel = require('../../models/DepartmentModel');
var DeviceModel = require('../../models/DeviceModel');
var RoomModel = require('../../models/RoomModel');
//list of department //done
router.get('/', async(req, res)=> {
    try{
        const list = await DepartmentModel.find({}).populate('device');
        const active_list = await DepartmentModel.find({active: 2}).populate('device');
        const deactive_list = await DepartmentModel.find({active: 1}).populate('device');
        if(list.length === 0){
            const message = process.env.EMPTY_DATA;
            res.render('admin/building/department/index', {success: true, message, layout:'layoutAdmin'});
        }
        res.render('admin/building/department/index', {success: true, list, active_list, deactive_list, layout:'layoutAdmin'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA;
        res.render('admin/building/department/index', {success: false, errors, layout:'layoutAdmin'});
    }
});

//delete //done
router.get('/delete/:id', async(req, res) => {
    var list = await DepartmentModel.find({}).populate('device');
    const active_list = await DepartmentModel.find({active: 2}).populate('device');
    const deactive_list = await DepartmentModel.find({active: 1}).populate('device');
    try{
        var id = req.params.id;
        const data = await DepartmentModel.findById(id);
        if(data){
            await DeviceModel.findByIdAndUpdate(data.device,{used: 'no'});
            await DepartmentModel.deleteOne(data);
            res.redirect('/department');
        } else {
            const error = process.env.ERROR_DELETING_DATA;
            res.render('admin/building/department/index', {success: false, error, list, active_list, deactive_list, layout:'layoutAdmin'});
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DELETING_DATA;
        res.render('admin/building/department/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
    }
});

//deactive department //done
router.get('/deactive/:id', async(req, res)=> {
    var list = await DepartmentModel.find({}).populate('device');
    const active_list = await DepartmentModel.find({active: 2}).populate('device');
    const deactive_list = await DepartmentModel.find({active: 1}).populate('device');
    try{
        const id = req.params.id;
        const subject = await DepartmentModel.findById(id);
        if(!subject){
            const errors = process.env.ERROR_SHOWING_DATA;
            res.render('admin/building/department/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
        }
        const deactive = 1;
        const deactiveSubject = await DepartmentModel.findByIdAndUpdate(id, {active: deactive });
        if(deactiveSubject){
            res.redirect('/department');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DEACTIVE;
        res.render('admin/building/department/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
    }
});

//active department //done
router.get('/active/:id', async(req, res)=> {
    var list = await DepartmentModel.find({}).populate('device');
    const active_list = await DepartmentModel.find({active: 2}).populate('device');
    const deactive_list = await DepartmentModel.find({active: 1}).populate('device');
    try{
        const id = req.params.id;
        const subject = await DepartmentModel.findById(id);
        if(!subject){
            const errors = process.env.ERROR_SHOWING_DATA;
            res.render('admin/building/department/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
        }
        const active = 2;
        const activeSubject = await DepartmentModel.findByIdAndUpdate(id, {active: active });
        if(activeSubject){
            res.redirect('/department');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_ACTIVE;
        res.render('admin/building/department/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
    }
});

//add new //done
router.get('/add', async(req, res) => {
    try{
        const type_device = "rfid";
        const device_used = "no";
        var deviceList = await DeviceModel.find({type: type_device, used: device_used});
        if(deviceList.length === 0){
            const error = process.env.ERROR_SHOWING_DATA + "list of device";
            res.render('admin/building/department/add', {success: false, error, layout:'layoutAdminNoReload'}); 
        }
        res.render('admin/building/department/add', {success: true, deviceList, layout:'layoutAdminNoReload'}); 
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/building/department/add', {success: false, errors, layout:'layoutAdminNoReload'});
    }
    
});

router.post('/add', async(req, res) => {
    try{
        const name = req.body.name;
        const description = req.body.description;
        const active = 2;
        const device = req.body.device;
        const checkDevice = await DepartmentModel.find({device: device});
        const checkName = await DepartmentModel.find({name: name});
        if(checkDevice.length !== 0 || checkName.length !== 0){
            const type_device = "rfid";
            const device_used = "no";
            const deviceList = await DeviceModel.find({type: type_device, used: device_used});
            const message = process.env.ERROR_CREATE_DATA + ": choose other device";
            return res.render('admin/building/department/add', {success: true, deviceList, message, layout:'layoutAdminNoReload'});
        }
        const editDevice = await DeviceModel.findByIdAndUpdate(device, {used: 'yes'});
        const newDepartment = await DepartmentModel.create({
            name: name,
            description: description,
            active: active,
            device: device
        });
        if(editDevice && newDepartment){
            res.redirect('/department');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/building/department/add', {success: false, errors, layout:'layoutAdminNoReload'});
    }
});

//edit //done
router.get('/edit/:id', async(req, res)=> {
    var list = await DepartmentModel.find({}).populate('device');
    const active_list = await DepartmentModel.find({active: 2}).populate('device');
    const deactive_list = await DepartmentModel.find({active: 1}).populate('device');
    try{
        const id = req.params.id;
        const data = await DepartmentModel.findById(id);
        const device_origin = await DeviceModel.findById(data.device);
        var deviceList = await DeviceModel.find({type: 'rfid' , used: 'no', _id:{ $ne: data.device}});
        if(data.length === 0){
            const error = process.env.ERROR_SHOWING_DATA + " department data";
            res.render('admin/building/department/edit', {success: false, error, layout:'layoutAdminNoReload'}); 
        }
        if(deviceList.length === 0){
            const error = process.env.ERROR_SHOWING_DATA + " list of device or department data";
            res.render('admin/building/department/edit', {success: false, data, error, layout:'layoutAdminNoReload'}); 
        }
        res.render('admin/building/department/edit', {success: true, deviceList, data, device_origin, layout:'layoutAdminNoReload'}); 
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_EDIT_DATA;
        res.render('admin/building/department/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdminNoReload'});
    }
});

router.post('/edit/:id', async(req, res) => {
    const list = await DepartmentModel.find({}).populate('device');
    const active_list = await DepartmentModel.find({active: 2}).populate('device');
    const deactive_list = await DepartmentModel.find({active: 1}).populate('device');
    try{
        const id = req.params.id;
        const data = await DepartmentModel.findById(id).populate('device');
        var deviceList = await DeviceModel.find({type: 'rfid' , used: 'no', _id:{ $ne: data.device}});
        const device_origin = await DeviceModel.findById(data.device);
        if(!data){
            const error = process.env.ERROR_SHOWING_DATA + "department data";
            res.render('admin/building/department/edit', {success: false, error, layout:'layoutAdminNoReload'}); 
        }

        const name = req.body.name;
        const description = req.body.description;
        const device = req.body.device;
        
        if(name === data.name){
            if(device){
                const checkDevice = await DepartmentModel.find({device: device});
                if(checkDevice.length !== 0){
                    const message = process.env.ERROR_EDIT_DATA + ": choose other device";
                    return res.render('admin/building/department/edit', {success: true, message, device_origin, deviceList, data, layout:'layoutAdminNoReload'});
                }
                const used_yes = 'yes'; const used_no = 'no';
                const changeDeviceOrigin = await DeviceModel.findByIdAndUpdate(data.device,{used: used_no});
                const changeDeviceNew = await DeviceModel.findByIdAndUpdate(device, {used: used_yes});
                const newDepartment = await DepartmentModel.findByIdAndUpdate(id,{description: description, device: device});
                if(changeDeviceNew && changeDeviceOrigin && newDepartment){res.redirect('/department');}
            } else if(!device){
                const newDepartment = await DepartmentModel.findByIdAndUpdate(id,{description: description,});
                if(newDepartment){res.redirect('/department');}
            }
        } else {
            if(device){
                const checkDevice = await DepartmentModel.find({device: device});
                if(checkDevice.length !== 0){
                    const message = process.env.ERROR_EDIT_DATA + ": choose other device";
                    return res.render('admin/building/department/edit', {success: true, message, device_origin, deviceList, data, layout:'layoutAdminNoReload'});
                }
                const used_yes = 'yes'; const used_no = 'no';
                const changeDeviceOrigin = await DeviceModel.findByIdAndUpdate(data.device,{used: used_no});
                const changeDeviceNew = await DeviceModel.findByIdAndUpdate(device, {used: used_yes});
                const newDepartment = await DepartmentModel.findByIdAndUpdate(id,{name: name, description: description, device: device});
                if(changeDeviceNew && changeDeviceOrigin && newDepartment){res.redirect('/department');}
            } else if(!device){
                const newDepartment = await DepartmentModel.findByIdAndUpdate(id,{name: name, description: description,});
                if(newDepartment){res.redirect('/department');}
            }
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_EDIT_DATA;
        res.render('admin/building/department/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdminNoReload'});
    }
});

//add new room //done
router.get('/addRoom/:id', async(req, res)=>{
    try{
        const id = req.params.id;
        const deviceList = await DeviceModel.find({});
        if(!deviceList){
            const message = process.env.EMPTY_DATA + "list of list of device";
            res.render('admin/building/department/addRoom', {success: false, message, layout:'layoutAdminNoReload'});    
        }
        res.render('admin/building/department/addRoom', {success: true, deviceList, layout:'layoutAdminNoReload'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/building/department/addRoom', {success: false, errors, layout:'layoutAdminNoReload'});
    }
});

router.post('/addRoom/:id', async(req, res)=>{
    try{
        const name = req.body.name;
        const floor = req.body.floor;
        const department_id = req.params.id;
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
                return res.render('admin/building/department/addRoom', {success: false, error, layout:'layoutAdminNoReload'});
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
            res.redirect('/department');
        }

    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/building/department/addRoom', {success: false, errors, layout:'layoutAdminNoReload'});
    }
});

//list of room //done
router.get('/roomList/:id', async(req, res) => {
    var list = await DepartmentModel.find({}).populate('device');
    const active_list = await DepartmentModel.find({active: 2}).populate('device');
    const deactive_list = await DepartmentModel.find({active: 1}).populate('device');
    try{
        const department_id = req.params.id;
        const list = await RoomModel.find({department: department_id});
        const active_list = await RoomModel.find({department: department_id, active: 2});
        const deactive_list = await RoomModel.find({department: department_id, active: 1});
        res.render('admin/building/department/roomList', {success: true, list, active_list, deactive_list, layout:'layoutAdmin' });
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA;
        res.render('admin/building/department/index', {success: false, errors, list, active_list, deactive_list, layout:'layoutAdmin'});
    }
});












module.exports = router;