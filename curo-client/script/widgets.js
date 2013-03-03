
angular.module('CuroComponents', [])
    .directive('ngBlur', function ($parse) {
        return {
            restrict: 'A',
            link:
                function postLink(scope, element, attrs) {
                    if (attrs.ngBlur) {
                        var fn = $parse(attrs.ngBlur);
                        element.bind('blur', function (event) {
                            scope.$apply(function () {
                                fn(scope, {$event: event});
                            });
                        });
                    }
                }
        };
    })
    .directive('monthlyTransactionTable',
        function(Transaction,$log) {
            return {
                restrict: 'EA',
                replace: true,
                scope: { month:'=' },
                templateUrl: '/client/partials/monthly-table.html',
                link: function postLink(scope, iElement, iAttrs) {
                    // Result is set in callback to enable loading message
                    Transaction.query({interval:scope.month}, function(data) {
                        scope.ts = data;
                    });
                },
                controller: ['$scope','Transaction','Entity','Category','$log',
                 function($scope, Transaction, Entity, Category, $log) {
                    $scope.getEntity = function(t) {
                        var e = t.entity;
                        Entity.get(e, function(data) {
                            delete t.entity;
                            t.entity = data;
                        });
                    }
                    $scope.getCategory = function(transaction) {
                        var getCategoryRecursive = function(category) {
                            return Category.get(category, function(data) {
                                if (data && data.parent) {
                                    data.parent = getCategoryRecursive(data.parent);
                                } else {
                                    $scope.doneLoadingCategory = true;
                                }
                            });
                        };
                        transaction.category = getCategoryRecursive(transaction.category);
                    }
                    $scope.getFullCategoryName = function(category) {
                        if (!$scope.doneLoadingCategory) return "Loading...";
                    
                        var name = "";
                        var saftlyCounter = 0;
                        for (var cat = category; cat != null && saftlyCounter < 10; (cat = cat.parent ? cat.parent : null), saftlyCounter++) {
                            if (cat && cat.name) {
                                name = cat.name + "." + name;
                            } else {
                                name = "??." + name;
                            }
                        }
                        // Remove dot at end of string
                        if (name.length > 0) {
                            name = name.slice(0,-1);
                        }
                        return name;
                    };
                }
                ]
            }
        }
    )
    .directive('currency', function($log) {
        return {
                restrict: 'C',
                link: function postLink(scope, iElement, iAttrs) {
                    var prefix,suffix,decimals;
                    if (iAttrs.currencyPrefix) {
                        prefix = iAttrs.currencyPrefix;
                    }
                    if (iAttrs.currencySuffix) {
                        suffix = iAttrs.currencySuffix;
                    }
                    if (iAttrs.currencyDecimals) {
                        decimals = iAttrs.currencyDecimals;
                    }
                
                    scope.$watch(function() {return iElement.text();}, function(oldValue, newValue) {
                        newValueNumber = parseInt(newValue);
                        if (newValueNumber == NaN) {
                            $log.info("Tried to pass non-number to curo's currency directive. Input: " + newValue);
                            return ;
                        }
                        var isPos = newValueNumber >= 0 ? true : false;
                    
                        if (decimals) {
                            $log.log("Setting deciamls " + decimals);
                            iElement.text(newValueNumber.toFixed(decimals));
                        }
                    
                        if (!isPos && iElement.hasClass("amount-positive")) {
                            iElement.removeClass("amount-positive");
                        }
                        if (isPos && iElement.hasClass("amount-negative")) {
                            iElement.removeClass("amount-negative");
                        }
                        if (isPos) {
                            iElement.addClass("amount-positive");
                        } else {
                            iElement.addClass("amount-negative");
                        }
                    });
                }
            }
    })
    .directive('datagrid', function($rootScope) {
        return {
            templateUrl: '/client/partials/datagrid.html',
            restrict: 'CA',
            scope: {
                rows: '=datagridRows',
                events: '&datagridRowsEvents',
                columns: '=datagridColumns'
            },
            controller:  function($scope, $element, $attrs) {
                if (!$scope.rows) {
                    $scope.rows = [];
                }
                // Private functions
                var lastRowChanged = function(scope) {
                    var lastRow = scope.rows[scope.rows.length - 1];
                    return !objectEmpty(lastRow);
                }

                var addRow = function() {
                    $scope.rows.push({});
                };

                var removeRow = function(index) {
                    return $scope.rows.splice(index, 1)[0];
                };
              
                var objectEmpty = function(obj) {
                    if (!obj) return true;
                    var name = obj.name || '';
                    var age = obj.age || '';
                    var sex = obj.sex || '';
                    return name === '' && age === '' && sex === '';
                }

                // Event handlers
                $scope.$on('datagrid:valueChange', function(event, args) {
                    var row = $scope.rows[args.rowId];
                    if (row) {
                        //scope.$emit('datagrid:rowChange', {rowId: args.rowId, row: row});
                        console.log("here");
                        $scope.events({args: {rowId: args.rowId, row: row}});
                    }
                });

                // Public functions
                $scope.toggleEdit = function() {
                    $scope.editMode = !$scope.editMode;
                }

                $scope.$watch(lastRowChanged, function(newValue) {
                    if (newValue) {
                        addRow();
                        var args = {rowId: $scope.rows.length - 1};
                        args.row = $scope.rows[args.rowId];
                        //scope.$emit('datagrid:newRow', args);
                        $scope.events({args: args});
                    }
                });
              
                $scope.deleteRow = function(index) {
                    var row = removeRow(index);
                    //scope.$emit('datagrid:rowDeleted', {row: row});
                    $scope.events({args: {row: row}});
                };
                
                $scope.foo = function() {
                    console.log("loool");
                };

                // Init
                $scope.editMode = false;
                //addRow();
            },
            compile: function(element, attrs) {
                console.log("compl");
                return {
                    pre: function preLink(scope, element, attrs) {
                        console.log("preF", scope);
                    },
                    post: function postLink(scope, element, attrs) {
                    
                    }
                };
            },
            link: function(scope, element, attrs) {
                console.log("columns", scope.columns);
                scope.valueChanged = function(args) {
                    console.log("alueCjange", args);
                };
            }
        };
    })
    .directive('cellContenteditable', function($parse) {
        return {
            require: 'ngModel',
            scope: {
                editMode: '=cellEditmode'
                ,valueChange: '&cellValueChange'
                ,formatter: '&cellFormatter'
                ,teest: '=teest'
            },
            link: function postLink(scope, elm, attrs, ctrl) {
                elm.bind('keyup', function(event) {
                    scope.$apply(function() {
                        //ctrl.$setViewValue(elm.text());
                    });
                    scope.valueChange({args: {cellValue: ctrl.$viewValue, rowId: scope.$index}});
                });

                ctrl.$render = function() {
                    //console.log("dd", ctrl.$viewValue);
                    if (ctrl.$viewValue) {
                        elm.text(ctrl.$viewValue);
                    }
                };

                var rawElm = elm[0];
                if (scope.editMode) {
                    rawElm.contentEditable = true;
                }
                scope.$watch('editMode', function(newValue) {
                    if (newValue) {
                        rawElm.contentEditable = newValue;
                    }
                });
                
                if (scope.formatter) {
                    var formatterFunction = scope.formatter({scope:scope, elm:elm, attrs:attrs});
                    if (formatterFunction) {
                      ctrl.$formatters.push(formatterFunction);
                    }
                }
            }
        };
    })
    ;

