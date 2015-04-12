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
