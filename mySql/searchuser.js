
var mysqlConnection=require('./connection');

exports.search=function(q){

    return new Promise(function(resolve,reject){

        let qd=q+"%"
        let qd1=q

        var sql="SELECT idusers,username,fullname,profile FROM users WHERE username LIKE ? || fullname LIKE ?";
        mysqlConnection.query(sql,[
            qd,
            qd1
        ],function(err,result){
            if(err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })


}

exports.explore=function(idusers,limit,offset){

    return new Promise(function(resolve,reject){
       
        var sql="SELECT users.idusers,username,fullname,profile,userinfo.account_visiblity FROM users INNER JOIN userinfo ON users.idusers=userinfo.idusers WHERE users.idusers not IN (SELECT followed_to FROM followers WHERE followed_by=?) AND  users.idusers!=? LIMIT ? OFFSET ?";
        mysqlConnection.query(sql,[
            parseInt(idusers),
        parseInt(idusers),
         parseInt(limit),
         parseInt(offset)
        ],function(err,result){
            console.log(result);
            if(err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })


}

exports.MaxUser=function () {
    return new Promise(function(resolve,reject){

        var sql="SELECT count(*) as len FROM users";
        mysqlConnection.query(sql,function(err,result){
            if(err){
                reject(err)
            }else{
             
                resolve(result[0].len)
            }
        })
    })
    
}
