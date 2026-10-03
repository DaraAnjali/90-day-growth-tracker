import mongoose from 'mongoose';
const taskSchema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},name:{type:String,required:true,trim:true},completed:{type:Map,of:Boolean,default:{}}},{timestamps:true});
export default mongoose.model('Task',taskSchema);
