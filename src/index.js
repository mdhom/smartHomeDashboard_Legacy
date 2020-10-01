/* jshint browser: true, esversion: 5, asi: true */
/*globals Vue, uibuilder */
// @ts-nocheck
/*
  Copyright (c) 2019 Julian Knight (Totally Information)

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
'use strict'

/** @see https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Front-End-Library---available-properties-and-methods */

const eventbus = new EventBus();
const rooms = { 
    data: function() {
        return {
            name: "Rooms",
            initiallyLoaded: false,
        }
    },
    props: {
        eventbus: Object,
    },
    created: function(){
        eventbus.emitEventListeners('action', `{ "type": "refresh", "page": "${name}" }`);
    },
    template: `
<div class="row">
  <!-- ROOMS -->
  <room-overview-component 
    :eventbus="eventbus" 
    name="Wohnzimmer"   
    netatmoname="netatmo/Wohnzimmer"
    iconname="livingroom"></room-overview-component>
  <room-overview-component 
    :eventbus="eventbus" 
    name="Schlafzimmer" 
    netatmoname="netatmo/Schlafzimmer"
    iconname="bedroom"></room-overview-component>
  <room-overview-component 
    :eventbus="eventbus" 
    name="Dachboden" 
    netatmoname="netatmo/Dachgeschoss"
    iconname="office"></room-overview-component>
  <room-overview-component 
    :eventbus="eventbus" 
    name="Küche"
    iconname="kitchen"
    netatmoname="Küche"></room-overview-component>
  <room-overview-component 
    :eventbus="eventbus" 
    name="Gang"
    iconname="diningroom" ></room-overview-component>
  <room-overview-component 
    :eventbus="eventbus" 
    name="Kinderzimmer"
    iconname="childrensroom"></room-overview-component>
</div>` }

const start = {
    data: function() {
        return {
            name: "Start",
            initiallyLoaded: false,
        }
    },
    props: {
        eventbus: Object,
    },
    created: function(){
        eventbus.emitEventListeners('action', `{ "type": "refresh", "page": "${name}" }`);
    },
    template: `<div class="row">
        <div class="col-md-6 col-sm-6 col-xs-12">
        <weather-component :eventbus="eventbus"></weather-component>
        </div>
        <div class="col-md-6 col-sm-6 col-xs-12">
        <calendar-component :eventbus="eventbus"></calendar-component>
        </div>
    </div>`
}

const routes = [
    { 
        path: '/',        
        name: 'Start', 
        component: start, 
        props: { 
            eventbus: eventbus 
        } 
    },
    { 
        path: '/rooms',   
        name: 'Rooms', 
        component: rooms, 
        props: { 
            eventbus: eventbus 
        } 
    }
]

const router = new VueRouter({
    routes // short for `routes: routes`
})

router.beforeEach((to, from, next) => {
    console.log(from.name + " -> " + to.name);

    eventbus.emitEventListeners('action', `{ "type": "navigation", "from": "${from.name}", "to": "${to.name}" }`);

    next();
});

// eslint-disable-next-line no-unused-vars
var depp1 = new Vue({
    el: '#depp',
    router,
    data: {
        startMsg    : 'Vue has started, waiting for messages',
        feVersion   : '',
        counterBtn  : 0,
        inputText   : null,
        inputChkBox : false,
        socketConnectedState : false,
        serverTimeOffset     : '[unknown]',
        imgProps             : { width: 75, height: 75 },

        msgRecvd    : '[Nothing]',
        msgsReceived: 0,
        msgCtrl     : '[Nothing]',
        msgsControl : 0,

        msgSent     : '[Nothing]',
        msgsSent    : 0,
        msgCtrlSent : '[Nothing]',
        msgsCtrlSent: 0,

        username:   'Max Dhom',
        eventbus:   eventbus,
        rooms:      [],
    }, // --- End of data --- //
    computed: {
        hLastRcvd: function() {
            var msgRecvd = this.msgRecvd
            if (typeof msgRecvd === 'string') return 'Last Message Received = ' + msgRecvd
            else return 'Last Message Received = ' + this.syntaxHighlight(msgRecvd)
        },
        hLastSent: function() {
            var msgSent = this.msgSent
            if (typeof msgSent === 'string') return 'Last Message Sent = ' + msgSent
            else return 'Last Message Sent = ' + this.syntaxHighlight(msgSent)
        },
        hLastCtrlRcvd: function() {
            var msgCtrl = this.msgCtrl
            if (typeof msgCtrl === 'string') return 'Last Control Message Received = ' + msgCtrl
            else return 'Last Control Message Received = ' + this.syntaxHighlight(msgCtrl)
        },
        hLastCtrlSent: function() {
            var msgCtrlSent = this.msgCtrlSent
            if (typeof msgCtrlSent === 'string') return 'Last Control Message Sent = ' + msgCtrlSent
            //else return 'Last Message Sent = ' + this.callMethod('syntaxHighlight', [msgCtrlSent])
            else return 'Last Control Message Sent = ' + this.syntaxHighlight(msgCtrlSent)
        },
    }, // --- End of computed --- //
    watch: {
    },
    methods: {
    }, // --- End of methods --- //
    updated: function(){
    },
    // Available hooks: init,mounted,updated,destroyed
    mounted: function(){
        //console.debug('[indexjs:Vue.mounted] app mounted - setting up uibuilder watchers')

        /** **REQUIRED** Start uibuilder comms with Node-RED @since v2.0.0-dev3
         * Pass the namespace and ioPath variables if hosting page is not in the instance root folder
         * The namespace is the "url" you put in uibuilder's configuration in the Editor.
         * e.g. If you get continual `uibuilderfe:ioSetup: SOCKET CONNECT ERROR` error messages.
         * e.g. uibuilder.start('uib', '/nr/uibuilder/vendor/socket.io') // change to use your paths/names
         */
        uibuilder.start()

        var vueApp = this

        // Example of retrieving data from uibuilder
        vueApp.feVersion = uibuilder.get('version')

        /** You can use the following to help trace how messages flow back and forth.
         * You can then amend this processing to suite your requirements.
         */

        //#region ---- Trace Received Messages ---- //
        // If msg changes - msg is updated when a standard msg is received from Node-RED over Socket.IO
        // newVal relates to the attribute being listened to.
        uibuilder.onChange('msg', function(newVal){
            //console.info('[indexjs:uibuilder.onChange] msg received from Node-RED server:', newVal)
            vueApp.msgRecvd = newVal


            var topic = newVal.topic;
            while(topic !== '') {
                vueApp.eventbus.emitEventListeners(topic, newVal);
                topic = topicUp(topic);
            }

            function topicUp(topic) {
                const levels = topic.split('/');
                return levels.splice(0, levels.length -1).join('/');
            }              
        })
        // As we receive new messages, we get an updated count as well
        uibuilder.onChange('msgsReceived', function(newVal){
            //console.info('[indexjs:uibuilder.onChange] Updated count of received msgs:', newVal)
            vueApp.msgsReceived = newVal
        })

        // If we receive a control message from Node-RED, we can get the new data here - we pass it to a Vue variable
        uibuilder.onChange('ctrlMsg', function(newVal){
            //console.info('[indexjs:uibuilder.onChange:ctrlMsg] CONTROL msg received from Node-RED server:', newVal)
            vueApp.msgCtrl = newVal
        })
        // Updated count of control messages received
        uibuilder.onChange('msgsCtrl', function(newVal){
            //console.info('[indexjs:uibuilder.onChange:msgsCtrl] Updated count of received CONTROL msgs:', newVal)
            vueApp.msgsControl = newVal
        })
        //#endregion ---- End of Trace Received Messages ---- //

        //#region ---- Trace Sent Messages ---- //
        // You probably only need these to help you understand the order of processing //
        // If a message is sent back to Node-RED, we can grab a copy here if we want to
        uibuilder.onChange('sentMsg', function(newVal){
            //console.info('[indexjs:uibuilder.onChange:sentMsg] msg sent to Node-RED server:', newVal)
            vueApp.msgSent = newVal
        })
        // Updated count of sent messages
        uibuilder.onChange('msgsSent', function(newVal){
            //console.info('[indexjs:uibuilder.onChange:msgsSent] Updated count of msgs sent:', newVal)
            vueApp.msgsSent = newVal
        })

        // If we send a control message to Node-RED, we can get a copy of it here
        uibuilder.onChange('sentCtrlMsg', function(newVal){
            //console.info('[indexjs:uibuilder.onChange:sentCtrlMsg] Control message sent to Node-RED server:', newVal)
            vueApp.msgCtrlSent = newVal
        })
        // And we can get an updated count
        uibuilder.onChange('msgsSentCtrl', function(newVal){
            //console.info('[indexjs:uibuilder.onChange:msgsSentCtrl] Updated count of CONTROL msgs sent:', newVal)
            vueApp.msgsCtrlSent = newVal
        })
        //#endregion ---- End of Trace Sent Messages ---- //

        // If Socket.IO connects/disconnects, we get true/false here
        uibuilder.onChange('ioConnected', function(newVal){
            //console.info('[indexjs:uibuilder.onChange:ioConnected] Socket.IO Connection Status Changed to:', newVal)
            vueApp.socketConnectedState = newVal
            console.log("UIBilder.onChange(ioConnected): " + newVal);
        })
        // If Server Time Offset changes
        uibuilder.onChange('serverTimeOffset', function(newVal){
            //console.info('[indexjs:uibuilder.onChange:serverTimeOffset] Offset of time between the browser and the server has changed to:', newVal)
            vueApp.serverTimeOffset = newVal
            console.log("UIBilder.onChange(serverTimeOffset): " + newVal);
        })

        vueApp.eventbus.addEventListener("action", function(data){
            uibuilder.send(data);
        });
    } // --- End of mounted hook --- //

}) // --- End of app1 --- //

// EOF