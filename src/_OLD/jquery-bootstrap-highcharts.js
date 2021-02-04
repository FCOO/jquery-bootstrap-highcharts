/****************************************************************************
	jquery-bootstrap-highcharts.js,

	(c) 2019, FCOO

	https://github.com/FCOO/jquery-bootstrap-highcharts
	https://github.com/FCOO

****************************************************************************/

(function ($, Highcharts, moment, i18next, window, document, undefined) {
	"use strict";

	var ns = Highcharts;

   //Extend Highcharts.setOptions to allow update of all charts
    ns.setOptions = function (setOptions) {
		return function (options, redraw) {
            var result = setOptions.call(this, options);
            if (redraw)
                $.each(ns.charts, function(index, chart){
                    if (chart)
                        chart.redraw(false);
                });
            return result;
		};
	} (ns.setOptions);


    //Updates defaultOptions = default options for all charts
    ns.setOptions({
        chart: {
            styledMode: true
        },
    });

    //Extend Highcharts.SVGRenderer.prototype.buildText to allow text as {da:"...", en:"..."}
/* VIRKER IKKE
    ns.SVGRenderer.prototype.buildText = function (buildText) {
		return function (wrapper) {
            var textStr = wrapper ? wrapper.textStr || '' : '',
                lang    = window.i18next && window.i18next.language ? window.i18next.language : '';

            if ($.type( textStr ) == "object")
                //Assume textStr is a {da:"dansk", en:"english",...}-object
                wrapper.bsText = textStr;

            if (wrapper.bsText && lang)
                textStr = wrapper.bsText[lang];

            wrapper.textStr = textStr;

            return buildText.call(this, wrapper);
		};
	} (ns.SVGRenderer.prototype.buildText);
*/


    /***************************************************************
    DATE-FORMATS
    1: Change name of month and weekday when language is changed by i18next
    2: Set format-functions for xAxis and tooltips using formats set with moment-simple-format
    3: Set and update when timezone is changed
    ***************************************************************/

    /**************************************************************
    1: onLanguageChanged - Called when i18next changes language: Change names of month and weekdays
    ***************************************************************/
    function onLanguageChanged(lang){
        lang = lang || i18next.language || 'en';

        //Check if moment has the same language
        if ((moment.locale() != lang) && (moment.locales().indexOf(lang) > -1))
            moment.locale(lang);

        //Set name of month, weekday etc.
        ns.setOptions({
            lang: {
                months       : moment.months(),
                shortMonths  : moment.monthsShort(),
                shortWeekdays: moment.weekdaysShort(),
                weekdays     : moment.weekdays() //= 3 char. Alt: moment.weekdaysMin() = 2 char
            }
        }, true);
    }

    i18next.on('initialized',     function(options){ onLanguageChanged(options.language); });
    i18next.on('languageChanged', onLanguageChanged );


    /**************************************************************
    2: Create new dateFormats as functions using moment-simple-format
        options = {
            weekday: 'Full'/'Short'/'Digital'/'None'
            month  : 'Full'/'Short'/'Digital'/'None'
            year   : 'Full'/'Short'/'Digital'/'None'
        }
    **************************************************************/

    /*
    function anyDateFormat(timestamp, options)
    options: {
        format: moment-format [string] or
                moment-simple-format.dateFormat [{weekday, month, year}]
        inclTime: [boolean]
    }
    */
    function timestampToMoment(timestamp){
        return moment(timestamp).tzMoment();
    }

    function anyDateFormat(timestamp, options){
        var result,
            m = timestampToMoment(timestamp);

        if ($.type(options.format) == 'string')
            //Simple moment-format
            result = m.format(options.format);
        else
            if (options.format === null)
                result = m.timeFormat();
            else
                result = options.inclTime ?
                            m.dateTimeFormat({dateFormat: options.format}) :
                            m.dateFormat({dateFormat: options.format});

        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    function createDateFormat(dateFormat, inclTime){
        return function(timestamp){
            return anyDateFormat(timestamp, {format: dateFormat, inclTime: inclTime || false});
        };
    }

    /*
    _monthYearDateFormatFunc
    format month-year isn't supported by moment-simple-format
    */
    function monthYearDateFormatFunc(timestamp)        { return _monthYearDateFormatFunc(timestamp, false, false); }
    //Not used function fullMonthYearDateFormatFunc(timestamp)    { return _monthYearDateFormatFunc(timestamp, true, false);  }
    //Not used function monthFullYearDateFormatFunc(timestamp)    { return _monthYearDateFormatFunc(timestamp, false, true);  }
    function fullMonthFullYearDateFormatFunc(timestamp){ return _monthYearDateFormatFunc(timestamp, true, true);   }

    function _monthYearDateFormatFunc(timestamp, fullMonth, fullYear){
        var m           = timestampToMoment(timestamp),
            monthFormat = fullMonth ? 'MMMM' : 'MMM',
            yearFormat  = fullYear  ? 'YYYY' : "'YY",
            result      = m.format(moment.sfGetOptions().date == 'YMD' ? yearFormat + ' ' + monthFormat : monthFormat + ' ' + yearFormat);
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    var timeFormatFunc        = createDateFormat(null, true),
        shortDateFormatFunc   = createDateFormat({weekday:'None', month:'Short', year:'None'}), //30. Jan
        tooltipDateFormatFunc = createDateFormat({weekday:'Short', month:'Short', year:'Short'}, true); //Mon,  30. Jan 19 13:00



    ns.dateFormats = $.extend(ns.dateFormats, {
        //xAxis[NAME] used by x-axis                    //Eks                   HC default
        xAxisMillisecond :  timeFormatFunc,             //13:00 or 01:00pm      '%H:%M:%S.%L'
        xAxisSecond      :  timeFormatFunc,             //13:00 or 01:00pm      '%H:%M:%S'
        xAxisMinute      :  timeFormatFunc,             //13:00 or 01:00pm      '%H:%M'
        xAxisHour        :  timeFormatFunc,             //13:00 or 01:00pm      '%H:%M'
        xAxisDay         :  shortDateFormatFunc,        //30. Jan               '%e. %b'
        xAxisWeek        :  shortDateFormatFunc,        //30. Jan               '%e. %b'
        xAxisMonth       :  monthYearDateFormatFunc,    //Jan 19                '%b \'%y'
        xAxisYear        :  createDateFormat('YY'),     //19                    '%Y'

        //tooltip[NAME] used by tooltip                         //Eks                       HC default
        tooltipMillisecond : tooltipDateFormatFunc,             //Mon,  30. Jan 19 13:00    '%A, %b %e, %H:%M:%S.%L'  = Sunday, Jan 30, 12:00:00,00
        tooltipSecond      : tooltipDateFormatFunc,             //Mon,  30. Jan 19 13:00    '%A, %b %e, %H:%M:%S'     = Sunday, Jan 30, 12:00:00
        tooltipMinute      : tooltipDateFormatFunc,             //Mon,  30. Jan 19 13:00    '%A, %b %e, %H:%M'        = Sunday, Jan 30, 12:00
        tooltipHour        : tooltipDateFormatFunc,             //Mon,  30. Jan 19 13:00    '%A, %b %e, %H:%M'        = Sunday, Jan 30, 12:00
        tooltipDay         : tooltipDateFormatFunc,             //Mon,  30. Jan 19 13:00    '%A, %b %e, %Y'           = Sunday, Jan 30, 2019
        tooltipWeek        : tooltipDateFormatFunc,             //Mon,  30. Jan 19 13:00    'Week from %A, %b %e, %Y' = Week from Sunday, Jan 30, 2019
        tooltipMonth       : fullMonthFullYearDateFormatFunc,   //Januar 2019'              '%B %Y',                  = January 2019
        tooltipYear        : createDateFormat('YYYY')           //2019                      '%Y'                      = 2019
    });

    //Updates defaultOptions with default date-formats
    //dateTimeLabelFormats: dateTimeLabelFormats
    // For series on a datetime axes, the date format in the tooltip's header will by default be guessed based on the closest data points.
    // This member gives the default string representations used for each unit. For an overview of the replacement codes, see dateFormat.
    ns.setOptions({
        xAxis: {
            dateTimeLabelFormats: {
                millisecond : '%xAxisMillisecond',
                second      : '%xAxisSecond',
                minute      : '%xAxisMinute',
                hour        : '%xAxisHour',
                day         : '%xAxisDay',
                week        : '%xAxisWeek',
                month       : '%xAxisMonth',
                year        : '%xAxisYear'
            },
        },
        tooltip: {
            dateTimeLabelFormats: {
                millisecond : '%tooltipMillisecond',
                second      : '%tooltipSecond',
                minute      : '%tooltipMinute',
                hour        : '%tooltipHour',
                day         : '%tooltipDay',
                week        : '%tooltipWeek',
                month       : '%tooltipMonth',
                year        : '%tooltipYear'
            },
        },
    });


    /**************************************************************
    3: Set and update when timezone is changed
    ***************************************************************/
    /*
    Use moment-simple-format and moment-timezone.js to return the timezone offset for
    individual timestamps, used in the X axis labels and the tooltip header.
    */
    ns.setOptions({
        time: {
            getTimezoneOffset: function (timestamp) {
                return -1*timestampToMoment(timestamp).utcOffset();
            }
        }
    });


    var timezone = moment.simpleFormat.options.timezone;

    //Update charts when timezone or format for date/time is changed
    moment.sfOnSetFormat( function(options){
        if (timezone != options.timezone)
            //Mark all date-axes' labels to be rearranged
            $.each(ns.charts, function(index, chart){
                if (chart)
                    $.each(chart.axes, function(index, axis){
                        if (axis && axis.isDatetimeAxis){
    //TODO: Skal finde rigtig metode til at arrangere labels på axis
                            axis.setExtremes(axis.min+1, axis.max, false);
                            axis.setExtremes(axis.min-1, axis.max, false);
                        }
                    });
                });

        ns.setOptions({}, true);
        timezone = options.timezone;
    });


}(jQuery, this.Highcharts,  this.moment, this.i18next, this, document));