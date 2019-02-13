import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import fire from './fire.js';
import img from './phipps.jpg';

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentLocation: null
    }
  }

  render() {
    let newList = []
    for (let i in this.state.locations) {
      console.log(this.state.locations[i])
      newList.push(
        <div key={i}>
        <li>Latitude: {this.state.locations[i].lat}</li>
        <li>Longitude: {this.state.locations[i].lng}</li>
        <li>Time: {this.state.locations[i].time}</li>
        <br/>
        </div>
      )
    }
    return (
      <div className="App">
        <header className="App-header">
          <img src={img} style={{width: '10%', height: '10%', marginBottom: '20px'}}className="App-logo" alt="logo" />
          <br/>
          <h1>Current Location: </h1>
          {this.state.currentLocation !== null ?
          <div>{this.state.currentLocation.lat}, {this.state.currentLocation.lng}</div>
          :
          <div></div>
          }
          <br/>
          <button onClick={e => this.pushLocation(e)}>Push Current Location to Database</button>
          <h3 style={{marginBottom: '0'}}>Locations in the Database</h3>
          <ul>
            {newList}
          </ul>
        </header>
      </div>
    );
  }

  pushLocation = (e) => {
    e.preventDefault();
    let that = this;
    if (this.state.currentLocation !== null) {
      var date = new Date();
      let db = fire.firestore();
      db.collection("locations").add({
        lat: that.state.currentLocation.lat,
        lng: that.state.currentLocation.lng,
        time: date.toLocaleTimeString()
      })
      .then(function() {
          console.log("Document successfully written!")
          // window.location.reload();
      })
      .catch(function(error) {
          console.error("Error writing document: ", error);
      });
    }
  }
  componentDidMount() {
    let db = fire.firestore();
    var wholeData = [];
    db.collection('locations').get()
    .then(snapshot => {
        snapshot.forEach(doc => {
            let docCopy = doc.data();
            wholeData.push(docCopy)
        });
        // let questions = Array(wholeData.length)
      this.setState(
        {locations: wholeData})
    })
    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const coords = pos.coords;
        console.log(pos.coords)
        this.setState({
          currentLocation: {
            lat: coords.latitude,
            lng: coords.longitude
          }
        });
      });
    }
  }
}

export default App;
