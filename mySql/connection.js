var mysql2=require('mysql2')

var mysqlConnection=mysql2.createConnection({
    host:'127.0.0.1',
    //host:'localhost',
    user:'root',
    password:'qwerty123',
    //database:'instatravel',
    database:'InstaTravel',
    multipleStatements:true

})
mysqlConnection.connect(function(err){
    if(!err){
        console.log("Connected");
    }else{
        console.log("Connection failed", err.message );
    }


})
module.exports=mysqlConnection;









