import React from "react";
import { Link } from "react-router-dom";
import HOST_URL from "../proxy";
import '../Styles/explorePeople.css';

class PeopleList extends React.Component {


    constructor(props) {
        super(props)
        this.state = {
            username: props.users.username,
            idusers: props.users.idusers,
            profilePic: props.users.profile,
            fullname: props.users.fullname,
            account_visiblity: props.users.account_visiblity,

        }

    }

    render() {
       
        return <>
            <div className="explore-people-main-container">
                <div className="people-list-item" >
                    <Link to={"/" + this.state.username} className="explore-people-users-info">
                        <div className="people-list-item-img">
                            <img src={HOST_URL + '/' + this.state.profilePic} alt={this.state.username}/>
                        </div>
                        <div className="people-list-item-name">
                            <h3>{this.state.username}</h3>
                        </div>
                    </Link>
                </div>
            </div>
        </>

    }


}



export default PeopleList;
