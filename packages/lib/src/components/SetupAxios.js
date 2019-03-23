import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { withAuth } from '@okta/okta-react';
import get from 'lodash/get';

export class UndecoratedSetupAxios extends React.Component {
  static propTypes = {
    auth: PropTypes.shape({
      getAccessToken: PropTypes.func.isRequired,
      logout: PropTypes.func.isRequired,
    }).isRequired,
    children: PropTypes.element.isRequired,
    requestInterceptorHandler: PropTypes.func,
    requestInterceptorErrorHandler: PropTypes.func,
    responseInterceptorSuccessHandler: PropTypes.func,
    responseInterceptorErrorHandler: PropTypes.func,
  };

  static defaultProps = {
    requestInterceptorHandler: config => config,
    requestInterceptorErrorHandler: error => Promise.reject(error),
    responseInterceptorSuccessHandler: response => response,
    responseInterceptorErrorHandler: error => Promise.reject(error),
  };

  componentDidMount() {
    axios.interceptors.request.use(
      this.requestInterceptorSuccessHandler,
      this.requestInterceptorErrorHandler
    );
    axios.interceptors.response.use(
      this.responseInterceptorSuccessHandler,
      this.responseInterceptorErrorHandler
    );
  }

  requestInterceptorSuccessHandler = config => {
    const token = this.props.auth.getAccessToken();
    // If not able to retrieve a token, send the user back to login
    if (typeof token === 'undefined') {
      this.props.auth.logout();
      return config;
    }
    // Process the user supplied requestInterceptorHandler
    const newConfig = this.props.requestInterceptorHandler(config);
    // Return the config with the token appended to the Authorization Header
    return {
      ...newConfig,
      headers: {
        ...get(newConfig, 'headers', {}),
        Authorization: `Bearer ${token}`,
      },
    };
  };

  requestInterceptorErrorHandler = error =>
    this.props.requestInterceptorErrorHandler(error);

  responseInterceptorSuccessHandler = response =>
    this.props.responseInterceptorSuccessHandler(response);

  responseInterceptorErrorHandler = error => {
    if (get(error, 'response.status') === 401) {
      this.props.auth.logout();
    }
    return this.props.responseInterceptorErrorHandler(error);
  };

  render() {
    return React.Children.only(this.props.children);
  }
}

UndecoratedSetupAxios.displayName = 'SetupAxios';

export default withAuth(UndecoratedSetupAxios);
