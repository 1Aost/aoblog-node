const express = require("express");
const router = express.Router();
const connection = require("../../config/db")

// 点赞
router.post('/', function (req, res) {
  const { article_id, user_id } = req.body;
  connection.query("insert into likes values(?,?,?)", [0, user_id, article_id], (err, results, fields) => {
    if (err) {
      return res.json({
        code: 5000,
        msg: err.message,
        data: null
      })
    }
    (async () => {
      try {
        let results = await queryAsync("select * from likes where article_id1=?", article_id);
        results = results.filter((item) => item !== null);
        // 增加articles表中likes的数量
        connection.query("update articles set article_likes=? where id=?", [results.length, article_id], (err, results, fields) => {
          if (err) {
            return res.json({
              code: 5000,
              msg: err.message,
              data: null
            });
          }
        })
        res.json({
          code: 1000,
          msg: "点赞成功",
          data: results
        });

      } catch (error) {
        return res.json({
          code: 5000,
          msg: err.message,
          data: null
        });
      }
    })();
    async function queryAsync(sql, id) {
      return new Promise((resolve, reject) => {
        connection.query(sql, [id], (err, results, fields) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    }
  })
});

// 取消点赞
router.delete('/', function (req, res) {
  const { article_id, user_id } = req.query;
  connection.query("delete from likes where article_id1=? and user_id2=?", [article_id, user_id], (err, results, fields) => {
    if (err) {
      return res.json({
        code: 5000,
        msg: err.message,
        data: null
      })
    }
    (async () => {
      try {
        let results = await queryAsync("select * from likes where article_id1=?", article_id);
        results = results.filter((item) => item !== null);
        connection.query("update articles set article_likes=? where id=?", [results.length, article_id], (err, results, fields) => {
          if (err) {
            return res.json({
              code: 5000,
              msg: err.message,
              data: null
            });
          }
        })
        res.json({
          code: 1000,
          msg: "取消点赞",
          data: results
        });

      } catch (error) {
        return res.json({
          code: 5000,
          msg: err.message,
          data: null
        });
      }
    })();
    async function queryAsync(sql, id) {
      return new Promise((resolve, reject) => {
        connection.query(sql, [id], (err, results, fields) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    }
  })
});

// 查找点赞信息
router.get('/', function (req, res) {
  const { article_id, user_id } = req.query;
  const sql = (article_id && user_id) ? "select * from likes where article_id1=? and user_id2=?" : article_id ? "select * from likes where article_id1=?" : "select * from likes where user_id2=?";
  const data = (article_id && user_id) ? [article_id, user_id] : article_id ? [article_id] : [user_id];
  connection.query(sql, data, (err, results, fields) => {
    if (err) {
      return res.json({
        code: 5000,
        msg: err.message,
        data: null
      })
    }
    res.json({
      code: 1000,
      msg: "查询成功",
      data: results
    })
  })
});

module.exports = router;