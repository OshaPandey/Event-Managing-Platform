import React, { useState, useEffect, useRef } from "react";
import GoogleMapReact from "google-map-react";
import { GOOGLE_MAP_API_KEY, MAX_RADIUS } from "../../constants/common.ts";
import { Link, useHistory } from "react-router-dom";
import {
  GenericObject,
  IPlacesResult,
  IPlaceSearchResponse,
  IFormState,
} from "../../interfaces/common";
import NearbyForm from "./NearbyForm.tsx";
import PlaceCard from "./PlaceCard.tsx";

const Home = () => {
  const [position, setPosition] = useState<{ lat: number; lng: number }>();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [displayedMarker, setDisplayedMarker] = useState<string>();
  const [results, setResults] = useState<{
    isLoading: boolean;
    data?: IPlacesResult[];
    error?: true;
  }>({ isLoading: false });
  const mapInstance = useRef<{ map: GenericObject; maps: GenericObject }>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      lat && lng && setPosition({ lat, lng });
    });
  }, []);

  const getResults = ({ type, searchKey, opennow }: IFormState) => {
    if (position && mapLoaded && mapInstance.current) {
      setResults({ ...results, isLoading: true });
      setDisplayedMarker(undefined);
      const { map, maps } = mapInstance.current;
      const pyrmont = new maps.LatLng(position.lat, position.lng);
      const service = new maps.places.PlacesService(map);
      var request = {
        location: pyrmont,
        radius: MAX_RADIUS,
        type: [type],
        ...(searchKey && { keyword: searchKey }),
        ...(opennow && { openNow: opennow }),
      };
      const callback = (
        response: Array<IPlaceSearchResponse>,
        status: string
      ) => {
        if (status === maps.places.PlacesServiceStatus.OK) {
          console.log(response);
          const data: IPlacesResult[] = response.map(
            ({
              name,
              id,
              icon,
              user_ratings_total,
              vicinity,
              rating,
              geometry: { location },
              opening_hours,
              photos,
            }) => ({
              name,
              id,
              icon,
              rating,
              totalRatings: user_ratings_total,
              vicinity,
              lat: location.lat(),
              lng: location.lng(),
              openNow: opening_hours && opening_hours.open_now,
              photo: photos && photos[0] && photos[0].getUrl(),
            })
          );
          setResults({ isLoading: false, data });
        } else if (status === maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setResults({ isLoading: false, data: [] });
        } else {
          setResults({ isLoading: false, error: true });
        }
      };
      service.nearbySearch(request, callback);
    }
  };

  const markerClick = (id?: string) => {
    setDisplayedMarker(id);
  };

  const Marker = (props: IPlacesResult) => (
    <div>
      {props.id === displayedMarker && (
        <div className="marker-card">
          <>
            <div className="marker-card__close" onClick={() => markerClick()}>
              x
            </div>
            <PlaceCard key={props.id} data={props} />
          </>
        </div>
      )}
      <img
        onClick={() => markerClick(props.id)}
        src={props.icon}
        className="map-marker"
        alt="fireSpot"
      />
    </div>
  );

  const handleApiLoaded = (map: GenericObject, maps: GenericObject) => {
    setMapLoaded(true);
    mapInstance.current = { map, maps };
  };

  return (
    <div className="container" data-test="home">
      <div className="sidebar">
        <NearbyForm
          onSubmit={getResults}
          isLoading={results.isLoading}
          data-test="nearbyFormComponent"
        />
        <div className="card-container" data-test="placeCardContainer">
          {results.error && <h5>Something Went Wrong. Please Try Again!</h5>}
          {results.data && !results.data.length && (
            <h5>No Results Found. Please Try Some Other Place!</h5>
          )}
          {!results.error && !results.data && (
            <h5>Search For Your Nearby Places!</h5>
          )}
          {results.data && results.data.length
            ? results.data.map((result) => (
                <PlaceCard
                  placeholder="box"
                  key={result.id}
                  data={result}
                  button={result.name}
                  displayMarkerCard={markerClick}
                  onClick={console.log(result.name)}
                />
              ))
            : null}
        </div>
      </div>
      <div className="map-container">
        {position && (
          <GoogleMapReact
            bootstrapURLKeys={{
              key: GOOGLE_MAP_API_KEY,
              libraries: ["places"],
            }}
            defaultCenter={position}
            defaultZoom={15}
            yesIWantToUseGoogleMapApiInternals={true}
            onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
            data-test="map"
          >
            {results.data &&
              results.data.map((result) => (
                <Marker {...result} key={result.id} />
              ))}
          </GoogleMapReact>
        )}
      </div>
    </div>
  );
};

export default Home;
