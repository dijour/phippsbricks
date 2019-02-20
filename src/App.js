import React, { Component } from 'react';
import './App.css';
import fire from './fire.js';
import img from './phipps.jpg';
import GoogleMapReact from 'google-map-react';
import Marker from './components/marker.js'

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentLocation: null,
      actualLocation: null,
      submitted: null,
      zoom: 25
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
        <header className="App-header" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
          <img src={img} style={{width: '10%', height: '10%', marginTop: '20px', marginBottom: '20px'}} className="App-logo" alt="logo" />
          <br/>
          <div>{this.state.submitted}</div>
          <h3>Current Location: </h3>
          {this.state.currentLocation !== null ?
          <div>
            <div>{this.state.currentLocation.lat}, {this.state.currentLocation.lng}</div>
            <h3>Selected Location: </h3>
            {this.state.actualLocation !== null ?
            <div>{this.state.actualLocation.lat}, {this.state.actualLocation.lng}</div>
            :
            <div>Unknown</div>
            }
            <h3>Meters between Current and Selected: </h3>
            {this.state.actualLocation !== null ?
            <div>{this.getDistance(this.state.currentLocation, this.state.actualLocation)}</div>
            :
            <div>Unknown</div>
            }
            <br/>
            <button onClick={e => this.pushLocation(e)} style={{color: 'black', borderBottomColor: 'white'}}>Push Current Location to Database</button>
            <br/>
            <br/>
            <div style={{ height: '60vh', width: '80vw'}}>
              <GoogleMapReact
                bootstrapURLKeys={{ key: 'AIzaSyDcMQLOO-WbqT-IopP9CmBzkmCBzoG67fQ' }}
                defaultCenter={this.state.currentLocation}
                defaultZoom={this.state.zoom}
                options={this.getMapOptions}
                onClick={e => this.mapClicked(e)}
              >
                <Marker
                text={"Current location"}
                lat={this.state.currentLocation.lat}
                lng={this.state.currentLocation.lng}
                />
              {this.state.actualLocation !== null ?
                <Marker
                text={"Selected location"}
                lat={this.state.actualLocation.lat}
                lng={this.state.actualLocation.lng}
                />
              :
                <div></div>
              }

              </GoogleMapReact>
            </div>
          </div>
          :
          <div></div>
          }
          <br/>
          <h3 style={{marginBottom: '0'}}>Locations in the Database</h3>
          <ul>
            {newList}
          </ul>
        </header>
      </div>
    );
  }

  mapClicked = (e) => {
    // e.preventDefault();
    // console.log(e)
    console.log('invoked')
    this.setState({
      actualLocation: {
        lat: e.lat,
        lng: e.lng
      }
    })
  }

  rad = (x) => {
    return x * Math.PI / 180;
  }
  
  getDistance = (p1, p2) => {
    console.log("i have been summoned")
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = this.rad(p2.lat - p1.lat);
    var dLong = this.rad(p2.lng - p1.lng);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.rad(p1.lat)) * Math.cos(this.rad(p2.lat)) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
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
          that.setState({
            submitted: "Submitted!"
          }, () => that.componentDidMount())
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

  getMapOptions = (maps: Maps) => {

    return {
        streetViewControl: false,
        scaleControl: true,
        fullscreenControl: false,
        styles: [{
            featureType: "poi.business",
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }]
        }],
        gestureHandling: "greedy",
        disableDoubleClickZoom: true,

        mapTypeControl: true,
        mapTypeId: maps.MapTypeId.SATELLITE,
        mapTypeControlOptions: {
            style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: maps.ControlPosition.BOTTOM_CENTER,
            mapTypeIds: [
                maps.MapTypeId.ROADMAP,
                maps.MapTypeId.SATELLITE,
                maps.MapTypeId.HYBRID
            ]
        },

        zoomControl: true,
        clickableIcons: false
    };
}



}

export default App;
