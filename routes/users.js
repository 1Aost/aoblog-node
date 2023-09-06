const express = require('express');
const connection = require('../config/db');
const router = express.Router();
const jwt=require("jsonwebtoken");
const { secret }=require("../config/config")
/* GET users listing. */
router.get('/', function(req, res, next) {
  connection.query("select * from users",(err,results,fields)=>{
    if(err) {
      return res.json({
        code:"6000",
        msg:"请稍后重试",
        data:null
      })
    }
    res.json({
      code:"0000",
      msg:"获取所有用户信息成功",
      data:results
    })
  })
});

router.get('/no', function(req, res, next) {
  const id=Number(req.query.id);
  connection.query("delete from users where id=?",[id],(err,results,fields)=>{
    if(err) {
      return res.json({
        code:"6001",
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
});

router.post('/new', function(req, res, next) {
  const {username,password,avatar}=req.body;
  connection.query("insert into users values(?,?,?,?)",[0,username,password,avatar],(err,results,fields)=>{
    if(err) {
      return res.json({
        code:"6002",
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
router.post("/bytoken",function(req,res) {
  let {token}=req.body;
  jwt.verify(token,secret,(err,data)=>{
    if(err) {
      return res.json({
        code:"1111",
        msg:"身份信息过期，请重新登录",
        data:null
      })
    }
    connection.query("select * from users where username=?",[data.username],(err,results,fields)=>{
      if(err) {
        return res.json({
          code:"6003",
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
router.post('/oldtonew', function(req, res) {
  const {id,username,password,avatar}=req.body;
  connection.query("update users set username=?,password=?,avatar=? where id=?",[username,password,avatar,id],(err,results,fields)=>{
    if(err) {
      return res.json({
        code:"6004",
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
// 判断token的
router.post("/token",(req,res)=>{
  const { token } = req.body;
  // 如果Token不存在，返回错误响应
  if (!token) {
    return res.json({
      code: "2222",
      msg: "尚未登录",
      data: null
    });
  }
  // 验证Token是否有效
  jwt.verify(token, secret, (err, data) => {
    if (err) {
      return res.json({
        code: "1111",
        msg: "身份信息过期，请重新登录",
        data: null
      });
    }
    return res.json({
      code:"0000",
      msg:"身份信息合法",
      data:data
    })
  });
})

module.exports = router;
