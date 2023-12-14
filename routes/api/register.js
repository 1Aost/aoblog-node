const express=require("express");
const bcrypt=require("bcryptjs");
const connection=require("../../config/db")
const router=express.Router();

router.post("/register",(req,res)=>{
    let {username,password}=req.body;
    connection.query("select * from users where username=?",[username],(err,results,fields)=>{
        if(err) {
            return res.json({
                code:"1003",
                msg:"查找出错，请稍后重试",
                data:null
            })
        }
        if(results.length!==0) {
            return res.json({
                code:"1004",
                msg:"该用户已存在",
                data:null
            })
        }
        // 加密密码
        password=bcrypt.hashSync(password,10);
        // 第四个参数：默认头像
        connection.query("insert into users values(?,?,?,?)",[0,username,password,'./avatar/user-default.png'],(err,results,fields)=>{
            if(err) {
                return res.json({
                    code:"1005",
                    msg:"插入出错，请稍后重试",
                    data:null
                })
            }
            res.json({
                code:"0000",
                msg:"注册成功,请登录",
                data:null
            })
        })
    })
        
})
module.exports=router;