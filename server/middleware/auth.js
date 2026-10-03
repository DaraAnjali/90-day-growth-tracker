import jwt from 'jsonwebtoken';
export default function auth(req,res,next){try{const h=req.headers.authorization;if(!h?.startsWith('Bearer ')) return res.status(401).json({message:'Not authenticated'});req.user=jwt.verify(h.slice(7),process.env.JWT_SECRET);next()}catch(e){res.status(401).json({message:'Invalid or expired token'})}}
