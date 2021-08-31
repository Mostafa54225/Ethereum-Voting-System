import React from "react";
import { Link } from "react-router-dom";

const StartEnd = ({start, end, endElection}) => {
  const btn = {
    display: "block",
    padding: "21px",
    margin: "7px",
    minWidth: "max-content",
    textAlign: "center",
    width: "333px",
    alignSelf: "center",
  };
  return (
    <div
      className="container-main"
      style={{ borderTop: "1px solid", marginTop: "0px" }}
    >
      {!start ? (
        <>
          {/* edit here to display start election Again button */}
          {!end ? (
            <>
              <div
                className="container-item attention "
                style={{ display: "block" }}
              >
                <h2>Do not forget to add candidates.</h2>
                <p>
                  Go to{" "}
                  <Link
                    title="Add a new "
                    to="/AddCandidate"
                    style={{
                      color: "black",
                      textDecoration: "underline",
                    }}
                  >
                    add candidates
                  </Link>{" "}
                  page.
                </p>
              </div>
              <div className="container-item">
                <button type="submit" style={btn}>
                  Start Election {end ? "Again" : null}
                </button>
              </div>
            </>
          ) : (
            <div className="container-item">
              <center>
                <p>Re-deploy the contract to start election again.</p>
              </center>
            </div>
          )}
          {end ? (
            <div className="container-item">
              <center>
                <p>The election ended.</p>
              </center>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="container-item">
            <center>
              <p>The election started.</p>
            </center>
          </div>
          <div className="container-item">
            <button
              type="button"
              onClick={endElection}
              style={btn}
              className="d-flex justify-content-center"
            >
              End
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StartEnd;