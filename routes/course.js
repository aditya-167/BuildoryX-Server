import express from 'express';

import formidable from 'express-formidable';


const router = express.Router();

import { requireSignin, isInstructor, isEnrolled } from '../middleware';


import { markComplete, userCourses, freeEnroll, displayCourses, enrollment, UnpublishCourse, publishCourse, updateLesson, removeLesson, updatecourse, uploadImage, create, readCourse, addLesson, uploadVideo, cancelVideo, removeImage } from '../controllers/courseControllers';

router.get('/courses',displayCourses);
router.post("/course/upload-image",uploadImage);

//router.put("/course/upload-image/:slug",updateuploadImage);
//router.put('/course/remove-image/:slug', updateremoveImage)

router.put("/course/:slug", requireSignin, updatecourse);
router.get('/courses',displayCourses);
router.post("/course",requireSignin, isInstructor, create);
router.get("/course/:slug",readCourse)

router.post('/course/video-upload', requireSignin, formidable({maxFileSize: 600 * 1024 * 1024}), uploadVideo);
router.post('/course/remove-image', removeImage)
router.post('/course/cancel-video', requireSignin, cancelVideo);

router.get("/enrollment/:courseId",requireSignin,enrollment);
router.put("/course/publish/:courseId", requireSignin, publishCourse);
router.put("/course/unpublish/:courseId", requireSignin, UnpublishCourse);
 
router.post("/freeEnroll/:courseId",requireSignin, freeEnroll);
router.post("/course/lesson/:slug", requireSignin, addLesson);
router.put("/course/lesson/:slug", requireSignin, updateLesson);
router.put("/course/:slug/:lessonId", requireSignin, removeLesson);
router.get('/user-courses',requireSignin,userCourses);
router.get("/user/userCourse/:slug",requireSignin, isEnrolled, readCourse)
router.post("/markComplete",requireSignin, isEnrolled, markComplete)
module.exports = router;