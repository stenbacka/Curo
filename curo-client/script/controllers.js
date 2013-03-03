function MainTabs($scope, $location, $log) {
  $scope.tabs = [{title: 'Home',    url: '/client/home'},
                 {title: 'Yearly',  url: '/client/yearly'},
                 {title: 'Monthly', url: '/client/monthly'},
                 {title: 'Add',     url: '/client/add'}];

  $scope.getClass = function($index) {
    var this_url = $scope.tabs[$index].url
    var current_url = $location.path()
    return (this_url == current_url) ? "active": "";
  }
}

function MonthsController($scope,DateService,Transaction,CategoryService) {
//    $scope.months = [DateService.January(), DateService.February(), DateService.March()
//                    ,DateService.April(),DateService.May(),DateService.June()
//                    ,DateService.July(),DateService.August(),DateService.September()
//                    ,DateService.October(),DateService.November(),DateService.December()];
    $scope.months = [DateService.February()];
//    $scope.tabModel = $scope.months[new Date().getMonth()].name;
        $scope.tabModel = $scope.months[0].name;
    /*var loopUp = CategoryService.lookUp();
    console.log("CategoryService", loopUp);
    $scope.searchCat = function(event, args) {
        console.log("changed!", $scope.sc);
        loopUp.find($scope.sc);
        console.log("loopUp", loopUp, loopUp.isComplete(), loopUp.currentLeaf());
    };
    $scope.sc = "";*/
}


function MonthController($scope, TransactionSuper, CellFormatters) {
    console.log("TransactionSuper", TransactionSuper);
    $scope.rows = TransactionSuper.query({interval:$scope.month});
    $scope.columns =
        [{name:'id', displayName:'id'}
        ,{name:'order_date',displayName:'Order date'}
        ,{name:'category',displayName:'Category', formatter:CellFormatters('category')}
        ,{name:'amount',displayName:'Amount', formatter:CellFormatters('currency')}
        ];
 
    $scope.printRows = function() {
        console.log($scope.rows);
    };
    
    $scope.rowsEvents = function(a,b) {
        console.log("events", a, b);
    };
    
}
MonthController.$inject = ['$scope','TransactionSuper', 'CellFormatters'];

