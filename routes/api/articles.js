const express=require("express");
const fs=require("fs");
const jwt=require("jsonwebtoken");
const { secret, reply } = require("../../config/config");
const timestampToTime=require("../../config/utils")
const connection=require("../../config/db")
const router=express.Router();

// 查询所有的文章
router.get("/all",(req,res)=>{
    // 设置响应头，禁用缓存
    /* res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-DNS-Prefetch-Control', 'off'); // 禁用DNS预加载
    res.setHeader('X-Prefetch-Control', 'off'); // 禁用预加载 */
    connection.query("select * from articles",(err,results,fields)=>{
        if(err) {
            return res.json({
                code:"2001",
                msg:"查询出现问题，请稍后重试",
                data:null
            })
        }
        res.json({
            code:"0000",
            msg:"获取成功",
            data:results
        })
    })
})

// 查询指定类型的文章
router.get("/types",(req,res)=>{
    let type="";
    if(req.query.type==='0') {
        type='前端基础'
    }else if(req.query.type==='1') {
        type='前端进阶'
    }else if(req.query.type==='2') {
        type='前端八股文'
    }else if(req.query.type==='3') {
        type='算法'
    }
    connection.query("select * from articles where article_type=?",[type],(err,results,fields)=>{
        if(err) {
            return res.json({
                code:"2002",
                msg:"查询出现问题，请稍后重试",
                data:null
            })
        }
        res.json({
            code:"0000",
            msg:"获取成功",
            data:results
        })
    })
})

// 根据id查询指定的文章
router.get("/some",(req,res)=>{
    let {id}=req.query;
    if(JSON.stringify(req.query)!=='{}') {
        connection.query("select * from articles where id=?",[id],(err,results,fields)=>{
            if(err) {
                return res.json({
                    code:"2003",
                    msg:"查询出现问题，请稍后重试",
                    data:null
                })
            }
            connection.query("update articles set article_views=? where id=?",[results[0].article_views+1,id],(err,results,fields)=>{
                if(err) {
                    return res.json({
                        code:"2004",
                        msg:"更新出现问题，请稍后重试",
                        data:null
                    })
                }
            })
            res.json({
                code:"0000",
                msg:"获取成功",
                data:results
            })
        })
    }
})

// 根据id修改文章的点赞数量
router.get("/likes",(req,res)=>{
    let {id,isLiked,likes}=req.query;
    likes=Number(likes);
    if(isLiked==="true") likes+=1;
    else likes-=1;
    // console.log(likes);
    if(likes!==-1) {
        connection.query("update articles set article_likes=? where id=?",[likes,id],(err,results,fields)=>{
            if(err) {
                return res.json({
                    code:"2005",
                    msg:"更新出现问题，请稍后重试",
                    data:null
                })
            }
            connection.query("select * from articles where id=?",[id],(err,results,fields)=>{
                if(err) {
                    res.json({
                        code:"2006",
                        msg:"获取失败，请稍后重试",
                        data:null
                    })
                }
                res.json({
                    code:"0000",
                    msg:"获取成功",
                    data:results
                })
            })
        })
    }
})

// 根据id查询指定的文章评论
router.get("/comments",(req,res)=>{
    let {id}=req.query;
    (async () => {
        try {
            let results = await queryAsync("select * from comments where article_id=?",id);
            results = await Promise.all(
                results.map(async (item) => {
                    try {
                        const userData = await getUserData(item.user_id);
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
                code: "0000",
                msg: "成功获取所有留言",
                data: results
            });
        } catch (error) {
            // console.error(error);
            return res.json({
                code: "3002",
                msg: "请稍后重试",
                data: null
            });
        }
    })();
    
    // queryAsync and getUserData functions remain the same
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
})

// 根据文章id以及用户id提交评论
router.post("/newcomments",(req,res)=>{
    let {article_id,token,comments}=req.body;
    let comment_time=timestampToTime(Date.now(),true);
    // 校验token
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
                    code:"2009",
                    msg:"请稍后重试",
                    data:null
                })
            }
            const id=results[0].id;
            connection.query("insert into comments values(?,?,?,?,?,?,?)",[0,article_id,id,comments,comment_time,0,reply],(err,results,fields)=>{
                if(err) {
                    return res.json({
                        code:"2010",
                        msg:"请稍后重试",
                        data:null
                    })
                }
                (async () => {
                    try {
                        let results = await queryAsync("select * from comments where article_id=?",article_id);
                        results = await Promise.all(
                            results.map(async (item) => {
                                try {
                                    const userData = await getUserData(item.user_id);
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
                        connection.query("update articles set comments_length=? where id=?",[results.length,article_id],(err,results,fields)=>{
                            if(err) {
                                return res.json({
                                    code: "3003",
                                    msg: "请稍后重试",
                                    data: null
                                });
                            }
                            
                        })
                        res.json({
                            code: "0000",
                            msg: "成功获取所有留言",
                            data: results
                        });
                        
                    } catch (error) {
                        // console.error(error);
                        return res.json({
                            code: "3002",
                            msg: "请稍后重试",
                            data: null
                        });
                    }
                })();
                
                // queryAsync and getUserData functions remain the same
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
            })
        })
    })
})

// 根据id删除文章
router.get("/noarticles",(req,res)=>{
    let id=Number(req.query.id);
    connection.query("delete from articles where id=?",[id],(err,results,fields)=>{
        if(err) {
            return res.json({
                code:"2012",
                msg:"删除出现问题，请稍后重试",
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

// 根据id修改文章信息
router.post("/oldtonew",(req,res)=>{
    let {id,article_type,article_title,article_introduction,article_img}=req.body;
    connection.query("update articles set article_type=?,article_title=?,article_introduction=?,article_img=? where id=?",[article_type,article_title,article_introduction,article_img,id],(err,results,fields)=>{
        if(err) {
            return res.json({
                code:"2013",
                msg:"出现问题，请稍后重试",
                data:null
            })
        }
        res.json({
            code:"0000",
            msg:"修改文章信息成功",
            data:null
        })
    })
})

// 保存文章内容
router.post("/saveArticle",(req,res)=>{
    const {image,title,desc}=req.body;
    let type=0;
    if(req.body.type==='前端基础') {
        type=0;
    }else if(req.body.type==='前端进阶') {
        type=1;
    }else if(req.body.type==='前端八股文') {
        type=2;
    }else if(req.body.type==='算法') {
        type=3;
    }
    // 生成唯一的文件名，使用当前时间戳作为文件名
    const fileName = Date.now() + '.md';
    const url="../aoblog/public/md/"+type+"/"+fileName;
    // 将文章信息保存在文件中
    fs.writeFile(url,req.body.content,(err)=>{
        if(err) {
            return res.json({
                code:"2014",
                msg:"保存文章失败",
                data:null
            })
        }
    })
    const time=timestampToTime(req.body.date,true);
    // 将信息保存在数据库中
    connection.query("insert into articles values(?,?,?,?,?,?,?,?,?,?,?)",[0,"./md/"+type+"/"+fileName,image,req.body.type,0,0,0,title,desc,time,0],(err,results,fields)=>{
        if(err) {
            return res.json({
                code:"2015",
                msg:"请稍后重试",
                data:null
            })
        }
        res.json({
            code:"0000",
            msg:"成功提交文章",
            data:null
        })
    })
})

// 根据文章名称查询id
router.get("/idbyname",(req,res)=>{
    let {name}=req.query;
    if(JSON.stringify(req.query)!=='{}') {
        connection.query("select * from articles where article_title=?",[name],(err,results,fields)=>{
            if(err) {
                return res.json({
                    code:"2016",
                    msg:"查询出现问题，请稍后重试",
                    data:null
                })
            }
            res.json({
                code:"0000",
                msg:"获取成功",
                data:results
            })
        })
    }
})

// 管理端修改评论的状态
router.post("/commentstatus",(req,res)=>{
    let {id,comments_status}=req.body;
    connection.query("update comments set comments_status=? where comments_id=?",[comments_status,id],(err,results,fields)=>{
        if(err) {
            return res.json({
                code:"2017",
                msg:"更改状态失败，请稍后重试",
                data:null
            })
        }
        res.json({
            code:"0000",
            msg:"修改状态成功",
            data:null
        })
    })
})
// 根据id删除评论
router.get("/nocomment",(req,res)=>{
    const comments_id=Number(req.query.comments_id);
    connection.query("delete from comments where comments_id=?",[comments_id],(err,results,fields)=>{
        if(err) {
            return res.json({
                code:"2018",
                msg:"请稍后重试",
                data:null
            })
        }
        res.json({
            code:"0000",
            msg:"成功删除",
            data:null
        })
    })
})

router.post('/replycomment',(req,res)=>{
    const {comments_id,reply}=req.body;
    connection.query("update comments set comments_reply=? where comments_id=?",[reply,comments_id],(err,results,fields)=>{
        if(err) {
            return res.json({
                code:"2019",
                msg:"回复失败，请稍后重试",
                data:null
            })
        }
        res.json({
            code:"0000",
            msg:"成功回复",
            data:null
        })
    })
})


router.get("/commentsbyid",(req,res)=>{
    let id=Number(req.query.id);
    (async () => {
        try {
            let results = await queryAsync("select * from comments where user_id=?",id);
            results = await Promise.all(
                results.map(async (item) => {
                    try {
                        const articleData = await getArticleData(item.article_id);
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
                msg: "成功获取所有评论",
                data: results
            });
        } catch (error) {
            // console.error(error);
            return res.json({
                code: "2020",
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
})
module.exports=router;