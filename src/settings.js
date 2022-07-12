import React from "react";
import {BrowserRouter as Router,Route, Routes,Navigate } from "react-router-dom";
import ChangePassword from "./Components/ChangePassword";
import EditProfile from "./Components/EditProfile";
import SettingHelp from "./Components/SettingHelp";
import SettingMenu from "./Components/SettingMenu";
import './Styles/settings.css';

class Settings extends React.Component{

    constructor(props){
        super(props)

    }
    render(){  
        if(!this.props.isAuth){
        return <Navigate to="/login" />
             }

        return <>
        
        <div className="settings-container">
           <Router>
           <section className="settings-menu-section">
                <SettingMenu/>
            </section>

            <section className="settings-content-section">
                <Routes>
                    <Route exact path="/accounts/edit" component={EditProfile}/>
                    <Route exact path="/accounts/password/change" component={ChangePassword}/>
                    <Route exact path="/settings/help" component={SettingHelp}/>
                </Routes>
            </section>

           </Router>
        </div>


        
        </>
    }




}


export default Settings