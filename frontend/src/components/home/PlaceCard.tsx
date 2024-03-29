import React, { useState, useEffect, useRef } from "react";
import { IPlacesResult } from "../../interfaces/common";
import { Link, useHistory } from "react-router-dom";
const PlaceCard = ({
  data,

  displayMarkerCard,
}: {
  data: IPlacesResult;
  displayMarkerCard?: (id: string) => void;
}) => {
  return (
    <div
      className="card"
      onClick={() => displayMarkerCard && displayMarkerCard(data.id)}
      data-test="card"
    >
      <div className="card__containts" onClick={() => console.log(data.name)}>
        <div
          className="card__image-wrapper"
          data-test="placeImage"
          style={{ backgroundImage: `url(${data.photo || data.icon})` }}
        ></div>

        <div className="card__rating-container" data-test="rating">
          <h3>{data.name}</h3>
          <p className="card__rating">
            Ratings: {data.rating} ({data.totalRatings} votes)
          </p>
          <p className="card__open-info">{data.openNow ? "OPEN" : "CLOSED"}</p>
        </div>
      </div>
      <p className="card__footer" data-test="vicinity">
        {data.vicinity}
      </p>
    </div>
  );
};

export default PlaceCard;
