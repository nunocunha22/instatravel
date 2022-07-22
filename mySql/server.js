require('dotenv').config()
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const port = 8000
var register = require('./register')
var login = require('./login')
var searchuser = require('./searchuser')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser');
const multer = require('multer')
const helper = require('./helper')
const jwt = require('jsonwebtoken')
const { sendMail } = require('./sendMail')
const md5 = require('md5')


app.set('assets', path.join(__dirname, 'assets'));
app.use(express.static(path.join(__dirname, 'assets')));

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    express.urlencoded({
        extended: true
    })
)
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
})


app.use(cors({
    origin: "*",
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'],
    credentials: true,
    exposedHeaders: ['set-cookie']

}));

io.on('connection', (socket) => {
    socket.on('message', (receiverId) => {
        ////console.logreceiverId);
        ////console.log'message received');
        io.emit('replay', receiverId);
    })
})


const extension = (mimetype) => {
    switch (mimetype) {
        case 'image/jpeg':
            return '.jpg'
        case 'image/png':
            return '.png'
        case 'image/gif':
            return '.gif'
        case 'image/bmp':
            return '.bmp'
        case 'image/webp':
            return '.webp'
        case 'image/svg+xml':
            return '.svg'
        case 'image/tiff':
            return '.tiff'
        case 'image/x-icon':
            return '.ico'
        case 'image/x-ms-bmp':
            return '.bmp'
        case 'video/mp4':
            return '.mp4'
        case 'video/webm':
            return '.webm'
        case 'video/ogg':
            return '.ogg'
        case 'video/quicktime':
            return '.mov'
        case 'video/x-msvideo':
            return '.avi'
        case 'video/x-flv':
            return '.flv'
        case 'video/x-ms-wmv':
            return '.wmv'
        
        default:
            return ''
    }
}


var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, './assets/media/images/profile')
    },
    filename: function (req, file, cb) {
        let username = req.users.username

        cb(null, md5(username, 16) + extension(file.mimetype))
    }
})
var media = multer.diskStorage({
    destination: function (req, file, cb) {
        let mimeType = file.mimetype
        if (mimeType.includes('image')) {
            cb(null, './assets/media/images/postImages')
        } else if (mimeType.includes('video')) {
            cb(null, './assets/media/videos')
        }
    },
    filename: function (req, file, cb) {
        let username = req.users.username
        let timestamp = new Date().getTime()
        let filename = md5(username + timestamp) + extension(file.mimetype)
        filename = filename.replace(/\s/g, '')
        cb(null, filename)
    }
})

var upload = multer({ storage: storage }).single('profile')
var postUpload = multer({ storage: media })




app.get('/assets/media/images/postImages/:filename', (req, res) => {
    const filename = req.url.split('/').pop()
    res.sendFile(path.join(__dirname, 'assets/media/images/postImages', filename))
})
app.get('/assets/media/images/profile/:filename', (req, res) => {
    const filename = req.url.split('/').pop()
    res.sendFile(path.join(__dirname, '/assets/media/images/profile', filename))
})


app.get('/assets/media/videos/:filename', (req, res) => {
    const filename = req.url.split('/').pop()

    res.sendFile(path.join(__dirname, '/assets/media/videos', filename))
})

app.post('/accounts/emailsignup', async (req, res) => {
    let { email, fullname, username, pswd } = req.body
    email = email.trim()
    username = username.trim()
    username = username.toLowerCase()

    if (await register.isDuplicateEmail(email)) {
        return res.send({ status: 403, statusText: "Failed", message: "Email Already Exists", field: "email" })
    }
    if (await register.isDuplicateUserName(username)) {
        return res.send({ status: 403, statusText: "Failed", message: "Username Already Exists", field: "username" })
    }
    if (register.IsRestrictedUserName(username)) {
        return res.send({ status: 403, statusText: "Failed", message: "Username is restricted", field: "username" })
    }
    if (register.isUsernameHasSpecialCharacters(username)) {
        return res.send({ status: 403, statusText: "Failed", message: "Username has special characters", field: "username" })
    }
    if (register.containsSpaceInUserName(username)) {
        return res.send({ status: 403, statusText: "Failed", message: "Username contains space", field: "username" })
    }
    if (register.passwordStrength(pswd) < 3) {
        return res.send({ status: 403, statusText: "Failed", message: "Password is weak", field: "password" })
    }
    var result = await register.register(email, fullname, username, pswd)
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if (result === false) {
        return res.send({ status: 403, statusText: "Failed", message: "Registration Failed" })
    }

    res.send({
        status: 200,
        statusText: 'Success',
        message: 'Registration Successful',
        token: result.token,

    })
})

app.post('/accounts/email/resend', async (req, res) => {
    const { token } = req.body
    let emailVerificationResult = await register.checkEmailVerificationToken(token)
    if (emailVerificationResult === false) {
        console.log("Can't match the toke");
        return res.send({ status: 403, statusText: "Failed", message: "Failed to send email" })
    }

    let resendEmailVerificationCode = await register.resendEmailVerificationCode(emailVerificationResult)
    if (resendEmailVerificationCode === false) {
        return res.send({ status: 403, statusText: "Failed", message: "Failed to send email" })
    }
    res.send({ status: 200, statusText: "Success", message: "Email sent" })



})

app.post('/accounts/email/verify', async (req, res) => {
    const { token, code } = req.body
    let verify_code = await register.verifyCode(token, code)
    if (verify_code === false) {
        return res.send({ status: 403, statusText: "Failed", message: "Failed to verify" })
    }
    let update_verification = await register.updateVerification(verify_code)
    if (update_verification === false) {
        return res.send({ status: 403, statusText: "Failed", message: "Failed to verify" })
    }
    res.send({ status: 200, statusText: "Success", message: "Email verified" })
})


function generateAccessToken(idusers, username, useremail) {
    ////console.logprocess.env.ACCESS_TOKEN_SECRET);
    var token = jwt.sign({ idusers: idusers, username: username, useremail: useremail }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '48h' })
    return token
}

app.post('/login', async (req, res) => {

    const { email, password } = req.body
    var result = await login.login(email, password)
    if (result.length > 0) {
        let email = result[0].email
        if (result[0].verification === 0) {

            let token = await register.getEmailVerificationToken(email)
            console.log(token);
            if (token === undefined) {
                return res.send({ status: 403, statusText: "Failed", message: "Something went wrong" })
            }
            if (token === false) {
                return res.send({ status: 403, statusText: "Failed", message: "Something went wrong" })
            }
            let emailVerificationResult = await register.resendEmailVerificationCode(email)
            if (emailVerificationResult === false) {
                return res.send({ status: 403, statusText: "Failed", message: "Something went wrong" })
            }
            console.log(token);
            return res.send({
                status: 201, statusText: "Failed", message: "Email not verified",
                verifyEmail: 0,
                token: token,
            })
        }
        const token = generateAccessToken(result[0].idusers, result[0].username, result[0].useremail)
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        return res.send({
            status: 200,
            statusText: "OK",
            message: "Login Successful",
            token: token,
            verifyEmail: 1,
            username: result[0].username,

        })
        //Login
    } else {
        //Error
        return res.send({ status: 403, statusText: "Failed", message: "Please check your email and password" })

    }



})

function AuthenticationToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) {
        return res.send({ status: 403, statusText: "Failed", message: "Please Login" })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, users) => {
        if (err) {
            return res.send({ status: 403, statusText: "Failed", message: "Please Login" })
        }
        req.users = users
        next()
    })
}

app.post('/activity', AuthenticationToken, (req, res) => {

    return res.send("Activity")
})



app.get('/', AuthenticationToken, async (req, res) => {

    return res.send("Home")

})



app.get('/current_user_info', AuthenticationToken, async (req, res) => {
    const idusers = req.users.idusers
    const username = req.users.username

    if (idusers != null) {
        var result = await register.getUserInfo(idusers);
        ////console.logresult)
        if (result === false) {
            return res.send({ status: 403, statusText: "Failed", message: "Something went wrong" })

        } else if (result.length > 0) {
            return res.send({
                status: 200,
                statusText: "OK",
                email: result[0].email,
                fullname: result[0].fullname,
                website: result[0].website,
                user_type: result[0].user_type,
                verification: result[0].verification,
                profile: result[0].profile,
                gender: result[0].gender,
                description: result[0].description,
                date_of_birth: result[0].date_of_birth,
                account_status: result[0].account_status,
                account_visiblity: result[0].account_visiblity,
                username: username,
                idusers: idusers
            })
        } else {
            return res.send({ status: 403, statusText: "Failed", message: "Something went wrong" })

        }


    } else {
        res.send({
            status: 403,
            statusText: "Failed",
            message: "Please login",
            redirect: "/login"
        })
    }






})




app.post('/other_user_profile', async (req, res) => {
    const { username } = req.body
    var result = await register.getUserInfoByUsername(username)

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    if (result.length > 0) {
        res.status(200).send(result)
    }

    else
        res.send({ status: 403, message: "User not found" })
})
app.get('/get_user', async (req, res) => {
    const { idusers } = req.query
    var result = await register.getUserInfoByUserId(idusers)

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    if (result.length > 0) {
        res.status(200).send(result[0])
    }

    else
        res.send({ status: 403, message: "User not found" })
})



app.post('/logout', (req, res) => {
    return res.send({ status: 200, message: "Logged out" })
})


app.get('/search?:q', async (req, res) => {

    let q = req.query.q
    let result = await searchuser.search(q)

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.status(200).send(result)
})

app.get('/explore/people', AuthenticationToken, async (req, res) => {
    let limit = 250
    let offset = 1
    let idusers = req.users.idusers
    let result = await searchuser.explore(idusers, limit, offset)
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    return res.status(200).send(result)
})

app.post('/upload_profile', AuthenticationToken, async (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            ////console.log"Multer Error" + err);
            return res.status(500).json(err)
        } else if (err) {
            ////console.log" Error" + err);
            return res.status(500).json(err)
        }
        // ////console.logreq.file.path);
        var profileUrl = req.file.path.replace(/..\\public/g, "")

        register.updateProfile(req.users.idusers, profileUrl)

            .then(result => {
                if (result) {
                    return res.status(200).send({ status: 200, message: "Profile updated", url: profileUrl })
                } else {
                    return res.status(403).send({ status: 403, message: "Something went wrong" })
                }
            })



    })



})



app.post('/follow/', AuthenticationToken, async (req, res) => {
    let { followTo } = req.body
    let currentUserId = req.users.idusers
    if (currentUserId === undefined) {
        return res.status(403).send({ status: 403, message: "Please login" })
    }
    if (currentUserId === followTo) {
        return res.status(403).send({ status: 403, message: "You cannot follow yourself" })
    }
    let result = await register.followUser(currentUserId, followTo)
    return res.send(result)
})

app.get('/is_following?:idusers', AuthenticationToken, async (req, res) => {
    let { idusers } = req.query
    let currentUserId = req.users.idusers
    let result = await register.isFollowing(currentUserId, idusers)
    // ////console.logresult);
    return res.send({ status: 200, result: result, currentUserId: currentUserId })
})

app.get('/currentUser_follower_following', AuthenticationToken, async (req, res) => {
    let currentUserId = req.users.idusers

    if (currentUserId == undefined || currentUserId == NaN) {

        return res.status(403).send({ status: 403, message: "Please login" })
    }
    let followers = await helper.getFollowerCount(currentUserId)
    let following = await helper.getFollowingCount(currentUserId)
    let postCount = await helper.getPostCount(currentUserId)
    return res.status(200).send({ followers: followers, following: following, post: postCount })
})


app.post('/change_password', AuthenticationToken, async (req, res) => {

    let { oldPassword, newPassword, confirmPassword } = req.body
    ////console.logoldPassword, newPassword, confirmPassword);
    let currentUserId = req.users.idusers
    ////console.logcurrentUserId);
    if (currentUserId == undefined) {
        return res.send({ status: 403, message: "Please login" })
    }
    let result = await helper.changePassword(currentUserId, oldPassword, newPassword, confirmPassword)
    ////console.logresult);
    return res.send(result)


})

app.post('/create-post', AuthenticationToken, postUpload.array('files'), async (req, res) => {

    let uploadedFiles = req.files
    let currentUserId = req.users.idusers
    let { caption, tags } = req.body

    let username = req.users.username

    let result = await helper.postStatus(currentUserId, username, tags, uploadedFiles, caption)

    return res.send(result)


})

// Update User Information

app.post('/update_user_info', AuthenticationToken, async (req, res) => {
    const { account_visiblity, bio, date_of_birth, email, fullname, profile, username, website } = req.body
    let idusers = req.users.idusers

    const userInfo = {
        account_visiblity: account_visiblity,
        bio: bio,
        date_of_birth: date_of_birth,
        email: email,
        fullname: fullname,
        profile: profile,
        username: username,
        website: website
    }
    if (fullname === "") {
        return res.send({ status: 403, message: "Name field can't be empty" })
    }

    let result = await register.updateUserInfo(idusers, userInfo)

    return res.send(result)
})



app.post('/send_message_text', AuthenticationToken, async (req, res) => {
    let { receiverId, message, messageReference } = req.body
    let type = "text"
    let current_userId = req.users.idusers
    let timestamp = new Date().getTime()
    ////console.logtimestamp);
    if (current_userId === undefined) {
        return res.send({ status: 403, message: "Please login" })
    }
    let messageStructure = new MessageStructure(
        0,
        current_userId,
        receiverId,
        message,
        timestamp,
        type,
        0,
        messageReference,
        0, 0
    )
    try {
        let result = await chat.sendMessage(messageStructure)
        if (result === false) {
            return res.send({ status: 403, message: "Something went's wrong" })
        }
        res.send({ status: 200, message: "Message sent successfully" })
    } catch (error) {
        ////console.logerror);
        return res.send({ status: 403, message: "Something went's wrong" })
    }




})

app.post('/get_chat_messages', AuthenticationToken, async (req, res) => {
    let { receiverId } = req.body
    let current_userId = req.users.idusers
    if (current_userId === undefined) {
        return res.send({ status: 403, message: "Please login" })
    }

    let result = await chat.getChatMessages(current_userId, receiverId)

    if (result === false) {
        return res.send({ status: 403, message: "Something went's wrong" })
    }
    res.send({ messages: result, idusers: current_userId })
})
app.post('/get_current_user_id', AuthenticationToken, (req, res) => {
    let current_userId = req.users.idusers
    if (current_userId === undefined) {
        return res.send({ status: 403, message: "Please login" })
    }
    res.send({ status: 200, idusers: current_userId })
})

function checkAlreadyVisited(visited, postId) {
    for (let i = 0; i < visited.length; i++) {
        if (visited[i] === postId) {
            return true
        }
    }
    return false
}
function groupingPosts(posts) {
    let post = []
    let visited = []
    //Grouping the posts
    for (let i = 0; i < posts.length; i++) {
        let myobject = []
        // ////console.logresult[i].postId);
        if (!checkAlreadyVisited(visited, posts[i].postId)) {
            for (let index = 0; index < posts.length; index++) {


                if (posts[index].postId === posts[i].postId) {

                    myobject.push(posts[index])
                }

            }
            post.push(myobject)
            visited.push(posts[i].postId)
        }

    }
    return post
}


app.get('/posts', AuthenticationToken, async (req, res) => {
    let idusers = req.users.idusers
    let offset = req.query.offset
    let limit = req.query.limit
    let result = await helper.getPosts(idusers, offset, limit)
    let post = groupingPosts(result)
    res.send({ posts: post, idusers: idusers, status: 200, message: "Posts fetched successfully", reachMax: result.length === 0 ? true : false })
})

app.put('/like_post', AuthenticationToken, async (req, res) => {
    let { postId, idusers } = req.body
    let currentUserId = req.users.idusers

    let result = await helper.likePost(postId, idusers, currentUserId)
    ////console.logresult);
    if (result === false) {
        return res.send({ status: 403, message: "Something went's wrong" })
    }
    res.send({ status: 200, message: "Post liked successfully" })
})


app.post('/comment_post', AuthenticationToken, async (req, res) => {
    let { postId, comment, commentParentId } = req.body

    let currentUserId = req.users.idusers
    let commentType = "text"
    let result = await helper.commentPost(postId, comment, currentUserId, commentParentId, commentType)
    if (result === false) {
        return res.send({ status: 403, message: "Something went's wrong" })
    }
    res.send({ status: 200, message: "Comment posted successfully" })
})

app.get('/get_comment_countAndCheck_user_like', AuthenticationToken, async (req, res) => {
    let { postId } = req.query
    let currentUserId = req.users.idusers
    let likes = await helper.checkLike(postId, currentUserId)
    let result = await helper.getCommentCount(postId)

    let isSavedResult = await helper.isSavedPost(postId, currentUserId)
    if (isSavedResult === false) {
        res.send({ status: 403, message: 'fail' })
    }
    if (result === false || likes === false) {
        return res.send({ status: 403, message: "Something went's wrong" })
    }
    res.send({ status: 200, message: "Likes fetched successfully", isLike: likes.length > 0 ? true : false, commentCount: result[0].count, isSaved: isSavedResult.length > 0 ? true : false })
})
app.get('/analyze_post', async (req, res) => {
    let { postId } = req.query
    let like_result = await helper.getLikeCount(postId)
    let comment_result = await helper.getCommentCount(postId)
    if (like_result === false || comment_result === false) {
        return res.send({ status: 403, message: "Something went's wrong" })
    }
    res.send({ status: 200, message: "Post analyzed successfully", likeCount: like_result[0].count, commentCount: comment_result[0].count })
})



app.get('/tags', async (req, res) => {
    let { tag } = req.query
    let result = await helper.getPostByTag(tag)
    if (result === false) {
        res.send({ status: 403, message: "No posts found with this tag " + tag })
        res.end()
        return
    }
    let post = groupingPosts(result)
    if (post.length > 0) {
        res.send({ status: 200, posts: post })
        res.end()
        return
    } else {
        res.send({ status: 403, message: "No posts found" })
        res.end()
        return
    }

})
app.get('/p/', async (req, res) => {
    let { postUrl } = req.query

    let result = await helper.getPostByUrl(postUrl)
    if (result === false) {
        return res.send({ status: 403, message: "No posts found with this id " + postUrl })
    }
    let post = groupingPosts(result)
    res.send({ status: 200, post: post })
})

app.get('/get_more_post', async (req, res) => {
    let { postId, idusers } = req.query
    let result = await helper.getMorePost(postId, idusers)
    if (result === false) {
        return res.send({ status: 403, message: "Something went's wrong" })
    }
    let post = groupingPosts(result)
    res.send({ status: 200, posts: post })
})


app.get('/explore', AuthenticationToken, async (req, res) => {

    //Find out the users behaviour 
    const idusers = req.users.idusers

    const result = await helper.getExplores()
    if (result === false) {
        res.send({ status: 403, message: "Something went's wrong" })
    }
    let explore = groupingPosts(result)
    res.send({ status: 200, explores: explore })





})

app.get('/suggestions', AuthenticationToken, async (req, res) => {

    //Find out the users behaviour 
    const idusers = req.users.idusers

    const suggestions = await helper.getSuggestions(idusers)
    if (suggestions === false) {
        res.send({ status: 403, message: "Something went's wrong" })
    }

    res.send({ status: 200, suggestions: suggestions.suggestedUserInfos, followers: suggestions.followers })

})
app.get('/count_message_request', AuthenticationToken, async (req, res) => {

    const idusers = req.users.idusers


    let result = await chat.getMessageRequestCount(idusers)
    if (result === false) {
        res.send({ status: 403, message: "Something went's wrong" })
    }
    console.log(result);

    res.send({ status: 200, message: "Fetch Success", count: result[0].count })

})
app.get('/get_all_message_request', AuthenticationToken, async (req, res) => {

    let idusers = req.users.idusers

    let result = await chat.getAllMessageRequests(idusers)
    if (result === false) {
        res.send({ status: 403, message: "Something went's wrong" })
    }
    res.send({
        status: 200,
        message: 'success',
        requests: result
    })






})

app.get('/accept_chatrequest', AuthenticationToken, async (req, res) => {
    let { id, cuid } = req.query
    let idusers = req.users.idusers


    let result = await chat.acceptChatRequest(id, cuid, 1, idusers)

    if (result === false) {
        res.send({ status: 403, message: 'fail' })
    }
    res.send({ status: 200, message: 'success' })
})


app.get('/ignore_chat', AuthenticationToken, async (req, res) => {
    let { cuid } = req.query
    let idusers = req.users.idusers
    let result = chat.ignoreChat(cuid, idusers, 1, 0)
    if (result === false) {
        res.send({ status: 403, message: 'fail' })
    }
    res.send({ status: 200, message: 'success' })
})

app.get('/currentuser_posts', AuthenticationToken, async (req, res) => {
    let idusers = req.users.idusers
    let result = await helper.getUserPosts(idusers)
    if (result === false) {
        res.status(403).send({ status: 403, message: 'fail' })
    }
    let post = groupingPosts(result)
    res.send({ status: 200, message: 'success', posts: post })
})
app.get('/otheruser_posts', async (req, res) => {
    let { idusers } = req.query

    //Check the users is public or private 
    let userInfo = await register.getUserInfo(idusers)
    if (userInfo === false) {
        res.send({ status: 403, message: 'fail' })
    }

    if (userInfo.length === 0) {
        res.status(403).send({ status: 403, message: "User not found" })
    }
    let account_visiblity = userInfo[0].account_visiblity
    if (account_visiblity.toLowerCase() === 'private') {
        res.status(403).send({ status: 403, message: 'Private account' })
        res.end()
    } else {
        //Normal flow
        let result = await helper.getUserPosts(idusers)
        if (result === false) {
            res.status(403).send({ status: 403, message: 'fail' })
        }
        let post = groupingPosts(result)
        res.send({ status: 200, message: 'success', posts: post })
    }

})

app.get('/login_user_posts', AuthenticationToken, async (req, res) => {
    let { idusers } = req.query
    let cuserId = req.users.idusers
    //Check the users is public or private 
    let userInfo = await register.getUserInfo(idusers)
    if (userInfo.length === 0) {
        res.send({ status: 403, message: 'fail' })
        res.end()
        return
    }
    let account_visiblity = userInfo[0].account_visiblity
    if (account_visiblity.toLowerCase() === 'private') {
        //check the users is following the current users or not
        let isFollowing = await helper.isFollowing(idusers, cuserId)
        if (isFollowing === false) {
            res.send({ status: 403, message: 'Private Account' })
            res.end()
            return
        } else {
            let result = await helper.getUserPosts(idusers)
            if (result === false) {
                res.status(403).send({ status: 403, message: 'fail' })
                res.end()
            }
            let post = groupingPosts(result)

            res.send({ status: 200, message: 'success', posts: post })
            res.end()
            return

        }


    } else {
        //Normal flow
        let result = await helper.getUserPosts(idusers)
        if (result === false) {
            res.status(403).send({ status: 403, message: 'fail' })
            res.end()
            return
        }
        let post = groupingPosts(result)
        res.send({ status: 200, message: 'success', posts: post })
        res.end()
        return
    }



})

app.post('/save_post', AuthenticationToken, async (req, res) => {
    let { postId } = req.body

    let idusers = req.users.idusers
    let result = await helper.savePost(postId, idusers)
    if (result === false) {
        res.status(403).send({ status: 403, message: 'fail' })
    }
    res.send({ status: 200, message: 'success' })

})
app.get('/get_saved_posts', AuthenticationToken, async (req, res) => {
    let idusers = req.users.idusers
    let result = await helper.getSavedPosts(idusers)
    if (result === false) {
        res.status(403).send({ status: 403, message: 'fail' })
    }
    let post = groupingPosts(result)
    res.send({ status: 200, message: 'success', posts: post })
})
app.get('/get_comments', AuthenticationToken, async (req, res) => {
    let { postId } = req.query
    let result = await helper.getComments(postId)
    if (result === false) {
        res.status(403).send({ status: 403, message: 'fail' })
    }
    res.send({ status: 200, message: 'success', comments: result })
})

app.get('/sendMail', (req, res) => {
    let email = sendMail("computerstha12@gmail.com", "test", "<h1>test<h1>")
    res.send(email)
})

app.post('/visited_by_someone', AuthenticationToken, async (req, res) => {
    let { idusers } = req.body
    let currentUserId = req.users.idusers
    let result = await helper.saveVisited(idusers, currentUserId)
    if (result === false) {
        res.send({ status: 403, message: 'fail' })
        res.end()
    }
    res.send({ status: 200, message: 'success' })
    res.end()
})
app.post('/visited_by_someone_notlogin', async (req, res) => {
    let { idusers } = req.body
    let result = await helper.saveVisited(idusers, null)
    if (result === false) {
        res.send({ status: 403, message: 'fail' })
        res.end()
    }
    res.send({ status: 200, message: 'success' })
    res.end()
})

app.post('/postviewer', AuthenticationToken, async (req, res) => {
    let { postUrl } = req.body
    let idusers = req.users.idusers
    let result = await helper.savePostViewer(idusers, postUrl)
    if (result === false) {
        res.send({ status: 403, message: 'fail' })
        res.end()
    }
    res.send({ status: 200, message: 'success' })
    res.end()
})
app.post('/postviewer_unknown', async (req, res) => {
    let { postUrl } = req.body
    let result = await helper.savePostViewer(null, postUrl)
    if (result === false) {
        res.send({ status: 403, message: 'fail' })
        res.end()
    }
    res.send({ status: 200, message: 'success' })
    res.end()
})

app.post('/send_reset_password_code', async (req, res) => {

    let { email } = req.body
    let checkUser = await register.checkUser(email)
    if (checkUser) {
        let result = await helper.sendResetPasswordCode(email)
        if (result === false) {
            res.send({ status: 403, message: 'fail' })
            res.end()
        } else {
            let code = result.code
            sendMail(email, "Reset Password Code", "<h1>Your reset password code is <span style={'background:red;'}>" + code + "</span> <h1>")
                .then((sres) => {

                    if (sres !== null) {

                        console.log(result);
                        res.send({ status: 200, message: 'Reset email send', ucode: result.ucode })
                        res.end()
                    } else {
                        res.send({ status: 403, message: 'Failed to send email' })
                        res.end()
                    }

                })

        }

    } else {
        res.send({ status: 403, message: 'User not found' })
        res.end()
    }


})

app.get('/ucode_checker', async (req, res) => {

    let { ucode } = req.query
    let result = await helper.verifyUCode(ucode)
    if (result === false) {
        res.status(403).send({ message: 'Failed' })
        res.end()
    }
    // console.log(result);
    res.status(200).send({
        message: result.message, status: result.status
    })

})
app.post('/verify_code', async (req, res) => {
    let { code, ucode } = req.body
    let result = await helper.verifyCode(code, ucode)
    res.send(result)

})

app.post('/create_new_password', async (req, res) => {
    let { pcode, password, confirmPassword } = req.body
    let verifyCode = await helper.verifyPasswordChangerCode(pcode)
    if (verifyCode === false) {
        res.send({ status: 403, message: 'Failed' })
        res.end()
        return
    }
    if (password !== confirmPassword) {
        res.send({ status: 403, message: 'Password not matched' })
        res.end()
        return
    }
    let timestamp = new Date().getTime()
    let expiretimestamp = verifyCode[0].timestamp + (1000 * 60 * 10)
    if (expiretimestamp < timestamp) {
        res.send({ status: 403, message: 'Expired code used' })
        res.end()
        return
    }
    if (register.passwordStrength(password) < 3) {
        res.send({ status: 403, message: 'Password is weak\nPassword should be at least 6 characters in length and should include at least one upper case letter, one number, and one special character' })
        res.end()
        return
    }
    let email = verifyCode[0].email
    let result = await register.create_new_password(email, password, pcode)
    if (result === false) {
        res.send({ status: 403, message: 'Failed' })
        res.end()
        return
    } else {
        res.send({ status: 200, message: 'Password changed' })
        res.end()
        return
    }


})

app.post('/remove_follower', AuthenticationToken, async (req, res) => {
    let { followerId } = req.body
    let currentUserId = req.users.idusers
    let result = await helper.removeFollower(followerId, currentUserId)
    if (result === false) {
        res.status(403).send({ status: 403, message: 'fail' })
        res.end()
        return
    }
    res.send({ status: 200, message: 'success' })
    res.end()
    return
})
app.delete('/delete/post/', AuthenticationToken, async (req, res) => {
    let { postId } = req.body

    let idusers = req.users.idusers
    let result = await helper.deletePost(postId, idusers)
    return res.send({
        status: result ? "Success" : "Fail",
        statusCode: result ? 200 : 403
    })

})

http.listen(port, () => {
    ////console.log'server started at port ' + port)
})








