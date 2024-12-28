const checkAdminSession = (req, res, next) => {
    if (req.session.email && req.session.role == 'admin') {
       next();
    }
    else {
       res.redirect('/auth/login');
    }
 }

 const checkStaffSession = (req, res, next) => {
    if (req.session.email && req.session.role == 'staff') {
       next();
    }
    else {
       res.redirect('/auth/login');
    }
 }

 module.exports = {
    checkAdminSession,
    checkStaffSession
 }