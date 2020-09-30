Vue.component('rooftop-window-component', {
    data: function() {
        return {
            isClosed: true
        }
    },
    props: {
        eventbus: Object,
        windowname: String,
    },
    created: function() {
        const comp = this;
        comp.eventbus.addEventListener("windowState", function(data){
            if (data.payload.name == comp.windowname) {
                comp.isClosed = data.payload.contact;
                console.log("window match, isClosed=" + comp.isClosed);
            } else {
                console.log("window mismatch: " + comp.windowname + " vs. " + data.payload.name);
            }
        });
    },
    template: `
        <img src="images/icons/rooftop-window-closed.svg" v-if="isClosed" style="width:30px; height:30px; margin-top:13px;"></img>
        <img src="images/icons/rooftop-window-open.svg" v-else style="width:30px; height:30px; margin-top:13px;"></img>`
});