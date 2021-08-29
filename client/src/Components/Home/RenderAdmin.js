import React from 'react'
import { useForm } from "react-hook-form";
import ElectionStatus from '../ElectionStatus'

import './Home.css'
import StartEnd from './StartEnd';

const RenderAdmin = ({ registerElection, start, end, endElection }) => {
  const EMsg = (props) => {
    return <span style={{ color: "tomato" }}>{props.msg}</span>;
  };
  const {
    handleSubmit,
    register,
    formState: {errors}
  } = useForm()
  
  const onSubmit = (data) => {
    registerElection(data)
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {!start & !end ? (
          <div className="container-main">
            {/* about-admin */}
            <div className="about-admin">
              <h3>About Admin</h3>
              <div className="container-item center-items">
                <div>
                  <label className="label-home">
                    Full Name{" "}
                    {errors.adminName && <EMsg msg="*required" />}
                    <input
                      className="input-home"
                      type="text"
                      placeholder="First Name"
                      {...register("adminName", {
                        required: true,
                      })}
                    />
                  </label>
                </div>
              </div>
            </div>
            {/* about-election */}
            <div className="about-election">
              <h3>About Election</h3>
              <div className="container-item center-items">
                <div>
                  <label className="label-home">
                    Election Title{" "}
                    {errors.electionTitle && <EMsg msg="*required" />}
                    <input
                      className="input-home"
                      type="text"
                      placeholder="eg. School Election"
                      {...register("electionTitle", {
                        required: true,
                      })}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <StartEnd 
          start={start}
          end={end}
          endElection={endElection}
        />
        <ElectionStatus
          Started={start}
          Ended={end}
        />
      </form>
    </div>
  )
}

export default RenderAdmin