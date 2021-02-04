/****************************************************************************
	_strftime-moment.js

****************************************************************************/

(function (/*$, Highcharts, moment, i18next, window, document, undefined*/) {
	"use strict";

	//var ns = Highcharts;

    // momentSF2Highchart
    //Gives convertion between php strftime and moment formats
    var momentSF2Highchart = [
            //Weekday
            {from: 'dddd', to: 'A'},    //Sunday
            {from: 'ddd',  to: 'a'},    //Sun
            {from: 'MMMM', to: 'B'},    //January

            //Day
            {from: 'DD',  to: 'd'},    //01-31
            {from: 'D',   to: 'e'},    // 1-31

            //Month
            {from: 'MMM',  to: 'b'},    //Jan
            {from: 'MM',   to: 'm'},    //01

            //Year
            {from: 'YYYY', to: 'Y'},    //1968
            {from: 'YY',   to: 'y'},    //68

            //Week number ISO-8601:1988
                                        //%U: Week number of the given year, starting with the first Sunday as the first week	13 (for the 13th full week of the year)
            {from: 'W',    to: 'V'},    //%V: ISO-8601:1988 week number of the given year, starting with the first week of the year with at least 4 weekdays, with Monday being the start of the week	01 through 53 (where 53 accounts for an overlapping week)
                                        //%W: A numeric representation of the week of the year, starting with the first Monday as the first week	46 (for the 46th week of the year beginning with a Monday)

            //Hour
            {from: 'HH',   to: 'H'},    //01-23
            {from: 'H',    to: 'k'},    //1-23
            {from: 'hh',   to: 'I'},    //01-12
            {from: 'h',    to: 'l'},    //1-12

            //Minutes
            {from: 'mm',    to: 'M'},   //00-59

            //Seconds
            {from: 'ss',    to: 'S'},   //00-59

            //am/pm
            {from: 'a',     to: 'P'},   //"am" or "pm"

        ];

    function convert2strftime( mask ){
        $.each(momentSF2Highchart, function(index, fromTo ){
            mask = mask.replace(new RegExp(fromTo.from, 'g'), '%'+fromTo.to);
        });
        return mask;
    }

}(/*jQuery, this.Highcharts,  this.moment, this.i18next, this, document*/));