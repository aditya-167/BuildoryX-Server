import mongoose from 'mongoose';

const {Schema} = mongoose;

const {ObjectId} = Schema;


const lessonSchema = new Schema({
    lessonName: {
        type: String,
        trim: true,
        required: true, //
        minlenght: 3,
        maxlength: 300
    },
    slug: {
        type: String,
        lowercase: true,

    },
    description: {
        type: {},
        minlength: 200,
    },
    video: {},

    lessonPreview: {
        type: Boolean,
        default: false,

    },
    },
    {timestamps: true},
    
);


const courseSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true, //
        minlenght: 3,
        maxlength: 300
    },
    slug: {
        type: String,
        lowercase: true,

    },
    description: {
        type: {},
        minlength: 200,
        required: true,
    },

    image: {},
    category: String,
    about: String,
    published: {
        type: Boolean,
        default: false,
    },
    paid: {
        type: Boolean,
        default: true,
    },
    instructor:{
        type: ObjectId,
        ref: "User",
        required: true,

    },
    lessons: [lessonSchema],
    },
    {timestamps: true},
    
);




export default mongoose.model("Course",courseSchema);