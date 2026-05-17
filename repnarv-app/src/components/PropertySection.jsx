import React from "react";
import PropertyCard from "./PropertyCard";
import sell from "../assets/sell.webp";
import rent1 from "../assets/rent1.webp";
import buyNew from "../assets/buyNew.jpg";
import resale from "../assets/resale.webp";

const PropertySection = () => {
  return (
    <div className="cards-container">
      <PropertyCard title="Sell Old Property" image={sell} />

      <PropertyCard
        title="Rent Property"
        subtitle="(New/Old)"
        image={rent1}
      />

      <PropertyCard title="Buy New Property" image={buyNew} />

      <PropertyCard title="Buy Resale Property" image={resale} />
    </div>
  );
};

export default PropertySection; 