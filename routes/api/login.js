const express=require("express");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const router=express.Router();
const connection=require("../../config/db")
const {secret}=require("../../config/config")

router.post("/token",(req,res)=>{
    let {username,password}=req.body;
    connection.query("select * from users where username=?",[username],(err,results,fields)=>{
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
        //TODO:判断用户输入的登陆密码是否和数据库中的密码一致
        //拿着用户输入的密码和数据库中的密码进行对比
        const compareResult=bcrypt.compareSync(password,results[0].password);
        //如果对比的结果为false，则证明用户输入的密码错误
        if(!compareResult) {
            return res.json({
                code:"1003",
                msg:"密码错误"
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