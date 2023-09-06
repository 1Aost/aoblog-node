const express=require("express");
const router=express.Router();
const connection=require("../../config/db")

router.get("/all",(req,res)=>{
    connection.query("select * from types",(err,results,fields)=>{
        if(err) {
            return res.json({
                code:"7000",
                msg:"出现错误",
                data:null
            })
        }
        res.json({
            code:"0000",
            msg:"成功获取所有类型",
            data:results
        })
    })
})

router.post('/new', function(req, res) {
    const {type}=req.body;
    connection.query("insert into types values(?,?)",[0,type],(err,results,fields)=>{
      if(err) {
        return res.json({
          code:"7001",
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
    const {id,type}=req.body;
    connection.query("update types set type=? where id=?",[type,id],(err,results,fields)=>{
      if(err) {
        return res.json({
          code:"7002",
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

router.get("/no",(req,res)=>{
    const id=Number(req.query.id);
    connection.query("delete from types where id=?",[id],(err,results,fields)=>{
        if(err) {
            return res.json({
                code:"7003",
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
module.exports=router;