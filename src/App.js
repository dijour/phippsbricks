import React, { Component } from 'react';
import './App.css';
import fire from './fire.js';
import img from './phipps.jpg';
import GoogleMapReact from 'google-map-react';
import Marker from './components/marker.js'
import bricks from './phippsbricks.json'
import * as algoliasearch from 'algoliasearch'

const ALGOLIA_ID = '0YB48ZSNOY';
const ALGOLIA_ADMIN_KEY = '29d14e5aa9ef6cc0eca30180790e6e08';
const ALGOLIA_SEARCH_KEY = '89d36e2116be0b0797033a466abe93b3';

const ALGOLIA_INDEX_NAME = 'bricks';
var client = algoliasearch(ALGOLIA_ID, ALGOLIA_SEARCH_KEY, { protocol: 'https:' });
var index = client.initIndex(ALGOLIA_INDEX_NAME)

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentLocation: null,
      actualLocation: null,
      submitted: false,
      zoom: 25,
      inscription: '',
      results: [],
      selectedBrick: null,
      pleaseSelectBrick: false,
      pleaseSelectLocation: false
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
          <input type="text" value={this.state.inscription} onChange={e => setTimeout(this.handleChange(e), 1000)}></input>
          <ul style={{listStyle: 'none', paddingLeft: '0'}}>
            {resultList}
          </ul>
          <div>{this.state.pleaseSelectBrick === true ? "Please choose a brick from the database first!" : ""}</div>
          <div>{this.state.pleaseSelectLocation === true ? "Please drop a pin on the map to update the brick location!" : ""}</div>
          <div>{this.state.selectedBrick !== null ? "Brick Selected!" : ""}</div>
          <div>{this.state.submitted ? "Updated Location in Database!" : ""}</div>
          <br/>
          {this.state.selectedResult !== null ?
            <button onClick={e => this.pushBrickLocation(e)} style={{color: 'black', borderBottomColor: 'white'}}>Update Brick Location in Database</button>
            :
            <div></div>
          }

          {/* <h3>Current Location: </h3> */}
          {this.state.currentLocation !== null ?
          <div>
            {/* <div>{this.state.currentLocation.lat}, {this.state.currentLocation.lng}</div> */}
            {/* <h3>Selected Location: </h3> */}
            {/* {this.state.actualLocation !== null ?
            <div>{this.state.actualLocation.lat}, {this.state.actualLocation.lng}</div>
            :
            <div>Unknown</div>
            }
            <h3>Meters between Current and Selected: </h3> */}
            {/* {this.state.actualLocation !== null ?
            <div>{this.getDistance(this.state.currentLocation, this.state.actualLocation)}</div>
            :
            <div>Unknown</div>
            } */}
            <br/>
            <div style={{ height: '60vh', width: '80vw'}}>
              <GoogleMapReact
                bootstrapURLKeys={{ key: 'AIzaSyDcMQLOO-WbqT-IopP9CmBzkmCBzoG67fQ' }}
                defaultCenter={this.state.currentLocation}
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
          </div>
          :
          <div></div>
          }
          <br/>
        </header>
      </div>
    );
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({inscription: e.target.value}
      ,() => this.updateSearchResults()
      );
  }

  setBrick = (e, result) => {
    e.preventDefault();
    this.setState({
      selectedBrick: result,
      inscription: result.Inscription,
      results: []
    })
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

  mapClicked = (e) => {
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

  pushBrickLocation = (e) => {
    if (this.state.actualLocation === null && this.state.actualLocation === null) {
      return this.setState({
        pleaseSelectLocation: true,
        pleaseSelectBrick: true
      })
    }
    else if (this.state.selectedBrick === null) {
      return this.setState({
        pleaseSelectBrick: true,
        pleaseSelectLocation: false
      })
    }
    else if (this.state.actualLocation === null) {
      return this.setState({
        pleaseSelectLocation: true,
        pleaseSelectBrick: false
      })
    }

    console.log(this.state.selectedBrick.objectID)
    let ID = this.state.selectedBrick.objectID
    e.preventDefault();
    let that = this;
    if (this.state.currentLocation !== null) {
      var date = new Date();
      let db = fire.firestore();
      db.collection("csv").doc(ID).update({
        lat: that.state.actualLocation.lat,
        lng: that.state.actualLocation.lng,
        timeUpdated: date.toLocaleTimeString()
      })
      .then(function() {
          console.log("Document successfully updated!")
          that.setState({
            submitted: true,
            pleaseSelectBrick: false,
            pleaseSelectLocation: false,
            selectedBrick: null
          }, () => that.componentDidMount())
          // window.location.reload();
      })
      .catch(function(error) {
          console.error("Error writing document: ", error);
      });
    }
  }

  
  pushCurrentSelectedLocation = (e) => {
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
    let db = fire.firestore();
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

  getResultsFromFirestore = () => {
    let db = fire.firestore();
    let that = this;
    let results = [];
    db.collection('csv').
      // .orderBy("Inscription", 'asc')
      where('Inscription', '==', this.state.inscription).
      // .startAt(that.state.inscription.toLowerCase())
      // .endAt(that.state.inscription.toLowerCase()+"\uf8ff")
      // limit(10).
      get().then(snapshot => {
        snapshot.forEach(doc => {
          let docCopy = doc.data();
          // console.log(docCopy)
          results.push(docCopy)
        });
        // let questions = Array(wholeData.length)
      this.setState(
        {results: results}, () =>
        console.log(this.state))
    })
  }

  uploadAllBricksToDB = () => {
    let db = fire.firestore();
    for (let i in bricks) {
      db.collection('csv').add(bricks[i]).then(ref => {
        console.log('Added document with ID: ', ref.id);
      });
    }
  }

  sendDBtoAlgolia = () => {
    let db = fire.firestore();
    var wholeData = [];
    db.collection('csv').get()
    .then(snapshot => {
        snapshot.forEach(doc => {
            console.log(doc.id);
            let docCopy = doc.data();
            docCopy.objectID = doc.id;
            wholeData.push(docCopy)
        });
        // let questions = Array(wholeData.length)
        var client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
        var index = client.initIndex(ALGOLIA_INDEX_NAME)

        index.saveObjects(wholeData, function(err, content) {
          // res.status(200).sent(content);
        })
    })
  }

}

export default App;
