angular.module('CuroProviders', ['CuroResources'])
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
    .service('TransactionSuper', ['$log', '$q', 'Transaction', 'CategoryService', function($log, $q, Transaction, CategoryService) {
        var queryFn = function(params) {
            var deferred = [];
            
            Transaction.query(params, function(data) {
                $log.info("data");
                angular.forEach(data, function(value) {
                    value.category = CategoryService.get(value.category);
                    //console.log("value.category", value.category);
                    deferred.push(value);
                });
            });
            
            return deferred;
        };
        var getFn = function(transactionId) {};

        return {
                query: queryFn,
                get: getFn
            };
    }])
    .service('CategoryService', ['$log', '$q', 'CategoryDao', function($log, $q, CategoryDao) {
        var CategoryObj = function(categoryName, parent) {
            this.id;// = -1
            this.name = categoryName || '';
            this.parent = parent;
            this.valid = false;
            this.created;// = "2012-06-26T22:53:34.583000"
            this.updated;// = "2012-08-13T15:59:46.675400"
            this.note = "";
            
            this.idString = function() {
                var value = this.name;
                var current = this.parent;
                while (current) {
                    value = current.name + "." + value;
                    current = current.parent;
                }
                return value;
            };

            this.canCreate = function() {
              return this.name !== '' && !this.valid;
            }
        };
        
        /////////////////////////////////////////////////////
        // Category service
        var categoryMap = {};
    
        var getExistingCategory = function(categortPath) {
            if (categortPath) {
                return categoryMap[categortPath];
            } else {
                return undefined;
            }
        };
        
        var parseCategoryPath = function(path) {
            if (!path || path === '') {
                return undefined;
            }
            var x = path.split('.');
            return x;
        };
        
        var findCorrectCategory = function(categories, categoryParts) {
            for (var i = 0; i < categories.length; i++) {
                var c = categories[i];
                if (categoryParts.length === 1) {
                    if (!c.parent) {
                        return c;
                    } else {
                        continue;
                    }
                }

                // categoryParts is guarenteed to be > 1 here
                var p = c.parent, ai = categoryParts.length - 2;
                var mismatch = false;
                while (p && !mismatch) {
                    if (p.name !== categoryParts[ai]) {
                        mismatch = true;
                    }
                    p = p.parent;
                    ai--;
                }
                if (!mismatch) {
                    return c;
                }
            }
        };
        
        var getCategory = function(categoryParts) {
            //dump("categoryParts", categoryParts);
            if (categoryParts && categoryParts.length > 0) {
                
                var categoryName = categoryParts[categoryParts.length - 1];
                console.log(CategoryDao);
                var categories = CategoryDao.query({name: categoryName});
                // = webService.get(categoryParts[categoryParts.length - 1]);
                //dump("categories", categories);
                
                var category = null;
                if (categories.length > 0) {
                    category = findCorrectCategory(categories, categoryParts);
                    category.valid = true;
                    categoryMap[category.idString()] = category;
                } else {
                    category = new CategoryObj(categoryName);
                    category.valid = false;
                    categoryParts.splice(-1, 1);
                    category.parent = getCategory(categoryParts);
                }
            } else if(!categoryParts) {
                var category = new CategoryObj();
                category.valid = false;
            } else {
                var category = undefined;
            }

            return category;
        }
        
        var validate = function(categoryParts) {
        
            for (var i = 0; i < categoryParts.length; i++) {
                var c = getExistingCategory(categoryParts[i]);
                if (!c) {
                    var cs = webService.get(categoryParts[i]);
                    if (cs.length === 0) {
                        return false;
                    }
                }
            }
        
            return categoryParts[categoryParts.length - 1].valid;
        };
        
        var updateCategoryFn = function(category, newValue) {
        
            var cachedCategory = getExistingCategory(newValue);
            
            if (cachedCategory) {
                return cachedCategory;
            } else {
                if (category.valid) {
                    // old=valid_new=invalid-case
                    return createCategory(newValue);
                } else {
                    // old=invalid_new=*valid-case
                    var categoryParts = parseCategoryPath(categoryPath);
                    category.valid = validate(categoryParts);
                    category.name = newValue;
                }
                return category;
            }
        };
        
        var getCategoryFn = function(categoryPath) {
        
            var category = getExistingCategory(categoryPath);
            
            if (!category) {
                var categoryParts = parseCategoryPath(categoryPath);
                category = getCategory(categoryParts);
            }
            return category;
        };
        
        var categoryService = {};
        // Public methods
        categoryService.Category = CategoryObj;
        categoryService.updateCategory = updateCategoryFn;
        categoryService.getCategory = getCategoryFn;

        return categoryService;
    }])
    ;








