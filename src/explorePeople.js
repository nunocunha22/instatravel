import axios from "axios";
import React from "react";
import { Navigate } from "react-router-dom";
import PeopleList from "./components/PeopleList";
import HOST_URL from "./proxy";
import Cookies from "js-cookie";
function FooterRender(params) {
    return <>
        <div className="footer-container">
            {params.isFooterLoading ? <div className="footer-loading">

                <h1>Loading...</h1>

            </div> : null}
        </div>
    </>
}
class ExplorePeople extends React.Component {

    constructor(props) {
        super(props)
        this.status=0
        this.state = {
            exploreResult: [],
            isLoading: true,
            isFooterLoading: false,
            status:0,
            reachLimit:false
        }
    }
  


    async getExplorePeople() {
        
        let url =HOST_URL+ '/explore/people';

        axios.get(url,{
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer '+Cookies.get('token')
            }
        }).then(res => {
            if(res.status===200){
                if(res.data.length===0){
                    this.setState({
                        reachLimit:true
                    })
                }
                
                this.setState({
                    exploreResult: this.state.exploreResult.concat(res.data),
                    isFooterLoading:false
                })
            }else if(res.status===403){
                this.setState({
                    reachLimit:true,
                    isFooterLoading:false
                })

            }
        }).catch(err => {})

    }

    componentDidMount() {
        this.getExplorePeople();
      //  document.addEventListener('scroll', this.handleScroll);
    }
   
    componentWillUnmount() {
       // document.removeEventListener('scroll', this.handleScroll);
    }


    render() {
        if(!this.props.isAuth){
            return <Navigate to="/login" />
        }
        return <>
            {this.state.exploreResult && this.state.exploreResult.map((people, index) => {
                return <PeopleList key={index} users={people} isAuth={this.props.isAuth} />
            })
            }
            <FooterRender isFooterLoading={this.state.isFooterLoading} />


        </>
    }


}

export default ExplorePeople