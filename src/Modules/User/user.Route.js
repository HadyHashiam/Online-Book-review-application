const express = require('express');
const { getUserValidator, createUserValidator, updateUserValidator, deleteUserValidator, changeUserPasswordValidator, updateLoggedUserValidator, } = require('./userValidator');
const { getUsers, getUser, createUser, updateUser, deleteUser, uploadUserImage, resizeImage, changeUserPassword, getLoggedUserData, updateLoggedUserPassword, updateLoggedUserData, deleteLoggedUserData, } = require('./controller/user.Controller');
const authService = require('../Auth/controller/auth.Controller');
// const cartRoute = require("../cart/cart.route")
// const favRoute = require("../Fav/fav.route")
// const orderRoute = require("../Order/order.route")
const router = express.Router();


router.use(authService.protect);


// router.use('/:userId/carts', cartRoute);
// router.use('/:userId/favs', favRoute);
// router.use('/:userId/orders', orderRoute);

router.get('/getMe', getLoggedUserData, getUser);
router.put('/changeMyPassword', updateLoggedUserPassword);
router.put('/updateMe', updateLoggedUserValidator, updateLoggedUserData);
router.delete('/deleteMe', deleteLoggedUserData);

router.route('/')
  .get(getUsers)
  .post(uploadUserImage, resizeImage, createUserValidator, createUser);

router.route('/:id')
  .get(getUserValidator, getUser)
  .put(authService.protect, authService.allowedTo('admin'), uploadUserImage, resizeImage, updateUserValidator, updateUser)
  .delete(authService.protect, authService.allowedTo('admin'), deleteUserValidator, deleteUser);

router.put('/changePassword/:id', authService.protect, authService.allowedTo('admin'), changeUserPasswordValidator, changeUserPassword);

// Admin
router.use(authService.allowedTo('admin'));

module.exports = router;
