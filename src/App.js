import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
      <BrowserRouter>
        <div>
          <Routes>

            <Route exact path="/accounts/emailsignup/" element={<EmailSignUp isAuth={isAuth} />}/>

{/*Login & Home*/}
            <Route exact path="/login" element={<Login isAuth={isAuth} />}/>
            <Route exact path="/" element={<Home isAuth={isAuth} />} >
            <Route path="/" element= {{navbar}}/>
            </Route>
              
{/*Settings Edit*/}  
            <Route exact path="/accounts/edit/" element={<Settings isAuth={isAuth} />}  >
            <Route exact path="/accounts/edit/" element={{navbar}}/>
            </Route> 

{/*Settings Pass Change*/}            
            <Route exact path="/accounts/password/change" element={<Settings isAuth={isAuth} />} >
            <Route exact path="/accounts/password/change" element={{navbar}}/>
            </Route>

{/*Settings Help*/} 
            <Route exact path="/settings/help" element={<Settings isAuth={isAuth} /> } >
             <Route exact path="/settings/help" element={{navbar}}/>              
            </Route>

{/*Home*/} 
            <Route exact path="/home" element= {<Home />}>
            <Route exact path="/home" element= { {navbar}}/>
             </Route>
                            
{/*Create*/}   
            <Route exact path="/create" element={<Create />}>  
            <Route exact path="/create" element={{navbar}}/>
            </Route>              

{/*Create Post*/}
            <Route exact path="/create/__post__" element={ <Create />}>
            <Route exact path="/create/__post__" element={{navbar}}/>
            </Route> 
             
{/*Create Story*/}        
            <Route exact path="/create/__story__" element ={<Create />}>
            <Route exact path="/create/__story__" element ={{navbar}}/>
            </Route>   
              
{/*PostViewer*/}          
            <Route exact path={'/p/:url'} render={(props) => <>{navbar}<PostViewer {...props} /></>} />
            <Route exact path={"/" + username + "/"} element={<Dashbaord  />}>
            <Route exact path={"/" + username + "/"} element={{navbar}}/>
            </Route>

            <Route exact path={"/" + username + "/__saved__"} element={ <Dashbaord  />}>
            <Route exact path={"/" + username + "/__saved__"} element={{navbar}}/>
            </Route>         
          
            <Route exact path={'/accounts/verify/email/'} element= { <EmailVerification />}>
            </Route>

            <Route exact path="/explore/people/" element={<ExplorePeople isAuth={isAuth} />}>
            <Route exact path="/explore/people/" element={{navbar}}/>
             </Route> 
              
            
            <Route exact path="/accounts/password/reset" component={ResetPassword} />
            <Route exact path="/resetpassword/verify/" render={(props) => <> <VerifyCode type="resetpassword_verify" {...props} /></>} />
            <Route exact path="/resetpassword/verify/:ucode" render={(props) => <> <VerifyCode type="resetpassword_verify" {...props} /></>} />
            <Route exact path={"/create/new/password/:pcode"} render={(props) => <> <CreateNewPassword type="create_new_password" {...props} /></>} />
            <Route path="/:username" render={(props) => <>{navbar} <OtherUserProfile isAuth={isAuth} {...props} /></>} />
            <Route path="/:username/__save__" render={(props) => <>{navbar} <OtherUserProfile isAuth={isAuth} {...props} /></>} />
            
          </Routes>
        </div>
      </BrowserRouter>


    </>
  );



}


export default App;
