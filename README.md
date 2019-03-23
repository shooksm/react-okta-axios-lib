# React Okta Axios Utility Library

> Utility components to help integrate @okta/okta-react and Axios

## Installation

```bash
$ npm install react-okta-axios-lib
```

## Example

```javascript
// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Security, SecureRoute, ImplicitCallback } from '@okta/okta-react';
import { SetupAxios } from 'react-okta-axios-lib';
import Home from './Home';
import Protected from './Protected';

class App extends React.Component {
  render() {
    return (
      <Router>
        <Security issuer='https://{yourOktaDomain}.com/oauth2/default'
                  client_id='{clientId}'
                  redirect_uri={window.location.origin + '/implicit/callback'} >
          <SetupAxios>
            <Route path='/' exact={true} component={Home}/>
            <SecureRoute path='/protected' component={Protected}/>
            <Route path='/implicit/callback' component={ImplicitCallback} />
          </SetupAxios>
        </Security>
      </Router>
    );
  }
}

export default App;
```
