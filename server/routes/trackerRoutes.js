import {Router} from 'express';
import auth from '../middleware/auth.js';
import Tracker from '../models/Tracker.js';
import Task from '../models/Task.js';
const r=Router();r.use(auth);
const validDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d+'T00:00:00Z'))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
r.get('/',async(req,res)=>res.json(await Tracker.find({user:req.user.id}).sort({createdAt:1})));
r.post('/',async(req,res)=>{
 const {name,startDate,endDate}=req.body;
 if(!name?.trim()||name.trim().length>80||!validDate(startDate)||!validDate(endDate)||endDate<startDate)return res.status(400).json({message:'Enter a name and a valid date range'});
 const days=Math.round((Date.parse(endDate)-Date.parse(startDate))/86400000)+1;
 if(days>3660)return res.status(400).json({message:'Maximum tracker length is 10 years'});
 res.status(201).json(await Tracker.create({user:req.user.id,name:name.trim(),startDate,endDate,taskIds:[]}));
});
r.post('/:id/tasks',async(req,res)=>{
 const tracker=await Tracker.findOne({_id:req.params.id,user:req.user.id});
 if(!tracker)return res.status(404).json({message:'Tracker not found'});
 const name=req.body.name?.trim();
 if(!name||name.length>150)return res.status(400).json({message:'Valid task name required'});
 // Reuse a task with the same name, making its date checkboxes shared everywhere.
 let task=(await Task.find({user:req.user.id})).find(t=>t.name.toLocaleLowerCase()===name.toLocaleLowerCase());
 if(!task)task=await Task.create({user:req.user.id,name,completed:{},isCustom:true});
 if(!tracker.taskIds.some(id=>String(id)===String(task._id))){tracker.taskIds.push(task._id);await tracker.save();}
 res.json({tracker,task});
});
r.delete('/:id/tasks/:taskId',async(req,res)=>{
 const tracker=await Tracker.findOne({_id:req.params.id,user:req.user.id});
 if(!tracker)return res.status(404).json({message:'Tracker not found'});
 tracker.taskIds=tracker.taskIds.filter(id=>String(id)!==req.params.taskId);await tracker.save();res.json(tracker);
});
r.delete('/:id',async(req,res)=>{
 const deleted=await Tracker.deleteOne({_id:req.params.id,user:req.user.id});
 if(!deleted.deletedCount)return res.status(404).json({message:'Tracker not found'});
 res.json({message:'Tracker deleted; shared tasks and checkmarks preserved'});
});
export default r;
