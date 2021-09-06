import React from 'react'
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <>
      <h1>404 NOT FOUND!</h1>
      <center>
        <p>
          The page your are looking for doesn't exist.
          <br />
          Go to{" "}
          <Link
            to={process.env.PUBLIC_URL + "/"}
            style={{ color: "black", textDecoration: "underline" }}
          >
            Home
          </Link>
        </p>
      </center>
    </>
  );
}

export default NotFound