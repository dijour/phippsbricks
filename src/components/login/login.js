import React, { Component } from 'react';
import '../../App.css';
import './login.css';
import fire from '../../fire.js';
import img from '../../logo_512x512.png';
import { Redirect } from 'react-router-dom';

export class Login extends Component {
    constructor() {
      super();
      this.state = {
        email: "",
        password: "",
        found: true,
        redirect: false
      }
  
  
    }
    render() {
      if (this.state.redirect === true){
        return <Redirect to='/'/>
      }
      return (
        <div className="login">
            <img src={img} style={{width: '10%', height: '10%', marginTop: '20px', marginBottom: '20px'}} className="App-logo" alt="logo" />
            <br/>
            <form onSubmit={this.login}>
                {this.state.found === true ?
                <h1>  </h1>
            
                :
                <h1> Could not find an account with that email/password.</h1>
                }
                <h3>Email:</h3>
                <input type="text" name="email" autoComplete="email" value={this.state.email} onChange={this.handleChange}/>
                <br/>
                <h3>Password:</h3>
                <input type="password" name="password" autoComplete="password" value={this.state.password} onChange={this.handleChange}/>
                <br/><br/>
                <button className="button-primary" type="submit" onClick={this.login}>Phipps Log In</button>
            </form>            
        </div>
      );
    }

    login = (e) => {
      e.preventDefault();
      fire.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then((u)=>{
        this.setState({
          redirect: true
        }
        // , () => (console.log(this.state))
        )
      }).catch((error) => {
          this.setState({
              found: false
          })
        });
    }

    onClickButton = (event) => {
      event.preventDefault();
      this.props.login(null, this.state.email.toString(), this.state.password.toString())
    }
  
    handleChange = (e) => {
        const name = e.target.name
        this.setState({[name]: e.target.value});
      }
  
  }
  
  export default Login;