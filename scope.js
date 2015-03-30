class Scope {

	constructor() {
		this.$$watchers = [];
	}

	$watch(watchFn, listenerFn) {
		var watch = {
			watchFn: watchFn,
			listenerFn: listenerFn || function() {}
		};

		this.$$watchers.push(watch);
	}

	$digest() {
		this.$$watchers.forEach((watch) => {
			var newValue = watch.watchFn(this);

			if (newValue !== watch.last) {
				watch.listenerFn(newValue, watch.last, this);
				watch.last = newValue;
			}

		});
	}
}
