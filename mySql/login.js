const md5 = require('md5')
var mysqlConnection = require('./connection')

exports.login = function (email, password) {
    return new Promise(function (resolve, reject) {
        mysqlConnection.query("SELECT * FROM users where email=? AND password=? limit 1"
            , [
                email,
                md5(password)
            ], (error, result) => {
                if (error) {                    
                    reject(error);

                }
                resolve(result);


            })
    }).then((result) => {
        return result;
    }).catch((error) => {        
        return false

    })

}
exports.usernameLogin = function (username,password) {
    return new Promise(function (resolve, reject) {
        mysqlConnection.query("SELECT * FROM users where username=? AND password=? limit 1"
            , [
                username,
                md5(password)
            ], (error, result) => {
                if (error) {
                    reject(error);
                }
                resolve(result);
            })
    }).then((result) => {
        return result;
    }).catch((error) => {
        return false

    })
}


exports.relogin = function (email, password, idusers, username) {
    return new Promise(function (resolve, reject) {
        mysqlConnection.query("SELECT * FROM users where email=? AND password=? AND username=? AND idusers=? limit 1"
            , [
                email,
                password,
                username,
                idusers
            ], (error, result) => {
                if (error) {
                    reject(error);

                }
                resolve(result);


            })
    }).then((result) => {
        return result;
    }).catch((error) => {
    })

}


