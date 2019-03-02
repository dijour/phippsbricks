import React, { Component } from 'react';
import '../../App.css';
import './admin.css';
import fire from '../../fire.js';
import img from '../../logo_512x512.png';
import check from './check.png';
import missing from './missing.png';

import GoogleMapReact from 'google-map-react';
import Marker from '../../components/map/marker.js';
import Brick from '../../components/map/brick.js';
import Person from '../../components/map/person.js';
import bricks from '../../phippsbricks.json';
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
var altAdminIndex = adminClient.initIndex("newBricks")
var adminIndex = adminClient.initIndex(ALGOLIA_INDEX_NAME)


class Admin extends Component {
  constructor() {
    super();
    this.state = {
      // Current location: the device's location
      currentLocation: null,
      // Actual location: the user selected location on the map component
      brickLocation: null,
      clickedLocation: null,
      submitted: false,
      //default zoom for Google Maps component
      zoom: 30,
      inscription: '',
      results: [],
      selectedBrick: null,
      adding: false,
      newBrick: {
        inscription: '',
        donorLastName: '',
        donorName: '',
        inscribedLastNameOrOtherKeyword: '',
        section: ''
      },
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
    console.log(this.state.selectedBrick)
    console.log(this.state.inscription)
    //create a list of li elements under the search bar, one li for every query result 
    let resultList = []
    for (let i in this.state.results) {
      let imgSrc = missing;
      if (this.state.results[i].hasOwnProperty("lat")) {
        imgSrc = check;
      }
      if (this.state.inscription.length > 0) {
        resultList.push(
          <li key={i} style={{background: 'white', color: 'black', textAlign: "initial", display: 'flex', justifyContent: 'space-between'}} onClick={e => this.setBrick(e, this.state.results[i])}>
            <div style={{float: 'left', width: '80%'}}>{this.state.results[i].inscription}</div>
            <div >
              <img src={imgSrc} style={{width:'30px', height:'30px', float: 'left'}}></img>
            </div>
            <br/>
            <br/>
          </li>
        )
      }
    }
    // this is what the render function will actually show on the page
    return (
      <div className="App">
        <header className="App-header" >
          <button className="logout" onClick={e => this.props.logout(e)}>Logout</button>
          <br/>
          <br/>
          <br/>
          {/* Load the search bar with the results list under it */}
          <div style={{display: 'flex'}}>
          {this.state.selectedBrick !== null ?
                <div>
                  {this.state.selectedBrick.lat !== undefined ?
                    <div style={{display: 'flex'}}>
                      <div> Update Location: </div>
                      <img src={check} style={{width: '30px', height: '30px', float: 'left'}}></img>
                    </div>
                  :
                    <div style={{display: 'flex', height: '2vh'}}>
                      <div style={{float: 'left'}}>Add Location: </div>
                      <img src={missing} style={{width: '30px', height: '30px', float: 'left'}}></img>
                    </div>
                  }
                </div>
                :
                <div></div>
              } 
          {this.state.inscription.length > 0 || this.state.results.length > 0 ? 
            <button className="clear" onClick={e => this.clearInscription(e)} style={{marginLeft: '70%', marginBottom: '10px', height: '2vh'}}>Clear</button>
          :
            <div></div>
          }
          </div>
          <input type="text" placeholder="Type a brick inscription..." value={this.state.inscription} onChange={e => setTimeout(this.handleChange(e), 1000)}></input>
          {this.state.adding ? 
            <div></div>
          :
              <div style={{float: 'left', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                <ul style={{listStyle: 'none', left: '0%', paddingLeft: '0', width: '90%'}}>
                  {resultList}
                </ul>
                {this.state.selectedBrick === null && this.state.inscription.length > 0 ? 
                  <div style={{width: '90%'}}>
                    <h5>--OR--</h5>
                    <button onClick={e => this.addingBrick(e)}>{this.state.adding? "Cancel" : "Add New Brick"}</button>
                  </div>
                  :
                  <div></div>
                }
              </div>
          }


          {/* All possible alerts will appear below if their flags are triggered */}
          <div>{this.state.pleaseSelectBrick === true ? "Please choose a brick from the database first!" : ""}</div>
          <div>{this.state.pleaseSelectLocation === true ? "Please drop a pin on the map to update the brick location!" : ""}</div>
          <div>{this.state.selectedBrick !== null ? "Brick Selected!" : ""}</div>
          <div style={{color: 'green'}}>{this.state.submitted ? "Updated Location!" : ""}</div>
          <br/>
          {/* If a brick has been selected, then a button to update its location in the database will appear*/}
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
                    {this.state.currentLocation !== null ?
                      <Person
                      text={"Current location"}
                      lat={this.state.currentLocation.lat}
                      lng={this.state.currentLocation.lng}
                      />
                    : 
                      <div></div>
                    }
                    {this.state.brickLocation !== null ?
                      <Brick
                      text={"Saved DB location"}
                      lat={this.state.brickLocation.lat}
                      lng={this.state.brickLocation.lng}
                      />
                    :
                      <div></div>
                    }
                    {this.state.clickedLocation !== null ?
                      <Brick
                      text={"Clicked location"}
                      lat={this.state.clickedLocation.lat}
                      lng={this.state.clickedLocation.lng}
                      />
                    :
                      <div></div>
                    }
                </GoogleMapReact>
            </div>
            {this.state.selectedBrick !== null && this.state.adding === false ?
              <div>
                {this.state.selectedBrick.lat !== undefined ?
                  <button onClick={e => this.pushBrickLocation(e)}>Edit Brick Location in Database</button>
                :
                  <button onClick={e => this.pushBrickLocation(e)}>Add Brick Location in Database</button>
                }
              </div>
              :
              <div></div>
            }
            <br/>
            {this.state.adding ? 
              <div style={{float: 'left', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <input type="text" placeholder="Type a brick inscription..." value={this.state.inscription} onChange={e => this.handleInscriptionChange(e)}></input>
                <button className="clear" onClick={e => this.clearInscription(e)}>Clear</button>
                {/* <form>
                  <input type="text" placeholder="Brick inscription..." name="inscription" value={this.state.newBrick.inscription} onChange={e => this.handleTextChange(e)} required></input>
                  <br/>
                  <input type="text" placeholder="Donor last name" name="donorLastName" value={this.state.newBrick.donorLastName} onChange={e => this.handleTextChange(e)} required></input>
                  <br/>
                  <input type="text" placeholder="Donor full name" name="donorName" value={this.state.newBrick.donorName} onChange={e => this.handleTextChange(e)} required></input>
                  <br/>
                  <input type="text" placeholder="Keyword or last name" name="inscribedLastNameOrOtherKeyword" value={this.state.newBrick.inscribedLastNameOrOtherKeyword} onChange={e => this.handleTextChange(e)} required></input>
                  <br/>
                  <input type="text" placeholder="Section" name="section" value={this.state.newBrick.section} onChange={e => this.handleTextChange(e)} required></input>
                  <br/>
                  <button className="clear" style={{float:'none', display: 'static'}} onClick={e => this.clearInscription(e)}>Clear</button>
                </form>
                <br/> */}
                <button onClick={e => this.pushNewBrickLocation(e)}>Add New Brick to Database</button> 
              </div>
            :
              <div></div>
            }
            
        </header>
      </div>
    );
  }

  // clears the inscription input field
  clearInscription = (e) => {
    this.setState({
      inscription: '',
      selectedBrick: null,
      results: []
    })
  }

  //sets this.state.adding to true, so we can add a brick instead of update existing bricks
  addingBrick = (e) => {
    this.setState({
      adding: !this.state.adding,
      selectedBrick: null,
      submitted: false,
      pleaseSelectBrick: false,
      pleaseSelectLocation: false
    })
  }

  handleTextChange = (e) => {
    // let brick = this.state.newBrick;
    // brick
    this.setState(Object.assign(this.state.newBrick,{[e.target.name]:e.target.value}));
  }

  // anytime the text area changes, update the state of this component to reflect the text in there 
  handleChange = (e) => {
    e.preventDefault();
    this.setState({
      inscription: e.target.value,
      submitted: false,
      brickLocation: null
    }
    // re-query the database with the next string in the text area
      ,() => this.updateSearchResults()
      );
  }

  // just a handler for the state change watcher when adding a NEW Brick
  handleInscriptionChange = (e) => {
    e.preventDefault();
    this.setState({
      inscription: e.target.value
    })
  }

  // whatever brick is selected, update the state of this component to reflect its properties
  // if the brick has a location in the database, it will update the actualLocation of this state
  // and will re-center the map based on that location
  setBrick = (e, result) => {
    console.log(result)
    e.preventDefault();
    this.setState({
      selectedBrick: result,
      inscription: result.inscription,
      results: [],
      brickLocation: {
        lat: result.lat,
        lng: result.lng,
        timeUpdated: result.timeUpdated
      },
      clickedLocation: null,
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
        // inscription: this.state.inscription
      })
    })
  }

  // anytime the map is clicked, update the state to reflect the location of the marker
  mapClicked = (e) => {
    console.log('invoked')
    this.setState({
      clickedLocation: {
        lat: e.lat,
        lng: e.lng
      },
      brickLocation: null
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

  // check if any of the brick properties are null
  checkNewBrick = (obj) => {
    for (var key in obj) {
        if (obj[key] !== null && obj[key] !== "")
            return false;
    }
    return true;
  }

  // function will not run if any flags are triggered (missing location, brick, or both)
  pushNewBrickLocationMonica = (e) => {
    e.preventDefault();
    if (this.checkNewBrick(this.state.newBrick)) {
      return
    }
    console.log('hellooooo')
    if (this.state.clickedLocation === null) {
      return this.setState({
        pleaseSelectLocation: true,
        pleaseSelectBrick: false
      })
    }
    console.log("hello we made it")
    // push everything from this state to the Firestore database
    let that = this;
    var date = new Date();
    let brickObject = this.state.newBrick;
    brickObject.lat = this.state.clickedLocation.lat;
    brickObject.lng = this.state.clickedLocation.lng;
    brickObject.timeUpdated = date.toLocaleTimeString();
    brickObject.updatedBy = this.props.user.email;
    if (this.state.currentLocation !== null) {
      let db = fire.firestore();
      db.collection("newBricks").add({
        inscription: brickObject.inscription,
        donorLastName: brickObject.donorLastName,
        donorName: brickObject.donorName,
        section: brickObject.section,
        lat: brickObject.lat,
        lng: brickObject.lng,
        timeUpdated: brickObject.timeUpdated,
        updatedBy: brickObject.updatedBy
      })
      // update Algolia to reflect this change
      .then(ref => {
          console.log("Document successfully updated!")
          console.log(ref.id)
          brickObject.objectID = ref.id
          console.log(brickObject)
          that.setState({
            submitted: true,
            pleaseSelectBrick: false,
            pleaseSelectLocation: false,
            selectedBrick: null
          }, () => 
          adminIndex.saveObject({
            inscription: brickObject.inscription,
            donorLastName: brickObject.donorLastName,
            donorName: brickObject.donorName,
            section: brickObject.section,
            lat: brickObject.lat,
            lng: brickObject.lng,
            timeUpdated: brickObject.timeUpdated,
            updatedBy: brickObject.updatedBy,
            objectID: ref.id
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

  // function will not run if any flags are triggered (missing location, brick, or both)
  pushBrickLocation = (e) => {
    console.log("this user is: ", this.props.user)
    if (this.state.clickedLocation === null && this.state.selectedBrick === null) {
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
    else if (this.state.clickedLocation === null) {
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
    brickObject.lat = this.state.clickedLocation.lat;
    brickObject.long = this.state.clickedLocation.lng;
    brickObject.timeUpdated = date.toLocaleTimeString();
    if (this.state.currentLocation !== null) {
      let db = fire.firestore();
      db.collection("csv").doc(ID).update({
        lat: that.state.clickedLocation.lat,
        lng: that.state.clickedLocation.lng,
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
            selectedBrick: null,
            inscription: ''
          }, () => 
          adminIndex.partialUpdateObject({
            lat: that.state.clickedLocation.lat,
            lng: that.state.clickedLocation.lng,
            timeUpdated: date.toLocaleTimeString(),
            objectID: brickObject.objectID,
            updatedBy: that.props.user.email
          }, function(err, content) {
            if (err) throw err;
          
            console.log(content);
          })
        )
          // window.location.reload();
      }, () => (console.log("finished")))
      .catch(function(error) {
          console.error("Error writing document: ", error);
      });
    }
  }

  // function will not run if any flags are triggered (missing location, brick, or both)
  pushNewBrickLocation = (e) => {
    console.log("pushing new brick location!")
    if (this.state.clickedLocation === null) {
      return this.setState({
        pleaseSelectLocation: true,
        pleaseSelectBrick: false
      })
    }

    console.log("hello we made it")
    // push everything from this state to the Firestore database
    let that = this;
    var date = new Date();
    let brickObject = {};
    brickObject.inscription = this.state.inscription;
    brickObject.lat = this.state.clickedLocation.lat;
    brickObject.lng = this.state.clickedLocation.lng;
    brickObject.timeUpdated = date.toLocaleTimeString();
    brickObject.updatedBy = this.props.user.email;
    if (this.state.currentLocation !== null) {
      let db = fire.firestore();
      db.collection("newBricks").add({
        inscription: brickObject.inscription,
        lat: brickObject.lat,
        lng: brickObject.lng,
        timeUpdated: brickObject.timeUpdated,
        updatedBy: brickObject.updatedBy
      })
      // update Algolia to reflect this change
      .then(ref => {
          console.log("Document successfully updated!")
          console.log(ref.id)
          brickObject.objectID = ref.id
          console.log(brickObject)
          that.setState({
            submitted: true,
            pleaseSelectBrick: false,
            pleaseSelectLocation: false,
            selectedBrick: null
          }, () => 
          altAdminIndex.saveObject({
            inscription: brickObject.inscription,
            lat: brickObject.lat,
            lng: brickObject.lng,
            timeUpdated: brickObject.timeUpdated,
            updatedBy: brickObject.updatedBy,
            objectID: ref.id
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
        }, () => this.sendDBtoAlgolia());
      });
    }
  }

  // sets up the Google map component with necessary properties
  getMapOptions = (maps: Maps) => {
    return {
        streetViewControl: false,
        scaleControl: true,
        fullscreenControl: false,
        tilt: 0,
        styles: [{
            featureType: "poi.business",
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }]
        }],
        gestureHandling: "greedy",
        disableDoubleClickZoom: true,

        // mapTypeControl: true,
        mapTypeId: maps.MapTypeId.SATELLITE,
        // mapTypeControlOptions: {
        //     style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
        //     position: maps.ControlPosition.BOTTOM_CENTER,
        //     mapTypeIds: [
        //         maps.MapTypeId.ROADMAP,
        //         maps.MapTypeId.SATELLITE,
        //         maps.MapTypeId.HYBRID
        //     ]
        // },

        // zoomControl: true,
        // clickableIcons: true
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
    // let db = fire.firestore();
    // var wholeData = [];
    // db.collection('csv').get()
    // .then(snapshot => {
    //     snapshot.forEach(doc => {
    //         console.log(doc.id);
    //         let docCopy = doc.data();
    //         docCopy.objectID = doc.id;
    //         wholeData.push(docCopy)
    //     });
    //     // let questions = Array(wholeData.length)
    //     var client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
    //     var index = client.initIndex(ALGOLIA_INDEX_NAME)

    //     index.saveObjects(wholeData, function(err, content) {
    //       // res.status(200).sent(content);
    //     })
    // })
  }

}

export default Admin;
