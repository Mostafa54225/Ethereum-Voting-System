import React from "react";

const UserHome = ({electionDetails}) => {
  return (
    <div>
      <div className="container-main">
        <div className="container-list title">
          <h1 className="text-center" style={{marginTop: '1em'}}>{electionDetails.electionTitle}</h1>
          <br />
          <table style={{ marginTop: "21px" }}>
            <tr>
              <th>admin</th>
              <td>
                {electionDetails.elDetails}
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserHome;