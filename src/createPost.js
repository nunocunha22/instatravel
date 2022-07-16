
import React from "react";
import { Route,BrowserRouter, Routes } from "react-router-dom";
import CreatePost from "./components/CreatePost";


class Create extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return <>
            <BrowserRouter>
            <Route exact path="/create/__post__" component={CreatePost} />
            <Route exact path="/create/" component={CreatePost} />
            </BrowserRouter>
        </>
    }

}

export default Create