import React, { Component } from 'react';
import '../../App.css';
import fire from '../../fire.js';
import img from '../../logo_512x512.png';
import GoogleMapReact from 'google-map-react';
import Marker from '../../components/map/marker.js'
import * as algoliasearch from 'algoliasearch'

//constants to access our Algolia index
const ALGOLIA_ID = '0YB48ZSNOY';
const ALGOLIA_ADMIN_KEY = '29d14e5aa9ef6cc0eca30180790e6e08';
const ALGOLIA_SEARCH_KEY = '89d36e2116be0b0797033a466abe93b3';

//reference to the specific Algolia "bricks" index
const ALGOLIA_INDEX_NAME = 'bricks';
var client = algoliasearch(ALGOLIA_ID, ALGOLIA_SEARCH_KEY, { protocol: 'https:' });
var index = client.initIndex(ALGOLIA_INDEX_NAME)

//admin keys to write to the Algolia database
var adminClient = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY, { protocol: 'https:' });
var adminIndex = adminClient.initIndex(ALGOLIA_INDEX_NAME)


class Admin extends Component {
  constructor() {
    super();
    this.state = {
      // Current location: the device's location
      currentLocation: null,
      // Actual location: the user selected location on the map component
      actualLocation: null,
      submitted: false,
      //default zoom for Google Maps component
      zoom: 30,
      inscription: '',
      results: [],
      selectedBrick: null,
      //Flag for telling the user they need to select a brick before updating the database
      pleaseSelectBrick: false,
      //Flag for telling the user they need to select a location before updating the database
      pleaseSelectLocation: false,
      // Phipps Garden Coordinates are pre-populated
      defaultCenter: {
        lat: 40.43920267930719,
        lng: -79.9481821247
      }
    }
  }

  render = () => {
    //create a list of li elements under the search bar, one li for every query result 
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
    // this is what the render function will actually show on the page
    return (
      <div className="App">
        <header className="App-header" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
          {/* Loads the Phipps Logo */}
          <img src={img} style={{width: '10%', height: '10%', marginTop: '20px', marginBottom: '20px'}} className="App-logo" alt="logo" />
          
          <h3>Hello, {this.props.user.displayName}</h3>
          {/* Button to logout */}
          <button onClick={e => this.props.logout(e)} style={{color: 'black', borderBottomColor: 'white'}}>Logout</button>
          <br/>
          <br/>
          {/* Load the search bar with the results list under it */}
          <textarea type="text" placeholder="Type a brick inscription..." value={this.state.inscription} onChange={e => setTimeout(this.handleChange(e), 1000)}></textarea>
          <ul style={{listStyle: 'none', paddingLeft: '0'}}>
            {resultList}
          </ul>
          {/* All possible alerts will appear below if their flags are triggered */}
          <div>{this.state.pleaseSelectBrick === true ? "Please choose a brick from the database first!" : ""}</div>
          <div>{this.state.pleaseSelectLocation === true ? "Please drop a pin on the map to update the brick location!" : ""}</div>
          <div>{this.state.selectedBrick !== null ? "Brick Selected!" : ""}</div>
          <div>{this.state.submitted ? "Updated Location in Database!" : ""}</div>
          <br/>
          {/* If a brick has been selected, then a button to update its location in the database will appear*/}
          {this.state.selectedResult !== null ?
            <button onClick={e => this.pushBrickLocation(e)} style={{color: 'black', borderBottomColor: 'white'}}>Update Brick Location in Database</button>
            :
            <div></div>
          }
          <br/>
          {/* The entire google map component. Most of this is default code */}
            <div style={{ height: '60vh', width: '80vw'}}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: 'AIzaSyDcMQLOO-WbqT-IopP9CmBzkmCBzoG67fQ' }}
                    center={this.state.defaultCenter}
                    defaultZoom={this.state.zoom}
                    options={this.getMapOptions}
                    onClick={e => this.mapClicked(e)}
                    >
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

  // anytime the text area changes, update the state of this component to reflect the text in there 
  handleChange = (e) => {
    e.preventDefault();
    this.setState({
      inscription: e.target.value,
      submitted: false
    }
    // re-query the database with the next string in the text area
      ,() => this.updateSearchResults()
      );
  }

  // whatever brick is selected, update the state of this component to reflect its properties
  // if the brick has a location in the database, it will update the actualLocation of this state
  // and will re-center the map based on that location
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
    })
  }

  // query the Algolia "bricks" index and extract the first 5 results
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

  // anytime the map is clicked, update the state to reflect the location of the marker
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
  
  // Haversine formula to calculate distance between 2 GPS points
  getDistance = (p1, p2) => {
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

  // function will not run if any flags are triggered (missing location, brick, or both)
  pushBrickLocation = (e) => {
    console.log(this.props.user)
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
    // push everything from this state to the Firestore database
    let ID = this.state.selectedBrick.objectID
    e.preventDefault();
    let that = this;
    var date = new Date();
    let brickObject = this.state.selectedBrick;
    brickObject.lat = this.state.actualLocation.lat;
    brickObject.long = this.state.actualLocation.lng;
    brickObject.timeUpdated = date.toLocaleTimeString();
    if (this.state.currentLocation !== null) {
      let db = fire.firestore();
      db.collection("csv").doc(ID).update({
        lat: that.state.actualLocation.lat,
        lng: that.state.actualLocation.lng,
        timeUpdated: date.toLocaleTimeString(),
        updatedBy: that.props.user.email
      })
      // update Algolia to reflect this change
      .then(function() {
          console.log("Document successfully updated!")
          that.setState({
            submitted: true,
            pleaseSelectBrick: false,
            pleaseSelectLocation: false,
            selectedBrick: null
          }, () => 
          adminIndex.partialUpdateObject({
            lat: that.state.actualLocation.lat,
            lng: that.state.actualLocation.lng,
            timeUpdated: date.toLocaleTimeString(),
            objectID: brickObject.objectID,
            updatedBy: that.props.user.email
          }, function(err, content) {
            if (err) throw err;
          
            console.log(content);
          })
        )
          // window.location.reload();
      })
      .catch(function(error) {
          console.error("Error writing document: ", error);
      });
    }
  }

  // not using this at the moment
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

  // currently just populating the database with where people are accessing the device from
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

  // Before anything renders, find the current location from the browser,
  // then push that location to Firestore automatically
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

  // sets up the Google map component with necessary properties
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

// not using this, ignore for now
  getResultsFromFirestore = () => {
    let db = fire.firestore();
    let that = this;
    let results = [];
    db.collection('csv').where('Inscription', '==', that.state.inscription).get().then(snapshot => {
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

    //   ONE TIME FUNCTION, ONLY EVER USE ONCE TO 
    // COMPLETELY UPLOAD ALL BRICKS TO FIRESTORE
  uploadAllBricksToDB = () => {
    // let db = fire.firestore();
    // for (let i in bricks) {
    //   db.collection('csv').add(bricks[i]).then(ref => {
    //     console.log('Added document with ID: ', ref.id);
    //   });
    // }
  }

  // not using this, ignore for now
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

export default Admin;
