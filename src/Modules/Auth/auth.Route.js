const express = require('express');
const router = express.Router();

const { signupValidator, loginValidator } = require('./authValidator');
const { postSignup, postlogin, forgotPassword, verifyPassResetCode, resetPassword, getlogout, postlogout } = require('./controller/auth.Controller');
const authService = require("../Auth/controller/auth.Controller");




// Routes for local authentication
router.post('/signup', postSignup);

router.post('/login', loginValidator, postlogin);



router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetCode', verifyPassResetCode);
router.put('/resetPassword', authService.protect, resetPassword);



module.exports = router;
