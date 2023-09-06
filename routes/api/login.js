const express=require("express");
const jwt=require("jsonwebtoken");
const router=express.Router();
const connection=require("../../config/db")
const {secret}=require("../../config/config")

router.post("/token",(req,res)=>{
    let {username,password}=req.body;
    connection.query("select * from users where username=? and password=?",[username,password],(err,results,fields)=>{
        if(err) {
            return res.json({
                code:"1001",
                msg:"出现错误",
                data:null
            })
        }
        if(results.length===0) {
            return res.json({
                code:"1002",
                msg:"尚未注册账号",
                data:null
            })
        }
        // 生成token
        let token=jwt.sign({
            username,
            password
        },secret,{
            expiresIn: 60*60*24*7,// 有效期：7天
        })
        res.json({
            code:"0000",
            msg:"成功登录",
            data:token
        })
    })
})
module.exports=router;