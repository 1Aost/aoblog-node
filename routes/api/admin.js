const express=require("express");
const jwt=require("jsonwebtoken");
const connection=require("../../config/db")
const router=express.Router();
const {secret}=require("../../config/config")

router.post("/",(req,res)=>{
    let {username,password}=req.body;
    connection.query("select * from admins where admin_username=? and admin_password=?",[username,password],(err,results,fields)=>{
        if(err) {
            return res.json({
                code:"5000",
                msg:"出现错误，请稍后重试",
                data:null
            })
        }
        if(results.length===0) {
            return res.json({
                code:"5001",
                msg:"该账号不存在",
                data:null
            })
        }
        // 生成token
        let token=jwt.sign({
            username,
            password
        },secret,{
            expiresIn: 60*60,
        })
        res.json({
            code:"0000",
            msg:"成功登录",
            data:token
        })
    })
})
router.post("/all",(req,res)=>{
    connection.query("select * from admins",(err,results,fields)=>{
        if(err) {
            return res.json({
                code:"5002",
                msg:"出现错误，请稍后重试",
                data:null
            })
        }
        res.json({
            code:"0000",
            msg:"成功获取所有管理员信息",
            data:results
        })
    })
})
router.get("/no",(req,res)=>{
    const id=Number(req.query.id);
    connection.query("delete from admins where id=?",[id],(err,results,fields)=>{
        if(err) {
            return res.json({
                code:"5003",
                msg:"请稍后重试",
                data:null
            })
        }
        res.json({
            code:"0000",
            msg:"删除成功",
            data:null
        })
    })
})

router.post('/new', function(req, res) {
    const {admin_username,admin_password,avatar,admin_type}=req.body;
    connection.query("insert into admins values(?,?,?,?,?)",[0,admin_username,admin_password,avatar,admin_type],(err,results,fields)=>{
      if(err) {
        return res.json({
          code:"5004",
          msg:"请稍后重试",
          data:null
        })
      }
      res.json({
        code:"0000",
        msg:"新增成功",
        data:null
      })
    })
});
router.post('/oldtonew', function(req, res) {
    const {id,admin_username,admin_password,avatar,admin_type}=req.body;
    connection.query("update admins set admin_username=?,admin_password=?,avatar=?,admin_type=? where id=?",[admin_username,admin_password,avatar,admin_type,id],(err,results,fields)=>{
      if(err) {
        return res.json({
          code:"5005",
          msg:"请稍后重试",
          data:null
        })
      }
      res.json({
        code:"0000",
        msg:"修改成功",
        data:null
      })
    })
});

router.post("/bytoken",function(req,res) {
    let {admin_token}=req.body;
    jwt.verify(admin_token,secret,(err,data)=>{
        if(err) {
            return res.json({
                code:"1111",
                msg:"身份信息过期，请重新登录",
                data:null
            })
        }
        connection.query("select * from admins where admin_username=?",[data.username],(err,results,fields)=>{
            if(err) {
                return res.json({
                    code:"5006",
                    msg:"出现错误，请稍后重试",
                    data:null
                })
            }
            res.json({
                code:"0000",
                msg:"成功查找",
                data:results
            })
        })
    });
})
module.exports=router;