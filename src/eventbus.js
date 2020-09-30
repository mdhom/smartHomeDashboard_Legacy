/**
 *  Create an Event Bus object which has the registration and publishing API.
 *  addEventListener and emitEventListeners functions 
 *  lets the subscriber and publisher to subscribe and publish on events respectively.
 */

function EventBus() {
    var eventTopics = {};

    this.addEventListener = function(eventName, listener) {
        if (!eventTopics[eventName] || eventTopics[eventName].length < 1) {
            eventTopics[eventName] = [];
        }
        eventTopics[eventName].push(listener);
    };

    this.emitEventListeners = function(eventName, params) {
        if (!eventTopics[eventName] || eventTopics[eventName].length < 1)
            return;
        eventTopics[eventName].forEach(function(listener) {
            listener(!!params ? params : {});
        });
    }

    this.removeListener = function(eventName, listener) {
        if (!eventTopics[eventName] || eventTopics[eventName].length < 1)
            return;
        // delete listener by event name
        delete eventTopics[eventName];
    };

    this.getListener = function(eventName){
        return eventTopics[eventName];
    }
} //END EventBus