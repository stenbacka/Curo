angular.module('CuroProviders', [])
    .factory('DateService'
        , function($filter, $log) {

            var defaultDateFormat = "yyyy-MM-dd";
            this.setDefaultDateFormat = function(format) {
                defaultDateFormat = format;
            };

            var DateInterval = function(startDate,endDate,name) {
                if (!angular.isDate(endDate)) {
                    if (angular.isDate(startDate)) {
                        this.startDate = startDate;
                        this.endDate = new Date();
                        if (endDate) {
                            this.name = endDate;
                        }
                    } else {
                        $log.warn("Tried to create DateInterval with invalid parameters. param: ", startDate);
                    }
                } else {
                    if (angular.isDate(startDate) && angular.isDate(endDate)) {
                        this.endDate = endDate;
                        this.startDate = startDate;
                        if (name) {
                            this.name = name;
                        }
                    } else {
                        $log.warn("Tried to create DateInterval with invalid parameters. params: ", startDate, endDate, name);
                    }
                }
                
                function dateAsString(date, format) {
                    if (!format) {
                        format = defaultDateFormat;
                    }
                    return $filter('date')(date, format);
                }
                
                this.startDateAsString = function(format) {
                    return dateAsString(this.startDate, format);
                }
                this.endDateAsString = function(format) {
                    return dateAsString(this.endDate, format);
                }
            };

            var DateService = function() {
                function getMonth(year, month) {
                    if (!year) {
                        year = new Date().getFullYear();
                    }
                    $log.log(year, month);
                    var startDate = new Date(year,month,1);
                    return new DateInterval( startDate  // startDate
                                           , new Date(year,month + 1,0,23,59,59) // endDate
                                           , $filter('date')(startDate, "MMMM"));
                }

                var monthList = ['January', 'February', 'March', 'April'
                    , 'May', 'June', 'July', 'August', 'September', 'October'
                    , 'November', 'December'];
                    
                for (var i = 0; i < monthList.length; i++) {
                    this[monthList[i]] = 
                        angular.bind(this, function(month, year) {return getMonth(year, month);}, i);
                }
                
                this.dateInterval = function(startdate,endDate,name) {
                    return new DateInterval(startdate,endDate,name);
                }
                
                this.daysInterval = function(days,name) {
                    days = parseInt(days);
                    if (!isNaN(days)) {
                        var now = new Date();
                        var startDate = new Date(now.getFullYear(),d.getMonth(),d.getDate()-data.days);
                        return new DateInterval(startDate,name);
                    } else {
                        $log.warn("Invalid parameter in daysInterval.", days);
                        // Returns dummy interval to allow friendly failing
                        return new DateInterval(new Date(),name);
                    }
                }
            }

            return new DateService();
        }
    )
    .filter('dateIntervalName'
        , function($log) {
            return function(input) {
                if (input && input.name) {
                    return input.name;
                } else {
                    return "";
                }
            }
        }
    )
    ;
