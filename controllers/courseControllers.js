import AWS from 'aws-sdk';
import { nanoid } from "nanoid"; 
import slugify from 'slugify';
import Course from '../models/courseModel'
import User from '../models/user'
import Completed from '../models/completed'
import { readFileSync } from 'fs'
const awsConfig = {
    accessKeyId: process.env.AWS_ACESS_KEY_ID,
    secretAcessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    apiVersion: process.env.AWS_API_VERSION,
} 

const S3 = new AWS.S3(awsConfig);

export const uploadImage = async(req,res) =>{
    try{
        const {image} = req.body;
        if(!image) return res.status(400).send("No Image");


        const base64 = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
        );

    const type = image.split(';')[0].split("/")[1];
    const params = {
        Bucket: "elearntutorial-bucket",
        Key: `${nanoid()}.${type}`,
        Body: base64,
        ACL: "public-read",
        ContentEncoding: "base64",
        ContentType: `image/${type}`,
    };

    S3.upload(params, (err,data)=>{
        if(err){
            console.log(err);
            return res.sendStatus(400);
        }
        console.log(data);
        res.send(data);
    })
    }catch(err){
        console.log(err);
    }
}

export const create = async(req, res) =>{
    try{

        const exist = await Course.findOne({
            slug: slugify(req.body.name.toLowerCase()),

        });

        if(exist) return res.status(400).send("Course title already exist");

        const course = await new Course({
            slug: slugify(req.body.name),
            instructor: req.user._id,
            ...req.body,
        }).save();

        res.json(course);

    }catch(err){
        console.log(err);
        return res.status(400).send("Course create failed. Try again!");
    }
}

export const readCourse = async(req, res) =>{

    try{
        const course = await Course.findOne({
            slug: req.params.slug
        }).populate("instructor","_id name")
        .exec();

        res.json(course);
    }catch(err){
        console.log(err);
    }
}


export const uploadVideo = async (req,res) => {
    try{
        const { video } = req.files;

        if(!video) return res.status(400).send("No video recieved");
        const params = {
            Bucket: "elearntutorial-bucket",
            Key: `${nanoid()}.${video.type.split('/')[1]}`,
            Body: readFileSync(video.path),
            ACL: "public-read",
            
            ContentType: video.type,
        };
    
        S3.upload(params, (err,data)=>{
            if(err){
                console.log(err);
                return res.sendStatus(400);
            }
            console.log(data);
            res.send(data);
        })
    }catch(err){
        console.log(err);
        return res.status(400).send("Video Upload failed!");


    }
}




export const cancelVideo = async (req,res) => {
    try{
        const { Bucket, Key } = req.body;

        const params = {
            Bucket,
            Key
        };
    
        S3.deleteObject(params, (err,data)=>{
            if(err){
                console.log(err);
                return res.sendStatus(400);
            }
            console.log(data);
            res.send({ok: true});
        })
    }catch(err){
        console.log(err);
        return res.status(400).send("Video Upload failed!");


    }
}

export const addLesson = async (req,res)=>{

    try{
        const { slug } = req.params;
        const { lessonName,description,video } = req.body;

        const update = await Course.findOneAndUpdate(
            {slug},
            {
                $push: {lessons: {lessonName,description,video, slug: slugify(lessonName) } },
            },
            {new : true}
            ).populate('instructor',"_id name").exec();
        res.json(update);
    }catch(err) {
        console.log(err);
        return res.status(400).send("Failed to add Lesson, please try again");
    }
}

export const removeImage = async(req,res) => {
    try{
        console.log(req.body)
        const { image } = req.body;

        const params = {
            Bucket : image.Bucket,
            Key: image.Key,
        };
    
        S3.deleteObject(params, (err,data)=>{
            if(err){
                console.log(err);
                return res.sendStatus(400);
            }
            console.log(data);
            res.send({ok: true});
        })
    }catch(err){
        console.log(err);
        return res.status(400).send("Video Upload failed!");


    }

}

export const updatecourse = async(req,res) => {
    try{
        const { slug } = req.params;

    const course = await Course.findOne({slug}).exec();
    const updated = await Course.findOneAndUpdate({slug},
        req.body, {new:true}).exec();

    res.json(updated);
    }catch(err){
        console.log(err);
        return res.status(400).send(err.message);
        
    }
}


export const removeLesson = async(req, res) => {
    try{
        console.log(req.params)
        const { slug, lessonId } = req.params;

    const course = await Course.findOne({slug}).exec();
    const deleted = await Course.findByIdAndUpdate(course._id,
    {
        $pull: {lessons: { _id: lessonId } },
    }).exec();


    res.json({ ok: true });
    }catch(err){
        console.log(err);
        return res.status(400).send(err.message);
         
    }
}

export const updateLesson = async(req, res) => {
    try{
    const { slug } = req.params;
    const { _id, lessonName, description, video, lessonPreview } = req.body
    const course = await Course.findOne({slug}).select("instructor").exec();
    const updated = await Course.updateOne({"lessons._id":_id},{
        $set: {
            "lessons.$.lessonName": lessonName,
            "lessons.$.description": description,
            "lessons.$.video": video,
            "lessons.$.lessonPreview": lessonPreview,
    
        
    },},{new: true}).exec();
    
    res.json({ok: true});
    }catch(err){
        console.log(err);
        return res.status(400).send(err.message);
    }
}



export const UnpublishCourse = async (req,res) => {
    try{

        const { courseId } = req.params;
        const course = await Course.findById(courseId).select("instructor").exec();
        
        const updated = await Course.findByIdAndUpdate(courseId, {published: false},
            {new: true}).exec();
        
        res.json(updated); 
    }catch(err){
        console.log(err);
        return res.status(400).send("UnPublish course failed");
    }

}
export const publishCourse = async (req,res) => {
    try{
        const { courseId } = req.params;
        const course = await Course.findById(courseId).select("instructor").exec();
        
        const updated = await Course.findByIdAndUpdate(courseId, {published: true},
            {new: true}).exec();
        
        res.json(updated); 
    }catch(err){
        console.log(err);
        return res.status(400).send("Publish course failed");
    }
}


export const displayCourses = async (req,res) => {
    try{
        const all = await Course.find({ published: true}).populate('instructor,','_id').exec();
        res.json(all);
    }catch(err){
        console.log(err);
    }
}


export const enrollment = async (req,res) => {
    
        const { courseId } = req.params;

        const user = await User.findById(req.user._id).exec();

        let ids = [];
        let length = user.courses && user.courses.length;

        for(let i = 0; i<length; i++){
            ids.push(user.courses[i].toString());

        }
        res.json({
            status: ids.includes(courseId),
            course: await Course.findById(courseId).exec(),

        });
    
}


export const freeEnroll = async (req,res) => {
    try{
        const course = await Course.findById(req.params.courseId).exec();
        const result = await User.findByIdAndUpdate(req.user._id,{
                $addToSet: {courses: course._id},
            },
            {new: true}
        ).exec();
        console.log(result);
        res.json({
            message: "Successfully Enrolled!",
            course,
        });
        
    }catch(err){
        return res.status(400).send("Enrollment error!");
    }
}



export const userCourses = async (req,res) => {
    const user = await User.findById(req.user._id).exec();
    const courses = await Course.find({
        _id: {$in: user.courses}
    }).populate('instructor','_id name').exec();
    res.json(courses);

}



export const markComplete = async (req,res) => {
    try{
        const {courseId, lessonId} = req.body;
        const exist =await Completed.findOne({
            user: req.user._id,
            course: courseId,  

        }).exec();

        if(exist){
            const update = await Completed.findOneAndUpdate({
                user: req.user._id,
                course: courseId,
            },{
                $addToSet: {lessons: lessonId},
            }).exec();
            res.json({ok:true});
        }else{
            const create = await new Completed({
                user: req.user._id,
                course: courseId,
                lessons: lessonId,
            }).save();

            res.json({ok:true});
        }
    }catch(err){
        return res.status(400).send("Enrollment error!");
    }
}



