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
          {/* <Navigation user={this.state.user} login={this.login} logout={this.logout}/> */}
          {this.state.user === null ? 
          <Route path="/" exact strict render={this.visitorPage}/>
          :
          <Route path="/" exact strict render={this.adminPage}/>
          }
          <Route path="/manager" exact strict render={this.managerPage}/>
          {/* <Route path="/book" exact strict render={ this.meetingPage } />
          <Route path="/admins" exact strict render={ this.adminsPage} />
          <Route path="/contacts" exact strict render={ this.contactsPage } />
          <Route path="/places" exact strict render={ this.placesPage } />
          <Route path="/admins/edit/:id" exact strict component={ Edit } />
          <Route path="/book/edit/:id" exact strict component={ Edit } />
          <Route path="/contacts/edit/:id" exact strict component={ Edit } />
          <Route path="/places/edit/:id" exact strict component={ Edit } />
          <Route path="/itineraries/edit/:id" exact strict component={ Edit } /> */}
          </div>
        </Router>
      </div>
    );
  }

  // homePage = (props) => {
  //   return (
  //     <Visitor
  //     user={this.state.user} /> 
  //   );
  // }

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
        console.log(user.email)
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