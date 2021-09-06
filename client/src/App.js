import React  from 'react'
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from './Components/Home/Home';
import AddCandidate from './Components/Admin/AddCandidate/AddCandidate';
import Voting from './Components/Voting/Voting';
import Result from './Components/Result/Result';
import AddAdmin from './Components/Admin/AddAdmin/AddAdmin'
import Registration from './Components/Registration/Registration'
import Verification from './Components/Admin/Verification/Verification'

import NotFound from './Components/NotFound';

function App() {
  return (
    <div className="App">
      <Router basename={process.env.PUBLIC_URL}>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/AddCandidate" component={AddCandidate} />
          <Route exact path="/Voting" component={Voting} />
          <Route exact path="/Result" component={Result} />
          <Route exact path="/AddAdmin" component={AddAdmin} />
          <Route exact path="/Registration" component={Registration} />
          <Route exact path="/Verification" component={Verification} />
          <Route exact path="*" component={NotFound} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
