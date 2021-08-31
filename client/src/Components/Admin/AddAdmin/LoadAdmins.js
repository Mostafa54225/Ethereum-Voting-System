import React from 'react'


const LoadCandidates = ({admins}) => {
  return (
    <ul className="list-group list-group-flush">
      { admins.map((admin, key) => {
        return(
          <li className="list-group-item" key={key}>
            <label>
              <strong>{admin.name}</strong>
            </label>
          </li>
        )
      })}
    </ul>
  )
}
export default LoadCandidates