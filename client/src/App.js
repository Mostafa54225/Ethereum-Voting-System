import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Home from './Components/Home/Home';
import AddCandidate from './Components/Admin/AddCandidate/AddCandidate';
import Voting from './Components/Voting/Voting';
import Result from './Components/Result/Result';
function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/AddCandidate" component={AddCandidate} />
          <Route exact path="/Voting" component={Voting} />
          <Route exact path="/Result" component={Result} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
