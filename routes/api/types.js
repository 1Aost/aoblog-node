const express = require("express");
const router = express.Router();
const connection = require("../../config/db")

// 获取所有分类
router.get("/", (req, res) => {
  connection.query("select * from types", (err, results, fields) => {
    if (err) {
      return res.json({
        code: 5000,
        msg: err.message,
        data: null
      })
    }
    res.json({
      code: 1000,
      msg: "成功获取所有类型",
      data: results
    })
  })
})

// 新增类别
router.post('/', function (req, res) {
  const { type } = req.body;
  connection.query("insert into types values(?,?)", [0, type], (err, results, fields) => {
    if (err) {
      return res.json({
        code: 5000,
        msg: err.message,
        data: null
      })
    }
    res.json({
      code: 1000,
      msg: "新增成功",
      data: null
    })
  })
});

// 修改类别
router.put('/', function (req, res) {
  const { id, type } = req.body;
  connection.query("update types set type=? where id=?", [type, id], (err, results, fields) => {
    if (err) {
      return res.json({
        code: 5000,
        msg: err.message,
        data: null
      })
    }
    res.json({
      code: 1000,
      msg: "修改成功",
      data: null
    })
  })
});

// 删除类别
router.delete("/", (req, res) => {
  const id = Number(req.query.id);
  connection.query("delete from types where id=?", [id], (err, results, fields) => {
    if (err) {
      return res.json({
        code: 5000,
        msg: err.message,
        data: null
      })
    }
    res.json({
      code: 1000,
      msg: "删除成功",
      data: null
    })
  })
})

module.exports = router;