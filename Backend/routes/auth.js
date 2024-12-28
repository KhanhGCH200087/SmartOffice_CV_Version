var express = require('express')
var router = express.Router()

const UserModel = require('../models/UserStaffModel');

router.get('/login', async(req, res) => {
    res.render('index');
 })

 router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect("/auth/login");
 })

 router.post('/login', async (req, res) => {
    try {
       const user_email = req.body.email;
       const password_email = req.body.password;
       var userData = await UserModel.findOne({ email: user_email }) //email: tên cột, accountLogin.email: người dùng nhập vào //dùng hàm findOne để đối chiếu dữ liệu đc nhập vào và db có khớp ko
 
       if (userData) {
          if (password_email ===  userData.password) {
            //----------------------------Session-----------------------------------------------------
            if(userData.role == 'admin'){   //Admin
                req.session.admin_id = userData._id;
            } else if(userData.role == 'staff'){    //Staff
                req.session.staff_id = userData._id;
            }
            //------------------------------------------------------------------------------------------------
            //initialize session after login success
            req.session.email = userData.email;
            req.session.role = userData.role; //take role from db, put it so session so it can be checked in middleware

            if (userData.role == 'admin') { //role: admin
            res.redirect('/room');
            }
            else if(userData.role == 'staff') { //role: staff
            res.redirect('/staff'); 
            }
          } else {
             res.redirect('/auth/login');
          }
       } else {
          res.redirect('/auth/login');
       }
    } catch (err) {
       console.log("Error: ", err);
    }
 });











module.exports = router