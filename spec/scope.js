'use strict';

jest.autoMockOff();

import Scope from '../src/scope.js';

describe('Scope', () => {

    it('has $watch method', () => {
        expect(typeof Scope.prototype.$watch).toBe('function');
    });

    it('has $digest method', () => {
        expect(typeof Scope.prototype.$digest).toBe('function');
    });

    it('initialized properly', () => {
        var scope = new Scope();

        expect(typeof scope).toBe('object');
        expect(scope.$$watchers).toEqual(jasmine.any(Array));
        expect(scope.$$asyncQueue).toEqual(jasmine.any(Array));
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

        it('compares properly', () => {
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
    });

});