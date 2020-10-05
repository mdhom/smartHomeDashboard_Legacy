Vue.component('shopping-component', {
    data: function() {
        return {
            purchase: [],
            recently: [],
            lastData: ""
        }
    },
    props: {
        eventbus: Object
    },
    methods: {
        refreshData: function(sender){
            $(".dropdown").removeClass("open");
            eventbus.emitEventListeners('action', `{ "type": "refreshData", "source": "shopping" }`);
            console.log("refreshing shopping");
        },
        moveToRecent: function(item){
            eventbus.emitEventListeners('action', `{ "type": "shopping/moveToRecent", "itemName": "${item.name}" }`);
        },
        moveToPurchase: function(item){
            eventbus.emitEventListeners('action', `{ "type": "shopping/moveToPurchase", "itemName": "${item.name}", "specification": "${item.specification}" }`);
        }
    },
    created: function() {
        const comp = this;

        this.eventbus.addEventListener("shoppingItems", function(data){
            console.log("received shopping items");
            comp.lastData = toTimeString(new Date());
            comp.purchase = data.payload.purchase;
            comp.recently = data.payload.recently;
        }); 
    },
    template: `
    <div class="x_panel">
        <div class="x_title">
            <h2>Shopping</h2>
            <ul class="nav navbar-right panel_toolbox">
                <li><a class="collapse-link"><i class="fa fa-chevron-up"></i></a>
                </li>
                <li class="dropdown">
                  <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"><i class="fa fa-wrench"></i></a>
                  <ul class="dropdown-menu" role="menu">
                    <li>
                        <a v-on:click.stop="refreshData">Refresh data</a>
                    </li>
                    <li>
                        <span style="padding:3px 20px;">Last data: {{ lastData }}</span>
                    </li>
                  </ul>
                </li>
            </ul>
            <div class="clearfix"></div>
        </div>
        <div class="x_content">
            <div class="row">
                <div class="col-lg-1 col-md-2 col-xs-4" v-for="item in purchase" :key="item.name" style="padding:5px; text-align:center; height:130px;">
                    <button v-on:click="moveToRecent(item)" style="width:100%; height:100%; color:white; background:#ee524f; border:0px;">
                        <div style="margin:0; position:absolute; top:50%; left:50%; -ms-transform:translate(-50%,-50%); transform:translate(-50%,-50%);">
                            <div style="display:inline-block;">
                                <div style="width:55px; height:55px; display:flex; justify-content:center; align-items:center;">
                                    <img :src="item.iconUrl" style="max-width:50px; max-height:50px;" />
                                </div>
                            </div><br />
                            <div style="display:inline-block; font-style:bold; height:15px; margin:0px;">
                                {{ item.displayName }}
                            </div><br />
                            <div style="display:inline-block; font-style:italic; height:15px; margin:0px;">
                                {{ item.specification }}
                            </div>
                        </div>
                    </button>
                </div>
            </div>
            <div class="row">
                <div class="col-lg-1 col-md-2 col-xs-4" v-for="item in recently" :key="item.name" style="padding:5px; text-align:center; height:130px;">
                    <button v-on:click="moveToPurchase(item)" style="width:100%; height:100%; color:white; background:#4faba2; border:0px;">
                        <div style="margin:0; position:absolute; top:50%; left:50%; -ms-transform:translate(-50%,-50%); transform:translate(-50%,-50%);">
                            <div style="display:inline-block;">
                                <div style="width:55px; height:55px; display:flex; justify-content:center; align-items:center;">
                                    <img :src="item.iconUrl" style="max-width:50px; max-height:50px;" />
                                </div>
                            </div><br />
                            <div style="display:inline-block; font-style:bold; height:15px; margin:0px;">
                                {{ item.displayName }}
                            </div><br />
                            <div style="display:inline-block; font-style:italic; height:15px; margin:0px;">
                                {{ item.specification }}
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>`
})