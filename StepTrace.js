var util = require("util");
var EventEmitter = require("events").EventEmitter;

function StepTrace() {
  this._steps = [];
  this._timeouts = {};

  EventEmitter.call(this);
}

util.inherits(StepTrace, EventEmitter);

StepTrace.prototype.step = function(name, timeout, timeoutCallback) {

  // override existing if any
  for(var i = this._steps.length-1 ; i >= 0 ; i--) {
    if(this._steps[i].name === name) {
      this._cancelTimeout(this._steps[i]);
      break;
    }
  }

  var step = {
    name: name,
    timeout: timeout,
    acknowledged: false
  };

  this._steps.push(step);

  var self = this;

  if(timeout) {
    this._timeouts[name] = setTimeout(function() {
      if(step.cancelled) {
        return;
      }

      if(!step.acknowledged) {
        self.emit('timeout', name, timeout);

        step.timedOut = true;

        if(timeoutCallback) {
          timeoutCallback();
        }
      }
    }, timeout);
  }

  return step;
};

StepTrace.prototype.acknowledge = function(name) {
  // potentially reduce the for loop by starting at the end of it
  // users are likely to ack the last step more often than an early one
  for(var i = this._steps.length-1 ; i >= 0 ; i--) {
    if(this._steps[i] && this._steps[i].name === name) {
      this._steps[i].acknowledged = true;
      this._cancelTimeout(this._steps[i]);
      return true;
    }
  }

  return false;
};

StepTrace.prototype._cancelTimeout = function(step) {
  if(this._timeouts[step.name]) {
    clearTimeout(this._timeouts[step.name])
    delete this._timeouts[step.name];
  }
  if(!step.acknowledged) { // only to prevent confusion when reading the steps
    step.cancelled = true;
  }
};


StepTrace.prototype.cancelAll = function() {
  for(var i = this._steps.length-1 ; i >= 0 ; i--) {
    if(this._steps[i]) {
      this._cancelTimeout(this._steps[i]);
    }
  }
};


StepTrace.prototype.steps = function() {
  return this._steps;
};

module.exports = StepTrace;
