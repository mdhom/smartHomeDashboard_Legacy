function sortSameDayEvents(a, b)
{
    if (a.isFullDayEvent && !b.isFullDayEvent) {
        return -1;
    } else if (!a.isFullDayEvent && b.isFullDayEvent) {
        return 1;
    } else if (a.isFullDayEvent && b.isFullDayEvent) {
        if (!a.isBirthday && !b.isBirthday) {
            return sortByString(a.title, b.title);
        } else if (a.isBirthday && b.isBirthday) {
            return sortByString(a.title, b.title);
        } else if (a.isBirthday && !b.isBirthday) {
            return -1;
        } else if(!a.isBirthday && b.isBirthday) {
            return 1;
        } else {
            return 0;
        }
    } else {
        return sortByString(a.startTime, b.startTime);
    }
}

function sortByString(a, b)
{
    if (a>b) {
        return 1;
    } else if (a < b) {
        return -1;
    } else {
        return 0;
    }
}

function dayOfWeekToString(dayOfWeekInt)
{
    var dayOfWeek = "";
    switch (dayOfWeekInt)
    {
        case 0: dayOfWeek = "Sonntag"; break;
        case 1: dayOfWeek = "Montag"; break;
        case 2: dayOfWeek = "Dienstag"; break;
        case 3: dayOfWeek = "Mittwoch"; break;
        case 4: dayOfWeek = "Donnerstag"; break;
        case 5: dayOfWeek = "Freitag"; break;
        case 6: dayOfWeek = "Samstag"; break;
    }
    return dayOfWeek;
}

function dayOfWeekToStringShort(dayOfWeekInt)
{
    var dayOfWeek = "";
    switch (dayOfWeekInt)
    {
        case 0: dayOfWeek = "SO"; break;
        case 1: dayOfWeek = "MO"; break;
        case 2: dayOfWeek = "DI"; break;
        case 3: dayOfWeek = "MI"; break;
        case 4: dayOfWeek = "DO"; break;
        case 5: dayOfWeek = "FR"; break;
        case 6: dayOfWeek = "SA"; break;
    }
    return dayOfWeek;
}

Vue.component('calendar-component', {
    data: function() {
        return {
            events: [],
            eventsToday: [],
            eventsTomorrow: [],
            fullDayEventsToday: [],
            fullDayEventsTomorrow: [],
            todayString: "",
            tomorrowString: "",
        }
    },
    props: {
        eventbus: Object,
    },
    methods: {
      refreshData: function(sender){
        $(".dropdown").removeClass("open");
        eventbus.emitEventListeners('action', `{ "type": "refreshCalendar" }`);
        console.log("refreshing calendar");
      }
    },
    created: function() {
        const comp = this;
    
        this.eventbus.addEventListener("events", function(data){
            var events = data.payload;

            var eventsView = [];
            events.forEach(function(event)
            {
                var emojiAndTitle = extractEmoji(event.summary);

                if (event.isBirthday) {
                    emojiAndTitle[1] = emojiAndTitle[1].replace("Geburtstag","").replace(/^\s+/,"");
                }

                eventsView.push({
                    id:                 event.id,
                    calendarId:         event.calendarId,
                    start:              event.startFormatted,
                    isFullDayEvent:     event.isFullDayEvent,
                    isBirthday:         event.isBirthday,
                    startDate:          new Date(event.dateObject),
                    startTime:          event.isFullDayEvent ? null : extractTime(event.startFormatted),
                    dayOffsetFromNow:   event.dayOffsetFromNow,
                    title:              emojiAndTitle[1],
                    emoji:              emojiAndTitle[0],
                    isCompanyEvent:     event.calendarId == "cpuri1abtoni7sa44m8e8v8fj8@group.calendar.google.com"
                });
            });
            comp.events = eventsView;

            var view1 = eventsView.filter(e => e.dayOffsetFromNow == 0 && !e.isFullDayEvent);
            view1.sort(sortSameDayEvents);
            comp.eventsToday = view1;

            var view2 = eventsView.filter(e => e.dayOffsetFromNow == 1 && !e.isFullDayEvent);
            view2.sort(sortSameDayEvents);
            comp.eventsTomorrow = view2;

            var view3 = eventsView.filter(e => e.dayOffsetFromNow == 0 && e.isFullDayEvent);
            view3.sort(sortSameDayEvents);
            comp.fullDayEventsToday = view3;

            var view4 = eventsView.filter(e => e.dayOffsetFromNow == 1 && e.isFullDayEvent);
            view4.sort(sortSameDayEvents);
            comp.fullDayEventsTomorrow = view4;
        
            const today = new Date();
            comp.todayString = dayOfWeekToString(today.getDay()) + ", " + today.getDate() + "." + pad(today.getMonth()+1, 2);

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            comp.tomorrowString = dayOfWeekToString(tomorrow.getDay()) + ", " + tomorrow.getDate() + "." + pad(tomorrow.getMonth()+1, 2);
        });

        function extractEmoji(title)
        {
            const regex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gm;
            var m = regex.exec(title);
            if (m != null) 
            {
                return [ m[1], title.substr(2) ];   
            } 
            else if(title.includes("FC Bayern")) 
            {
                return [ '<img src="./images/icons/fcbayern.svg" style="width:17px; margin-bottom:2px;" />', title ];
            } 
            else 
            {
                return [ undefined, title ];
            }
        }

        function extractTime(str)
        {
            const regex = /(\d{2}:\d{2}) Uhr/gm;
            let m;

            while ((m = regex.exec(str)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++;
                }

                return m[1];
            }
        }
    },
    template: `
    <div class="x_panel">
      <div class="x_title">
        <h2>Anstehende Termine</h2>
        <ul class="nav navbar-right panel_toolbox">
          <li><a class="collapse-link"><i class="fa fa-chevron-up"></i></a>
          </li>
          <li class="dropdown">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"><i class="fa fa-wrench"></i></a>
            <ul class="dropdown-menu" role="menu">
              <li><a v-on:click.stop="refreshData">Refresh data</a>
              </li>
            </ul>
          </li>
        </ul>
        <div class="clearfix"></div>
      </div>
      <div class="x_content">
        <h3 style="margin-top: 0px;">Heute - {{ todayString }}</h3>
        <ul class="fullDayEvents">
          <li v-for="event in fullDayEventsToday" :key="event.id" :class="{ 'birthday': event.isBirthday }">
            <p>
              <span v-if="event.emoji">{{ event.emoji }}</span>
              <i v-if="event.isBirthday" class="fa fa-birthday-cake"></i> {{ event.title }}
            </p>
          </li>
        </ul>

        <ul class="eventlist">
          <li v-for="event in eventsToday" :key="event.id" :class="{ 'company' : event.isCompanyEvent }">
            <div class="startTime">
              {{ event.startTime }}
            </div>
            <div class="emoji" v-html="event.emoji">
            </div>
            <div class="title">
              {{ event.title }}
            </div>
          </li>
        </ul>

        <h3 style="margin-top: 0px;">Morgen - {{ tomorrowString }}</h3>
        <ul class="fullDayEvents">
          <li v-for="event in fullDayEventsTomorrow" :key="event.id" :class="{ 'birthday': event.isBirthday }">
            <p>
              <span v-if="event.emoji">{{ event.emoji }}</span>
              <i v-if="event.isBirthday" class="fa fa-birthday-cake"></i> {{ event.title }}
            </p>
          </li>
        </ul>

        <ul class="eventlist">
          <li v-for="event in eventsTomorrow" :key="event.id" :class="{ 'company' : event.isCompanyEvent }">
            <div class="startTime">
              {{ event.startTime }}
            </div>
            <div style="display: inline-block; width:20px;" v-html="event.emoji">
            </div>
            <div style="display: inline-block;">
              {{ event.title }}
            </div>
          </li>
        </ul>
      </div>
    </div>`
})