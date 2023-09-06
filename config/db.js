const mysql=require("mysql")
const connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"170506",
    database:"blog"
})
connection.connect();
module.exports=connection;