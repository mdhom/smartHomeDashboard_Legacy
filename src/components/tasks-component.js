    Vue.component('tasks-component', {
        data: function() {
            return {
                tasks: [],
                lastData: ""
            }
        },
        props: {
            eventbus: Object,
        },
        methods: {
            refreshData: function(sender){
                $(".dropdown").removeClass("open");
                eventbus.emitEventListeners('action', `{ "type": "refreshData", "source": "tasks" }`);
                console.log("refreshing tasks");
            }
        },
        created: function() {
            const comp = this;

            console.log("Created");
        
            this.eventbus.addEventListener("tasks", function(data){
                comp.lastData = toTimeString(new Date());
                comp.tasks = data.payload;
            }); 
        },
        template: `
        <div class="x_panel">
            <div class="x_title">
                <h2>To Do</h2>
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
                <ul class="fullDayEvents">
                    <li v-for="task in tasks" :key="task.id">
                        <p>{{ task.title }}</p>
                    </li>
                </ul>
            </div>
        </div>`
    })