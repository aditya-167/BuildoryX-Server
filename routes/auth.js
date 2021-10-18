import express from 'express';


const router = express.Router();

import { requireSignin } from '../middleware';


import { instructorCourses, register,login, logout, currentInstructor, currentUser, forgetPassword, resetPassword, signUpOTP, checkCredentials } from '../controllers/authController';

router.post("/register",register);
router.post("/login",login);
router.get("/logout",logout);
router.get("/current-user", requireSignin, currentUser);
router.post("/forgetPassword",forgetPassword);
router.post("/resetPassword", resetPassword);
router.post("/signUpOTP",signUpOTP);
router.post("/checkCredentials",checkCredentials);
router.get("/currentInstructor", requireSignin, currentInstructor);
router.get('/instructor-course',requireSignin, instructorCourses);
module.exports = router;