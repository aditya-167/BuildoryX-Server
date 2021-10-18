
import User from '../models/user';
import {hashPassword, comparePassword} from "../utils/authUtils"
import jwt from 'jsonwebtoken';
import AWS from 'aws-sdk';
import { nanoid } from 'nanoid';
import Course from '../models/courseModel'

const awsConfig = {
    accessKeyId: process.env.AWS_ACESS_KEY_ID,
    secretAcessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    apiVersion: process.env.AWS_API_VERSION,
}



const SES = new AWS.SES(awsConfig);
var code = "";
export const register = async(req,res)=>{

    try{
        const {name, email, password, pin} = req.body;
        if(pin===""||(code!==pin)) return res.status(400).send("Invalid PIN");
        
        const hashedPass = await hashPassword(password);


        if(email===process.env.ADMINEMAIL && password === process.env.ADMINPASSWORD && name === process.env.ADMINNAME){
            const user =  new User({
                name,
                email,
                password: hashedPass,
                role: "Instructor",
            });
            await user.save();
            code = "";
            return res.json({
                ok:true
            });
        }
        const user =  new User({
            name,
            email,
            password: hashedPass,
        });
        await user.save();
        
        code = "";
        return res.json({
            ok:true
        });
    } catch(err){
        console.log(err);
        return res.status(400).send('Error, pls. try again!!')
    };
}; 


export const checkCredentials = async(req,res) => {

    try{
        const {name, email, password, reEnterPassword} = req.body;

        //validation
        if(!name) return res.status(400).send("Name is mandatory!");
        if(!password || password.length< 6) return res.status(400).send("password is mandatory, minimum 6 chracters long!");
        if(password!==reEnterPassword) return res.status(400).send("Password does not match!");
        
        let userExist = await User.findOne({email}).exec();

    

        if(userExist) return res.status(400).send("Email is already taken!");

        return res.json({
            ok:true
        });

    }catch(err){
        console.log(err)
    };
};


export const login = async(req,res) => {
    try{
        //check if user is in database
        const {email,password} = req.body;
        const user = await User.findOne({email}).exec();

        if(!user) {
            return res.status(400).send("No user found!");
        }

        const foundPass = await comparePassword(password, user.password);
        console.log(foundPass);

        if (!foundPass) return res.status(400).send("pasword is incorrect!");

        const token = jwt.sign({_id: user._id},process.env.JWT_SECRET);

        //returning user and token and exclude hash password;

        user.password = undefined;

        res.cookie('token',token,{
            httpOnly: true,
        });

        res.json(user);
    }catch(err){
        console.log(err);
        return res.status(400).send("Error. Try again");
    }
}



export const logout = async (req,res)=>{

    try{

        res.clearCookie("token");
        return res.json({message: "Signed out successfully"});

    } catch(err){
        console.log(err);
    }


}
export const currentUser = async (req, res) => {
    try{
        const user = await User.findById(req.user._id).select("-password").exec();
        return res.json({ok: true});
    } catch(err){
        console.log(err);
    }
}
export const forgetPassword = async (req, res) => {

    try{

        const { email } = req.body;
        code = nanoid(7).toUpperCase();
        const user = await User.findOneAndUpdate({email},
            {passwordReset: code}
            );

            if(!user) return res.status(400).send(
                "User not found!"
            );
            
        

        const params = {
                Source: process.env.EMAIL_FROM,
                Destination:{
                    ToAddresses: [email]
                },
                Message:{
                    Body:{
                        Html:{
                            Charset: 'UTF-8',
                            Data:
                            `
                                <html>
                                    <h1>Reset password</h1>
                                    <p>Use the PIN below to reset password</p>
                                    <h2 stlye = "color:red;">${code}</h2>
                                    <i>From ADY's Tutorials</i>
                                </html>
                            `
                        }
                    },
                    Subject: {
                        Charset: "UTF-8",
                        Data: "Reset Password",
                    },
                },
                

            };

            const emailSending = SES.sendEmail(params).promise();

            emailSending.then((data)=>{
                console.log(data);
                res.json({ ok : true});
            }).catch((err)=>{
                return res.status(400).send("Error! please try again");
            })
    }catch(err){
        return res.status(400).send("Error! please try again");
    }
}



export const resetPassword = async(req,res)=>{
    try{
        const { email, pin ,newPass, reEnternewPass } = req.body;

        
        if(code!==pin) return res.status(400).send("Invalid PIN"); 
        
        if(!newPass || newPass.length< 6) return res.status(400).send("password is mandatory, minimum 6 chracters long!");
        console.log(newPass);
        console.log(reEnternewPass);
        if (newPass!==reEnternewPass) return res.status(400).send("Password do not match!");
        const hashedPassword = await hashPassword(newPass);

        const user = User.findOneAndUpdate({
            email, passwordReset : pin,
        },{password: hashedPassword,passwordReset: ""}).exec();

        res.json({ok: true});
    }catch(err){
        console.log(err);
        return res.status(400).send("Error! Try again");
    }
}

export const signUpOTP = async(req, res) => {

    try{
        const { email } = req.body;

        code = nanoid(6).toUpperCase();
        const params = {
            Source: process.env.EMAIL_FROM,
            Destination:{
                ToAddresses: [email]
            },
            Message:{
                Body:{
                    Html:{
                        Charset: 'UTF-8',
                        Data:
                        `
                            <html>
                                <h1>Confirm Email verification code</h1>
                                <p>Use the PIN below to confirm your email</p>
                                <h2 stlye = "color:blue;">${code}</h2>
                                <i>From ADY's Tutorials</i>
                            </html>
                        `
                        }
                    },
                    Subject: {
                        Charset: "UTF-8",
                        Data: "Confirm Email Verification, ADY's Tutorials",
                    },
                },
                

            };

            const emailSending = SES.sendEmail(params).promise();

            emailSending.then((data)=>{
                res.json({ ok : true});
            }).catch((err)=>{
                console.log(err);
                return res.status(400).send("Email verification failed! kindly provide valid Email!");
            })
    }catch(err){
        console.log(err);
        return res.status(400).send("Email verification failed! kindly provide valid Email!");
    }

}


export const currentInstructor = async (req,res) => {

    try{
        let user = await User.findById(req.user._id).select('-password').exec();
        if(!user.role.includes("Instructor")){
            console.log("not instructor!")
            return res.sendStatus(403);
        }
        else{
            console.log("instructor!")
            res.json({ok:true});
        }
    }catch(err){
        console.log(err);
    }
}


export const instructorCourses = async (req,res) => {
    try{
        const courses = await Course.find({instructor: req.user._id})
        .sort({ createdAt: -1})
        .exec();

        res.json(courses);
    }catch(err){
        console.log(err);
    }
}