import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const picture = props => {
  return (
    <div
      src={`https://ipfs.infura.io/ipfs/${props.picture}`}
      alt="picture of Instrument"
      className="card-img-top mx-auto display-block"
      style={{
        width: 250,
        alignItems: "center"
      }}
    />
  );
};

export default picture;
