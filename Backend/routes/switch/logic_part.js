var express = require('express');
var router = express.Router();

const {formatDate, formatTime, isValidTimeRange} = require('../code_function');

var LogicModel = require('../../models/LogicPartModel');
var SwitchLogicModel = require('../../models/SwitchLogicModel');

//List of logic
router.get('/', async(req, res) => {
    try{
        var listCountdown = await LogicModel.find({type: countdown}).populate('switch_logic');
        var listSchedule = await LogicModel.find({type: schedule}).populate('switch_logic');
        var listInching = await LogicModel.find({type: inching}).populate('switch_logic');
        res.render('admin/switch/logic/index', {success: true, listCountdown, listSchedule, listInching});
    }catch (error) {
        console.error("Error: ", error);
        const errors = process.env.ERROR_SHOWING_DATA + ": list of logic";
        res.render('admin/switch/logic/index', {success: false, errors});
    }
});

//delete
router.get('/delete/:id', async(req, res) => {
    var listCountdown = await LogicModel.find({type: countdown}).populate('switch_logic');
    var listSchedule = await LogicModel.find({type: schedule}).populate('switch_logic');
    var listInching = await LogicModel.find({type: inching}).populate('switch_logic');
    try{
        var id = req.params.id;
        const data = await LogicModel.findById(id);
        if(data){
            await LogicModel.deleteOne(data);
            res.redirect('/logicpart');
        } else {
            const error = process.env.ERROR_DELETING_DATA;
            res.render('admin/switch/logic/index', {success: false, error, listCountdown, listSchedule, listInching});
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DELETING_DATA;
        res.render('admin/switch/logic/index', {success: false, errors, listCountdown, listSchedule, listInching});
    }
});

//deactive
router.post('/deactive/:id', async(req, res)=> {
    var listCountdown = await LogicModel.find({type: countdown}).populate('switch_logic');
    var listSchedule = await LogicModel.find({type: schedule}).populate('switch_logic');
    var listInching = await LogicModel.find({type: inching}).populate('switch_logic');
    try{
        const id = req.params.id;
        const subject = await LogicModel.findById(id);
        if(!subject){
            const errors = process.env.ERROR_SHOWING_DATA;
            res.render('admin/switch/logic/index', {success: false, errors, listCountdown, listSchedule, listInching});
        }
        const deactive = 1;
        const deactiveSubject = await LogicModel.findByIdAndUpdate(id, {active: deactive });
        if(deactiveSubject){
            res.redirect('/logicpart');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_DEACTIVE;
        res.render('admin/switch/logic/index', {success: false, errors, listCountdown, listSchedule, listInching});
    }

});

//******************ADD NEW******************* */
//add new countdown //Không sử dụng
router.get('/addCountdown', async(req, res) => {
    var listCountdown = await LogicModel.find({type: countdown}).populate('switch_logic');
    var listSchedule = await LogicModel.find({type: schedule}).populate('switch_logic');
    var listInching = await LogicModel.find({type: inching}).populate('switch_logic');
    try{
        res.render('admin/switch/logic/addCountdown', {success: true})
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/switch/logic/index', {success: false, errors, listCountdown, listSchedule, listInching});
    }
});

router.post('/addCountdown', async(req, res) => {
    var listCountdown = await LogicModel.find({type: countdown}).populate('switch_logic');
    var listSchedule = await LogicModel.find({type: schedule}).populate('switch_logic');
    var listInching = await LogicModel.find({type: inching}).populate('switch_logic');
    try{
        const switch_logic_id = req.body.switch_logic;
        const active = 2;
        const device_status = req.body.status;
        const type = 'countdown';
        const day = 'null';
        const time = formatTime(req.body.time);

        const newlogic = await LogicModel.create({
            switch_logic_id: switch_logic_id,
            active: active,
            device_status: device_status,
            type: type,
            day: day,
            time: time
        });
        if(newlogic){
            res.redirect('/logicpart');
        }
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
        res.render('admin/switch/logic/index', {success: false, errors, listCountdown, listSchedule, listInching});
    }
});

//add new schedule //done
router.get('/addSchedule/:deviceId/:roomId/:switchId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
        const roomId = req.params.roomId;
        const switchId = req.params.switchId;
        res.render('admin/switch/logic/addSchedule', {success: true, deviceId, roomId, switchId,layout:'layoutAdminNoReload'});
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
    }
});

router.post('/addSchedule/:deviceId/:roomId/:switchId', async(req, res) => {
    const deviceId = req.params.deviceId;
    const roomId = req.params.roomId;
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
        if(newlogic){
            return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);
        }
    }catch(error){
        console.error("Error: ", error);
    }
});

//add new inching //done
router.get('/addInching/:deviceId/:roomId/:switchId', async(req, res) => {
    const deviceId = req.params.deviceId;
    const roomId = req.params.roomId;
    const switchId = req.params.switchId;
    try{
        res.render('admin/switch/logic/addInching', {success: true, deviceId, roomId, switchId,layout:'layoutAdminNoReload'})
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
    }
});

router.post('/addInching/:deviceId/:roomId/:switchId', async(req, res) => {
    const deviceId = req.params.deviceId;
    const roomId = req.params.roomId;
    const switchId = req.params.switchId;
    try{
        const switch_logic_id = switchId;
        const active = 1;
        const device_status = req.body.status;
        const type = 'inching';
        const day = 'null';

        const hours_origin = req.body.hours;
        const minutes_origin = req.body.minutes;
        
        if(hours_origin < 10){
            const hours_fix = '0'+hours_origin;
            if(minutes_origin < 10){
                const minutes_fix = '0'+minutes_origin;
                const time = hours_fix+':'+minutes_fix;
                const newlogic = await LogicModel.create({
                    switch_logic_id: switch_logic_id,
                    active: active,
                    device_status: device_status,
                    type: type,
                    day: day,
                    time: time
                });
                if(newlogic){return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);}
            } else{
                const time = hours_fix+':'+minutes_origin;
                const newlogic = await LogicModel.create({
                    switch_logic_id: switch_logic_id,
                    active: active,
                    device_status: device_status,
                    type: type,
                    day: day,
                    time: time
                });
                if(newlogic){return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);}
            }
        } else {
            if(minutes_origin < 10){
                const minutes_fix = '0'+minutes_origin;
                const time = hours_origin+':'+minutes_fix;
                const newlogic = await LogicModel.create({
                    switch_logic_id: switch_logic_id,
                    active: active,
                    device_status: device_status,
                    type: type,
                    day: day,
                    time: time
                });
                if(newlogic){return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);}
            } else{
                const time = hours_origin+':'+minutes_origin;
                const newlogic = await LogicModel.create({
                    switch_logic_id: switch_logic_id,
                    active: active,
                    device_status: device_status,
                    type: type,
                    day: day,
                    time: time
                });
                if(newlogic){return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);}
            }
        }

    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
    }
});

//**************EDIT LOGIC*******************************/
//edit countdown //done
router.get('/editCountdown/:deviceId/:roomId/:logicId', async(req, res) => {
    const deviceId = req.params.deviceId;
    const roomId = req.params.roomId;
    const switchId = req.params.switchId;
    const logicId = req.params.logicId;
    try{
        const logicData = await LogicModel.findById(logicId);
        res.render('admin/switch/logic/editCountdown', {success: true, deviceId, roomId, switchId, logicData,layout:'layoutAdminNoReload'})
    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
    }
});

router.post('/editCountdown/:deviceId/:roomId/:logicId', async(req, res) => {
    const deviceId = req.params.deviceId;
    const roomId = req.params.roomId;
    const switchId = req.params.switchId;
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
                if(editlogic){return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);}
            } else{
                const time = hours_fix+':'+minutes_origin;
                const editlogic = await LogicModel.findByIdAndUpdate(logicId,{time: time});
                if(editlogic){return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);}
            }
        } else {
            if(minutes_origin < 10){
                const minutes_fix = '0'+minutes_origin;
                const time = hours_origin+':'+minutes_fix;
                const editlogic = await LogicModel.findByIdAndUpdate(logicId,{time: time});
                if(editlogic){return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);}
            } else{
                const time = hours_origin+':'+minutes_origin;
                const editlogic = await LogicModel.findByIdAndUpdate(logicId,{time: time});
                if(editlogic){return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);}
            }
        }

    }catch(error){
        console.error("Error: ", error);
        const errors = process.env.ERROR_CREATE_DATA;
    }
});



module.exports = router;