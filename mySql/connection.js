var mysql=require('mysql')

var mysqlConnection=mysql.createConnection({
    host:'InstaTravel',
    user:'root',
    password:'qwerty123',
    database:'instatravel',
    multipleStatements:true

})
mysqlConnection.connect(function(err){
    if(!err){
        console.log("Connected");
    }else{
        console.log("Connection failed");
    }


})
module.exports=mysqlConnection;