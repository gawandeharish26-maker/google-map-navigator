import React from "react";
import "./propertyCard.css";

const PropertyCard = ({ title, subtitle, image }) => {
  return (
    <div className="card">
      <div className="arrow">→</div>

      <h2>{title}</h2>
      {subtitle && <p className="subtitle">{subtitle}</p>}

      <img src={image} alt="property" className="card-img" />
    </div>
  );
};

export default PropertyCard;