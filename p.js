;(function(factory) {

  if (typeof module !== 'undefined' && module && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    Pinky = factory();
  }

})(function() {

  var PENDING = -1
    , FULFILLED = 0
    , REJECTED = 1;

  function Pinky() {
    this.state = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.callbacks = [];

    this.executeFulfiled = this.executeFulfiled.bind(this);
    this.executeRejected = this.executeRejected.bind(this);
    this.fulfill = this.fulfill.bind(this);
    this.reject = this.reject.bind(this);

    this.thenable = this.promise = { then: this.then };
  }

  Pinky.prototype.then = function then(onFulfilled, onRejected) {
    var deferred = new Pinky();

    var value = this.value;
    var reason = this.reason;

    switch (this.state) {
      case PENDING:
        // store callbacks for later execution
        this.storeCallbacks(onFulfilled, onRejected, deferred);
        break;

      case FULFILLED:
        // promise is already fulfilled, execute this callback next
        if (typeof onFulfilled === 'function') {
          doNext(function() {
            executeCallback(onFulfilled, deferred, value);
          });
        } else {
          deferred.fulfill(value);
        }
        break;

      case REJECTED:
        // promise is already rejected, execute this callback next
        if (typeof onRejected === 'function') {
          doNext(function() {
            executeCallback(onRejected, deferred, reason);
          });
        } else {
          deferred.reject(reason);
        }
        break;
    }

    return deferred.thenable;
  };

  Pinky.prototype.storeCallbacks = function(onFulfilled, onRejected, deferred) {
    this.callbacks.push({
      deferred: deferred,
      onFulfilled: onFulfilled,
      onRejected: onRejected
    });
  };

  Pinky.prototype.fulfill = function(value) {
    if (this.state !== PENDING) return;

    // execute callbacks with value
    this.state = FULFILLED;
    this.value = value;
    this.executeCallbacks(true);
  };

  Pinky.prototype.reject = function(reason) {
    if (this.state !== PENDING) return;

    this.state = REJECTED;
    this.reason = reason;
    this.executeCallbacks(false);
  };

  Pinky.prototype.executeCallbacks = function(isFulfilled) {
    var callbacks = this.callbacks;

    this.callbacks = null;

    callbacks.forEach(isFulfilled ? this.executeFulfiled : this.executeRejected);
  };

  Pinky.prototype.executeFulfiled = function(cbo) {
    if (typeof cbo.onFulfilled === 'function') {
      executeCallback(cbo.onFulfilled, cbo.deferred, this.value);
    } else {
      cbo.deferred.fulfill(this.value);
    }
  };

  Pinky.prototype.executeRejected = function(cbo) {
    if (typeof cbo.onRejected === 'function') {
      executeCallback(cbo.onRejected, cbo.deferred, this.reason);
    } else {
      cbo.deferred.reject(this.reason);
    }
  };

  // utility functions
  function doNext(fn) {
    return setTimeout(fn, 0);
  }

  function executeCallback(cb, deferred, value) {
    try {
      var result = cb(value);

      if (result && typeof result.then === 'function') {
        // if result is a promise defer to when promise is fulfilled
        result.then(function(result) {
          deferred.fulfill(result);
        }, function(reason) {
          deferred.reject(reason);
        });
      } else {
        deferred.fulfill(result);
      }
    } catch (er) {
      deferred.reject(er);
    }
  }

  return Pinky;

});