import React, { Component } from 'react';
import './App.css';
import {auth, provider} from './fire.js';
import Admin from './components/admin/admin.js';
import Visitor from './components/visitor/visitor.js';
import {BrowserRouter as Router} from 'react-router-dom';
import Route from 'react-router-dom/Route';


class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null
    }

  }
  render() {
    return (
      <div>
        {/* This is a router component from React-Router to instantiate the various paths the site has. */}
        <Router>
          <div className="App">
          {/* If a user is not logged in (user === null) then just render the visitor page. */}
          {this.state.user === null ? 
          <Route path="/" exact strict render={this.visitorPage}/>
          :
          <Route path="/" exact strict render={this.adminPage}/>
          }
          <Route path="/manager" exact strict render={this.managerPage}/>
          </div>
        </Router>
      </div>
    );
  }

  // We could just make the route render the standard Admin component, but we want a little more specificity
  // We're going to create an "adminPage" which renders the Admin component, but additionally feeds in props
  adminPage = (props) => {
    return (
      <Admin
      user={this.state.user} 
      login={this.login}
      logout={this.logout}/> 
    );
  }

  // We could just make the route render the standard Visitor component, but we want a little more specificity
  // We're going to create an "adminPage" which renders the Visitor component, but additionally feeds in props
  visitorPage = (props) => {
    return (
      <Visitor
      user={this.state.user} 
      login={this.login}
      logout={this.logout}/> 
    );
  }

  //Before the page renders, make sure we update the app's state with the user object, so it persists even when pages reload
  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      } 
    });
  }

  //Default Firebase logout function 
  logout = (e) => {
    e.preventDefault();
    auth.signOut()
      .then(() => {
        this.setState({
          user: null
        });
      });
  }

  //Default Firebase login function
  login = (e) => {
    e.preventDefault();
    auth.signInWithPopup(provider) 
      .then((result) => {
        const user = result.user;
        console.log(user)
        console.log("we may be logging in")
        const email = user.email.toString();
        // if (email.match(/@phippsconservatory.org/) === null){
        //   console.log("thou shall not pass");
        //   this.logout();
        // }
        // else {
            console.log("thou shall pass");
            this.setState({
              user
            });
        // }
      });
  }
}

export default App;