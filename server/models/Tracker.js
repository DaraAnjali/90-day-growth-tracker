import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
  name:{type:String,required:true,trim:true,maxlength:80},
  startDate:{type:String,required:true},endDate:{type:String,required:true},
  taskIds:[{type:mongoose.Schema.Types.ObjectId,ref:'Task'}]
},{timestamps:true});
export default mongoose.model('Tracker',schema);
