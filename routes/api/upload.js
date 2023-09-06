const express=require("express");
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const connection=require("../../config/db")
const router=express.Router();

// 配置 multer 中间件
const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    // 指定上传文件保存的目录
      cb(null, '../aoblog/public/images/');
  },
  filename: function (req, file, cb) {
    // 自定义上传文件的文件名
    cb(null, Date.now() + file.originalname);
  },
});
const upload1 = multer({ 
  storage: storage1,
  // limits: { fileSize: 1024 * 1024 }, // 限制文件大小为1MB
});
const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    // 指定上传文件保存的目录
      cb(null, '../aoblog/public/avatar/');
  },
  filename: function (req, file, cb) {
    // 自定义上传文件的文件名
    cb(null, Date.now() + file.originalname);
  },
});

const upload2 = multer({ 
  storage: storage2,
  // limits: { fileSize: 1024 * 1024 }, // 限制文件大小为1MB
});
// 上传图片
router.post("/",upload1.single('file'),(req,res)=>{
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    // console.log(req.file);
    // 将图片信息保存到数据库
    const filename = req.file.filename;
    const path = req.file.path;
    // console.log(filename);

    // 将文件复制到另一个位置 './images/'
    const originalFilePath = path;
    const newFilePath = originalFilePath.replace("aoblog","aoblog_admin")
    fs.copyFile(originalFilePath, newFilePath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: '将图片复制到另一个位置失败.' });
      }
      // console.log('图片已复制到另一个位置.');
      res.json({ url: filename }); // 返回图片的文件名或其他信息给前端
    });
})

// 上传头像
router.post("/avatar",upload2.single('file'),(req,res)=>{
  if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
  }
  // console.log(req.file);
  // 将图片信息保存到数据库
  const filename = req.file.filename;
  const path = req.file.path;

  // 将文件复制到另一个位置 './avatar/'
  const originalFilePath = path;
  const newFilePath = originalFilePath.replace("aoblog","aoblog_admin")
  fs.copyFile(originalFilePath, newFilePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: '将图片复制到另一个位置失败.' });
    }
    // console.log('图片已复制到另一个位置.');
    res.json({ url: filename }); // 返回图片的文件名或其他信息给前端
  });
})


module.exports=router;