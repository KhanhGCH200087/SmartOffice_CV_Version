var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//---------------------------------------------------------------------------------------
//3A. declare router (1 collection => 1 router)
//user_data
var user_staffRouter = require('./routes/user_data/user_staff');
var access_logRouter = require('./routes/user_data/access_log');
//building
var departmentRouter = require('./routes/building/department')
var roomRouter = require('./routes/building/room');
//switch
var switch_logicRouter = require('./routes/switch/switch_logic');
var logic_partRouter = require('./routes/switch/logic_part');
//library
var room_table_bookedRouter = require('./routes/library/room_table_booked');
var subject_tableRouter = require('./routes/library/subject_table.js');
var book_dataRouter = require('./routes/library/book_data');
//booked room
var booked_roomRouter = require('./routes/booked_room/booked_room');
//device
var deviceRouter = require('./routes/device/device');
//dashboard
//var adminDashboardRouter = require('./routes/dashboard/adminDashboard.js');
//Auth
var authRouter = require('./routes/auth.js');
//Staff
var staffRouter = require('./routes/staff.js');
//--------------------------------------------------------------------------------------

var app = express();

//--------------------------------------------------------------------------------------
//import "express-session" library
var session = require('express-session');
//set session timeout
const timeout = 10000 * 60 * 60 * 24;  // 24 hours (in milliseconds)
//config session parameters
app.use(session({
  secret: "practice_makes_perfect",  // Secret key for signing the session ID cookie
  resave: false,                     // Forces a session that is "uninitialized" to be saved to the store
  saveUninitialized: true,           // Forces the session to be saved back to the session store
  cookie: { maxAge: timeout },
}));
//----------------------------------------------------------------------------------------

//1. config mongoose library (connect and work with database)
//1A. import library
var mongoose = require('mongoose');
//1B. set mongodb connection string
//Note1: Database name: SmartOffice
var database = "mongodb+srv://phamminhkhanh6011:khanh@databasever01.nj4y6.mongodb.net/SmartOffice";
//1C. connect to mongodb
mongoose.connect(database)
  .then(() => console.log('connect to db sucess'))
  .catch((err) => console.log('connect to db fail' + err));
  
  const PORT = process.env.PORT || 8000
  app.listen(PORT)
  console.log("Server is running " + PORT)
//2. config body-parser library (get data from client-side)
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
//------------------------------------------------------------------

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//----------------------------------------------------------------------
//make session value can be accessible in view (hbs)
//IMPORTANT: place this code before setting router url
app.use((req, res, next) => {
  res.locals.email = req.session.email;
  res.locals.role = req.session.role;
  next();
});

//--------------------------------------------------------------------------
//set user authorization for whole router
//IMPORTANT: place this code before setting router url
const {checkAdminSession, checkStaffSession} = require('./middlewares/auth.js');
//user_data
app.use('/userstaff', checkAdminSession);
// app.use('/accesslog', checkAdminSession);
//building
app.use('/department', checkAdminSession);
app.use('/room', checkAdminSession);
//switch
app.use('/switchlogic', checkAdminSession);
app.use('/logicpart', checkAdminSession);
//library
app.use('/roomtablebooked', checkAdminSession);
//app.use('/subjecttable', subject_tableRouter); //use room table booked
app.use('/bookdata', checkAdminSession);
//booked room
app.use('/bookedroom', checkAdminSession);
//device
app.use('/device', checkAdminSession);
//staff
app.use('/staff', checkStaffSession);

//----------------------------------------------------------------------------
app.use('/', indexRouter);
app.use('/users', usersRouter);

//--------------------------------------------------------------------------
//3B. declare web URL of router
//user_data
app.use('/userstaff', user_staffRouter);
// app.use('/accesslog', access_logRouter);
//building
app.use('/department', departmentRouter);
app.use('/room', roomRouter);
//switch
app.use('/switchlogic', switch_logicRouter);
app.use('/logicpart', logic_partRouter);
//library
app.use('/roomtablebooked', room_table_bookedRouter);
//app.use('/subjecttable', subject_tableRouter); //use room table booked
app.use('/bookdata', book_dataRouter);
//booked room
app.use('/bookedroom', booked_roomRouter);
//device
app.use('/device', deviceRouter);
//dashboard
//app.use('/adminDashboard', adminDashboardRouter);
//auth
app.use('/auth', authRouter);
//staff
app.use('/staff', staffRouter);
//--------------------------------------------------------------------------

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//--------------------------------------------
require('./specialFunction.js');
require('./firebase_device.js');

module.exports = app;
