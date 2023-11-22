const express=require("express");
const router=express.Router();
const connection=require("../../config/db")

router.post('/new', function(req, res) {
  const {article_id,user_id}=req.body;
  connection.query("insert into likes values(?,?,?)",[0,user_id,article_id],(err,results,fields)=>{
    if(err) {
      return res.json({
        code:"8000",
        msg:"请稍后重试",
        data:null
      })
    }
    (async () => {
      try {
        let results = await queryAsync("select * from likes where article_id1=?",article_id);
        results = results.filter((item) => item !== null);
        // console.log(results);
        connection.query("update articles set article_likes=? where id=?",[results.length,article_id],(err,results,fields)=>{
            if(err) {
              return res.json({
                code: "8001",
                msg: "请稍后重试",
                data: null
              });
            }
        })
        res.json({
          code: "0000",
          msg: "点赞成功",
          data: results
        });
          
      } catch (error) {
        return res.json({
          code: "8002",
          msg: "请稍后重试",
          data: null
        });
      }
    })();
    async function queryAsync(sql,id) {
      return new Promise((resolve, reject) => {
          connection.query(sql,[id], (err, results, fields) => {
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
router.post('/no', function(req, res) {
  const {article_id,user_id}=req.body;
  connection.query("delete from likes where article_id1=? and user_id2=?",[article_id,user_id],(err,results,fields)=>{
    if(err) {
      return res.json({
        code:"8003",
        msg:"请稍后重试",
        data:null
      })
    }
    (async () => {
      try {
        let results = await queryAsync("select * from likes where article_id1=?",article_id);
        results = results.filter((item) => item !== null);
        // console.log(results);
        connection.query("update articles set article_likes=? where id=?",[results.length,article_id],(err,results,fields)=>{
          if(err) {
            return res.json({
              code: "8004",
              msg: "请稍后重试",
              data: null
            });
          }
        })
        res.json({
          code: "0000",
          msg: "取消点赞",
          data: results
        });
          
      } catch (error) {
        return res.json({
          code: "3002",
          msg: "请稍后重试",
          data: null
        });
      }
  })();
  async function queryAsync(sql,id) {
    return new Promise((resolve, reject) => {
        connection.query(sql,[id], (err, results, fields) => {
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

router.post('/search', function(req, res) {
    const {article_id,user_id}=req.body;
    connection.query("select * from likes where article_id1=? and user_id2=?",[article_id,user_id],(err,results,fields)=>{
        if(err) {
            return res.json({
                code:"8001",
                msg:"请稍后重试",
                data:null
            })
        }
        res.json({
            code:"0000",
            msg:"查询成功",
            data:results
        })
    })
});
router.post('/searchbyuserid', function(req, res) {
  const {id}=req.body;
  (async () => {
    try {
      let results = await queryAsync("select * from likes where user_id2=?",id);
      results = await Promise.all(
        results.map(async (item) => {
          try {
            const articleData = await getArticleData(item.article_id1);
            item.article_name = articleData.article_title;
            return item;
          } catch (err) {
            console.error(err);
            return null;
          }
        })
      );
      results = results.filter((item) => item !== null);
      // console.log(results);
      res.json({
        code: "0000",
        msg: "成功获取所有点赞",
        data: results
      });
    } catch (error) {
      // console.error(error);
      return res.json({
        code: "8002",
        msg: "请稍后重试",
        data: null
      });
    }
  })();
  // queryAsync and getArticleData functions remain the same
  async function queryAsync(sql,id) {
    return new Promise((resolve, reject) => {
      connection.query(sql,[id], (err, results, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  async function getArticleData(articleId) {
    return new Promise((resolve, reject) => {
      connection.query("select * from articles where id=?", [articleId], (err, results, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
  }
});
router.post('/searchbyarticleid', function(req, res) {
  const {id}=req.body;
  (async () => {
    try {
      let results = await queryAsync("select * from likes where article_id1=?",id);
      results = await Promise.all(
        results.map(async (item) => {
          try {
            const userData = await getUserData(item.user_id2);
            item.user_name = userData.username;
            return item;
          } catch (err) {
            console.error(err);
            return null;
          }
        })
      );
      results = results.filter((item) => item !== null);
      // console.log(results);
      res.json({
        code: "0000",
        msg: "成功获取所有点赞",
        data: results
      });
    } catch (error) {
      // console.error(error);
      return res.json({
        code: "8002",
        msg: "请稍后重试",
        data: null
      });
    }
  })();
  // queryAsync and getArticleData functions remain the same
  async function queryAsync(sql,id) {
    return new Promise((resolve, reject) => {
      connection.query(sql,[id], (err, results, fields) => {
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
});
module.exports=router;