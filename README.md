# jquery-bootstrap-highcharts
>
[Highcharts]: https://highcharts.com/



## Description
This packages adjust [Highcharts](https://www.highcharts.com/) to [jquery-bootstrap](https://github.com/FCOO/jquery-bootstrap) regarding StyleSheet and settings (language, date format, timezone, numerical format etc.).

It also adjust default options for [Highcharts](https://www.highcharts.com/)

## Style mode vs options-mode

In [Highcharts] the styling of any element can be controlled either by css or options by setting `chart.styledMode = true or false` ([documentation](https://www.highcharts.com/docs/chart-design-and-style/style-by-css)).

In `jquery-bootstrap-highcharts` we try to create a combination of style-mode and options-mode allowing elements outside the chart (eg. buttons, menus, titles) being styled by css and most of the chart (line and marker color, thickness etc.) being controlled by options.

This is done by setting `chart.styledMode = false` **AND** including a css-file (`dist/jquery-bootstrap-highcharts.css`) in the packages.

`dist/jquery-bootstrap-highcharts.css` is compiled from `src/jquery-bootstrap-highcharts.scss` witch import the scss-variables from [jquery-bootstrap](https://github.com/FCOO/jquery-bootstrap) and from [Bootstrap](https://getbootstrap.com/) and adjust the [Highcharts] scss-variables before importing the scss-file (`highcharts/css/highcharts.scss`)

To allow charts options for marker and lines the scss-file used (`src/_highcharts.scss`) is a local copy of the original [Highcharts] version where styles for lines, markers etc. have been removed (commented out).

#### That means that any changes in in [Highcharts] regarding css require this packages to be rebuild.

The current copy of the [Highcharts] css-file (`src/_highcharts_VERSION.scss`) is from version 10.2



## Installation
### bower
`bower install https://github.com/FCOO/jquery-bootstrap-highcharts.git --save`

## Demo
http://FCOO.github.io/jquery-bootstrap-highcharts/demo/


## Note
Not all chart types has been checked to see if some css-style is overwriting the options style. But simple line charts should work correctly.

## ToDo

The following (known) issues need to be fixed:

1. Axis labels in Waterfall do not work with `{da:"...", en:"..."}`
2. `Title` for buttons in range-selector do not work with `{da:"...", en:"..."}`

## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/jquery-bootstrap-highcharts/LICENSE).

Copyright (c) 2019 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk