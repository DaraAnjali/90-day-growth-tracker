import Task from '../models/Task.js';
export async function listTasks(req,res){res.json(await Task.find({user:req.user.id}).sort({createdAt:1}))}
export async function createTask(req,res){const name=req.body.name?.trim();if(!name)return res.status(400).json({message:'Task name is required'});const task=await Task.create({user:req.user.id,name,completed:{}});res.status(201).json(task)}
export async function updateTask(req,res){const task=await Task.findOne({_id:req.params.id,user:req.user.id});if(!task)return res.status(404).json({message:'Task not found'});if(req.body.name!==undefined)task.name=req.body.name.trim();if(req.body.dateKey!==undefined)task.completed.set(req.body.dateKey,!!req.body.value);await task.save();res.json(task)}
export async function deleteTask(req,res){const r=await Task.deleteOne({_id:req.params.id,user:req.user.id});if(!r.deletedCount)return res.status(404).json({message:'Task not found'});res.json({message:'Task deleted'})}
