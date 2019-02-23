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
        <Router>
          <div className="App">
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

  adminPage = (props) => {
    return (
      <Admin
      user={this.state.user} 
      login={this.login}
      logout={this.logout}/> 
    );
  }

  visitorPage = (props) => {
    return (
      <Visitor
      user={this.state.user} 
      login={this.login}
      logout={this.logout}/> 
    );
  }

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      } 
    });
  }

  logout = (e) => {
    e.preventDefault();
    auth.signOut()
      .then(() => {
        this.setState({
          user: null
        });
      });
  }

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