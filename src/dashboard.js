import React from "react";
import { Link, NavLink } from "react-router-dom";
import './Styles/dashboard.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import HOST_URL from "./proxy";
import Cookies from 'js-cookie'
import baseUrl from './proxy'
import DashboardPosts from "./components/DashboardPost";



class Dashbaord extends React.Component {


    constructor(props) {
        super(props);

        let message = {
            title: "",
            message: "Update profile successfully",
            status: true,
            showPoupView: props.isShowPopupView,
            toggle: () => { }
        }
        let profile = localStorage.getItem('currentuserprofile');
        console.log(profile);


        this.state = {
            selected: 0,
            profileurl: profile !== undefined ? profile : "https://upload.wikimedia.org/wikipedia/commons/3/3c/IMG_logo_%282017%29.svg",
            userId: 0,
            username: "insta_user",
            fullname: "insta_user",
            bio: "",
            website: "",
            posts: 0,
            visiblity: "public",
            hasErrorOnFetchInfo: false,
            updateProfile: false,
            message: message

        }
    }

    componentDidMount() {

        axios.get(HOST_URL + '/current_user_info',
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Cookies.get('token')
                }
            }

        ).then(result => {

            if (result.status === 200) {
                let data = result.data
                localStorage.setItem('username', data.username);

                this.setState({
                    profileurl: data.profile,
                    username: data.username,
                    fullname: data.fullname,
                    bio: data.description,
                    visiblity: data.account_visibility,
                    userId: data.userId,
                    website: data.website,

                })
                localStorage.setItem('currentuserprofile', this.state.profileurl);

                document.getElementsByTagName("title")[0].innerHTML = this.state.fullname + "- " + this.state.username;

            } else {
                this.setState({
                    hasErrorOnFetchInfo: true
                })
            }

        }).catch(err => {
            document.getElementsByTagName("title")[0].innerHTML = this.state.fullname + "- " + this.state.username;
        })
        axios.get(HOST_URL + '/currentUser_follower_following', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + Cookies.get('token')
            }
        }).then(result => {
            if (result.status === 200) {
                let data = result.data
                console.log(data);
                this.setState({
                    posts: data.post
                   
                })
            } else {
                this.setState({
                    hasErrorOnFetchInfo: true
                })
            }
        }).catch(err => {
            console.log(err);
        })
    }

    handleClickMenu = (e) => {
    }
    handleFileSelection = (e) => {
        e.preventDefault();
        let files = e.target.files;
        this.setState({
            updateProfile: false
        })
        if (files.length > 0) {
            e.preventDefault();
            this.uploadProfile(files[0]);
        }


    }
    async uploadProfile(file) {
        let formData = new FormData();
        formData.append('profile', file);

        let result = await axios.post(HOST_URL + '/upload_profile', formData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + Cookies.get('token')
            }
        });
        if (result.status === 200) {
            console.log(result.data);
            this.setState({
                updateProfile: true,
                profileurl: result.data.url,

                message: {
                    title: "Success",
                    message: "Update profile successfully",
                    status: true
                }
            })
        } else {

        }



    }
    handleClick = () => {

    }
    handleClosePopup = () => {
        window.location.href = "/"+this.state.username;
    }

    render() {
        let savedUrl = "/" + this.state.username + "/__saved__";
        let taggedUrl = "/" + this.state.username + "/__tagged__";
        let postsUrl = "/" + this.state.username;



        if (this.state.hasErrorOnFetchInfo) {
            return <>
                <h1>Something went wrong</h1>
            </>
        }
        let style={
            link:{
                color:'#000',
                textDecoration:'none'
            }
        }

        return <>

            <BrowserRouter>
                <Routes>
                    <Route exact path={'accounts/edit'}>
                    </Route>
                </Routes>


                <div className="dashboard">
                    {/* User Information Section */}

                    <div className="main-container-users-information">

                        <section className="profile-section">
                            <img src={baseUrl + "/" + this.state.profileurl} alt="" className="current-users-profile" />
                        </section>

                        <section className="users-information-section">
                            {/*  */}
                            <div className="username-edit-setting">
                                <h2>{this.state.username}</h2>
                                <label htmlFor="profile-pic" className="edit-profile-btn">Edit Profile</label>
                                {/* <form method="POST" name="profile" id="profile" name="profile"> */}
                                <input type="file" hidden name="profile-pic" multiple={false} accept="image/*" id="profile-pic" onChange={this.handleFileSelection} />
                                {/* </form> */}

                                <a href={'/accounts/edit'}> <i className="material-icons">settings</i></a>

                            </div>
                            
                            <div className="users-fullname-bio-website-field">
                                <h3>{this.state.fullname}</h3>
                                <span>{this.state.bio}</span>
                                <a href={"https://" + this.state.website} target="_blank">{this.state.website}</a>
                            </div>

                        </section>



                    </div>
                    {/* End Section */}
                    {/* Divider */}
                    <hr className="dashboard-userinfo-divider" />
                    {/* End Divider */}
                    {/* Dashboard Menu Section */}


                    <BrowserRouter>


                        <div className="main-container-dashboard-menu">

                            <div className="current-users-post dashboard-sub-menu" onClick={this.handleClickMenu(0)} >
                                <Link to={postsUrl} className="sub-menu-item"><i className="material-icons" onSelect={this.handleSelected}>person</i><span>POSTS</span></Link>
                            </div>
                            <div className="current-users-saved dashboard-sub-menu" onClick={this.handleClickMenu(1)}  >
                                <Link to={savedUrl} className="sub-menu-item" onSelect={this.handleSelected}><i className="material-icons">turned_in_not</i><span>SAVED</span></Link>
                            </div>
                            <div className="current-users-tagged dashboard-sub-menu" onClick={this.handleClickMenu(2)} >
                                <Link to={taggedUrl} className="sub-menu-item" onSelect={this.handleSelected}><i className="material-icons">portrait</i><span>TAGGED</span></Link>
                            </div>

                        </div>

                        {/* End Dashboard Menu Section */}

                        {/* Another Section */}
                        <div className="main-container-dashboard-data">

                            <Routes>
                                <Route exact path={postsUrl}>
                                    <DashboardPosts calledFrom="dashboard_post" />

                                </Route>
                                <Route exact path={savedUrl}>
                                    <DashboardPosts calledFrom="dashboard_saved" />
                                </Route>
                                <Route exact path={taggedUrl}>
                                    <h1>Tagged</h1>

                                </Route>

                            </Routes>


                        </div>

                    </BrowserRouter>

                    {/*End Section  */}

                </div>



            </BrowserRouter>
        </>
    }


}

export default (Dashbaord);