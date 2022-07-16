import React from "react";
import {BrowserRouter,Route, Routes,Navigate } from "react-router-dom";
import ChangePassword from "./components/ChangePassword";
import EditProfile from "./components/EditProfile";
import SettingHelp from "./components/SettingHelp";
import SettingMenu from "./components/SettingMenu";
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
           <BrowserRouter>
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

           </BrowserRouter>
        </div>


        
        </>
    }




}


export default Settings