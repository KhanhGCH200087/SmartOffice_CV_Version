var express = require('express');
var router = express.Router();

const SwitchModel = require('../../models/SwitchLogicModel');
const DeviceModel = require('../../models/DeviceModel');
const LogicModel = require('../../models/LogicPartModel');
const RoomModel = require('../../models/RoomModel');
const UserModel = require('../../models/UserStaffModel');
//*************************************************************** */
require('../../FirebaseAdminSDK');
const admin = require('firebase-admin');
// Get a reference to the Firebase database
const db = admin.database();
// Set up listener for Firebase data
const device_main = db.ref('/device');
//***************************************************************** */


//turn device on //done
router.get('/turnOn/:deviceId/:roomId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
        const roomId = req.params.roomId;
        const statusOn = 2;
        const dataDevice = 'on';
        const deviceData = await DeviceModel.findById(deviceId);
        const switchData = await SwitchModel.findOne({device_id: deviceId});
        if(deviceData && switchData){
            const updateDevice = await DeviceModel.findByIdAndUpdate(deviceId,{data: dataDevice});
            const updateSwitch = await SwitchModel.findByIdAndUpdate(switchData._id,{status_on_off: statusOn});
            if(updateDevice && updateSwitch){
                return res.redirect(`/room/detail/` + roomId);
            }
        }
    }catch(errors){
        console.log("Error Log: ",errors);
        const error = process.env.ERROR_TURNON;
    }
});

//turn device off //done
router.get('/turnOff/:deviceId/:roomId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
        const roomId = req.params.roomId;
    
        const statusOff = 1;
        const dataDevice = 'off';
        const deviceData = await DeviceModel.findById(deviceId);
        const switchData = await SwitchModel.findOne({device_id: deviceId});
        if(deviceData && switchData){
            const updateDevice = await DeviceModel.findByIdAndUpdate(deviceId,{data: dataDevice});
            const updateSwitch = await SwitchModel.findByIdAndUpdate(switchData._id,{status_on_off: statusOff});
            if(updateDevice && updateSwitch){
                return res.redirect(`/room/detail/` + roomId);
            }
        }
    }catch(errors){
        console.log("Error Log: ",errors);
        const error = process.env.ERROR_TURNOFF;
    }
});

//-------------------------------
//turn device on and stay at switch detail page//done
router.get('/turnOnSwitch/:deviceId/:roomId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
        const roomId = req.params.roomId;
        const statusOn = 2;
        const dataDevice = 'on';
        const deviceData = await DeviceModel.findById(deviceId);
        const switchData = await SwitchModel.findOne({device_id: deviceId});
        if(deviceData && switchData){
            const updateDevice = await DeviceModel.findByIdAndUpdate(deviceId,{data: dataDevice});
            const updateSwitch = await SwitchModel.findByIdAndUpdate(switchData._id,{status_on_off: statusOn});
            if(updateDevice && updateSwitch){
                return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);
            }
        }
    }catch(errors){
        console.log("Error Log: ",errors);
        const error = process.env.ERROR_TURNON;
    }
});

//turn device off and stay at switch detail page//done
router.get('/turnOffSwitch/:deviceId/:roomId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
        const roomId = req.params.roomId;
    
        const statusOff = 1;
        const dataDevice = 'off';
        const deviceData = await DeviceModel.findById(deviceId);
        const switchData = await SwitchModel.findOne({device_id: deviceId});
        if(deviceData && switchData){
            const updateDevice = await DeviceModel.findByIdAndUpdate(deviceId,{data: dataDevice});
            const updateSwitch = await SwitchModel.findByIdAndUpdate(switchData._id,{status_on_off: statusOff});
            if(updateDevice && updateSwitch){
                return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);
            }
        }
    }catch(errors){
        console.log("Error Log: ",errors);
        const error = process.env.ERROR_TURNOFF;
    }
});
//------------------------------

//detail page of that switch device //done
router.get('/detail/:deviceId/:roomId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
        const roomId = req.params.roomId;
    
        const roomData = await RoomModel.findById(roomId);
        const deviceData = await DeviceModel.findById(deviceId);
        const switchData = await SwitchModel.findOne({device_id: deviceId}).populate({path:'user.user_id', model: 'user_staff'});
    
        const logicCountdown = await LogicModel.find({switch_logic_id: switchData._id, type: 'countdown'}).populate('switch_logic_id');
        const logicSchedule = await LogicModel.find({switch_logic_id: switchData._id, type: 'schedule'}).populate('switch_logic_id');
        const logicInching = await LogicModel.find({switch_logic_id: switchData._id, type: 'inching'}).populate('switch_logic_id');
    
        res.render('admin/switch/switch_logic/detail', {success: true, roomData, deviceData, switchData, logicCountdown, logicSchedule, logicInching, deviceId, roomId, layout: 'layoutAdmin' });
    }catch(errors){
        console.log("Error Log:", errors);
    }
});

//active logic //done
router.get('/activeLogic/:deviceId/:roomId/:logicId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
        const roomId = req.params.roomId;
        const logicId = req.params.logicId;
    
        const logicData = await LogicModel.findByIdAndUpdate(logicId, {active: 2})
        if(logicData){
            return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);
        }
    }catch(errors){
        console.log("Error Log:", errors);
    }
    
});

//deactive logic //done
router.get('/deactiveLogic/:deviceId/:roomId/:logicId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
        const roomId = req.params.roomId;
        const logicId = req.params.logicId;
    
        const logicData = await LogicModel.findByIdAndUpdate(logicId, {active: 1})
        if(logicData){
            return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);
        }
    }catch(errors){
        console.log("Error Log:", errors);
    }
    
});

//delete logic of the switch 
router.get('/deleteLogic/:deviceId/:roomId/:logicId', async(req, res) => {
    try{
        const deviceId = req.params.deviceId;
        const roomId = req.params.roomId;
        const logicId = req.params.logicId;
    
        const logicData = await LogicModel.findById(logicId);
        if(logicData){
            await LogicModel.findByIdAndDelete(logicId);
            return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);
        }
    }catch(errors){
        console.log("Error Log:", errors);
    }
    
});

//remove user from the list
router.get('/removeUser/:deviceId/:roomId/:switchId/:userId', async(req, res) => {
    const deviceId = req.params.deviceId;
    const roomId = req.params.roomId;
    const switchId = req.params.switchId;
    const userId = req.params.userId;

    try{
        const switchData = await SwitchModel.findById(switchId);
        switchData.user = switchData.user.filter(user => user.user_id.toString() !== userId);
        const removeSwitch = await switchData.save();
        if(removeSwitch){
            return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);
        }
    }catch(error){
        console.error("Error: ", error);
    }
});

//add new user
router.post('/addUser/:deviceId/:roomId/:switchId', async(req, res) => {
    const deviceId = req.params.deviceId;
    const roomId = req.params.roomId;
    const switchId = req.params.switchId;
    try{
        const mainSwitch = await SwitchModel.findById(switchId);
        const user_email = req.body.user_email;
        console.log("User Email: ", user_email);
        const userData = await UserModel.findOne({email: user_email});

        if(!userData){ //check if email exist in the database
            console.log("User is not exist in the system");
            return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);
        }
        
        const existingUser = await SwitchModel.findOne({ 
            _id: switchId,
            'user.user_id': userData._id
        });

        if(existingUser){   //check if user is already in the list
            console.log("User already exist in the room");
            return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);
        }

        //Save data to database
        const user_id = userData._id;
        const permission_level = 2;
        mainSwitch.user.push({user_id, permission_level});
        await mainSwitch.save();
        return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);

    }catch(error){
        console.error("Error: ", error);
        return res.redirect('/switchlogic/detail/'+ deviceId+'/'+roomId);
    }
});


module.exports = router;