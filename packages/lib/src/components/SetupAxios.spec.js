import React from 'react';
import { mount, shallow } from 'enzyme';
import { UndecoratedSetupAxios as SetupAxios } from './SetupAxios';

const props = {
  auth: {
    handleAuthentication: jest.fn(),
    isAuthenticated: jest.fn(),
    getUser: jest.fn(),
    getIdToken: jest.fn(),
    getAccessToken: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    redirect: jest.fn(),
  },
};

describe('<SetupAxios />', () => {
  afterEach(() => {
    Object.keys(props.auth).forEach(key => props.auth[key].mockReset());
  });

  it('should render without throwing', () => {
    expect(() =>
      mount(
        <SetupAxios {...props}>
          <div />
        </SetupAxios>
      )
    ).not.toThrow();
  });

  describe('requestInterceptorSuccessHandler()', () => {
    it('should logout when the token is undefined', () => {
      props.auth.getAccessToken.mockImplementation(() => undefined);
      expect(props.auth.logout).not.toHaveBeenCalled();
      const setupAxios = shallow(
        <SetupAxios {...props}>
          <div />
        </SetupAxios>
      );
      const config = setupAxios
        .instance()
        .requestInterceptorSuccessHandler({ test: 'test' });
      expect(config).toMatchObject({ test: 'test' });
      expect(props.auth.logout).toHaveBeenCalled();
    });

    it('should append the Authorization Header when the token is still valid', () => {
      props.auth.getAccessToken.mockImplementation(() => 'GOOD_TOKEN');
      const setupAxios = shallow(
        <SetupAxios {...props}>
          <div />
        </SetupAxios>
      );
      const config = setupAxios
        .instance()
        .requestInterceptorSuccessHandler({ test: 'test' });
      expect(config).toMatchObject({
        test: 'test',
        headers: { Authorization: 'Bearer GOOD_TOKEN' },
      });
    });

    it('should allow a user to define a custom request handler', () => {
      const customRequestInterceptorHandler = config => ({
        ...config,
        custom: 'config',
      });
      props.auth.getAccessToken.mockImplementation(() => 'GOOD_TOKEN');
      const setupAxios = shallow(
        <SetupAxios
          {...props}
          requestInterceptorHandler={customRequestInterceptorHandler}
        >
          <div />
        </SetupAxios>
      );
      const config = setupAxios
        .instance()
        .requestInterceptorSuccessHandler({ test: 'test' });
      expect(config).toMatchObject({
        test: 'test',
        headers: { Authorization: 'Bearer GOOD_TOKEN' },
        custom: 'config',
      });
    });
  });

  describe('requestInterceptorErrorHandler()', () => {
    it('should return a rejected promise with the error', () => {
      expect.assertions(1);
      const setupAxios = shallow(
        <SetupAxios {...props}>
          <div />
        </SetupAxios>
      );
      return expect(
        setupAxios
          .instance()
          .requestInterceptorErrorHandler(new Error('Error!!'))
      ).rejects.toEqual(new Error('Error!!'));
    });

    it('should allow a user to define a custom request error handler', () => {
      expect.assertions(1);
      const customRequestInterceptorErrorHandler = error =>
        Promise.reject(new Error(`Custom ${error.message}`));
      const setupAxios = shallow(
        <SetupAxios
          {...props}
          requestInterceptorErrorHandler={customRequestInterceptorErrorHandler}
        >
          <div />
        </SetupAxios>
      );
      return expect(
        setupAxios
          .instance()
          .requestInterceptorErrorHandler(new Error('Error!!'))
      ).rejects.toEqual(new Error('Custom Error!!'));
    });
  });

  describe('responseInterceptorSuccessHandler()', () => {
    it('should return the response unmodified', () => {
      const response = { test: 'test' };
      const setupAxios = shallow(
        <SetupAxios {...props}>
          <div />
        </SetupAxios>
      );
      expect(
        setupAxios.instance().responseInterceptorSuccessHandler(response)
      ).toMatchObject(response);
    });

    it('should allow a user to define a custom response success handler', () => {
      const response = { test: 'test' };
      const customResponseInterceptorSuccessHandler = response => ({
        ...response,
        custom: true,
      });
      const setupAxios = shallow(
        <SetupAxios
          {...props}
          responseInterceptorSuccessHandler={
            customResponseInterceptorSuccessHandler
          }
        >
          <div />
        </SetupAxios>
      );
      expect(
        setupAxios.instance().responseInterceptorSuccessHandler(response)
      ).toMatchObject({ ...response, custom: true });
    });
  });

  describe('responseInterceptorErrorHandler()', () => {
    it('should call logout when the error response status is 401', done => {
      expect.assertions(3);
      const error = { response: { status: 401 } };
      const setupAxios = shallow(
        <SetupAxios {...props}>
          <div />
        </SetupAxios>
      );
      expect(props.auth.logout).not.toHaveBeenCalled();
      setupAxios
        .instance()
        .responseInterceptorErrorHandler(error)
        .catch(error => {
          expect(error).toMatchObject(error);
          expect(props.auth.logout).toHaveBeenCalled();
          done();
        });
    });

    it('should skip calling logout when the error response status is not an authentication error', done => {
      expect.assertions(3);
      const error = { response: { status: 403 } };
      const setupAxios = shallow(
        <SetupAxios {...props}>
          <div />
        </SetupAxios>
      );
      expect(props.auth.logout).not.toHaveBeenCalled();
      setupAxios
        .instance()
        .responseInterceptorErrorHandler(error)
        .catch(error => {
          expect(error).toMatchObject(error);
          expect(props.auth.logout).not.toHaveBeenCalled();
          done();
        });
    });

    it('should allow a user to define a custom response error handler', done => {
      expect.assertions(2);
      const customErrorHandlerSpy = jest.fn();
      const customResponseInterceptorErrorHandler = error => {
        customErrorHandlerSpy(error.response.status);
        return Promise.reject(error);
      };
      const error = { response: { status: 403 } };
      const setupAxios = shallow(
        <SetupAxios
          {...props}
          responseInterceptorErrorHandler={
            customResponseInterceptorErrorHandler
          }
        >
          <div />
        </SetupAxios>
      );
      setupAxios
        .instance()
        .responseInterceptorErrorHandler(error)
        .catch(error => {
          expect(error).toMatchObject(error);
          expect(customErrorHandlerSpy).toHaveBeenCalledWith(403);
          done();
        });
    });
  });
});
