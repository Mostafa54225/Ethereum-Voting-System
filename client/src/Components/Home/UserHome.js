import React from "react";

const UserHome = ({electionDetails}) => {
  return (
    <div>
      <div className="container-main">
        <div className="container-list title">
          <h1>{electionDetails.electionTitle}</h1>
          <br />
          <table style={{ marginTop: "21px" }}>
            <tr>
              <th>admin</th>
              <td>
                {electionDetails.adminName}
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserHome;