'use strict';

jest.autoMockOff();

import Scope from '../src/scope.js';

describe('class Scope', () => {

    it('has $watch method', () => {
        expect(typeof Scope.prototype.$watch).toBe('function');
    });

    it('has $digest method', () => {
        expect(typeof Scope.prototype.$digest).toBe('function');
    });

    it('has $eval method', () => {
        expect(typeof Scope.prototype.$eval).toBe('function');
    });

    it('has $evalAsync method', () => {
        expect(typeof Scope.prototype.$evalAsync).toBe('function');
    });

    it('has $apply method', () => {
        expect(typeof Scope.prototype.$apply).toBe('function');
    });

    it('initialized properly', () => {
        var scope = new Scope();

        expect(typeof scope).toBe('object');
        expect(scope.$$watchers).toEqual(jasmine.any(Array));
        expect(scope.$$asyncQueue).toEqual(jasmine.any(Array));
        expect(scope.$$postDigestQueue).toEqual(jasmine.any(Array));
    });
});

describe('Scope', () => {
    var scope;

    beforeEach(() => {
        scope = new Scope();
    });

    describe('$watch', () => {
        it('executed in digest cycle', () => {
            // set initial scope variables
            scope.firstName = 'John';
            scope.counter = 0;

            // add watcher
            scope.$watch(
                (scope) => { return scope.firstName; },
                (newVal, oldVal, scope) => { scope.counter++; }
            );

            expect(scope.counter).toEqual(0);

            // run digest first time
            scope.$digest();
            // counter should be increased
            expect(scope.counter).toEqual(1);

            // run digest two times more
            scope.$digest();
            scope.$digest();
            // listener shouldn't be called
            expect(scope.counter).toEqual(1);

            // change watched value
            scope.firstName = 'Tony';
            // run digest
            scope.$digest();
            // listener should be called
            expect(scope.counter).toEqual(2);
        });

        it('removes watch', () => {
            scope.theValue = 'qweqwe';
            scope.counter = 0;

            var removeWatch = scope.$watch(
                (scope) => { return scope.theValue; },
                (newVal, oldVal, scope) => { scope.counter++; }
            );

            scope.$digest();
            expect(scope.counter).toEqual(1);

            scope.theValue = 'bazinga';
            scope.$digest();
            expect(scope.counter).toEqual(2);

            removeWatch();
            scope.theValue = 'gotcha!';
            scope.$digest();
            expect(scope.counter).toEqual(2);
        });
    });

    describe('$digest', () => {
        it('run until dirty', () => {
            scope.firstName = 'Groot';
            scope.counter = 0;

            // add first watch
            scope.$watch(
                (scope) => { return scope.counter; },
                (newVal, oldVal, scope) => {
                    scope.counterIsTwo = (newVal === 2);
                }
            );

            // add second watch
            scope.$watch(
                (scope) => { return scope.firstName; },
                (newVal, oldVal, scope) => { scope.counter++; }
            );

            //run digest
            scope.$digest();
            expect(scope.counter).toEqual(1);

            scope.firstName = 'John';
            scope.$digest();

            expect(scope.counter).toEqual(2);
            expect(scope.counterIsTwo).toEqual(true);
        });

        it('has limited cycles to run', () => {
            scope.counter1 = 0;
            scope.counter2 = 0;

            scope.$watch(
                (scope) => { return scope.counter1; },
                (newVal, oldVal, scope) => { scope.counter2++; }
            );

            scope.$watch(
                (scope) => { return scope.counter2; },
                (newVal, oldVal, scope) => { scope.counter1++; }
            );

            expect(scope.$digest).toThrow();
        });

        it('compares objects properly', () => {
            scope.counterByRef = 0;
            scope.counterByValue = 0;
            scope.value = [1, 2, {three: [4, 5]}];

            // add watch that checks by reference
            scope.$watch(
                (scope) => { return scope.value; },
                (newVal, oldVal, scope) => { scope.counterByRef++; }
            );

            //add watch that checks by value
            scope.$watch(
                (scope) => { return scope.value; },
                (newVal, oldVal, scope) => { scope.counterByValue++; },
                true // <== flag shows to compare by value
            );

            // run digest
            scope.$digest();
            expect(scope.counterByRef).toEqual(1);
            expect(scope.counterByValue).toEqual(1);

            // When changes are made within the value,
            // the by-reference watcher does not notice,
            // but the by-value watcher does.
            scope.value[2].three.push(6);
            scope.$digest();
            expect(scope.counterByRef).toEqual(1);
            expect(scope.counterByValue).toEqual(2);

            // Both watches notice when the reference changes.
            scope.value = {theNewest: 'value'};
            scope.$digest();
            expect(scope.counterByRef).toEqual(2);
            expect(scope.counterByValue).toEqual(3);

            delete scope.value;
            scope.$digest();
            expect(scope.counterByRef).toEqual(3);
            expect(scope.counterByValue).toEqual(4);
        });

        it('works with NaN', () => {
            scope.number = 0;
            scope.counter = 0;

            scope.$watch(
                (scope) => { return scope.number; },
                (newVal, oldVal, scope) => { scope.counter++; }
            );

            scope.$digest();
            expect(scope.counter).toEqual(1);

            // convert watched value to NaN
            scope.number = parseInt('WAT', 10);
            scope.$digest();
            expect(scope.counter).toEqual(2);
        });

        it('trigger after $apply executed', () => {
            var listenerFn = jasmine.createSpy('listenerFn');

            scope.$watch(
                (scope) => { return scope.theValue; },
                listenerFn
            );

            scope.$apply((scope) => {
                scope.theValue = 'Modified from "outer" world';
            });

            expect(listenerFn).toHaveBeenCalled();
        });

        it('execute expr from $evalAsync queue', () => {
            scope.asyncEvaled = false;

            scope.$watch(
                (scope) => { return scope.theValue; },
                (newVal, oldVal, scope) => {
                    scope.counter++;
                    scope.$evalAsync((scope) => {
                        scope.asyncEvaled = true;
                    });
                    expect(scope.asyncEvaled).toEqual(false);
                }
            );

            scope.theValue = '42';
            scope.$digest();

            expect(scope.asyncEvaled).toEqual(true);
        });

        it('executes $evalAsynced fn added by $watch', () => {
            scope.theValue = [1, 2, 3];
            scope.asyncEvaluated = false;

            scope.$watch(
                (scope) => {
                    if (!scope.asyncEvaluated) {
                        scope.$evalAsync(
                            (scope) => { scope.asyncEvaluated = true; }
                        );
                    }
                    return scope.theValue;
                },
                () => {}
            );

            scope.$digest();

            expect(scope.asyncEvaluated).toBe(true);
        });

        it('executes $evalAsynced fn even when not dirty', () => {
            scope.theValue = 'lol';
            scope.asyncEvaluatedTimes = 0;

            scope.$watch(
                (scope) => {
                    if (scope.asyncEvaluatedTimes < 2) {
                        scope.$evalAsync(
                            (scope) => {
                                scope.asyncEvaluatedTimes++;
                            }
                        );
                    }
                    return scope.theValue;
                },
                () => {}
            );

            scope.$digest();

            expect(scope.asyncEvaluatedTimes).toEqual(2);
        });

    });

    describe('phase', () => {
        it('initially set to null', () => {
            expect(scope.$$phase).toEqual(null);
        });

        it('has a $$phase field with current digest phase value', () => {
            scope.theValue = [1, 2, 3];
            scope.phaseInWatchFn = undefined;
            scope.phaseInListenerFn = undefined;
            scope.phaseInApplyFn = undefined;

            scope.$watch(
                (scope) => {
                    scope.phaseInWatchFn = scope.$$phase;
                    return scope.theValue;
                },
                (newVal, oldVal, scope) => {
                    scope.phaseInListenerFn = scope.$$phase;
                }
            );

            scope.$apply(
                (scope) => {
                    scope.phaseInApplyFn = scope.$$phase;
                }
            );

            expect(scope.phaseInWatchFn).toBe('$digest');
            expect(scope.phaseInListenerFn).toBe('$digest');
            expect(scope.phaseInApplyFn).toBe('$apply');
        });

        it('throw exception when phase is started', () => {
            scope.value = false;

            expect(scope.$$phase).toEqual(null);

            scope.$watch(
                (scope) => { return scope.value; },
                (newVal, oldVal, scope) => {
                    expect(scope.$$phase).toEqual('$digest');
                    scope.$beginPhase('$apply');
                }
            );

            expect(scope.$digest).toThrow();
        });

        it('set on $digest', () => {
            scope.value = false;

            expect(scope.$$phase).toEqual(null);

            scope.$watch(
                (scope) => { return scope.value; },
                (newVal, oldVal, scope) => {
                    expect(scope.$$phase).toEqual('$digest');
                }
            );

            scope.$digest();
            expect(scope.$$phase).toEqual(null);
        });

        it('set on $apply', () => {
            expect(scope.$$phase).toEqual(null);

            scope.$apply( (scope) => {
                expect(scope.$$phase).toEqual('$apply');
            } );

            expect(scope.$$phase).toEqual(null);
        });
    });

    describe('$$postDigest', () => {
        it('add to $$postDigestQueue', () => {
            var callback = jest.genMockFunction();

            expect(scope.$$postDigestQueue.length).toEqual(0);
            scope.$$postDigest(callback);
            expect(scope.$$postDigestQueue.length).toEqual(1);
        });

        it('executed in $digest final stage', () => {
            var callback = jest.genMockFunction();

            expect(scope.$$postDigestQueue.length).toEqual(0);
            scope.$$postDigest(callback);
            expect(scope.$$postDigestQueue.length).toEqual(1);
            expect(callback).not.toBeCalled();

            scope.$digest();

            expect(callback).toBeCalled();
            expect(scope.$$postDigestQueue.length).toEqual(0);
        });
    });

    describe('thrown exception', () => {
        it('cought for $$asyncQueue events', () => {
            var callback = () => {
                scope.$evalAsync(() => {
                    throw 'exception';
                });
            };

            expect(callback).not.toThrow();
        });

        it('cought properly', () => {
            scope.theValue = ['asd'];
            scope.counter = 0;

            scope.$watch(() => {
                throw 'Watch fail';
            });
            scope.$watch(
                (scope) => {
                    scope.$evalAsync(() => { throw 'Async fail'; });
                    return scope.theValue;
                },
                (newVal, oldVal, scope) => {
                    scope.counter++;
                }
            );


            expect(() => { scope.$digest(); }).toThrow();
            expect(scope.counter).toEqual(1);
        });
    });

});
