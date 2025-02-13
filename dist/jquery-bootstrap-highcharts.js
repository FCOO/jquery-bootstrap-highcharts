/****************************************************************************
    jquery-bootstrap-highcharts.js,

    (c) 2019, FCOO

    https://github.com/FCOO/jquery-bootstrap-highcharts
    https://github.com/FCOO

****************************************************************************/

(function ($, Highcharts, moment, i18next, numeral, window, document, undefined) {
    "use strict";

    var nsHC = Highcharts;

    /****************************************************************
    Create global variable to set when jquery-bootstrap style is used:
    window.Highcharts.USE_JB_STYLE:
    true : Allways. Force chart.options.styledMode = true
    false: Never.
    STRING: Only if chart.styledMode = true in options

    Extend all (known) constructor to include className "use-jquery-bootstrap-style"
    and force chart.options.styledMode = true to use css-style given in
    jquery-bootstrap if conditions in window.Highcharts.USE_JB_STYLE and options
    are set
    ****************************************************************/
    if (Highcharts.USE_JB_STYLE === undefined)
        Highcharts.USE_JB_STYLE = 'only if styledMode = true';

    function get(obj, idList ){
        idList = idList.split('.');
        let result = obj;
        idList.forEach(id => result = result[id] = result[id] || {} );
        return result;
    }

    function getCssVar( id, ns = ':root' ){
        let r = document.querySelector(ns);
        let rs = getComputedStyle(r);
        return parseFloat(rs.getPropertyValue('--' + id));
    }

    /*
    function setCssVar( id, value, ns = ':root' ){
        let r = document.querySelector(ns);
        r.style.setProperty('--'+id, value);
    }
    */

    //Adjust button size to fit with jquery-bootstrap
    let buttonHeight = [], buttonPadding = [];
    function setHeightAndPadding(obj, idList, index = 0, inclWidth){
        let opt = get(obj, idList);
        opt.height  = buttonHeight[index];
        opt.padding = buttonPadding[index];
        if (inclWidth)
            opt.width = buttonHeight[index];
    }


    ['chart', 'stockChart', 'mapChart',  'ganttChart'].forEach( constructorId => {
        if (nsHC[constructorId])
            nsHC[constructorId] = function( originalConstructor ){
                return function(){
                    let options    = arguments[1],
                        chartOpt   = options ? options.chart || {} : {};

                    if ( (  Highcharts.USE_JB_STYLE === true) ||
                         ( (Highcharts.USE_JB_STYLE !== false) && chartOpt.styledMode) ){

                        chartOpt.styledMode = chartOpt.styledMode || true;

                        //Get jquery-bootstrap padding, font-size and line-height from css to calc height of buttons.
                        let $elem = $('<div/>')
                            .hide()
                            .appendTo( $('body') );

                        ['btn-sm btn-xs', 'btn btn-sm'].forEach( (classSet, index) => {
                            classSet = classSet.split(' ');
                            let className = classSet[ $('html').hasClass('touchevents') ? 0 : 1];

                            $elem.removeClass()
                                .addClass(className)
                                .addClass('this-is-a-temp-btn');

                            const ns          = '.this-is-a-temp-btn' + '.'+className,
                                  lineHeight  = getCssVar('bs-btn-line-height', '.btn'),
                                  paddingX    = 16 * getCssVar('bs-btn-padding-x', ns),
                                  paddingY    = 16 * getCssVar('bs-btn-padding-y', ns),
                                  fontSize    = 16 * getCssVar('bs-btn-font-size', ns);

                            //Calc new default button for Highcharts ("1" = border-width) adjusted for padding
                            let hcButtonHeight = 1 + paddingY + lineHeight*fontSize + paddingY + 1 - 2*paddingX;
                            buttonHeight[index] = hcButtonHeight;
                            buttonPadding[index] = paddingX;
                        });

                        $elem.remove();


                        //Set new height of rest-zoom-button
                        setHeightAndPadding(chartOpt, 'zooming.resetButton.theme');

                        //Set new height for buttons in range-selector
                        setHeightAndPadding(options, 'rangeSelector.buttonTheme');

                        //@todo Set new height and width for context-menu-button - need also to recalc size of menu-char etc.
                        //setHeightAndPadding(options, 'exporting.buttons.contextButton', 1, true);

                        //@todo Set new height and width for map-zoom-button - need also to recalc size of menu-char etc.
                        //setHeightAndPadding(options, 'mapNavigation.buttonOptions', 1, true);


                        //Save adjusted options
                        arguments[1].chart = chartOpt;

                    }
                    let chart = originalConstructor.apply(this, arguments);

                    if (chartOpt.styledMode){

                        //Add class "use-jquery-bootstrap-style" to div with <select> for range-selector (stockChart)
                        if (chart.rangeSelector)
                            chart.rangeSelector.div ? $(chart.rangeSelector.div).addClass('use-jquery-bootstrap-style') : null;

                        //Adding class "use-jquery-bootstrap-style" to container
                        let container = chart.container;
                        if (chart.scrollablePlotArea)
                            container = chart.scrollablePlotArea.parentDiv;
                        if (container)
                            $(container).addClass('use-jquery-bootstrap-style');
                    }

                    return chart;
                };
        }( nsHC[constructorId] );
   });



    /****************************************************************
    Extend Highcharts.setOptions to allow update of all charts
    ****************************************************************/
    nsHC.setOptions = function (setOptions) {
        return function (options, redraw) {
            var result = setOptions.call(this, options);
            if (redraw && nsHC.charts)
                nsHC.charts.forEach( chart => {
                    if (chart){
                        chart.options.lang = nsHC.getOptions().lang;
                        chart.redraw(false);
                        translateChart(chart);
                    }
                });
            return result;
        };
    } (nsHC.setOptions);


    /****************************************************************
    LEGEND
    When two or more series are linked together via series.linkedTo:..
    there was a 'bug': Hover over the legend for the multi series only highlight
    the first series.
    Based on a solution/fix provided by Highcharts the Legend.setItemEvents is altered below
    The method is from version 10.3.1
    The added code is left-side-aligned
    See https://www.highcharts.com/forum/viewtopic.php?t=39679, and
        https://jsfiddle.net/daniel_s/1hL6saxn/, and
        https://github.com/highcharts/highcharts/issues/17961

    @todo Check if this is fixed in version 12
    ****************************************************************/
    /**
     * @private
     * @function Highcharts.Legend#setItemEvents
     * @param {Highcharts.BubbleLegendItem|Point|Highcharts.Series} item
     * @param {Highcharts.SVGElement} legendLabel
     * @param {boolean} [useHTML=false]
     * @emits Highcharts.Point#event:legendItemClick
     * @emits Highcharts.Series#event:legendItemClick
     */
    //var merge = Highcharts.merge;
    //var fireEvent = Highcharts.fireEvent;


    //Ready to add actions for setItemEvents
    Highcharts.Legend.prototype.setItemEvents = function (setItemEvents) {
        return  function(/*item*/ /*, legendLabel, useHTML*/){
                    let result = setItemEvents.apply(this, arguments);

                    //Extra code added here

                    return result;
                };

    }( Highcharts.Legend.prototype.setItemEvents );

    /* From version 4
    Highcharts.Legend.prototype.setItemEvents = function (item, legendLabel, useHTML) {
        var legend = this,
            legendItem = item.legendItem || {},
            boxWrapper = legend.chart.renderer.boxWrapper,
            isPoint = item instanceof Highcharts.Point,
            activeClass = 'highcharts-legend-' +
                (isPoint ? 'point' : 'series') + '-active',
            styledMode = legend.chart.styledMode,
            // When `useHTML`, the symbol is rendered in other group, so
            // we need to apply events listeners to both places
            legendElements = useHTML ?
                [legendLabel,
            legendItem.symbol] :
                [legendItem.group];
        var setOtherItemsState = function (state) {
                legend.allItems.forEach(function (otherItem) {
                    if (item !== otherItem) {
                        [otherItem]
                            .concat(otherItem.linkedSeries || [])
                            .forEach(function (otherItem) {
                            otherItem.setState(state, !isPoint);
                    });
                }
            });
        };

var setLinkedSeriesState = function ( state ){
    console.log('kommer vi her?', state, this);return;
    if (item.linkedSeries && item.linkedSeries.length){
        item.linkedSeries.forEach(function(linkedItem){
            linkedItem.setState(state);
        });
    }
};

        // Set the events on the item group, or in case of useHTML, the item
        // itself (#1249)
        for (var _i = 0, legendElements_1 = legendElements; _i < legendElements_1.length; _i++) {
            var element = legendElements_1[_i];
            if (element) {
                element
                    .on('mouseover', function () {
                    if (item.visible) {
                        setOtherItemsState('inactive');
                    }
                    item.setState('hover');
setLinkedSeriesState('hover');
                    // A CSS class to dim or hide other than the hovered
                    // series.
                    // Works only if hovered series is visible (#10071).
                    if (item.visible) {
                        boxWrapper.addClass(activeClass);
                    }
                    if (!styledMode) {
                        legendLabel.css(legend.options.itemHoverStyle);
                    }
                })
                    .on('mouseout', function () {
                    if (!legend.chart.styledMode) {
                        legendLabel.css(merge(item.visible ?
                            legend.itemStyle :
                            legend.itemHiddenStyle));
                    }
                    setOtherItemsState('');
                    // A CSS class to dim or hide other than the hovered
                    // series.
                    boxWrapper.removeClass(activeClass);
                    item.setState();
setLinkedSeriesState();
                })
                    .on('click', function (event) {
                    var strLegendItemClick = 'legendItemClick',
                        fnLegendItemClick = function () {
                            if (item.setVisible) {
                                item.setVisible();
                        }
                        // Reset inactive state
                        setOtherItemsState(item.visible ? 'inactive' : '');
                    };
                    // A CSS class to dim or hide other than the hovered
                    // series. Event handling in iOS causes the activeClass
                    // to be added prior to click in some cases (#7418).
                    boxWrapper.removeClass(activeClass);
                    // Pass over the click/touch event. #4.
                    event = {
                        browserEvent: event
                    };
                    // click the name or symbol
                    if (item.firePointEvent) { // point
                        item.firePointEvent(strLegendItemClick, event, fnLegendItemClick);
                    }
                    else {
                        fireEvent(item, strLegendItemClick, event, fnLegendItemClick);
                    }
                });
            }
        }
    };
    */

    /***************************************************************
    LANGUAGE
    ***************************************************************/
    //global_lang = Translation of global names/sentences. Is updated in
    var global_lang = {

            //contextButtonTitle is removed because it is not (for now) possible to translate the title
            contextButtonTitle: '',//{da:'Genvejsmenu ???', en:'Chart context menu'},

            downloadCSV : {da:'Hent som CSV',   en:'Download as CSV'},
            downloadJPEG: {da:'Hent som JPEG',  en:'Download as JPEG'},
            downloadPDF : {da:'Hent som PDF',   en:'Download as PDF'},
            downloadPNG : {da:'Hent som PNG',   en:'Download as PNG'},
            downloadSVG : {da:'Hent som SVG',   en:'Download as SVG'},
            downloadXLS : {da:'Hent som XLS',   en:'Download as XLS'},

            viewFullscreen  : {da:'Vis i fuld skærm',   en:'View in full screen'},
            exitFullscreen  : {da:'Forlad fuld skærm',  en:'Exit full screen'/*Exit from full screen'},*/},

            drillUpText     : {da:'◁ Tilbage til {series.name}',   en:'◁ Back to {series.name}'},

            hideData        : {da:'Skjul data-tabel',   en: 'Hide data table'},
            viewData        : {da:'Vis data-tabel',     en: 'View data table'},

            //Hvad bruges denne her til? invalidDate     : {da:'Ugyldig dato',   en: 'Invalid date'},
            noData          : {da:'Ingen data',     en: 'No data to display'},

            printChart      : {da:'Udskriv graf',   en: 'Print chart'},

            resetZoom       : {da:'Reset zoom',             en: 'Reset zoom'},
            resetZoomTitle  : {da:'Reset zoom niveau 1:1',  en: 'Reset zoom level 1:1'},

            loading         : {da:'Indlæser...',    en: 'Loading...'},

        };


    //checkPath(obj, path) Check if obj contains a nested object descriped in path
    //Eq. checkPath(obj, "level1.level2.level3") return true if obj.level1.level2.level3 exists
    function checkPath(obj, path){
        path = path.split('.');

        for (var i=0; i < path.length; i++) {
            if (!obj || !obj.hasOwnProperty(path[i]))
                return false;
            obj = obj[path[i]];
        }
        return obj;
    }

    function isObject(obj){
        return $.type(obj) == "object";
    }

    function translate(obj){
        //Assume if obj is Object: obj is a {da:"dansk", en:"english",...}-object
        return isObject(obj) ? obj[i18next.language] : obj;
    }

    /*
    translateElement(element, options, id)
    Add i18next to element if it exists else save
    translation and set to current language
    */
    function translateElement(element, options, id, simple){
        if (!id || !options[id])
            return;
        var id_i18next = id+'i18next';

        //Save {da,en} until next update and use sentence for now
        if ( isObject(options[id]) )
            options[id_i18next] = $.extend(true, {}, options[id]);

        options[id] = options[id_i18next] ? translate(options[id_i18next]) : options[id];

        if (element && options[id_i18next]){
            if (simple){
                $(element).text( translate(options[id_i18next]) );
            }
            else
                $(element).i18n( options[id_i18next] );
        }
    }


    /****************************************************
    translateChart(chartOrEvent)
    Translate the different parts of a chart that is not
    re-created on reset
    *****************************************************/
    function translateChart(chartOrEvent){
        var chart = chartOrEvent.target ? chartOrEvent.target : chartOrEvent;

//console.log('translateChart', chart);

        //Translate menu-items in the export-menu but only when the fullscreen is not open
        if (chart.fullscreen && !chart.fullscreen.isOpen){
            var menuItems = checkPath(chart, 'options.exporting.buttons.contextButton.menuItems');
            if (menuItems)
                menuItems.forEach( (id, index) => {
                var elem = chart.exportDivElements ? chart.exportDivElements[index] : null;
                translateElement(elem, chart.options.lang, id);
            });
        }

        if (chart.series)
            chart.series.forEach( serie => {
            //Translate valuePrefix amd valueSuffix of tooltips - both in original optiona and in shortcut version
            if ( checkPath(serie, 'tooltipOptions.valuePrefix') )
                translateElement(null, serie.tooltipOptions, 'valuePrefix');
            if ( checkPath(serie, 'options.tooltip.valuePrefix') )
                translateElement(null, serie.options.tooltip, 'valuePrefix');

            if ( checkPath(serie, 'tooltipOptions.valueSuffix') )
                translateElement(null, serie.tooltipOptions, 'valueSuffix');
            if ( checkPath(serie, 'options.tooltip.valueSuffix') )
                translateElement(null, serie.options.tooltip, 'valueSuffix');
        });

        //Translate range-selector buttons and drop-down
        let crs = chart.rangeSelector,
            crsbo = crs ? crs.buttonOptions : null;
        if (crsbo){
            crsbo.forEach( (buttonOpt, index) => {
                //Translate button
                translateElement(null, buttonOpt, 'text');
                translateElement(null, buttonOpt, 'title');

                //Translate options in select
                crs.dropdown[index+1].innerHTML = buttonOpt.title || buttonOpt.text;
            });

            //Align elements (buttons and select) to update select
            crs.alignElements();

            //Update label for dropbox in range-selector
            let selectedText = (crs.selected > -1) && crsbo[crs.selected] ? crsbo[crs.selected].text : '';
            selectedText = selectedText || Highcharts.defaultOptions.lang.rangeSelectorZoom || 'Zoom';
            crs.dropdownLabel.attr({text: selectedText + ' ▾'});
        }
    }

    //Translate all chartts when they load or reset
    nsHC.addEvent(nsHC.Chart, 'render', translateChart);


    /****************************************************
    Extend Highcharts.SVGRenderer.prototype.text and
           Highcharts.Point.prototype.tooltipFormatter
    to allow text as {da:"...", en:"..."}
    *****************************************************/
    nsHC.SVGRenderer.prototype.buildText = function(SVGRenderer_buildText) {
        return function (wrapper) {
            if (isObject(wrapper.textStr)){
                //Assume textStr is a {da:"dansk", en:"english",...}-object
                $(wrapper.element).i18n(wrapper.textStr);
                wrapper.textStr = wrapper.element.innerHTML;
                wrapper.useHTML = true;
            }
            return SVGRenderer_buildText.call(this, wrapper);
        };
    } (nsHC.SVGRenderer.prototype.buildText);


/*
    nsHC.SVGRenderer.prototype.button = function (SVGRenderer_button) {
        return function () {
            arguments[0] = translate(arguments[0]);
            return SVGRenderer_button.apply(this, arguments);
        };
    } (nsHC.SVGRenderer.prototype.button);


    nsHC.SVGRenderer.prototype.text = function(SVGRenderer_text) {
        return function() {
            arguments[0] = translate(arguments[0]);
            return SVGRenderer_text.apply(this, arguments);
        };
    } (nsHC.SVGRenderer.prototype.text);
*/

    nsHC.Point.prototype.tooltipFormatter = function (tooltipFormatter) {
       return function(){
           [this, this.options, this.series].forEach( obj => {
                let hasName = !!(obj && obj.name),
                    name    = hasName ? obj.name : '',
                    translateName = hasName && isObject(name);

                if (translateName)
                    obj.i18nextName = name;

                obj.name = obj.i18nextName ? i18next.sentence(obj.i18nextName) : obj.name;
            });

            return tooltipFormatter.apply(this, arguments);
        };
    }(nsHC.Point.prototype.tooltipFormatter);


    /***************************************************************
    NUMBER-FORMAT
    Using Numeral to set number-format
    Overwrite numeral.locale to update Highcharts setting regarding
    number format
    ***************************************************************/
    numeral.locale = function(numeral_locale){
        return function(id){
            var locale = numeral.locales[id.toLowerCase()],
                delimiters = locale ? locale.delimiters : null;

            if (delimiters)
                Highcharts.setOptions({
                    lang: {
                        decimalPoint: delimiters.decimal,
                        thousandsSep: delimiters.thousands
                    }
                }, true);

            return numeral_locale.apply(this, arguments);
        };
    }(numeral.locale);



    /***************************************************************
    DATE-FORMATS
    1: Change name of month and weekday when language is changed by i18next
    2: Set format-functions for xAxis and tooltips using formats set with moment-simple-format
    3: Set and update when timezone is changed
    ***************************************************************/

    /**************************************************************
    1: onLanguageChanged - Called when i18next changes language:
    Updates global_lang and
    Change names of month and weekdays
    ***************************************************************/
    nsHC.onLanguageChanged = function(language, callLocalize = true){
        language = language || i18next.language || 'en';

        //Translate global language
        var lang = $.extend(true, {}, global_lang);
        $.each(lang, function(id){
            translateElement(null, lang, id);
        });
        nsHC.setOptions({lang: lang}, false);

        //Check if moment has the same language
        if ((moment.locale() != language) && (moment.locales().indexOf(language) > -1))
            moment.locale(language);

        //Set name of month, weekday etc.
        nsHC.setOptions({
            lang: {
                months       : moment.months(),
                shortMonths  : moment.monthsShort(),
                shortWeekdays: moment.weekdaysShort(),
                weekdays     : moment.weekdays(), //= 3 char. Alt: moment.weekdaysMin() = 2 char
            }
        }, true);

        if (callLocalize)
            $('body').localize();
    };

    /**************************************************************
    2: Create new dateFormats as functions using moment-simple-format
        options = {
            weekday: 'Full'/'Short'/'Digital'/'None'
            month  : 'Full'/'Short'/'Digital'/'None'
            year   : 'Full'/'Short'/'Digital'/'None'
        }
        Highcharts uses the following keys in dateFormats
        `%a`: Short weekday, like 'Mon'
        `%A`: Long weekday, like 'Monday'
        `%d`: Two digit day of the month, 01 to 31
        `%e`: Day of the month, 1 through 31
        `%w`: Day of the week, 0 through 6
        `%b`: Short month, like 'Jan'
        `%B`: Long month, like 'January'
        `%m`: Two digit month number, 01 through 12
        `%y`: Two digits year, like 09 for 2009
        `%Y`: Four digits year, like 2009
        `%H`: Two digits hours in 24h format, 00 through 23
        `%k`: Hours in 24h format, 0 through 23
        `%I`: Two digits hours in 12h format, 00 through 11
        `%l`: Hours in 12h format, 1 through 12
        `%M`: Two digits minutes, 00 through 59
        `%p`: Upper case AM or PM
        `%P`: Lower case AM or PM
        `%S`: Two digits seconds, 00 through 59
        `%L`: Milliseconds (naming from Ruby)

    **************************************************************/

    function timestampToMoment(timestamp){
        return moment(timestamp).tzMoment();
    }

    /************************************************
    function anyDateFormat(timestamp, options)
    options: {
        format: moment-format [string] or
                moment-simple-format.dateFormat [{weekday, month, year}]
        inclTime: [boolean]
    }
    *************************************************/
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
    function monthYearDateFormatFunc(timestamp)        { return _monthYearDateFormatFunc(timestamp, false, /*false*/true); }
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
        shortDateFormatFunc   = createDateFormat({weekday:'None', month:'Digital', year:'Short'}), //30/01/18

        tooltipDateTimeFormatFunc = createDateFormat({weekday:'Short', month:'Short', year:'Full'}, true ), //Mon,  30. Jan 2019 13:00
        tooltipDateFormatFunc     = createDateFormat({weekday:'Short', month:'Short', year:'Full'}, false); //Mon,  30. Jan 2019



    nsHC.dateFormats = $.extend(nsHC.dateFormats, {
        //xAxis[NAME] used by x-axis                    //Eks                   HC default
        xAxisMillisecond :  timeFormatFunc,             //13:00 or 01:00pm      '%H:%M:%S.%L'
        xAxisSecond      :  timeFormatFunc,             //13:00 or 01:00pm      '%H:%M:%S'
        xAxisMinute      :  timeFormatFunc,             //13:00 or 01:00pm      '%H:%M'
        xAxisHour        :  timeFormatFunc,             //13:00 or 01:00pm      '%H:%M'
        xAxisDay         :  shortDateFormatFunc,        //30. Jan               '%e. %b'
        xAxisWeek        :  shortDateFormatFunc,        //30. Jan               '%e. %b'
        xAxisMonth       :  monthYearDateFormatFunc,    //Jan 19                '%b \'%y'
        xAxisYear        :  createDateFormat('YYYY'),   //19                    '%Y'

        //tooltip[NAME] used by tooltip                         //Eks                       HC default
        tooltipMillisecond : tooltipDateTimeFormatFunc,         //Mon,  30. Jan 19 13:00    '%A, %b %e, %H:%M:%S.%L'  = Sunday, Jan 30, 12:00:00,00
        tooltipSecond      : tooltipDateTimeFormatFunc,         //Mon,  30. Jan 19 13:00    '%A, %b %e, %H:%M:%S'     = Sunday, Jan 30, 12:00:00
        tooltipMinute      : tooltipDateTimeFormatFunc,         //Mon,  30. Jan 19 13:00    '%A, %b %e, %H:%M'        = Sunday, Jan 30, 12:00
        tooltipHour        : tooltipDateTimeFormatFunc,         //Mon,  30. Jan 19 13:00    '%A, %b %e, %H:%M'        = Sunday, Jan 30, 12:00
        tooltipDay         : tooltipDateFormatFunc,             //Mon,  30. Jan 19          '%A, %b %e, %Y'           = Sunday, Jan 30, 2019
        tooltipWeek        : tooltipDateFormatFunc,             //Mon,  30. Jan 19          'Week from %A, %b %e, %Y' = Week from Sunday, Jan 30, 2019
        tooltipMonth       : fullMonthFullYearDateFormatFunc,   //Januar 2019'              '%B %Y',                  = January 2019
        tooltipYear        : createDateFormat('YYYY'),          //2019                      '%Y'                      = 2019
    });

    /*
    Updates defaultOptions with default date-formats
    dateTimeLabelFormats: dateTimeLabelFormats
    For series on a datetime axes, the date format in the tooltip's header will by default be guessed based on the closest data points.
    This member gives the default string representations used for each unit. For an overview of the replacement codes, see dateFormat.
    */
    nsHC.setOptions({
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
    Use moment-simple-format and moment-timezone.js to return the timezone offset for
    individual timestamps, used in the X axis labels and the tooltip header.
    Highcharts do not seem to support tz="local" therefore a getTimezoneOffset is set
    instead of setOptions({time: {timezone:"..."}})
    ***************************************************************/
    nsHC.setOptions({
        time: {
            getTimezoneOffset: function (timestamp) {
                return -1*timestampToMoment(timestamp).utcOffset();
            }
        }
    });

    var timezone = moment.simpleFormat.options.timezone;
    //Update charts when timezone or format for date/time is changed
    moment.sfOnSetFormat( function(options){
        if ((timezone != options.timezone) && nsHC.charts)
            //Mark all date-axes' labels to be rearranged
            nsHC.charts.forEach( chart => {
                if (chart && chart.axes)
                    chart.axes.forEach( axis => {
                        if (axis && axis.options && (axis.options.type == "datetime")){
                            axis.tickPositions = undefined; //Not the right way according to https://github.com/highcharts/highcharts/issues/10525 but it works!
                            axis.update({});
                        }
                    });
                });

        nsHC.setOptions({}, true);
        timezone = options.timezone;
    });

}(jQuery, this.Highcharts,  this.moment, this.i18next, this.numeral, this, document));