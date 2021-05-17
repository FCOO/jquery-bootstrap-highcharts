# jquery-bootstrap-highcharts



## Description
This packages adjust [Highcharts](https://www.highcharts.com/) to [jquery-bootstrap](https://github.com/FCOO/jquery-bootstrap) regarding StyleSheet and settings (language, date format, timezone, numerical format etc.).

It also adjust default options for [Highcharts](https://www.highcharts.com/)


## Installation
### bower
`bower install https://github.com/FCOO/jquery-bootstrap-highcharts.git --save`

## Demo
http://FCOO.github.io/jquery-bootstrap-highcharts/demo/


## Note
When using options `chart.scrollablePlotArea` to have a scrollable chart it is necessary to set `clip: false` for all `series`

    series: [{
        ...
        clip: false
    },....,{
        ...
        clip: false
    }]
    
 

## ToDo

The following (known) issues need to be fixed:



1. Axis labels in Waterfall do not work with `{da:"...", en:"..."}`
2. `Title` for buttons in range-selector do not work with `{da:"...", en:"..."}`
3. Using `Highcharts.scss` prevent the option `series.lineWidth` to be used.

# ITEM 3 NEED TO BE FIXED ASAP
 



## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/jquery-bootstrap-highcharts/LICENSE).

Copyright (c) 2019 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk