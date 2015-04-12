'use strict';

import _ from 'lodash';

function initWatchValue() { }

class Scope {

    constructor() {
        this.$$watchers = [];
    		this.$$asyncQueue = [];
    		this.$$postDigestQueue = [];
    		this.$$phase = null;
    		this.$$lastDirtyWatch = null;
    }

	$beginPhase(phase) {
		if (this.$$phase) {
			throw `${this.$$phase} already in progress.`;
		}
		this.$$phase = phase;
	}

	$clearPhase() {
		this.$$phase = null;
	}

    $watch(watchFn, listenerFn, valueEq) {
        var watch = {
            watchFn: watchFn,
            listenerFn: listenerFn || function() {},
			last: initWatchValue,
			valueEq: !!valueEq
        };

        this.$$watchers.push(watch);

		this.$$lastDirtyWatch = null;

		return () => {
			var index = this.$$watchers.indexOf(watch);
			if (index >= 0) {
				this.$$watchers.splice(index, 1);
			}
		};
    }

    $digestOnce() {
		var dirty = false;

        _.forEach(this.$$watchers, (watch) => {
			try {
	            var newValue = watch.watchFn(this),
					oldValue = watch.last;

	            if (!this.$$areEqual(newValue, oldValue, watch.valueEq)) {
					this.$$lastDirtyWatch = watch;

					if (watch.valueEq) {
						watch.last = _.cloneDeep(newValue);
					} else {
						watch.last = newValue;
					}

					watch.listenerFn(newValue, oldValue, this);

					dirty = true;
	            } else if (this.$$lastDirtyWatch === watch) {
					return false;
				}
			} catch (e) {
				(console.error || console.log)(e);
			}
        });

		return dirty;
    }

	$digest() {
		var ttl = 10,
			dirty;

		this.$$lastDirtyWatch = null;

		this.$beginPhase('$digest');

		do {
			while (this.$$asyncQueue.length) {
				try {
					var asyncTask = this.$$asyncQueue.shift();
					asyncTask.scope.$eval(asyncTask.expression);
				} catch (e) {
					(console.error || console.log)(e);
				}
			}

			dirty = this.$digestOnce();

			if ((dirty || this.$$asyncQueue.length) && !(ttl--)) {
				this.$clearPhase();

				throw '10 digest iterations reached';
			}
		} while (dirty || this.$$asyncQueue.length);

		this.$clearPhase();

		while (this.$$postDigestQueue.length) {
			try {
				this.$$postDigestQueue.shift()();
			} catch (e) {
				(console.error || console.log)(e);
			}
		}
	}

	$$areEqual(newValue, oldValue, valueEq) {
		if (valueEq) {
			return _.isEqual(newValue, oldValue);
		} else {
			return newValue === oldValue ||
				(typeof newValue === 'number' && typeof oldValue === 'number' &&
				isNaN(newValue) && isNaN(oldValue));
		}
	}

	$eval(expr, locals) {
		return expr(this, locals);
	}

	$apply(expr) {
		try {
			this.$beginPhase('$apply');
			return this.$eval(expr);
		} finally {
			this.$clearPhase();
			this.$digest();
		}
	}

	$evalAsync(expr) {
		if (!this.$$phase && !this.$$asyncQueue.length) {
			setTimeout(() => {
				if (this.$$asyncQueue.length) {
					this.$digest();
				}
			}, 0);
		}

		this.$$asyncQueue.push({
			scope: this,
			expression: expr
		});
	}

	$$postDigest(fn) {
		this.$$postDigestQueue.push(fn);
	}
}

export default Scope;
