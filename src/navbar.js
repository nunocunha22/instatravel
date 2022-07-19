
import React from 'react';
import { Link } from 'react-router-dom';
import LoginAndSignup from './components/LoginAndSignUp';
import InstaMenu from './components/Menu';
import './Styles/navbar.css';


class NavBar extends React.Component {
  constructor(props) {
    super(props);
    //console.log(props);
    this.state = {
      isClickedProfile: false
    }
    this.handleClickProfile = this.handleClickProfile.bind(this);
    this.close = this.close.bind(this);
    this.addEventListener = this.addEventListener.bind(this);
  }

  addEventListener() {

    document.addEventListener('click', this.close);
  }


  handleClickProfile() {
    if (this.state.isClickedProfile) {
      this.setState({
        isClickedProfile: false
      })
      document.getElementsByClassName('sub-menu-profile')[0].style.display = 'none';
    } else {
      this.setState({
        isClickedProfile: true
      })
      document.getElementsByClassName('sub-menu-profile')[0].style.display = 'block';
    }

  }

  close() {
    if (this.state.isClickedProfile) {
      this.setState({
        isClickedProfile: false
      })
      document.getElementsByClassName('sub-menu-profile')[0].style.display = 'none';
    }
  }

  componentDidUpdate() {
    //console.log("Update");
  }



  render() {

    return <>
      <nav className="instaTravel-navbar-menu-container" onClick={this.close}>
        {/* Title */}
        <section className="title-section">
          <h1><Link to="/">InstaTravel</Link></h1>
        </section>

        {/* Menu */}
        {this.props.isAuth ? <InstaMenu close={this.close} handleClickProfile={this.handleClickProfile} /> : <LoginAndSignup />}


      </nav>

    </>
  }
}



export default NavBar;