const express = require("express");
const jwt = require("jsonwebtoken");
const { secret, reply } = require("../../config/config");
const connection = require("../../config/db")
const timestampToTime = require("../../config/utils")
const router = express.Router();

// 获取所有留言
router.get("/", (req, res) => {
  connection.query("select * from reviews", (err, results, fields) => {
    if (err) {
      console.log(err);
      return res.json({
        code: 5000,
        msg: "请稍后重试",
        data: null
      })
    }
    (async () => {
      try {
        let results = await queryAsync("select * from reviews");

        results = await Promise.all(
          results.map(async (item) => {
            try {
              const userData = await getUserData(item.user_id1);
              item.user_name = userData.username;
              return item;
            } catch (err) {
              console.error(err);
              return null;
            }
          })
        );

        // Filter out any null values returned due to errors in the inner queries
        results = results.filter((item) => item !== null);

        // console.log(results);

        res.json({
          code: 1000,
          msg: "成功获取所有留言",
          data: results
        });
      } catch (error) {
        console.log(err);
        return res.json({
          code: 5000,
          msg: "请稍后重试",
          data: null
        });
      }
    })();

    // queryAsync and getUserData functions remain the same
    async function queryAsync(sql) {
      return new Promise((resolve, reject) => {
        connection.query(sql, (err, results, fields) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    }

    async function getUserData(userId) {
      return new Promise((resolve, reject) => {
        connection.query("select * from users where id=?", [userId], (err, results, fields) => {
          if (err) {
            reject(err);
          } else {
            resolve(results[0]);
          }
        });
      });
    }
  })
})

// 用户提交新留言
router.post("/", (req, res) => {
  let { review_message, review_email, token } = req.body;
  let review_time = timestampToTime(Date.now(), true);
  // 校验token
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
      const id = results[0].id;
      connection.query("insert into reviews values(?,?,?,?,?,?,?)", [0, id, review_time, review_email, review_message, 0, reply], (err, results, fields) => {
        if (err) {
          return res.json({
            code: 5000,
            msg: err.message,
            data: null
          })
        }
        res.json({
          code: 1000,
          msg: "成功提交留言，请等待管理员的通过回复哦",
          data: null
        })
      })
    })
  })
})

// 删除留言
router.delete("/", (req, res) => {
  const id = Number(req.query.id);
  connection.query("delete from reviews where id=?", [id], (err, results, fields) => {
    if (err) {
      console.log(err.message);
      return res.json({
        code: 5000,
        msg: err.message,
        data: null
      })
    }
    res.json({
      code: 1000,
      msg: "成功删除",
      data: null
    })
  })
})

// 根据id获取留言
router.get("/reviewsById", (req, res) => {
  const id = Number(req.query.id);
  connection.query("select * from reviews where user_id1=?", [id], (err, results, fields) => {
    if (err) {
      console.log(err);
      return res.json({
        code: 5000,
        msg: "请稍后重试",
        data: null
      })
    }
    res.json({
      code: 1000,
      msg: "查询成功",
      data: results
    })
  })
})

// 管理端修改留言的状态
router.put("/status", (req, res) => {
  let { id, review_status } = req.body;
  connection.query("update reviews set review_status=? where id=?", [review_status, id], (err, results, fields) => {
    if (err) {
      return res.json({
        code: 5000,
        msg: err.message,
        data: null
      })
    }
    res.json({
      code: 1000,
      msg: "修改状态成功",
      data: null
    })
  })
})

// 根据id管理员回复留言
router.post('/reply', (req, res) => {
  const { id, reply } = req.body;
  connection.query("update reviews set review_reply=? where id=?", [reply, id], (err, results, fields) => {
    if (err) {
      return res.json({
        code: 5000,
        msg: err.message,
        data: null
      })
    }
    res.json({
      code: 1000,
      msg: "成功回复",
      data: null
    })
  })
})

module.exports = router;