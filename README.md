# jquery-bootstrap-highcharts
>
[Highcharts]: https://highcharts.com/
[jquery-bootstrap]: https://github.com/FCOO/jquery-bootstrap


## Description
This packages adjust [Highcharts] to [jquery-bootstrap] regarding StyleSheet and settings (language, date format, timezone, numerical format etc.).

It also adjust default options for [Highcharts]

## Styling

To have a [Highcharts] chart styled similar to the styling of [jquery-bootstrap] regarding elements (buttons, menus, titles) a new chart-options and a new global variable are created:

### Options

To have a single chart using [jquery-bootstrap] styles, set options `useJBStyle: true` in the chart-options for the chart

	{
		chart: {
			useJBStyle: true,
			...
		},
		...
	}


### Global variable

To enable or disable the use of [jquery-bootstrap] styling for all charts in an application a global variable is defined

	window.Highcharts.USE_JB_STYLE = true/false/STRING //Default = "only if useJBStyle = true"

Posible values

-     `true `: Allways. Force `options.chart.useJBStyle = true`
-     `false`: Never.
-     `STRING`: Individuel for each chart: Only if `options.chart.useJBStyle = true`


## Installation
### bower
`bower install https://github.com/FCOO/jquery-bootstrap-highcharts.git --save`

## Demo
http://FCOO.github.io/jquery-bootstrap-highcharts/demo/


## ToDo

The following (known) issues need to be fixed:

1. Axis labels in Waterfall do not work with `{da:"...", en:"..."}`
2. `Title` for buttons in range-selector do not work with `{da:"...", en:"..."}`
3. No color-scale on Speedometer

## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/jquery-bootstrap-highcharts/LICENSE).

Copyright (c) 2019 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk