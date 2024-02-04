const mongoose=require('mongoose');

const demoSchema= new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    image:{
        data: Buffer,
        contentType: String
    }
});

mongoose.model('Demo',demoSchema);