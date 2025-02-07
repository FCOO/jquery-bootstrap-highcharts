# jquery-bootstrap-highcharts
>
[Highcharts]: https://highcharts.com/
[jquery-bootstrap]: https://github.com/FCOO/jquery-bootstrap


## Description
This packages adjust [Highcharts] to [jquery-bootstrap] regarding StyleSheet and settings (language, date format, timezone, numerical format etc.).

It also adjust default options for [Highcharts]

## Styling

### Highcharts
In [Highcharts] the styling of any element can be controlled either by css or options by setting `chart.styledMode = true or false` ([documentation](https://www.highcharts.com/docs/chart-design-and-style/style-by-css)):
> When the chart.styledMode option is true, no presentational attributes (like fill, stroke, font styles etc.) are applied to the chart SVG. Instead, the design is applied purely by CSS.

### jquery-bootstrap-highcharts

In `jquery-bootstrap-highcharts` a global variable is defined to control if the charts will have style similar to [jquery-bootstrap] regarding elements (buttons, menus, titles) and line colors:

	window.Highcharts.USE_JB_STYLE = true/false/STRING //Default = "only if styledMode = true"
Posible values

-     `true `: Allways. Force `options.chart.styledMode = true`
-     `false`: Never.
-     `STRING`: Individuel for each chart: Only if `options.chart.styledMode = true`

## Installation
### bower
`bower install https://github.com/FCOO/jquery-bootstrap-highcharts.git --save`

## Demo
http://FCOO.github.io/jquery-bootstrap-highcharts/demo/


## ToDo

The following (known) issues need to be fixed:

1. Axis labels in Waterfall do not work with `{da:"...", en:"..."}`
2. `Title` for buttons in range-selector do not work with `{da:"...", en:"..."}`

## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/jquery-bootstrap-highcharts/LICENSE).

Copyright (c) 2019 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk