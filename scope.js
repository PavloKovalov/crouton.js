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

    $digestOnce() {
		var dirty = false;

        this.$$watchers.forEach((watch) => {
            var newValue = watch.watchFn(this);

            if (newValue !== watch.last) {
                watch.listenerFn(newValue, watch.last, this);
                watch.last = newValue;

				dirty = true;
            }

        });

		return dirty;
    }

	$digest() {
		var ttl = 10,
			dirty;

		do {
			dirty = this.$digestOnce();
			
			if (dirty && !(ttl--)) {
				throw '10 digest iterations reached';
			}
		} while (dirty);
	}
}
