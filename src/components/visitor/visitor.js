
import React, { Component } from 'react';
import '../../App.css';
import fire from '../../fire.js';
import img from '../../logo_512x512.png';
import GoogleMapReact from 'google-map-react';
import Marker from '../../components/map/marker.js'
import * as algoliasearch from 'algoliasearch'

const ALGOLIA_ID = '0YB48ZSNOY';
const ALGOLIA_SEARCH_KEY = '89d36e2116be0b0797033a466abe93b3';

const ALGOLIA_INDEX_NAME = 'bricks';
var client = algoliasearch(ALGOLIA_ID, ALGOLIA_SEARCH_KEY, { protocol: 'https:' });
var index = client.initIndex(ALGOLIA_INDEX_NAME)

class Visitor extends Component {
  constructor() {
    super();
    this.state = {
      currentLocation: null,
      actualLocation: null,
      submitted: false,
      zoom: 30,
      inscription: '',
      results: [],
      selectedBrick: null,
      pleaseSelectBrick: false,
      pleaseSelectLocation: false,
      // Phipps Garden Coordinates
      defaultCenter: {
        lat: 40.43920267930719,
        lng: -79.9481821247
      }
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
    let resultList = []
    for (let i in this.state.results) {
      resultList.push(
        <li key={i} style={{background: 'white', color: 'black'}}onClick={e => this.setBrick(e, this.state.results[i])}>
          <div>Inscription: {this.state.results[i].Inscription}</div>
          <div>Section: {this.state.results[i].Section}</div>
          <div>Location in DB: {this.state.results[i].hasOwnProperty("lat") ? "Yes" : "No"} </div>
        </li>
      )
    }
    console.log(resultList)
    console.log(this.state)
    return (
      <div className="App">
        <header className="App-header" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
          <img src={img} style={{width: '10%', height: '10%', marginTop: '20px', marginBottom: '20px'}} className="App-logo" alt="logo" />
          <br/>
          <button onClick={e => this.props.login(e)} style={{color: 'black', borderBottomColor: 'white'}}>Login</button>
          <br/>
          <br/>
          <textarea type="text" placeholder="Type a brick inscription..." value={this.state.inscription} onChange={e => setTimeout(this.handleChange(e), 1000)}></textarea>
          <ul style={{listStyle: 'none', paddingLeft: '0'}}>
            {resultList}
          </ul>
          <div>{this.state.selectedBrick !== null ? "Brick Selected!" : ""}</div>
          <br/>
          <br/> 
          <div style={{ height: '60vh', width: '80vw'}}>
              <GoogleMapReact
                  bootstrapURLKeys={{ key: 'AIzaSyDcMQLOO-WbqT-IopP9CmBzkmCBzoG67fQ' }}
                  center={this.state.defaultCenter}
                  defaultZoom={this.state.zoom}
                  options={this.getMapOptions}
                  onClick={e => this.mapClicked(e)}
                  >
                  {/* <Marker
                  text={"Current location"}
                  lat={this.state.currentLocation.lat}
                  lng={this.state.currentLocation.lng}
                  /> */}
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
        </header>
      </div>
    );
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({
      inscription: e.target.value,
      submitted: false
    }
      ,() => this.updateSearchResults()
      );
  }

  setBrick = (e, result) => {
    e.preventDefault();
    this.setState({
      selectedBrick: result,
      inscription: result.Inscription,
      results: [],
      actualLocation: {
        lat: result.lat,
        lng: result.lng,
        timeUpdated: result.timeUpdated
      },
      defaultCenter: {
        lat: result.lat,
        lng: result.lng
      }      
    }, () => {this.render()})
  }

  updateSearchResults = () => {
    index.search({
      query: this.state.inscription
    }).then((data) => {
      console.log(data.hits);
      this.setState({
        results: data.hits.slice(0,5)
      })
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

  pushAutoLoggedLocation = () => {
    let that = this;
    if (this.state.currentLocation !== null) {
      var date = new Date();
      let db = fire.firestore();
      db.collection("autoLogged").add({
        lat: that.state.currentLocation.lat,
        lng: that.state.currentLocation.lng,
        time: date.toLocaleTimeString()
      })
      .then(function() {
          console.log("Document successfully written!")
      })
      .catch(function(error) {
          console.error("Error writing document: ", error);
      });
    }
  }

  componentDidMount() {
    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const coords = pos.coords;
        this.setState({
          currentLocation: {
            lat: coords.latitude,
            lng: coords.longitude
          }
        }, () => this.pushAutoLoggedLocation());
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

export default Visitor;
