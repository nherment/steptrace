
StepTrace
=========

StepTrace is a node.js library that allows you to register expected steps, put a timeout and acknowledge them.
You get notified when one of the steps times out and can take appropriate action.

One of the use cases is if you have multiple asynchronous actions that need to be taken one after the other but you need
to know if one of the steps takes longer than expected. You can delegate the timeout verifications to StepTrace.
StepTrace will tell you what step failed.


Examples
========


    var st = new StepTrace()

    st.step('step1', 1000, function() {
      // step 1 was not acknowledged before the 1000ms timeout
    })

    // a step needs to be acknowledged before it times out or the callback will be invoked
    st.step('step2', 1000, function() {
      // this will never be called because step2 is acknowledged before the timeout expires.
    })
    st.acknowledge('step2');

    // steps names are unique and you can overwrite an existing step
    st.step('step3', 1000, function() {
      // this will never be called because step3 is overwritten before it times out
    })

    st.step('step3', 2000, function() {
      // this will be called after 2 seconds.
    })

    [...]

    // cancel all the timeouts and flag the unacknowledged steps as 'cancelled'
    st.cancelAll()

    // the callback for an individual step is optional
    st.step('step4', 3000)

    // as you can rely on a global timeout listener
    st.on('timeout', function(stepName, timeout) {
      // this will be executed whenever a step times out
    })