function mapOWMtoSkycons(state)
{
    var map = [
        { owm: "01d", skycon: "clear-day" },
        { owm: "01n", skycon: "clear-night" },
        { owm: "02d", skycon: "partly-cloudy-day" },
        { owm: "02n", skycon: "partly-cloudy-night" },
        { owm: "03d", skycon: "cloudy" },
        { owm: "03n", skycon: "cloudy" },
        { owm: "04d", skycon: "cloudy" },
        { owm: "04n", skycon: "cloudy" },
        { owm: "09d", skycon: "rain" },
        { owm: "09n", skycon: "rain" },
        { owm: "10d", skycon: "showers-day" },
        { owm: "10n", skycon: "showers-night" },
        { owm: "11d", skycon: "thunder-rain" },
        { owm: "11n", skycon: "thunder-rain" },
        { owm: "13d", skycon: "snow" },
        { owm: "13n", skycon: "snow" },
        { owm: "50d", skycon: "fog" },
        { owm: "50n", skycon: "fog" },
    ];
    var pair = map.find(function(pair) { return pair.owm == state });
    if (pair !== undefined) {
        return pair.skycon;
    } else {
        return "ERROR "  + state;
    }
}

function init_skycons(){
    if( typeof (Skycons) === 'undefined'){ return; }

    var icons = new Skycons({
        "monochrome": false,
        "color":
        {
            "cloud": "#F00",
            "dark_cloud": "#F0F",
            "sun": "#00F"
        }
    });
        
    $(".skycons").each(function(){
        const id = $(this).attr('id');
        const skycon = $(this).attr('data-icon');
        icons.set(id, skycon);
    });

    icons.play();
}  

function init_hourlyForecast(comp)
{
    var tempData = comp.weatherForecastHourly.map(d => {
        return [d.date.getTime(), d.temperature];
    });

    var windData = comp.weatherForecastHourly.map(d => {
        return [d.date.getTime(), d.windspeed];
    });

    var rainData = comp.weatherForecastHourly.map(d => {
        return [d.date.getTime(), d.rain];
    });
    
    var settings = {
        series: {
            lines: {
                show: false,
                fill: true
            },
            splines: {
                show: true,
                tension: 0.4,
                lineWidth: 1,
                fill: 0.4
            },
            points: {
                radius: 3,
                show: false
            },
            shadowSize: 2
        },
        grid: {
            verticalLines: true,
            hoverable: true,
            clickable: true,
            tickColor: "#d5d5d5",
            borderWidth: 1,
            color: '#fff'
        },
        colors: ["rgba(38, 185, 154, 0.38)", "rgba(3, 88, 106, 0.38)", "rgba(3, 10, 244, 0.38)"],
        xaxis: {
            tickColor: "rgba(51, 51, 51, 0.06)",
            mode: "time",
            tickSize: [2, "hour"],
            //tickLength: 10,
            axisLabel: "Hour",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 10
        },
        yaxis: {
            ticks: 4,
            tickColor: "rgba(51, 51, 51, 0.06)",
        },
        tooltip: false
    }

    if ($("#" + comp.diagramId).length){              
        $.plot( $("#" + comp.diagramId), [ tempData, windData, rainData ],  settings );
    }
}

Vue.component('weather-component', {
    data: function() {
        return {
            id: uuidv4(),
            currentWeather: {},
            weatherForecastDaily: [],
            weatherForecastHourly: [],
        }
    },
    computed: {
        diagramId: function(){
            return "hourlyWeatherForecast" + this.id;
        }
    },
    props: {
        eventbus: Object,
    },
    updated: function() {
        init_skycons();
        init_hourlyForecast(this);
    },
    created: function() {
        const comp = this;

        comp.eventbus.addEventListener("weather", function(data){
            comp.currentWeather = toWeatherObject(data.payload.current);

            var forecasts = data.payload.daily.slice(1, 7).map((d, index) => {
                return toWeatherObject(d, index);
            });
            comp.weatherForecastDaily = forecasts;

            var forecasts = data.payload.hourly.slice(0, 13).map((d, index) => {
                return toWeatherObject(d, index);
            });
            comp.weatherForecastHourly = forecasts;

            function toWeatherObject(d, index) {
                const date = new Date(d.dt * 1000) // timestamp is given in seconds, date takes milliseconds
                return {
                    date: date,
                    dayOfWeek: dayOfWeekToString(date.getDay()),
                    dayOfWeekShort: dayOfWeekToStringShort(date.getDay()),
                    time: pad(date.getHours(),2)+":"+pad(date.getMinutes(),2),
                    temperature: typeof d.temp === 'object' ? Math.round(d.temp.max) : Math.round(d.temp),
                    windspeed: Math.round(d.wind_speed / 1000.0 * 60 * 60), // given in m/s, converting to km/h
                    rain: d.rain !== undefined ? d.rain["1h"] : 0.0,
                    description: d.weather[0].description,
                    skycon: mapOWMtoSkycons(d.weather[0].icon),
                    skyconId: uuidv4(),
                    forecastIndex: index
                }
            }
        });
    },
    template: `
    <div class="x_panel">
      <div class="x_title">
        <h2>Wetter <small>Söchtenau</small></h2>
        <ul class="nav navbar-right panel_toolbox">
          <li><a class="collapse-link"><i class="fa fa-chevron-up"></i></a>
          </li>
          <li class="dropdown">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"><i class="fa fa-wrench"></i></a>
            <ul class="dropdown-menu" role="menu">
              <li><a href="#">Settings 1</a>
              </li>
              <li><a href="#">Settings 2</a>
              </li>
            </ul>
          </li>
          <li><a class="close-link"><i class="fa fa-close"></i></a>
          </li>
        </ul>
        <div class="clearfix"></div>
      </div>
      <div class="x_content">
        <div class="row">
          <div class="col-sm-12">
            <div class="temperature">
              <b>{{ currentWeather.dayOfWeek }}</b>, {{ currentWeather.time }} Uhr
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-3 vcenter">
            <canvas class="skycons" :id="currentWeather" :data-icon="currentWeather.skycon" height="84" width="84"></canvas>
          </div>
          <div class="col-sm-4 vcenter">
              <h2>{{ currentWeather.description }}</h2>
          </div>
          <div class="col-sm-4 vcenter">
              <h3 style="font-size:40px; text-align: right;">{{ currentWeather.temperature }}°</h3>
          </div>
        </div>
        <div class="clearfix"></div>

        <!-- HOURLY FORECAST -->
        <div class="col-md-12 col-sm-12 col-xs-12">
          <div :id="diagramId" class="demo-placeholder"></div>
        </div>

        <!-- DAILY FORECAST -->
        <div class="row weather-days">
          <div class="col-sm-2" v-for="weather in weatherForecastDaily" :key="weather.forecastIndex">
            <div class="daily-weather">
              <h2 class="day">{{ weather.dayOfWeekShort }}</h2>
              <h3 class="degrees">{{ weather.temperature }}</h3>
              <canvas class="skycons centered" :id="weather.skyconId" :data-icon="weather.skycon" width="32" height="32"></canvas>
              <h5 style="text-align: center;">{{ weather.windspeed }}<i><br />km/h</i></h5>
            </div>
          </div>
          <div class="clearfix"></div>
        </div>
      </div>
    </div>`
});