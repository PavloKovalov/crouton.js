'use strict';

jest.autoMockOff();

import Provider from '../src/provider.js';

describe('Provider external interface', () => {
  it('initialized properly', () => {
    expect(typeof Provider).toBe('object');
  });

  it('has get method', () => {
    expect(typeof Provider.get).toBe('function');
  });

  it('has invoke method', () => {
    expect(typeof Provider.invoke).toBe('function');
  });

  it('has directive method', () => {
    expect(typeof Provider.directive).toBe('function');
  });

  it('has controller method', () => {
    expect(typeof Provider.controller).toBe('function');
  });

  it('has service method', () => {
    expect(typeof Provider.service).toBe('function');
  });

  it('has annotate method', () => {
    expect(typeof Provider.annotate).toBe('function');
  });
});

describe('Provider', () => {
  it('register directive', () => {
    let directive = 'crouton-wat',
      fn = () => {};
    Provider.directive(directive, fn);

    expect(Provider.$$providers[directive+'Directive']).toBe(fn);
  });

  it('register controller', () => {
    let controllerName = 'Main',
      fn = () => {};
    Provider.controller(controllerName, fn);

    expect(Provider.$$providers[controllerName+'Controller']).toBe(fn);
  });

  it('register service', () => {
    let serviceName = 'wut',
      fn = () => {};
    Provider.service(serviceName, fn);

    expect(Provider.$$providers[serviceName]).toBe(fn);
  });
});

describe('Provider::annotate', () => {
  it('returns array of dependencies', () => {
    var fn = ($scope, $http, $dep1, $anotherDep) => {
      return [$scope, $http, $dep1, $anotherDep];
    };

    expect(Provider.annotate(fn)).toEqual(
      ['$scope', '$http', '$dep1', '$anotherDep']
    );
  });
});
