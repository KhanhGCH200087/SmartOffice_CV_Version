const admin = require('firebase-admin');

const AccessLogModel = require('./models/AccessLogModel');
const BookModel = require('./models/BookDataModel');
const BookedRoomModel = require('./models/BookedRoomModel');
const DepartmentModel = require('./models/DepartmentModel');
const DeviceModel = require('./models/DeviceModel');
const LogicPartModel = require('./models/LogicPartModel');
const RoomModel = require('./models/RoomModel');
const RoomTableBookedModel = require('./models/RoomTableBookedModel');
const SubjectTableModel = require('./models/SubjectTableModel');
const SwitchLogicModel = require('./models/SwitchLogicModel');
const UserModel = require('./models/UserStaffModel');

const {formatDate, formatTime, addCountdownTime, parseTime} = require('./routes/code_function');
//*********************************************************************************************** */

// Initialize Firebase admin SDK
// admin.initializeApp({
//   credential: admin.credential.cert({
//     projectId: process.env.PROJECT_ID,
//     clientEmail: process.env.CLIENT_EMAIL,
//     privateKey: process.env.PRIVATE_KEY
//   }),
//   databaseURL: process.env.URL_FIREBASE
// });

require('./FirebaseAdminSDK');

// Get a reference to the Firebase database
const db = admin.database();

// Set up listener for Firebase data
const device_main = db.ref('/device');

//******************************************************************************************************* */

const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const d = new Date();
let dayWeek = weekday[d.getDay()];

const time = formatTime(new Date());
const day = formatDate(new Date());
const present_time = new Date();


//Listen for changes in Firebase data
device_main.on('child_changed', async(snapshot) => {
    const deviceName = snapshot.key;
    const device_data = snapshot.val();
    //check if device is exist in database and if it is active
    const find_device = await DeviceModel.findOne({name: deviceName}); //thông tin của device ở đây
    if(!find_device){
      if(device_data.type === 'switch'){
        let device_log = [];
        const newDevice = await DeviceModel.create({
          name: deviceName,
          active: device_data.active,
          data: device_data.data,
          note: device_data.note,
          type: device_data.type,
          used: 'no',
          device_log: device_log
        });

        const name_switch = 'Swith Logic of Device: ' + deviceName;
        const user_id = '67163c569cfeb1ea3a7950e5';
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

        const newCountdownLogic = await LogicPartModel.create({
            switch_logic_id: newSwitch._id,
            active: 1,
            device_status: 1,
            type: 'countdown',
            day: 'null',
            time: '00:00'
        });

        if(!newDevice ||  !newSwitch || !newCountdownLogic || !finalSwitch){
          return console.log('Error: Device or Switch or Logic not created');
        }

        return console.log('Create Switch Device Successfully');

      } else {
        let device_log = [];
        const newDevice = await DeviceModel.create({
          name: deviceName,
          active: device_data.active,
          data: device_data.data,
          note: device_data.note,
          type: device_data.type,
          used: 'no',
          device_log: device_log
        });
        if(!newDevice){
          return console.log('Faild create new device: ', deviceName);
        }
        return console.log('Success create new device: ', deviceName);
      }





     
    } else {
      //console.log('Device is in database:', deviceName);
      const device_message = db.ref('device/'+deviceName+'/device_message');
      const device_message2 = db.ref('device/'+deviceName+'/device_message2');
      const device_data_updated = db.ref('device/'+deviceName+'/data');
      if(device_data.active == 1){
        console.log('Device is not active');
        //send message to led of device through device_message
        return await device_message.set('Denied Access');
      }
      //console.log('Device is active')
      const data_type = device_data.type;

      switch(data_type){
        case "fire": // (đã xong phần backend, chưa có module nên chưa thể test) OK đã xong báo cháy, chú ý ở nhưng thiết bị khác, phần message bị ghi đè nên là tập trung sử dụng phần detect_danger
          console.log("Trường hợp: Thiết bị phòng cháy");          
          const fire_data = device_data.data;
          const old_status = device_data.old_status;
          if(find_device.active == 1 ||  find_device.used === 'no'){ //Device problem
            return console.log("Device is not active or used");

          }else if(fire_data === "null" && old_status === "null"){ //hệ thống default, chưa có gì
            return console.log("Default system of fire device");

          } else if(fire_data === "null" && old_status === "fire"){ // trường hợp cháy đã xảy ra, hiện tại đã hết cháy
            //const allMessage = "null";
            const detectDanger = "no";
            const snapshot = await device_main.once('value');
            if(!snapshot.exists()){return console.log("There are no device in the Firebase")};
            //const updateAllMessage = {};
            const updateDetectDanger = {};
            snapshot.forEach((childSnapshot)=>{
              const deviceKey = childSnapshot.key;
              //updateAllMessage[`${deviceKey}/device_message`] = allMessage;
              updateDetectDanger[`${deviceKey}/detect_danger`] = detectDanger;
            });
            //const updateAllDeviceMessage = await device_main.update(updateAllMessage);
            const updateAllDetectDanger = await device_main.update(updateDetectDanger);
            const device_old_status = db.ref('device/'+deviceName+'/old_status');
            const updateDeviceOldStatus = await device_old_status.set("null");

            return console.log("Change from fire situation to normal situation");
        
          } else if(fire_data === "Detect Fire"){ //trường hợp phát hiện ra cháy
            const time = formatTime(new Date());
            const day = formatDate(new Date());
            const present_time = new Date();
            //const allMessage = "Fire Situation";
            const detectDanger = "yes";
            const snapshot = await device_main.once('value');
            if(!snapshot.exists()){return console.log("There are no device in the Firebase")};
            //const updateAllMessage = {};
            const updateDetectDanger = {};
            snapshot.forEach((childSnapshot)=>{
              const deviceKey = childSnapshot.key;
              //updateAllMessage[`${deviceKey}/device_message`] = allMessage;
              updateDetectDanger[`${deviceKey}/detect_danger`] = detectDanger;
            });
            //const updateAllDeviceMessage = await device_main.update(updateAllMessage);
            const updateAllDetectDanger = await device_main.update(updateDetectDanger);
            const device_old_status = db.ref('device/'+deviceName+'/old_status');
            const updateDeviceOldStatus = await device_old_status.set("fire");

            console.log("Device: "+ find_device.name +" có cháy");
            const roomData = await RoomModel.findOne({ 'device.device_id': find_device._id }).populate('department').
            populate({path: 'device.device_id', model: 'device' });
            const log = "Detect a Fire at room "+roomData.name+" of department "+roomData.department.name;
            const type = 'danger';
            find_device.device_log.push({log, day, time, type});
            const newErrorLog = await find_device.save();
          
            return console.log("Change from Warning Fire");
          }
        break;

        case "rfid": // OK đã xong kết nối với thiết bị rfid để kiểm tra và gửi data (cần kết nối thật để test)
            console.log("Trường hợp: Kiểm tra thẻ RFID của nhân viên");
            const rfid_card = device_data.data;
            const user_data = await UserModel.findOne({rfid: rfid_card});
            //const detect_danger = device_data.detect_danger;

            // if(detect_danger === "yes"){
            //   return console.log("Trường hợp: Có nguy hiểm, bật đèn, mở cửa, ......");
            // } else if(detect_danger === "no"){
            // }
            if(rfid_card === "null"){ //trường hợp default system, phần null này ta để module gửi lên
              console.log("Default system case RFID");
              return await device_message.set('null');

            } else if(!user_data){ //User is not exist
                const time = formatTime(new Date());
                const day = formatDate(new Date());
                const present_time = new Date();
                console.log("User is not exist");
                //trường hợp không đúng người dùng thì lưu vào device_log
                const log = "Unauthorize of user with RFID: "+ rfid_card;
                const type = 'danger';
                find_device.device_log.push({log, day, time, type});
                const newErrorLog = await find_device.save();
                if(newErrorLog){
                  console.log("Unauthorize User Error Log is created");
                }
                //send message to led of device through device_mesage
                return await device_message.set('Denied Access');

            } else if(user_data.active == 1){ //user is not active
                const time = formatTime(new Date());
                const day = formatDate(new Date());
                const present_time = new Date();
                console.log("User is not active");
                const log = "User "+  user_data.name + " is not active but try to access";
                const type = 'danger';
                find_device.device_log.push({log, day, time, type});
                const newErrorLog = await find_device.save();
                if(newErrorLog){
                  console.log("Unauthorize User Error Log is created");
                }
              //send message to led of device through device_mesage
                return await device_message.set('Denied Access');

            } else if(user_data){  //User is exist
                const room_data = await RoomModel.findById(user_data.room_id);
                console.log("User is ok");
                if(!room_data || room_data.active == 1){//Room problem
                    const time = formatTime(new Date());
                    const day = formatDate(new Date());
                    const present_time = new Date();
                    console.log("Cannot enter because of room is not active or exist");
                    //lưu vào bảng lỗi
                    const log = "Room is not active or exist so user "+ user_data.name+" with RFID " +rfid_card+ " cannot enter";
                    const type = 'danger';
                    find_device.device_log.push({log, day, time, type});
                    const newErrorLog = await find_device.save();
                    if(newErrorLog){
                      console.log("Unauthorize User Error Log is created");
                    }
                    //send message to led of device through device_mesage
                    return await device_message.set('Denied Access');
                }else{ 
                    const department_data = await DepartmentModel.findById(room_data.department);
                    //if(!department_data || department_data.active == 1 || !department_data.device.equals(find_device._id) ){//Department problem
                    if(!department_data || department_data.active == 1 ){ //department problem
                        const time = formatTime(new Date());
                        const day = formatDate(new Date());
                        const present_time = new Date();
                        console.log("Cannot enter because of department")
                        //lưu vào bảng lỗi 
                        const log = "Department is not active or exist so user "+user_data.name+" with RFID " +rfid_card+ " cannot enter";
                        const type = 'danger';
                        find_device.device_log.push({log, day, time, type});
                        const newErrorLog = await find_device.save();
                        if(newErrorLog){
                          console.log("User cannot enter Department because of Department problem");
                        }
                        //send message to led of device
                        return await device_message.set('Denied Access');
                    }else{ //Enter Success
                        console.log("Welcome user: ", user_data.name);
                        //user dùng đúng thẻ -> mở cửa (thay đổi value trên Firebase), lưu vào hệ thống điểm danh access_log
                        //Write to Access_log
                        const time = formatTime(new Date());
                        const day = formatDate(new Date());
                        const present_time = new Date();
                        const newAccessLog = await AccessLogModel.create({
                            user_id: user_data._id,
                            department_id: department_data._id,
                            rfid: rfid_card,
                            day: day,
                            time: time,
                            image: device_data.image
                        });
                        const log = "User "+user_data.name+" with RFID " +rfid_card+ " enter "+ department_data.name + " successfully";
                        const type = 'normal';
                        find_device.device_log.push({log, day, time, type});
                        const newDeviceLog = await find_device.save();
                        if(newAccessLog && newDeviceLog){
                          await device_message.set('Welcome Staff: '+ user_data.name);
                          return console.log("New access log is created");
                        }
                    }
                }
            }
          break;

        case "booked_table": //đã xong phần đặt bàn (hoạt động tương đối, cần tinh chỉnh sau)
          console.log("Trường hợp đặt bàn");
          const available_user = db.ref('device/'+deviceName+'/available_user');

          if(device_data.data === "return table" && device_data.available_user !== "null"){ //Bàn đã được đặt -> trả bàn
            const time = formatTime(new Date());
            const day = formatDate(new Date());
            const present_time = new Date();

            console.log("Trả bàn");
            console.log("RFID User: ", device_data.available_user);
            const staffData = await UserModel.findOne({rfid: device_data.available_user});
            const user_rfid = device_data.data;
            const user_name = staffData.name;
            const subjectTableData = await SubjectTableModel.findOne({device: find_device._id});
            const table_name = subjectTableData.table_name;
            const log = "Staff: "+user_name+ " with RFID "+user_rfid+" return booked table "+table_name;
            const type = 'normal';

            find_device.device_log.push({log, day, time, type});
            const updateDeivceData = await device_data_updated.set('null');
            const newLog = await find_device.save();
            const updateDeviceMessage = await device_message.set('null');
            const updateAvailabelUser = await available_user.set('null');

            const tableId = subjectTableData._id;
            const updateStaffData = await UserModel.findByIdAndUpdate(staffData._id,{
              $pull: {
                table_booked: { subject_table_id: tableId }
              }
            }, {new: true});

            const updateSubjectTable = await SubjectTableModel.findByIdAndUpdate(subjectTableData._id,{status: 1});

            return console.log("User "+ staffData.name + " return booked table success: "+find_device.name);
          }   
          
          if(device_data.available_user !== "null" && device_data.data !== device_data.available_user && device_data.data !== "null"){
            return console.log("Trường hợp người dùng khác quẹt nhầm thẻ");
          }

          if(device_data.data === "null" && device_data.available_user === "null"){ //hệ thống đang default, chưa hoạt động
            await device_message.set('null');
            return console.log("Booked Table: Default system");
          } else if(find_device.active == 1 || find_device.used === 'no'){ //device chưa active hoặc used
            return console.log("Device"+find_device.name+"is not active or used"); 
          } 

          if(device_data.data !== "null"){
            const time = formatTime(new Date());
            const day = formatDate(new Date());
            const present_time = new Date();
            const staffData = await UserModel.findOne({rfid: device_data.data});
            if(!staffData && device_data.available_user === "null"){ //user không tồn tại trong system OK
              console.log("Not Found User to Book Table");
              const log = "Unauthorized User with RFID "+device_data.data+ " try to book a table";
              const type = 'danger';
              find_device.device_log.push({log, day, time, type});
              const newErrorLog = await find_device.save();
              if(newErrorLog){return await device_message.set('Denied User');}
            }else if (staffData){ //User có tồn tại trong hệ thống OK
              const user_rfid = device_data.data;
              const user_name = staffData.name;
              const subjectTableData = await SubjectTableModel.findOne({device: find_device._id});
              const table_name = subjectTableData.table_name;
      
              if(staffData.active == 1){ //User chưa active nên không thể đặt bàn OK
                const log = "Staff: "+user_name+ " with RFID "+user_rfid+" is not active so cannot booked table "+table_name;
                const type = 'danger';
                find_device.device_log.push({log, day, time, type});
                const newErrorLog = await find_device.save();
                if(newErrorLog){return await device_message.set('Denied User');}

              } else if(staffData.active == 2){ //User đã active
                if(device_data.available_user === "null"){ //Bàn chưa được đặt -> đăng ký người dùng mới OK
                  console.log("Đặt bàn mới");
                  const log = "Staff: "+user_name+ " with RFID "+user_rfid+" booked table "+table_name;
                  const type = 'normal';
                  find_device.device_log.push({log, day, time, type});
                  const newLog = await find_device.save();
  
                  const updateDeviceMessage = await device_message.set('Welcome User');
                  const updateAvailabelUser = await available_user.set(user_rfid);
    
                  const subject_table_id = subjectTableData._id;
                  const note =  "Table "+table_name+" booked by "+user_name+" with RFID "+user_rfid;
                  staffData.table_booked.push({subject_table_id, day, time, note});
                  const updateStaffData = await staffData.save();
    
                  const updateSubjectTable = await SubjectTableModel.findByIdAndUpdate(subjectTableData._id,{status: 2});
    
                  if(newLog && updateAvailabelUser && updateDeviceMessage && updateStaffData &&  updateSubjectTable){
                    return console.log("User "+ staffData.name + " booked table success: "+find_device.name);
                  }
                } //Phần trả bàn để module làm
                // else if(device_data.available_user === device_data.data && device_data.available_user !== "null" && device_data.data !== "null"){ //Bàn đã được đặt -> trả bàn
                //   console.log("Trả bàn");
                //   const log = "Staff: "+user_name+ " with RFID "+user_rfid+" return booked table "+table_name;
                //   const type = 'normal';
                //   find_device.device_log.push({log, day, time, type});
                //   const newLog = await find_device.save();
  
                //   const updateDeviceMessage = await device_message.set('null');
                //   const updateAvailabelUser = await available_user.set('null');
                //   const updateDeivceData = await device_data_updated.set('null');
  
                //   const tableId = subjectTableData._id;
                //   const updateStaffData = await UserModel.findByIdAndUpdate(staffData._id,{
                //     $pull: {
                //       table_booked: { subject_table_id: tableId }
                //     }
                //   }, {new: true});
  
                //   const updateSubjectTable = await SubjectTableModel.findByIdAndUpdate(subjectTableData._id,{status: 1});
  
                //   return console.log("User "+ staffData.name + " return booked table success: "+find_device.name);
                  
                // }            
              }
            }
          }
          
        break;
        
        case "borrow_book": //đã xong phần mượn sách cả backend lẫn module 
          const present_user_updated = db.ref('device/'+deviceName+'/present_user');
          const roomData = await RoomModel.findOne({ 'device.device_id': find_device._id }).populate('department').populate({path: 'device.device_id', model: 'device' });
          
          if(find_device.active == 1 || find_device.used.toString() === 'no'){ //trường hợp device chưa active hoặc used
            return console.log('Thiết bị '+ find_device.name+' chưa được sử dụng hoặc active.');
          } 
          
          if(device_data.data.toString() === "null" && device_data.present_user.toString() === "null"){ //hệ thống mặc định không có người dùng
            const updateMessage = await device_message.set('null');
            const updateMessage2 = await device_message2.set('null');
            return console.log("Hệ thống sẵn sàng hoạt động. Hiện tại không có người dùng");
          } 

          //Phần người dùng muốn sử dụng service nữa, để module làm
          // if(device_data.present_user.toString() !== "null" && device_data.data.toString() === device_data.present_user.toString()){ //trường hợp người dùng hoàn thành việc mượn sách
          //   const userRFID = device_data.present_user.toString();
          //   const enterData = device_data.data.toString();
          //   const userDataN = await UserModel.findOne({rfid: userRFID});
          //   const log = "User "+userDataN.name.toString()+ " with RFID "+userRFID+" finish borrow a book at room "+roomData.name.toString()+" of department"+roomData.department.name.toString();
          //   const type = 'normal';
          //   // find_device.device_log.push({log, day, time, type});
          //   // const newLog = await find_device.save();
          //   const updatePresentUser = await present_user_updated.set('null');
          //   const updateDeviceData = await device_data_updated.set('null');
          //   const updateMessage = await device_message.set('User: '+userDataN.name.toString()+ ' finish borow book');
          //   return console.log("Người dùng đã xong quy trình mượn sách");
          // } 

          if(device_data.return_user.toString() === "yes" && device_data.present_user !== "null"){ //OK trường hợp người dùng hoàn thành việc mượn sách
            const userRFID = device_data.present_user.toString();
            const userDataN = await UserModel.findOne({rfid: userRFID});
            const log = "User "+userDataN.name.toString()+ " with RFID "+userRFID+" finish borrow a book at room "+roomData.name.toString()+" of department"+roomData.department.name.toString();
            const type = 'normal';
            // find_device.device_log.push({log, day, time, type});
            // const newLog = await find_device.save();
            const updatePresentUser = await present_user_updated.set('null');
            const updateDeviceData = await device_data_updated.set('null');
            const updateMessage = await device_message.set(userDataN.name.toString());
            return console.log("Người dùng đã xong quy trình mượn sách");
          } 

          if(device_data.present_user === "null" && device_data.data !== "null" ){ //trường hợp hệ thống chưa có người dùng
            const time = formatTime(new Date());
            const day = formatDate(new Date());
            const present_time = new Date();
            const userData = await UserModel.findOne({rfid: device_data.data});
              if(!userData && device_data.data !== "null"){ //trường hợp sai người dùng
                const log = "Unauthorize user with RFID "+device_data.data+" try to borrow a book at room "+roomData.name+" of department "+roomData.department.name;
                const type = 'danger';
                find_device.device_log.push({log, day, time, type});
                const newErrorLog = await find_device.save();
                const updateMessage = await device_message.set('Unauthorize User');
                //const updateDeviceData = await  device_data_updated.set('null');
                return console.log("Thông báo lỗi không đúng User ");
              } 
            
            
            if(userData){
              if(userData.active == 1){ //trường hợp user chưa được active
                const log = "User "+userData.name+ " with RFID "+device_data.data+" is not active but try to borrow a book at room "+roomData.name+" of department"+roomData.department.name;
                const type = 'danger';
                find_device.device_log.push({log, day, time, type});
                const newErrorLog = await find_device.save();
                await device_message.set('Not Active');
                await device_message2.set(userData.name);
                //const updateDeviceData = await  device_data_updated.set('null');
                //await device_message.set('null');
                return console.log("Thông báo lỗi User không Active thành công");
                
              } else if(userData.active == 2){ //trường hợp user được active
                console.log("Sẵn sàng mượn sách");
                const updatePresentUser = await  present_user_updated.set(device_data.data);
                const updateDeviceData = await device_data_updated.set('null');
                const updateMessage = await device_message.set(userData.name);
                const log = "User "+userData.name+ " with RFID "+device_data.data+" ready to borrow a book at room "+roomData.name+" of department"+roomData.department.name;
                const type = 'normal';
                // find_device.device_log.push({log, day, time, type});
                // const newLog = await find_device.save();
                return console.log("User bắt đầu mượn sách");
              }
            }
          }

          if(device_data.present_user !== "null" && device_data.data !== "null"){ //trường hợp hệ thống đã có người dùng
            console.log("Bắt đầu quy trình cho mượn sách")
            const time = formatTime(new Date());
            const day = formatDate(new Date());
            const present_time = new Date();

            const userRFID = device_data.present_user;
            const enterData = device_data.data;
            const userDataN = await UserModel.findOne({rfid: userRFID});
            const updateMessage = await device_message.set(userDataN.name);

            // if(userDataN && enterData === userRFID){ //trường hợp người dùng hoàn thành việc mượn sách
            //   console.log("Người dùng đã xong việc mượn sách");
            //   const log = "User "+userDataN.name+ " with RFID "+userRFID+" finish borrow a book at room "+roomData.name+" of department"+roomData.department.name;
            //   const type = 'normal';
            //   // find_device.device_log.push({log, day, time, type});
            //   // const newLog = await find_device.save();
            //   const updatePresentUser = await present_user_updated.set('null');
            //   const updateDeviceData = await device_data_updated.set('null');
            //   const updateMessage = await device_message.set('User: '+userDataN.name+ ' finish borow book');
            //   return console.log("Người dùng đã xong quy trình mượn sách");
            // }

            const bookData = await BookModel.findOne({rfid_book: enterData});

            if(!bookData && userRFID !== enterData){ //trường hợp sách lạ 
              const log = "User "+userDataN.name+ " with RFID "+userRFID+" try borrow an unauthorized book with RFID "+enterData+" at room "+roomData.name+" of department"+roomData.department.name;
              const type = 'danger';
              find_device.device_log.push({log, day, time, type});
              const newLog = await find_device.save();
              const updateDeviceData = await device_data_updated.set('null');
              const updateMessage2 = await device_message2.set('Unauthorize Book');
              return console.log("Sách lạ ko nhận ra");
            }
            if(bookData){
              const checkExistBook = userDataN.borrow_book.some( //kiểm tra xem người dùng có sách đó không
                (borrowBook) => borrowBook.book_id.toString() ===  bookData._id.toString()
              );
  
              if(bookData.active == 1 && !checkExistBook){ //trường hợp mượn đúng sách đang được sử dụng
                const log = "User "+userDataN.name+ " with RFID "+userRFID+" try borrow an used book "+bookData.name+" at room "+roomData.name+" of department"+roomData.department.name;
                const type = 'danger';
                find_device.device_log.push({log, day, time, type});
                const newLog = await find_device.save();
                const updateDeviceData = await device_data_updated.set('null');
                const updateMessage2 = await device_message2.set('Denied Borow');
                return console.log("Sách lạ ko nhận ra");
              } else if(bookData.active == 1 && checkExistBook){ //trường hợp trả lại sách
                const log = "User "+userDataN.name+ " with RFID "+userRFID+" return a book "+bookData.name+" at room "+roomData.name+" of department"+roomData.department.name;
                const type = 'normal';
                find_device.device_log.push({log, day, time, type});
                const newLog = await find_device.save();
                const updateUserDataN = await UserModel.findByIdAndUpdate(userDataN,{
                  $pull: {
                    borrow_book: { book_id: bookData._id }
                  }
                }, {new: true});
                const updateBookData = await BookModel.findByIdAndUpdate(bookData._id,{active: 2});
                const updateDeviceData = await device_data_updated.set('null');
                const updateMessage2 = await device_message2.set('Return Book '+bookData.name);
                return console.log("Trả sách thành công");
              } else if(bookData.active == 2 && !checkExistBook){ //trường hợp mượn sách
                const log = "User "+userDataN.name+ " with RFID "+userRFID+" borrow a book "+bookData.name+" at room "+roomData.name+" of department"+roomData.department.name;
                const type = 'normal';
                find_device.device_log.push({log, day, time, type});
                const newLog = await find_device.save();
                const updateBookData = await BookModel.findByIdAndUpdate(bookData._id,{active: 1});
  
                const book_id =  bookData._id;
                const day_borrow = formatDate(new Date());
                userDataN.borrow_book.push({book_id, day_borrow});
                const saveNewBook = await userDataN.save();
  
                const updateDeviceData = await device_data_updated.set('null');
                const updateMessage2 = await device_message2.set('Borrow Book '+bookData.name);
  
                return console.log("Người dùng mượn sách thành công");
              }
            }
            

          } 
        break;

        case "switch": //(đã xong phần backend và module)tất cả đã xong còn phần inching nhưng đang chưa có cách xử lý -> giải pháp: ẩn phần inching trong view đi
            console.log("Trường hợp Switch");
            const update_old_status = db.ref('device/'+deviceName+'/old_status');
            if(find_device.active == 2 && find_device.used === "yes"){
              const switchLogic = await SwitchLogicModel.findOne({device_id: find_device._id});
              if(switchLogic){
                const time = formatTime(new Date());
                const day = formatDate(new Date());
                const present_time = new Date();

                const time_countdown = db.ref('device/'+deviceName+'/time_countdown');
                const time_end_schedule = formatTime(new Date());
                //Phần schedule, ON/OFF từ website
                const scheduleLogicOn = await LogicPartModel.findOne({switch_logic_id: switchLogic._id, type: 'schedule', active: 2, day: dayWeek, time:time_end_schedule, device_status: 2});
                const scheduleLogicOff = await LogicPartModel.findOne({switch_logic_id: switchLogic._id, type: 'schedule', active: 2, day: dayWeek, time:time_end_schedule, device_status: 1});
                if(scheduleLogicOn && device_data.data === "off"){
                  await SwitchLogicModel.findByIdAndUpdate(switchLogic._id,{status_on_off: 2});
                  await DeviceModel.findByIdAndUpdate(find_device._id,{data: 'on'});
                  const log = "Device is turn ON online by schedule: "+scheduleLogicOn.day+" at "+scheduleLogicOn.time;
                  const type = 'normal';
                  find_device.device_log.push({log, day, time, type});
                  await find_device.save();
                  await device_data_updated.set('on');
                  await update_old_status.set('on');
                  return console.log("Device is turn On by schedule at",  time_end_schedule);

                } else if(scheduleLogicOff && device_data.data === "on"){
                  await SwitchLogicModel.findByIdAndUpdate(switchLogic._id,{status_on_off: 1});
                  await DeviceModel.findByIdAndUpdate(find_device._id,{data: 'off'});
                  const log = "Device is turn OFF online by schedule: "+scheduleLogicOff.day+" at "+scheduleLogicOff.time;
                  const type = 'normal';
                  find_device.device_log.push({log, day, time, type});
                  await find_device.save();
                  await update_old_status.set('off');
                  await device_data_updated.set('off');
                  return console.log("Device is turn OFF by schedule at",  time_end_schedule);

                }
  
                //Phần Countdown, ON/OFF từ website
                const countdownLogicActive = await LogicPartModel.findOne({switch_logic_id: switchLogic._id, type: 'countdown', active: 2});
                const countdownLogicDeactive = await LogicPartModel.findOne({switch_logic_id: switchLogic._id, type: 'countdown', active: 1});
                const time_end_countdown = formatTime(new Date());
                if(countdownLogicActive && device_data.time_countdown === "null"){
                  const timeEndCountdown = addCountdownTime(countdownLogicActive.time);
                  await time_countdown.set(timeEndCountdown);
                } else if(countdownLogicActive && device_data.time_countdown !== "null"){

                  if(find_device.data === "on" && time_end_countdown === device_data.time_countdown && device_data.time_countdown !== "null"){
                    await SwitchLogicModel.findByIdAndUpdate(switchLogic._id,{status_on_off: 1});
                    await DeviceModel.findByIdAndUpdate(find_device._id,{data: 'off'});
                    await LogicPartModel.findByIdAndUpdate(countdownLogicActive._id, {active: 1});
                    const log = "Device is turn OFF online by countdown "+countdownLogicActive.time;
                    const type = 'normal';
                    find_device.device_log.push({log, day, time_end_countdown, type});
                    await find_device.save();
                    await update_old_status.set('off');
                    await device_data_updated.set('off');
                    await time_countdown.set('null');

                  } else if(find_device.data === "off" && time_end_countdown === device_data.time_countdown && device_data.time_countdown !== "null"){
                    await SwitchLogicModel.findByIdAndUpdate(switchLogic._id,{status_on_off: 2});
                    await DeviceModel.findByIdAndUpdate(find_device._id,{data: 'on'});
                    await LogicPartModel.findByIdAndUpdate(countdownLogicActive._id, {active: 1});
                    const log = "Device is turn ON online by countdown "+countdownLogicActive.time;
                    const type = 'normal';
                    find_device.device_log.push({log, day, time_end_countdown, type});
                    await find_device.save();
                    await update_old_status.set('on');
                    await device_data_updated.set('on');
                    await time_countdown.set('null');
                  }
  
                } else if(countdownLogicDeactive){
                  await time_countdown.set('null');
                }
  
                //Phần Inching, ON/OF từ website
                // const inchingLogic = await LogicPartModel.find({switch_logic_id: switchLogic._id, type: 'inching', active: 2});
              }

              if(find_device.data === "on" && device_data.old_status === "off"){ //ON/OFF online từ website
                const log = "Device is turn ON online";
                const type = 'normal';
                find_device.device_log.push({log, day, time, type});
                await update_old_status.set('on');
                await device_data_updated.set('on');
                await find_device.save();
                return console.log("Turn On device online");
              } else if(find_device.data === "off" && device_data.old_status === "on"){
                await update_old_status.set('off');
                await device_data_updated.set('off');
                const log = "Device is turn OFF online";
                const type = 'normal';
                find_device.device_log.push({log, day, time, type});
                await find_device.save();
                return console.log("Turn Off device online");
              }

            } else {
              return console.log("Switch chưa được active hoặc sử dụng")
            }
        break;

        case "booked_room": 
          if(find_device.active == 1 || find_device.used === "no"){ //trường hợp thiết bị chưa được sử dụng hoặc active
            return console.log("Device is not used or active");
          }

          const id_booked_room = db.ref('device/'+deviceName+'/id_booked_room');

          const roomBooked = await RoomModel.findOne({ 'device.device_id': find_device._id }).populate('department').populate({path: 'device.device_id', model: 'device' }); //xác định room chứa device 
          const listBookedRoom = await BookedRoomModel.find({room: roomBooked._id, active: 2, day: day}); //xác định danh sách room phù hợp với điều kiện
          
          // if(roomBooked.active == 1 || listBookedRoom.length == 0){ //trường hợp room chưa được active hoặc thêm vào danh sách booked
          //   return console.log("Room is not active or not booked");
          // }
          
          if(device_data.id_booked_room === "null"){
            if(listBookedRoom.length == 1){ //trường hợp chỉ có 1 book room duy nhất
              const choosenRoom = listBookedRoom[0];
              const time_end_parse = parseTime(choosenRoom.time_end, day);
              const choosenRoomID = choosenRoom._id.toString();
              await id_booked_room.set(choosenRoomID);
              await device_message2.set(choosenRoom.QR_code);
  
              if(choosenRoom.time_end === time || present_time > time_end_parse){ //trường hợp hết thời gian sử dụng phòng
                await device_data_updated.set('null');
                await device_message.set('null');
                await device_message2.set('null');
                await id_booked_room.set('null');
                return await BookedRoomModel.findByIdAndUpdate(choosenRoom._id,{active:1});
              } 
              
            } else if(listBookedRoom.length > 0){ //trường hợp có nhiều book room thì lấy cái book room có time_start sớm nhât
              let earliest = listBookedRoom[0]; // Assume the first room is the earliest
              for (let i = 1; i < listBookedRoom.length; i++) {
                  const current = listBookedRoom[i];
    
                  // Parse the time_start values into Date objects (using the same day for both)
                  const earliestTime = parseTime(earliest.time_start, day);
                  const currentTime = parseTime(current.time_start, day);
    
                  // Compare the times using Date comparison
                  if (currentTime < earliestTime) {
                      earliest = current;
                  }
              }
              const choosenRoom = earliest;
              const time_end_parse = parseTime(choosenRoom.time_end, day);
              const choosenRoomID = choosenRoom._id.toString();
  
              await id_booked_room.set(choosenRoomID);
              await device_message2.set(choosenRoom.QR_code);
  
              if(choosenRoom.time_end === time || present_time > time_end_parse){ //trường hợp hết thời gian sử dụng phòng
                await device_data_updated.set('null');
                await device_message.set('null');
                await device_message2.set('null');
                await id_booked_room.set('null');
                return await BookedRoomModel.findByIdAndUpdate(choosenRoom._id,{active:1});
              } 
            }
          }

          if(device_data.id_booked_room !== "null"){ //hiện tại đang có phòng
            const time = formatTime(new Date());
            const day = formatDate(new Date());
            const present_time = new Date();
            
            const choosenRoom = await BookedRoomModel.findById(device_data.id_booked_room);
            const time_end_parse = parseTime(choosenRoom.time_end, day);
            const time_start_parse = parseTime(choosenRoom.time_start, day);

            // if(time_start_parse > present_time){
            //   return await device_message.set('The Meeting start at '+ choosenRoom.time_start);
            // }

            if(choosenRoom.time_end === time || present_time > time_end_parse){ //trường hợp hết thời gian sử dụng phòng
              await device_data_updated.set('null');
              await device_message.set('null');
              await device_message2.set('null');
              await id_booked_room.set('null');
              return await BookedRoomModel.findByIdAndUpdate(choosenRoom._id,{active:1});
            } else if(choosenRoom.active === 1){
              await device_data_updated.set('null');
              await device_message.set('null');
              await device_message2.set('null');
              await id_booked_room.set('null');
            } else {
              if(device_data.data !== "null"){ //có thông tin nhập vào
                const accessUser = await UserModel.findOne({rfid: device_data.data});
    
                if(!accessUser){ //user không tồn tại trong hệ thống
                  await device_message.set('Denied Access');
                  const log = "Unauthorize user with RFID "+device_data.data+ " try to access room "+roomBooked.name;
                  const type = 'danger';
                  find_device.device_log.push({log, day, time, type});
                  return await find_device.save();
                  //return await device_data_updated.set('null');
                }
  
                const existingUser = await BookedRoomModel.findOne({ //kiểm tra người dùng nhập thẻ vào đã có trong danh sách chưa
                  _id: choosenRoom._id,
                  'user_staff.user': accessUser._id
                });
    
                if(!existingUser){ //trường hợp người dùng không có trong danh sách booked room
                  await device_message.set('Denied Access');
                  const log = "Unregistered user "+ accessUser.name + " with RFID "+device_data.data+ " try to access room "+roomBooked.name+ " at "+choosenRoom.time_start;
                  const type = 'danger';
                  find_device.device_log.push({log, day, time, type});
                  return await find_device.save();
                  //return await device_data_updated.set('null');
                } else if(existingUser){ //trường hợp người dùng có trong danh sách booked room
                  await device_message.set('Welcome Staff');
                  const log = "User "+ accessUser.name + " with RFID "+device_data.data+ " access room "+roomBooked.name+ " start at "+choosenRoom.time_start+ " and end at "+choosenRoom.time_end;
                  const type = 'normal';
                  find_device.device_log.push({log, day, time, type});
                  return await find_device.save();
                  //return await device_data_updated.set('null');
                }
              }  
            }

          }
        break;

        default: //trường hợp không có type nào
          console.log("No case");
      }
    }
});

//******************************************************************************************************************** */
