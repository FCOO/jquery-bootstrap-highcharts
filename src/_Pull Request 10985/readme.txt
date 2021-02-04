This is the adjusted scss-files used in pull request https://github.com/highcharts/highcharts/pull/10985

This feature contains a complete list of SCSS-variables used to create and modify the Style Sheets for Highcharts when used in Styled mode and is an addition to Custom themes in styled mode

Compared to previous versions all the properties is now associated to a individual scss-variable

It allows user to alter any part of the Style Sheets with there own values or using values from other packages

All variable-names are prefixed with $highcharts- to prevent error when mixed with SCSS-files from other packages.
A scss-file (_variables_original.scss) can be used to ensure backward compatible of new variable-names

*************************************************************************************
* The PR was made based on version 7 but was not accepted.                          *
* The scss-file in version 8 are not seperated in variables.css and styles.scss     *
* but is one combined file.                                                         *
* Therefore the PR can't be used in version 8.                                      *       
*************************************************************************************

