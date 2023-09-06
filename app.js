const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

//解决跨域问题
const cors=require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const loginRouter=require("./routes/api/login")
const registerRouter=require("./routes/api/register")
const articlesRouter=require("./routes/api/articles")
const reviewsRouter=require("./routes/api/reviews")
const adminRouter=require("./routes/api/admin")
const typeRouter=require("./routes/api/types")
const uploadRouter=require("./routes/api/upload")
const likesRouter=require("./routes/api/likes")

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users' , usersRouter);
app.use('/api', loginRouter);
app.use('/api', registerRouter);
app.use("/api/articles",articlesRouter);
app.use("/api/reviews",reviewsRouter)
app.use("/api/admin",adminRouter)
app.use("/api/types",typeRouter);
app.use("/api/Upload",uploadRouter);
app.use("/api/likes",likesRouter);
// 进行404响应
app.all("*",(req,res)=>{
  res.end("404")
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
