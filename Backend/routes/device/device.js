var express = require('express');
var router = express.Router();

var DeviceModel = require('../../models/DeviceModel');
const SwitchLogicModel = require('../../models/SwitchLogicModel');
const LogicModel = require('../../models/LogicPartModel');
const RoomModel = require('../../models/RoomModel');

//list of device //done
router.get('/', async(req, res) => {
    try{
        const list = await DeviceModel.find({});
        if(list.length === 0){
            const message = process.env.EMPTY_DATA;
            res.render('admin/device/index', {success: false, message, layout:'layoutAdmin'});
        }
        const active_list = await DeviceModel.find({active: 2});
        const deactive_list = await DeviceModel.find({active: 1});
        res.render('admin/device/index', {success: true, list, active_list, deactive_list, layout:'layoutAdmin'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA;
        res.render('admin/device/index', {success: false, errors, layout:'layoutAdmin'});
    }
});

//detail //done
router.get('/detail/:id', async(req, res) => {
    try{
        const id = req.params.id;
        const detail = await DeviceModel.findById(id);
        const reversedLogs = detail.device_log.slice().reverse();

        if(!detail){
            const message = process.env.EMPTY_DATA;
            res.render('admin/device/detail', {success: false, message, layout:'layoutAdmin'});
        }
        if(detail.active === 2){
            const active = 'Device is active';
            const active_true = '2';
            res.render('admin/device/detail', {success: true, detail, reversedLogs, active, active_true, layout:'layoutAdmin'});
            console.log(detail);
        } else if (detail.active === 1){
            const active = 'Device is not active';
            const active_false = '1';
            res.render('admin/device/detail', {success: true, detail, reversedLogs, active, active_false, layout:'layoutAdmin'});
            console.log(detail);
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA;
        res.render('admin/device/detail', {success: false, errors, layout:'layoutAdmin'});
    }
});

//delete //done
router.get('/delete/:id', async(req, res) => {
    var list = await DeviceModel.find({});
    try{
        var id = req.params.id;
        const data = await DeviceModel.findById(id);
        if(data){
            if(data.used === 'yes'){
                const roomHasDevice = await RoomModel.findOne({"device.device_id": id});
                if(!roomHasDevice){
                    const error = process.env.ERROR_DELETING_DATA;
                    res.render('admin/device/index', {success: false, error, list,layout:'layoutAdmin'});
                }
                const used = 'no';
                await DeviceModel.findByIdAndUpdate(id, {used: used});
                roomHasDevice.device = roomHasDevice.device.filter(device => device.device_id.toString() !== id);
                await roomHasDevice.save();
                if(data.type === 'switch'){
                    const switchLogic = await SwitchLogicModel.findOne({device_id: data._id});
                    await LogicModel.deleteMany({switch_logic_id: switchLogic._id});
                    await SwitchLogicModel.findByIdAndDelete(switchLogic._id);
                }
                await DeviceModel.findByIdAndDelete(id);
                res.redirect('/device');
            } else if(data.used === 'no'){
                if(data.type === 'switch'){
                    const switchLogic = await SwitchLogicModel.findOne({device_id: data._id});
                    await LogicModel.deleteMany({switch_logic_id: switchLogic._id});
                    await SwitchLogicModel.findByIdAndDelete(switchLogic._id);
                }
                await DeviceModel.findByIdAndDelete(id);
                res.redirect('/device');
            }
            
        } else {
            const error = process.env.ERROR_DELETING_DATA;
            res.render('admin/device/index', {success: false, error, list,layout:'layoutAdmin'});
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DELETING_DATA;
        res.render('admin/device/index', {success: false, errors, list,layout:'layoutAdmin'});
    }
});

//deactive //done
router.get('/deactive/:id', async(req, res)=> {
    var list = await DeviceModel.find({});
    try{
        const id = req.params.id;
        const subject = await DeviceModel.findById(id);
        if(!subject){
            const errors = process.env.ERROR_SHOWING_DATA;
            res.render('admin/device/index', {success: false, errors, list,layout:'layoutAdmin'});
        }
        const deactive = 1;
        const deactiveSubject = await DeviceModel.findByIdAndUpdate(id, {active: deactive });
        if(deactiveSubject){
            res.redirect('/device/detail/'+ id);
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DEACTIVE;
        res.render('admin/device/index', {success: false, errors, list,layout:'layoutAdmin'});
    }

});

//active //done
router.get('/active/:id', async(req, res)=> {
    var list = await DeviceModel.find({});
    try{
        const id = req.params.id;
        const subject = await DeviceModel.findById(id);
        if(!subject){
            const errors = process.env.ERROR_SHOWING_DATA;
            res.render('admin/device/index', {success: false, errors, list,layout:'layoutAdmin'});
        }
        const active = 2;
        const deactiveSubject = await DeviceModel.findByIdAndUpdate(id, {active: active });
        if(deactiveSubject){
            res.redirect('/device/detail/' + id);
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DEACTIVE;
        res.render('admin/device/index', {success: false, errors, list,layout:'layoutAdmin'});
    }
});

//add new //done
router.get('/add', async(req, res) => {
    try{
        res.render('admin/device/add',{success: true,layout:'layoutAdminNoReload' });
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/device/add', {success: false, errors,layout:'layoutAdminNoReload'});
    }
});

router.post('/add', async(req, res) => {
    try{
        const active = 2;
        const name = req.body.name;
        const data = 'null';
        const type = req.body.type;
        const note = req.body.note;
        const used = 'no';
        let deviceLog = [];
        const check_device = await DeviceModel.find({name: name});
        if(check_device.length === 1){
            const error = 'Error: Device existed. Enter different name';
            return res.render('admin/device/add', {success: false, error,layout:'layoutAdminNoReload'});
        } else {
            if(type === 'switch'){
                const data = 'off';
                const newDevice = await DeviceModel.create({
                    active: active,
                    name: name,
                    data: data,
                    type: type,
                    note: note,
                    used: used,
                    device_log: deviceLog
                });
                const name_switch = 'Swith Logic of Device: ' + name;
                const user_id = req.session.admin_id;
                const permission_level = 1;
                let empty_user = [];
                const newSwitch = await SwitchLogicModel.create({
                    active: 2,
                    name: name_switch,
                    status_on_off: 1,
                    device_id: newDevice._id,
                    user: empty_user
                });
                newSwitch.user.push({user_id, permission_level});
                const finalSwitch = await newSwitch.save();
                const newCountdownLogic = await LogicModel.create({
                    switch_logic_id: newSwitch._id,
                    active: 1,
                    device_status: 1,
                    type: 'countdown',
                    day: 'null',
                    time: '00:00'
                });
                if(newDevice && finalSwitch && newCountdownLogic){
                    const message = process.env.SUCCESS_CREATE_DATA + ' device with name: ' + name;
                    return res.render('admin/device/add', {success: true, message,layout:'layoutAdminNoReload'});
                }
            } else {
                const newDevice = await DeviceModel.create({
                    active: active,
                    name: name,
                    data: data,
                    type: type,
                    note: note,
                    used: used,
                    device_log: deviceLog
                });
                if(newDevice){
                    const message = process.env.SUCCESS_CREATE_DATA + ' device with name: ' + name;
                    return res.render('admin/device/add', {success: true, message,layout:'layoutAdminNoReload'});
                }
            }
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/device/add', {success: false, errors,layout:'layoutAdminNoReload'});
    }
});

//edit //done
router.get('/edit/:id', async(req, res) => {
    const list = await DeviceModel.find({});
    try{
        const id = req.params.id;
        const dataDevice = await DeviceModel.findById(id);
        if(!dataDevice){
            const error = process.env.ERROR_SHOWING_DATA + ' device to edit';
            res.render('admin/device/index',{success: false, list, error,layout:'layoutAdminNoReload'});
        }
        res.render('admin/device/edit',{success: true, dataDevice,layout:'layoutAdminNoReload'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_EDIT_DATA;
        res.render('admin/device/index', {success: false, errors, list,layout:'layoutAdminNoReload'});
    }
});

router.post('/edit/:id', async(req, res) => {
    const list = await DeviceModel.find({});
    try{
        const id = req.params.id;
        const dataDevice = await DeviceModel.findById(id);
        if(!dataDevice){
            const error = process.env.ERROR_SHOWING_DATA + ' device to edit';
            res.render('admin/device/index',{success: false, list, error,layout:'layoutAdminNoReload'});
        }
        
        const name = req.body.name;
        const new_type = req.body.type;
        const note = req.body.note;
        if(name === dataDevice.name){
            if(new_type){
                const editDevice = await DeviceModel.findByIdAndUpdate(id,{
                    type: new_type,
                    note: note,
                });
                if(editDevice){
                    res.redirect('/device');
                }
            } else {
                const editDevice = await DeviceModel.findByIdAndUpdate(id,{note: note,});
                if(editDevice){res.redirect('/device');}
            }
        } else {
            const check_device = await DeviceModel.find({name: name});
            if(check_device.length === 1){
                const error = process.env.ERROR_EDIT_DATA + ': ' + name;
                return res.render('admin/device/index',{success: false, list, error,layout:'layoutAdminNoReload'});
            } 
            if(new_type){
                const editDevice = await DeviceModel.findByIdAndUpdate(id,{
                    name: name,
                    type: new_type,
                    note: note,
                });
                if(editDevice){
                    res.redirect('/device');
                }
            } else {
                const editDevice = await DeviceModel.findByIdAndUpdate(id,{note: note, name: name});
                if(editDevice){res.redirect('/device');}
            }
        }

    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_EDIT_DATA;
        res.render('admin/device/index', {success: false, errors, list,layout:'layoutAdminNoReload'});
    }
});


module.exports = router;