const connection = require('./connection');
var md5 = require('md5');
const mysqlConnection = require('./connection');
const { func } = require('prop-types');
const register = require('./register');
const { resolve } = require('path/posix');
const { sendMail } = require('./sendMail');

exports.changePassword = function (idusers, oldPassword, newPassword, confirmPassword) {
    //console.loguserId, oldPassword, newPassword, confirmPassword);
    if (newPassword != confirmPassword) {
        //console.log"password not matched");
        return new Promise(function (resolve, reject) {
            resolve({
                status: 400,
                message: "New password and confirm password does not match"
            })
        }).then(function (result) {
            return result;
        }).catch(function (err) {
            throw err;
        })
    } else {
        //Check Old Password 
        const query = "SELECT * FROM users where idusers=? AND password=?";
        //console.loguserId);
        return new Promise(function (resolve, reject) {
            connection.query(query, [parseInt(idusers), md5(oldPassword)], function (err, result) {
                if (err)
                    reject(err);
                resolve(result)

            })
        }).then(function (result) {

            //Change Password
            if (result.length > 0) {
                const query = "UPDATE users SET password=? WHERE idusers=?";
                return new Promise(function (resolve, reject) {
                    connection.query(query, [md5(newPassword), parseInt(idusers)], function (err, result) {
                        if (err)
                            resolve({
                                status: 400,
                                message: "Error in changing password"
                            });
                        if (result.affectedRows > 0)
                            resolve({
                                status: 200,
                                message: "Password changed successfully"
                            })
                        //console.logresult);

                    })
                }).then(function (result) {
                    return result;
                }).catch(function (err) {
                    throw err;
                })
            } else {
                return new Promise(function (resolve, reject) {
                    resolve({
                        status: 400,
                        message: "Old password is incorrect"
                    })
                }).then(function (result) {
                    return result;
                }).catch(function (err) {
                    throw err;
                })
            }
        }).catch(function (err) {
            throw err;
        })
    }

}
// LIKE POST
exports.likePost = function (postId, idusers, currentUserId) {
    let table = 'likes'
    return new Promise(function (resolve, reject) {
        mysqlConnection.beginTransaction(function (err) {
            if (err) reject(err)
            let timestamp = new Date().getTime()
            //Check if the user has already liked the post
            let query1 = "SELECT * FROM " + table + " WHERE postId=? AND liked_by=?"
            mysqlConnection.query(query1, [postId, currentUserId], (err, result) => {
                if (err) reject(err)
                if (result.length == 0) {
                    // if the user has not liked the post
                    let query2 = "INSERT INTO " + table + "(postId,liked_by,pc_by,timestamp) VALUES(?,?,?,?)"
                    mysqlConnection.query(query2, [postId, currentUserId, idusers, timestamp], (err, result) => {
                        if (err) reject(err)
                        resolve(result)
                    })
                } else {
                    //delete the like
                    let query2 = "DELETE FROM " + table + " WHERE postId=? AND liked_by=?"
                    mysqlConnection.query(query2, [postId, currentUserId], (err, result) => {
                        if (err) reject(err)
                        resolve(result)

                    })
                }
            })
            mysqlConnection.commit(function (err) {
                if (err) {
                    mysqlConnection.rollback(function () {
                        reject(err)
                    })
                }
                resolve(true)
            })
        })
    })
        .then(function (result) {
            return result
        })
        .catch(function (err) {
            return false
        })
}
exports.checkLike = function (postId, idusers) {
    let table = 'likes'
    let query = "SELECT * FROM " + table + " WHERE postId=? AND liked_by=? limit ?"
    return new Promise(function (resolve, reject) {
        mysqlConnection.query(query, [postId, idusers, 1], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    }).then((result) => {
        return result
    }).catch((err) => {
        return false
    })
}

exports.commentPost = function (postId, comment, idusers, parentCommentId, commentType) {
    let table = 'comment'
    let timestamp = new Date().getTime()
    let query = "INSERT INTO " + table + "(postId,idusers,comment_content,timestamp,parentId,comment_type,isModified) VALUES(?,?,?,?,?,?,?)"

    return new Promise(function (resolve, reject) {
        mysqlConnection.query(query, [postId, idusers, comment, timestamp, parentCommentId, commentType, 0], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    }).then((result) => {
        return result
    }).catch((err) => {
        return false
    })
}

exports.getCommentCount = function (postId) {
    let table = 'comment'
    let query = "SELECT COUNT(*) as count FROM " + table + " WHERE postId=?"
    return new Promise(function (resolve, reject) {
        mysqlConnection.query(query, [postId], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    }).then((result) => {
        return result
    }
    ).catch((err) => {
        return false
    })

}
exports.getLikeCount = function (postId) {
    let table = 'likes'
    let query = "SELECT COUNT(*) as count FROM " + table + " WHERE postId=?"
    return new Promise(function (resolve, reject) {
        mysqlConnection.query(query, [postId], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    }).then((result) => {
        return result
    }).catch((err) => {
        return false
    })
}

exports.getPostIdFromTag = function (tag) {
    let table = 'hashtag'
    tag = "#" + tag
    let query = "SELECT postId FROM " + table + " WHERE value=?"
    return new Promise(function (resolve, reject) {
        mysqlConnection.query(query, [tag], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    }).then((result) => {
        return result
    }).catch((err) => {
        return false
    })
}



exports.getPostByTag = async function (tag) {
    let postIdResult = await this.getPostIdFromTag(tag)
    let postId = []
    for (let i = 0; i < postIdResult.length; i++) {
        postId.push(postIdResult[i].postId)
    }

    if (postIdResult.length > 0) {
        return new Promise(function (resolve, reject) {
            let query = `SELECT post.postId,post.postUrl,
            post.idusers,post.timestamp,insta_media.mimetype,insta_media.url
            from post inner join insta_media on post.postId=insta_media.postId
            where post.postId in (?) ORDER BY post.timestamp DESC`
            mysqlConnection.query(query, [postId], (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
        }).then((result) => {
            return result
        }).catch((err) => {
            console.log(err);
            return false
        })
    } else {
        return false
    }

}
exports.getPostByUrl = function (url) {
    url = '/p/' + url
    let query = `SELECT post.postId,post.postUrl,post.idusers,post.timestamp,post.caption,
    insta_media.mimetype,insta_media.url
     FROM post INNER JOIN insta_media ON post.postId=insta_media.postId WHERE post.postUrl=?`
    return new Promise(function (resolve, reject) {
        mysqlConnection.query(query, [url], (err, result) => {
            if (err) reject(err)

            resolve(result)
        })
    }).then((result) => {
        return result
    }).catch((err) => {
        return false
    })
}

exports.getMorePost = async function (postId, idusers) {
    let userInfo = await register.getUserInfo(idusers)
    if (userInfo[0].account_visiblity.toLowerCase() === "private") {
        return false
    }
    return new Promise(function (resolve, reject) {
        let query = `SELECT post.postId,post.postUrl,post.idusers,post.timestamp,post.caption,
        insta_media.mimetype,insta_media.url
         FROM post INNER JOIN insta_media ON post.postId=insta_media.postId WHERE post.postId!=? ORDER BY post.timestamp DESC LIMIT 15`
        mysqlConnection.query(query, [postId], (err, result) => {
            if (err) reject(err)

            resolve(result)
        })
    }).then((result) => {
        return result
    }).catch((err) => {
        return false
    })


}
exports.getExplores = async function () {


    let query = `SELECT post.postId,post.postUrl,post.idusers,post.timestamp,post.caption,
    insta_media.mimetype,insta_media.url
     FROM post INNER JOIN insta_media ON post.postId=insta_media.postId  ORDER BY post.timestamp DESC`
    return new Promise((resolve, reject) => {
        mysqlConnection.query(query, (err, result) => {
            if (err) reject(false)
            resolve(result)
        })
    })
        .then((result) => result)
        .catch((err) => false)


}

exports.getUserPosts = async function (idusers) {

    let query = `SELECT post.postId,post.postUrl,post.idusers,post.timestamp,post.caption,
    insta_media.mimetype,insta_media.url
     FROM post INNER JOIN insta_media ON post.postId=insta_media.postId WHERE post.idusers=? ORDER BY post.timestamp DESC`
    return new Promise((resolve, reject) => {
        mysqlConnection.query(query, [idusers], (err, result) => {
            if (err) reject(false)
            resolve(result)
        })
    }).then((result) => result).catch((err) => false)


}

exports.savePost = async function (postId, idusers) {
    return new Promise((resolve, reject) => {
        //Check the post is already saved or not
        let timestamp = new Date().getTime()

        let query = `SELECT * FROM saved WHERE postId=? AND idusers=?`
        mysqlConnection.query(query, [postId, idusers], (err, result) => {
            if (err) reject(false)
            if (result.length > 0) {
                //Delete the post from saved post
                let query = `DELETE FROM saved WHERE postId=? AND idusers=?`
                mysqlConnection.query(query, [postId, idusers], (err, result) => {
                    if (err) reject(false)
                    resolve(false)
                })
                resolve(false)
            } else {
                query = `INSERT INTO saved (postId,idusers,timestamp) VALUES (?,?,?)`
                mysqlConnection.query(query, [postId, idusers, timestamp], (err, result) => {
                    if (err) reject(false)
                    resolve(true)
                })
            }
        })




    }).then((result) => result).catch((err) => false)
}

exports.isSavedPost = function (postId, idusers) {
    let query = `SELECT * FROM saved WHERE postId=? AND idusers=?`
    return new Promise((resolve, reject) => {
        mysqlConnection.query(query, [postId, idusers], (err, result) => {
            if (err) reject(false)
            resolve(result)
        })

    }).then((result) => result).catch((err) => false)
}
exports.getSavedPosts = function (idusers) {
    let query = `SELECT post.postId,post.postUrl,post.idusers,post.timestamp,post.caption,
    insta_media.mimetype,insta_media.url
     FROM post INNER JOIN insta_media ON post.postId=insta_media.postId INNER JOIN saved ON post.postId=saved.postId WHERE saved.idusers=? ORDER BY saved.timestamp DESC`
    return new Promise((resolve, reject) => {
        mysqlConnection.query(query, [idusers], (err, result) => {
            if (err) reject(false)
            resolve(result)
        })

    }).then((result) => result).catch((err) => false)

}
exports.getComments = function (postId) {

    let query = `SELECT comment.isModified,comment.comment_content,comment.parentId,comment.commentId,comment.comment_type,comment.idusers,comment.timestamp,users.username,users.profile
     FROM comment INNER JOIN users ON comment.idusers=users.idusers WHERE comment.postId=? ORDER BY comment.timestamp DESC`
    return new Promise((resolve, reject) => {
        mysqlConnection.query(query, [postId], (err, result) => {
            if (err) reject(false)
            console.log(err);
            resolve(result)
        })

    }).then((result) => result).catch((err) => false)



}

exports.saveVisited = function (idusers, visited_by) {

    //table name is visitor 
    // attribute are timestamp	visited_by	idusers
    console.log(idusers, visited_by);
    return new Promise((resolve, reject) => {
        let timestamp = new Date().getTime()
        let query = `INSERT INTO profilevisitor (visited_by,idusers,timestamp) VALUES (?,?,?)`
        mysqlConnection.query(query, [visited_by, idusers, timestamp], (err, result) => {
            console.log(result);
            if (err) reject(false)
            resolve(true)
        })

    }).then((result) => result).catch((err) => {
        console.log(err);
        return false
    })

}

exports.savePostViewer = function (idusers, url) {
    url = '/p/' + url
    return new Promise((resolve, reject) => {
        let timestamp = new Date().getTime()
        //timestamp	postId	idusers
        let query = `INSERT INTO postviewer (view_by,postUrl,timestamp) VALUES (?,?,?)`
        mysqlConnection.query(query, [idusers, url, timestamp], (err, result) => {
            if (err) reject(false)
            console.log(err);
            resolve(true)
        })


    }).then((result) => result).catch((err) => false)
}

function generateCode(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
exports.generateCode = generateCode;


exports.sendResetPasswordCode = function (email) {

    let code = generateCode(6)
    return new Promise((resolve, reject) => {
        //table name is passwordreset
        // column are email	code	timestamp ucode expiretimestamp
        let checkAlreadyEmailExist = `SELECT * FROM passwordreset WHERE email=?`
        var timestamp = new Date().getTime()
        mysqlConnection.query(checkAlreadyEmailExist, [email], (err, result) => {
            // console.log(err);
            if (err) reject(false)
            if (result.length > 0) {
                let ucode = md5(timestamp + email, 16)
                let query = `UPDATE passwordreset SET code=?,timestamp=?,ucode=? WHERE email=?`
                mysqlConnection.query(query, [code, timestamp, ucode, email], (err, result) => {
                    // console.log(err);
                    if (err) reject(false)
                    resolve({ code: code, ucode: ucode })
                })
            } else {
                let ucode = md5(timestamp + email, 16)

                let query = `INSERT INTO passwordreset (email,code,timestamp,ucode) VALUES (?,?,?,?)`
                mysqlConnection.query(query, [email, code, timestamp, ucode], (err, result) => {
                    // console.log(err);
                    if (err) reject(false)
                    resolve({ code: code, ucode: ucode })
                })
            }
        })

    }).then((result) => result).catch((err) => {
        console.log(err);
        false
    })




}
function verifyPUCode(ucode) {
    //passwordreset
    //pid email code timestamp ucode
    //Verify the ucode and check the ucode is expire or not 
    //console.log(ucode);
    let query = 'SELECT email,timestamp from passwordreset where ucode=?'
    return new Promise((resolve, reject) => {
        mysqlConnection.query(query, [ucode], (err, result) => {
            if (err) reject(false)
            resolve(result)
        })
    }).then((result) => {

        if (result === false) {
            return false
        }
        if (result.length > 0) {
            let row = result[0]
            let timestamp = new Date().getTime()
            let expire = parseInt(row.timestamp) + (1000 * 60 * 5)
            if (timestamp > expire) {
                return { message: 'Expired', status: 403 }
            }
            return { message: 'ok', status: 200 }
        } else {
            return { message: 'Invalid code', status: 403 }
        }

    })
        .catch((err) => {
            console.log(err);
            return false
        })
}
exports.verifyUCode = verifyPUCode;
exports.verifyUCode = function (code) {
    return verifyPUCode(code)
}

const insertPasswordChangeCode = function (email, code) {
    //email	passwordChangeCode	timestamp	old_password
    //table name is passwordchanger
    let timestamp = new Date().getTime()
    let query = `INSERT INTO passwordchanger (email,passwordChangeCode,timestamp) VALUES (?,?,?)`
    return new Promise((resolve, reject) => {
        mysqlConnection.query(query, [email, code, timestamp], (err, result) => {
            if (err) reject(false)
            resolve(true)
        })
    }).then((result) => result).catch((err) => false)
}
exports.insertPasswordChangeCode = insertPasswordChangeCode;


exports.verifyCode = function (code, ucode) {
    //Check the ucode is expire or not 
    return new Promise((resolve, reject) => {
        verifyPUCode(ucode).then((result1) => {
            if (result1 === false) {
                reject({
                    message: 'Something went W',
                    status: 403
                })
            } else {
                if (result1.status === 403) {
                    reject(result1)
                } else {
                    let query = `SELECT * FROM passwordreset WHERE code=? AND ucode=?`
                    mysqlConnection.query(query, [code, ucode], async (err, result) => {
                        if (err) reject({
                            message: 'Something went wrong',
                            status: 403
                        })
                        if (result.length > 0) {
                            let email = result[0].email
                            let newCode = generateCode(11)
                            let hashCode = md5(newCode, 32)
                            let inResult = await insertPasswordChangeCode(email, hashCode)
                            if (inResult === false) {
                                reject({
                                    message: 'Something went wrong',
                                    status: 403
                                })
                            } else {
                                resolve({
                                    message: 'ok',
                                    status: 200,
                                    passwordChangeCode: hashCode,

                                })
                            }
                        } else {
                            reject({
                                message: 'Invalid code',
                                status: 403
                            })
                        }
                    })
                }
            }
        }).catch((err) => {

            reject({
                message: 'Something went wrong',
                status: 403
            })
        })

    }).then((result) => {
        return result
    }).catch((err) => {

        return err
    })
}
exports.verifyPasswordChangerCode = function (code) {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM passwordchanger WHERE passwordChangeCode=? ORDER BY timestamp DESC LIMIT 1`
        mysqlConnection.query(query, [code], (err, result) => {
            if (err) reject(false)
            resolve(result)
        })
    }).then((result) => {
        return result
    }).catch((err) => {
        console.log(err);
        return false
    })
}

exports.getPostCount = function (idusers) {
    let query = `SELECT COUNT(*) as count FROM post WHERE idusers=?`
    return new Promise((resolve, reject) => {
        mysqlConnection.query(query, [idusers], (err, result) => {
            if (err) reject(false)
            resolve(result[0].count)
        })
    }).then((result) => {
        return result
    }).catch((err) => {
        return false
    })

}

const getPostDetails = function (postId, idusers) {
    let getThePost = `
    SELECT * FROM post INNER JOIN insta_media ON post.postId=insta_media.postId WHERE post.postId=? AND post.idusers=?;
    `
    return new Promise((resolve, reject) => {
        mysqlConnection.query(getThePost, [postId, idusers], (err, result) => {
            if (err) reject(false)
            resolve(result)
        })
    }).then((result) => result).catch((err) => false)
}
exports.getPostDetails = getPostDetails;

const insertDeletedPost = async function (postId, idusers) {
    let data = await getPostDetails(postId, idusers)
    if (data === false) {
        return
    }
    return new Promise((resolve, reject) => {
        mysqlConnection.beginTransaction((err) => {
            if (err) {
                console.log(err);
                mysqlConnection.rollback(function () {
                    reject(false)
                })
            } else {
                if (data.length > 0) {
                    let d = data[0]
                    //postId	postUrl	idusers		caption	
                    let query = `INSERT INTO deleted_post(postId,postUrl,idusers,timestamp,caption) 
                    VALUES(?,?,?,?,?)
                    `
                    let timestamp = new Date().getTime()
                    mysqlConnection.query(query, [d.postId, d.postUrl, d.idusers, timestamp, d.caption], (err, result) => {
                        if (err) {
                            console.log(err);
                            mysqlConnection.rollback(function () {
                                reject(false)
                            })

                        } else {
                            let postId = result.insertId

                            let success = 0
                            for (let index = 0; index < data.length; index++) {
                                //postId	mimeType	url
                                let query = `
                                INSERT INTO deleted_media(postId,mimeType,url) 
                                VALUES(?,?,?)
                                `
                                mysqlConnection.query(query, [postId, data[index].mimetype, data[index].url], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        mysqlConnection.rollback(function () {
                                            reject(false)
                                        })
                                    }
                                    success += 1

                                    if (data.length === success) {
                                        console.log("Commit");
                                        mysqlConnection.commit((err) => {
                                            console.log("Commit");
                                            if (err) {
                                                console.log(err);
                                                mysqlConnection.rollback(function (err) {
                                                    reject(false)
                                                })
                                            } else {
                                                resolve(true)
                                            }
                                        })
                                    }

                                })
                            }
                        }

                    })
                }
            }



        })



    }).then((result) => result).catch((err) => {
        console.log(err);
        return false
    })
}

exports.insertDeletedPost = insertDeletedPost
exports.deletePost = async function (postId, idusers) {

    let result = await insertDeletedPost(postId, idusers)
    console.log(result);
    if (result === false) {
        return false
    }
    return new Promise((resolve, reject) => {
        let deleteQ = `
       DELETE p,i FROM post p 
       INNER JOIN insta_media i ON p.postId=i.postId 
       where p.postId=? AND p.idusers=?
       `

        mysqlConnection.query(deleteQ, [postId, idusers], (err, result) => {
            if (err) reject(false)

            resolve(true)
        })

    }).then((result) => result).catch((err) => false)

}
