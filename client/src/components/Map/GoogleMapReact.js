import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';

//import dotenv from 'dotenv'
//dotenv.config()
//const GoogleMapReact_API_KEY = process.env.GoogleMapReact_API_KEY;



const AnyReactComponent = ({ text }) => <div>{text}</div>;

class SimpleMap extends Component {
  static defaultProps = {
    center: {
      lat: 59.95,
      lng: 30.33
    },
    zoom: 11
  };

  render() {
    return (
      // Important! Always set the container height explicitly
      <div style={{ height: '60vh', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: 'BLskCNDcpuIKPZGUlFGHcvMKYYtRJNBADWhUSaL' }}  // Using Sample-Key (If you use it, ypu have to replace Sample-Key with your API-KEY)
          //bootstrapURLKeys={{ key: GoogleMapReact_API_KEY }}
          //bootstrapURLKeys={{ key: /* YOUR KEY HERE */ }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
        >
          <AnyReactComponent
            lat={59.955413}
            lng={30.337844}
            text="My Marker"
          />
        </GoogleMapReact>
      </div>
    );
  }
}

export default SimpleMap;
