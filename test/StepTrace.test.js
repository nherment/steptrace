
var StepTrace = require('../StepTrace.js');

var assert = require('assert');

describe('StepTrace', function() {


  it('a local timeout should fire when the step expires', function(done) {
    var st = new StepTrace();

    var start = Date.now();

    st.step('step1', 100, function() {

      assert.ok(Date.now() >= (start + 100), 'the first timeout fired too early')

      start = Date.now();
      st.step('step2', 200, function() {
        assert.ok(Date.now() >= (start + 200), 'the second timeout fired too early')


        var steps = st.steps();

        assert.equal(steps.length, 2);
        assert.equal(steps[0].name, 'step1');
        assert.ok(steps[0].timedOut);
        assert.equal(steps[1].name, 'step2');
        assert.ok(steps[1].timedOut);

        done();
      })

    });

  });

  it('acknowledged steps should not timeout', function(done) {
    var st = new StepTrace();

    setTimeout(function() {
      var steps = st.steps();

      assert.equal(steps.length, 2);

      for(var i = 0 ; i < steps.length ; i++) {
        assert.ok(steps[i], 'missing step [' + i + ']');
        assert.ok(steps[i].acknowledged, 'step [' + i + '] should be flagged as acknowledged');
      }
      done();
    }, 300);

    st.step('step1', 100, function() {
      assert.fail('step1 should not have timed out because it was acknowledged');
    });
    st.step('step2', 200, function() {
      assert.fail('step2 should not have timed out because it was acknowledged');
    });

    setTimeout(function() {
      st.acknowledge('step1')
    }, 50);
    setTimeout(function() {
      st.acknowledge('step2')
    }, 150);

  });

  it('cancelAll should cancel all steps', function(done) {
    var st = new StepTrace();

    setTimeout(function() {
      var steps = st.steps();
      for(var i = 0 ; i < steps.length ; i++) {
        assert.ok(steps[i], 'missing step [' + i + ']');
        assert.ok(steps[i].cancelled, 'step [' + i + '] should be flagged as cancelled');
      }
      done();
    }, 300);

    st.step('step1', 100, function() {
      assert.fail('step1 should not have timed out because it was acknowledged');
    });
    st.step('step2', 200, function() {
      assert.fail('step2 should not have timed out because it was acknowledged');
    });

    setTimeout(function() {
      st.cancelAll();
    }, 50);

  });

  it('a global listener should be invoked when a step times out', function(done) {
    var st = new StepTrace();

    var start = Date.now();
    st.on('timeout', function(step, timeout) {

      assert.ok(Date.now() >= (start + 100), 'step 1 timed out too early');

      assert.equal(step, 'step1');
      assert.equal(timeout, 100);

      done();
    });

    st.step('step1', 100);

  });

});
