'use strict';

const DIRECTIVE_SUFFIX = 'Directive';

const CONTROLLER_SUFFIX = 'Controller';

const FUNCTION_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;

const FUNCTION_ARGS_SPLIT = ',';

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

class Provider {

  constructor() {
    this.$$providers = {};
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
   * @param fn
   * @returns {Array}
   */
  annotate(fn) {
    var $inject = [],
      deps = fn.toString();

    deps = deps.replace(STRIP_COMMENTS, '').match(FUNCTION_ARGS);

    if (deps && (deps = deps[1])) {
      deps.split(FUNCTION_ARGS_SPLIT).forEach((dep) => {
        $inject.push(dep.trim());
      });
    }

    return $inject;
  }

  /**
   * Register provider
   * @param name
   * @param factory
   */
  $$register(name, factory) {
    this.$$providers[name] = factory;
  }

}

export default new Provider();
