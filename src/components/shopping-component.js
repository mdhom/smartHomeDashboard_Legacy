Vue.component('shopping-component', {
    data: function() {
        return {
            items: []
        }
    },
    props: {
        eventbus: Object,
    },
    methods: {
    refreshData: function(sender){
        console.log("refresh" + sender);
    }
    },
    created: function() {
        const comp = this;

        this.eventbus.addEventListener("shoppingItems", function(data){
            comp.items = data.payload;
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
                </ul>
                </li>
            </ul>
            <div class="clearfix"></div>
        </div>
        <div class="x_content">
            <div class="row">
                <div class="col-md-2 col-sm-4 col-xs-6" v-for="item in items" :key="item.name" style="background:#ee524f; padding:0px; color:white; text-align:center; height:132px; margin:0 10px 10px 0;">
                    <div style="margin:0; position:absolute; top:50%; left:50%; -ms-transform:translate(-50%, -50%); transform:translate(-50%, -50%);">
                        <div style="display:inline-block;">
                            <div style="width:50px; height:50px; display:flex; justify-content:center; align-items:center;">
                                <img :src="item.iconUrl" style="max-width:50px; max-height:50px;" />
                            </div>
                        </div><br />
                        <b>{{ item.displayName }}</b><br />
                        {{ item.specification }}
                    </div>
                </div>
            </div>
        </div>
    </div>`
})