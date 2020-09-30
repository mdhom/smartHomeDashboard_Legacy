Vue.component('room-overview-component', {
    data: function() {
        return {
            temperature: "",
            co2: "",
            co2Color: "",
            humidity: "",
            lamps: []
        }
    },
    props: {
        eventbus: Object,
        name: String,
        netatmoname: String,
        iconname: String,
    },
    methods: {
        lampToggle: function (lampAddress) {
            console.log(lampAddress);
            this.eventbus.emitEventListeners("action", { topic: "toggleLamp", payload: { lampAddress: lampAddress }});
        }
    },
    created: function() {
        const comp = this;
        if (comp.netatmoname !== undefined && comp.netatmoname.length > 0) {
            comp.eventbus.addEventListener("climateState", function(data){
                try {
                    if (data.payload.name === comp.netatmoname) {
                        // update temperature
                        comp.temperature    = data.payload.temperature ? Number.parseFloat(data.payload.temperature).toFixed(1) + "°" : null;
                        
                        // update CO2
                        comp.co2            = data.payload.temperature ? data.payload.co2 : null;
                        const colorRanges = [
                            { value: 700,   color: "#69B42F" },
                            { value: 820,   color: "#8EBF28" },
                            { value: 940,   color: "#AAC918" },
                            { value: 1060,  color: "#C5D311" },
                            { value: 1180,  color: "#DADB15" },
                            { value: 1300,  color: "#ECE314" },
                            { value: 1420,  color: "#EECB13" },
                            { value: 1540,  color: "#EDA816" },
                            { value: 1660,  color: "#EB801B" },
                            { value: 1780,  color: "#E75421" },
                            { value: 99999, color: "#E52323"}
                        ];
                        var i;
                        for (i = 0; i < colorRanges.length; i++) {
                            if (colorRanges[i].value > comp.co2) {
                                comp.co2Color = colorRanges[i].color;
                                break;
                            }
                        }
                        
                        // update humidity
                        comp.humidity       = data.payload.humidity ? data.payload.humidity + "%" : null;
                    }
                } catch (err) {
                    console.log("room-overview-component["+name+"]: " + err);
                }
            });
        }

        comp.eventbus.addEventListener("lampState", function(data){
            var lampState = data.payload;
            if (lampState.roomName === comp.name) {            
                var lamp = comp.lamps.find(function(l) { return l.name == lampState.name});
                if (lamp !== undefined)
                {
                    lamp.state = lampState.state;
                }
                else
                {
                    lamp = {
                        address: lampState.address,
                        name:    lampState.name,
                        state:   lampState.state
                    };
                    comp.lamps.push(lamp);
                }
            }
        });
    },
    template: `
        <div class="col-md-4 col-sm-4 col-xs-12">
            <div class="x_panel tile" style="height:400px;">
                <div class="x_title">
                    <h2>
                        <img :src="'./images/icons/'+iconname+'.png'" style="margin-right:5px;" /> {{ name }}
                    </h2>
                    <ul class="nav navbar-right panel_toolbox">
                        <li>
                            <div style="font-size:1.5em; margin-top:8px;">
                                {{ temperature }}
                            </div>
                        </li>
                        <li style="margin-left:10px; margin-top:8px;" v-if="co2">
                            <div :style="'margin:5px auto; width:16px; height:16px; background-color:'+co2Color+'; border-radius:50%; border:1px solid gray;'"></div>
                        </li>
                    </ul>
                    <div class="clearfix"></div>
                </div>
                <div class="x_content">
                    <button class="widget_summary" v-for="lamp in lamps" :key="lamp.name" v-on:click="lampToggle(lamp.address)">
                        <div class="w_left w_75" >
                            <span class="textInlineSvgIcon">{{ lamp.name }}</span>
                        </div>
                        <div class="w_right w_25">
                            <img src="images/icons/lightbulb_on.svg" class="svgIcon" v-if="lamp.state" />
                            <img src="images/icons/lightbulb_off.svg" class="svgIcon" v-else />
                        </div>
                        <div class="clearfix"></div>
                    </button>

                </div>
            </div>
        </div>`
});