import axios from "axios";
import Cookies from "js-cookie";
import React from "react";

import {
    BrowserRouter,
    Route,
    Link,
    Routes
} from "react-router-dom";
import DashboardPosts from "./components/DashboardPost";
import UserNotLogin from "./notLogin";
import HOST_URL from "./proxy";

class OtherUserProfile extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            message: "",
            isLoading: true,
            qusername: this.props.match.params.username,
            posts: 0,           
            idusers: 0,
            username: "",
            fullname: "",
            user_type: "",
            profile: "",
            description: "",
            website: "",
            date_of_birth: 0,
            account_status: '',
            account_visiblity: '',
            page_not_found: false,

        }
    }

    componentDidMount() {
        document.getElementsByTagName("title")[0].innerHTML = this.state.qusername
        axios.post(HOST_URL + '/other_user_profile', {
            username: this.state.qusername
        }).then(result => {
            let res = result.data
            console.log(res);
            if (result.status === 301) {
                window.location.href = res.redirect
            }
            else if (res.status == 403) {
                this.setState({
                    page_not_found: true
                })
            } else {
                this.setState({
                    idusers: res[0].idusers,
                    username: res[0].username,
                    fullname: res[0].fullname,
                    user_type: res[0].user_type,
                    profile: res[0].profile,
                    website: res[0].website,
                    description: res[0].description,
                    date_of_birth: res[0].date_of_birth,
                    account_status: res[0].account_status,
                    account_visiblity: res[0].account_visiblity,
                    isLoading: false
                })
            }
        }).catch(err => {
            console.log(err);
        })

        setTimeout(() => {

            if (Cookies.get('token') !== undefined) {
                axios.post(HOST_URL + '/visited_by_someone', {
                    idusers: this.state.idusers,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + Cookies.get('token')

                    }
                }).then(result => {
                    if (result.status === 200) {
                        //
                    }
                }).catch(err => {
                    console.log(err);
                })
            } else {
                axios.post(HOST_URL + '/visited_by_someone_notlogin', {
                    idusers: this.state.idusers,
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(result => {
                    if (result.status === 200) {
                        //
                    }
                }).catch(err => {
                    console.log(err);
                })
            }
        }, 30000)
    }


    render() {

        let savedUrl = "/" + this.state.username + "/__saved__";
        let taggedUrl = "/" + this.state.username + "/__tagged__";
        let postsUrl = "/" + this.state.username;
        if (this.state.page_not_found) {
            return <>
                <h1>Page not found {this.state.qusername}</h1>
            </>
        }
        let style = {
            link: {
                color: '#000',
                textDecoration: 'none'
            }
        }
        return <>
            <UserNotLogin />
            <div className="dashboard">
                {/* User Information Section */}
                <div className="main-container-users-information">

                    <section className="profile-section">
                        <img draggable={false} src={HOST_URL + "/" + this.state.profile} className="current-users-profile" />
                    </section>

                    <section className="users-information-section">
                        {/*  */}
                        <div className="username-edit-setting">
                            <h2>{this.state.username}</h2>
                            
                        </div>
                        
                        <div className="users-fullname-bio-website-field">
                            <h3>{this.state.fullname}</h3>
                            <div>{this.state.description}</div>
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

                        <div className="current-users-post dashboard-sub-menu" >
                            <Link to={postsUrl} className="sub-menu-item"><i className="material-icons" onSelect={this.handleSelected}>person</i><span>POSTS</span></Link>
                        </div>

                        <div className="current-users-tagged dashboard-sub-menu"  >
                            <Link to={taggedUrl} className="sub-menu-item" onSelect={this.handleSelected}><i className="material-icons">portrait</i><span>TAGGED</span></Link>
                        </div>

                    </div>

                    {/* End Dashboard Menu Section */}

                    {/* Another Section */}
                    <div className="main-container-dashboard-data">

                        <Routes>
                            <Route exact path={postsUrl}>
                                <DashboardPosts idusers={this.state.idusers} />
                            </Route>
                            <Route exact path={taggedUrl}>
                                <h1>Tagged</h1>

                            </Route>
                        </Routes>


                    </div>

                </BrowserRouter>

                {/*End Section  */}

            </div>
        </>
    }



}


export default OtherUserProfile;