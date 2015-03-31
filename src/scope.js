'use strict';

import _ from 'lodash';

class Scope {

    constructor() {
        this.$$watchers = [];
		this.$$asyncQueue = [];
    }

    $watch(watchFn, listenerFn, valueEq) {
        var watch = {
            watchFn: watchFn,
            listenerFn: listenerFn || function() {},
			valueEq: !!valueEq
        };

        this.$$watchers.push(watch);
    }

    $digestOnce() {
		var dirty = false;

        this.$$watchers.forEach((watch) => {
            var newValue = watch.watchFn(this),
				oldValue = watch.last;

            if (!this.$$areEqual(newValue, oldValue, watch.valueEq)) {
                watch.listenerFn(newValue, oldValue, this);

				if (watch.valueEq) {
					watch.last = _.cloneDeep(newValue);
				} else {
					watch.last = newValue;
				}

				dirty = true;
            }

        });

		return dirty;
    }

	$digest() {
		var ttl = 10,
			dirty;

		do {
			while (this.$$asyncQueue.length) {
				var asyncTask = this.$$asyncQueue.shift();
				this.$eval(asyncTask.expression);
			}

			dirty = this.$digestOnce();

			if (dirty && !(ttl--)) {
				throw '10 digest iterations reached';
			}
		} while (dirty);
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
			return this.$eval(expr);
		} finally {
			this.$digest();
		}
	}

	$evalAsync(expr) {
		this.$$asyncQueue.push({
			scope: this,
			expression: expr
		});
	}
}

export default Scope;
