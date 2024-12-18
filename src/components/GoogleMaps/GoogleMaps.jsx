'use client'
import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import Loader from '../Loader/Loader';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 40.110558,
  lng: -88.228333
};

const GoogleMapComponent = () => {
    return (
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={20}
            >
                <Marker position={center} />
            </GoogleMap>
        </LoadScript>
    )
}

export default GoogleMapComponent;