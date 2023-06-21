const EVENT_TYPES = {
  CROSSHAIR_SAVE: 'CROSSHAIR_SAVE',
  CROSSHAIR_SELECT: 'CROSSHAIR_SELECT',
  CROSSHAIR_SHARE: 'CROSSHAIR_SHARE'
};

function sendEvent(eventType, content) {
    const { DataStore } = require('../DataStore');
    const { v4 } = require('uuid');
    const axios = require('axios');

    const eventId = v4(); 
    const uuid =  DataStore.getStore().get("uuid");

    console.log("Sending event", eventType, content);
    const messageToSend = {
        uuid,
        eventId,
        eventType,
    }

    if (content) {
        messageToSend.content = content
    }

    axios.post('https://die76f8a25.execute-api.us-east-1.amazonaws.com/crosshairXUserTriggeredEvents', messageToSend)
      .then(function (response) {
        console.log("Successfully sent event", eventType);
        console.log(response.data);
      })
      .catch(function (error) {
        console.log("Error with sending event", error);
      });
}

exports.sendEvent = sendEvent;
exports.eventTypes = EVENT_TYPES;