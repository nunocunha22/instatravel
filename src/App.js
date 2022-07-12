import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './home';
import NavBar from './navbar';
import Dashbaord from './dashboard';
import Login from './login';
import OtherUserProfile from './otherUserProfile';
import EmailSignUp from './register';
import ResetPassword from './resetPass';
import Loading from './loading';
import ExplorePeople from './explorePeople';
import Create from './createPost'
import Settings from './settings';
import Cookies from 'js-cookie';
import PostViewer from './postViewer';
import VerifyCode from './verifyCode';
import CreateNewPassword from './createNewPass';
import EmailVerification from './emailVerify';


function App(props) {
  const isLoading = false;
  let isAuth = false;


  const token = Cookies.get('token');
  if (token != undefined || token != null) {
    isAuth = true;
  }





  if (isLoading) {
    return <Loading />
  }
  let username = localStorage.getItem('username');

  let navbar = <NavBar isAuth={isAuth} />

  return (
    <>
      <Router>
        <div>
          <Routes>

            <Route exact path="/accounts/emailsignup/">
              <EmailSignUp isAuth={isAuth} />
            </Route>

            <Route exact path="/login">
              <Login isAuth={isAuth} />
            </Route>
            <Route exact path="/"  >
              {navbar}
              <Home isAuth={isAuth} />
              
            </Route>
            <Route exact path="/accounts/edit/"  >
              {navbar}
              <Settings isAuth={isAuth} />
           
            </Route>
            <Route exact path="/accounts/password/change"  >
              {navbar}
              <Settings isAuth={isAuth} />
            </Route>
            <Route exact path="/settings/help" >
              {navbar}
              <Settings isAuth={isAuth} />
            </Route>

            <Route exact path="/home">
              {navbar}
              <Home />
              
            </Route>
        
            <Route exact path="/create">
              {navbar}
              <Create />
              
            </Route>
            <Route exact path="/create/__post__">
              {navbar}
              <Create />
            </Route>
            <Route exact path="/create/__story__">
              {navbar}
              <Create />
            </Route>
            <Route exact path={'/p/:url'} render={(props) => <>{navbar}<PostViewer {...props} /></>} />
            <Route exact path={"/" + username + "/"} >
              {navbar}
              <Dashbaord  />
              
            </Route>
            <Route exact path={"/" + username + "/__saved__"}>
              {navbar}
              <Dashbaord  />
              
            </Route>         
          
            <Route exact path={'/accounts/verify/email/'}>
              <EmailVerification />
            </Route>

            <Route exact path="/explore/people/">
              {navbar}
              <ExplorePeople isAuth={isAuth} />
            </Route>
            <Route exact path="/accounts/password/reset" component={ResetPassword} />
            <Route exact path="/resetpassword/verify/" render={(props) => <> <VerifyCode type="resetpassword_verify" {...props} /></>} />
            <Route exact path="/resetpassword/verify/:ucode" render={(props) => <> <VerifyCode type="resetpassword_verify" {...props} /></>} />
            <Route exact path={"/create/new/password/:pcode"} render={(props) => <> <CreateNewPassword type="create_new_password" {...props} /></>} />
            <Route path="/:username" render={(props) => <>{navbar} <OtherUserProfile isAuth={isAuth} {...props} /></>} />
            <Route path="/:username/__save__" render={(props) => <>{navbar} <OtherUserProfile isAuth={isAuth} {...props} /></>} />
            
          </Routes>
        </div>
      </Router>


    </>
  );



}


export default App;
