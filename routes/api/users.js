const express = require('express');
const connection = require('../../config/db');
const router = express.Router();
const jwt = require("jsonwebtoken");
const { secret } = require("../../config/config")
const bcrypt = require("bcryptjs");

// 用户登录
router.post("/login", (req, res) => {
  let { username, password } = req.body;
  connection.query("select * from users where username=?", [username], (err, results, fields) => {
    if (err) {
      return res.json({
        code: 5000,
        msg: err.message,
        data: null
      })
    }
    if (results.length === 0) {
      return res.json({
        code: 5000,
        msg: "尚未注册账号",
        data: null
      })
    }
    //TODO:判断用户输入的登陆密码是否和数据库中的密码一致
    //拿着用户输入的密码和数据库中的密码进行对比
    const compareResult = bcrypt.compareSync(password, results[0].password);
    //如果对比的结果为false，则证明用户输入的密码错误
    if (!compareResult) {
      return res.json({
        code: 5000,
        msg: "密码错误"
      })
    }
    // 生成token
    let token = jwt.sign({
      username,
      password
    }, secret, {
      expiresIn: 60 * 60 * 24 * 7,// 有效期：7天
    })
    res.json({
      code: 1000,
      msg: "成功登录",
      data: token
    })
  })
})

// 用户注册
router.post("/register", (req, res) => {
  let { username, password } = req.body;
  connection.query("select * from users where username=?", [username], (err, results, fields) => {
    if (err) {
      return res.json({
        code: 5000,
        msg: err.message,
        data: null
      })
    }
    if (results.length !== 0) {
      return res.json({
        code: 5000,
        msg: "该用户已存在",
        data: null
      })
    }
    // 加密密码
    password = bcrypt.hashSync(password, 10);
    // 第四个参数：默认头像
    connection.query("insert into users values(?,?,?,?)", [0, username, password, './avatar/user-default.png'], (err, results, fields) => {
      if (err) {
        return res.json({
          code: 5000,
          msg: err.message,
          data: null
        })
      }
      res.json({
        code: 1000,
        msg: "注册成功,请登录",
        data: null
      })
    })
  })
})

// 获取所有用户信息
router.get('/', function (req, res, next) {
  connection.query("select * from users", (err, results, fields) => {
    if (err) {
      return res.json({
        code: 5000,
        msg: err.message,
        data: null
      })
    }
    res.json({
      code: 1000,
      msg: "获取所有用户信息成功",
      data: results
    })
  })
});

// 删除用户
router.delete('/', function (req, res, next) {
  const id = Number(req.query.id);
  connection.query("delete from users where id=?", [id], (err, results, fields) => {
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
});

// 新增用户
router.post('/', function (req, res, next) {
  const { username, password, avatar } = req.body;
  connection.query("insert into users values(?,?,?,?)", [0, username, password, avatar], (err, results, fields) => {
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

// 根据token获取用户信息
router.post("/bytoken", function (req, res) {
  let { token } = req.body;
  jwt.verify(token, secret, (err, data) => {
    if (err) {
      return res.json({
        code: 401,
        msg: "身份信息过期，请重新登录",
        data: null
      })
    }
    connection.query("select * from users where username=?", [data.username], (err, results, fields) => {
      if (err) {
        return res.json({
          code: 5000,
          msg: err.message,
          data: null
        })
      }
      res.json({
        code: 1000,
        msg: "成功查找",
        data: results
      })
    })
  });
})

// 修改用户
router.put('/', function (req, res) {
  const { id, username, password, avatar } = req.body;
  connection.query("update users set username=?,password=?,avatar=? where id=?", [username, password, avatar, id], (err, results, fields) => {
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

// 判断token是否失效
router.post("/tokenStatus", (req, res) => {
  const { token } = req.body;
  // 如果Token不存在，返回错误响应
  if (!token) {
    return res.json({
      code: 403,
      msg: "尚未登录",
      data: null
    });
  }
  // 验证Token是否有效
  jwt.verify(token, secret, (err, data) => {
    console.log(data);
    if (err) {
      return res.json({
        code: 401,
        msg: "身份信息过期，请重新登录",
        data: null
      });
    }
    return res.json({
      code: 1000,
      msg: "身份信息合法",
      data: data
    })
  });
})

module.exports = router;
