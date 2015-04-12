'use strict';

const DIRECTIVE_SUFFIX = 'Directive';

const CONTROLLER_SUFFIX = 'Controller';

class Provider {

  constructor() {
    this.$$providers  = {};
  }

  /**
   * Return service by name
   */
  get(name, locals) {

  }

  /**
   * Initialize service
   */
  invoke(fn, locals) {

  }

  /**
   * Register directive
   */
  directive(name, fn) {
    this.$$register(name + DIRECTIVE_SUFFIX, fn);
  }

  /**
   * Register controller
   */
  controller(name, fn) {
    this.$$register(name + CONTROLLER_SUFFIX, fn);
  }

  /**
   * Register service
   */
  service(name, fn) {
    this.$$register(name, fn);
  }

  /**
   * Returns array of dependencies for given service
   */
  annotate(fn) {

  }

  $$register(name, factory) {
    this.$$providers[name] = factory;
  }

}

export default new Provider();
