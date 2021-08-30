import React from 'react'


const LoadCandidates = ({candidates}) => {
  return (
    <ul className="list-group list-group-flush">
      { candidates.map((candidate, key) => {
        return(
          <li className="list-group-item" key={key}>
            <label>
              <span>{candidate.candidateId}</span>{"."}
              <strong>{candidate.name}</strong>
            </label>
          </li>
        )
      })}
    </ul>
  )
}
export default LoadCandidates