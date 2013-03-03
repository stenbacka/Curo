describe('PhoneCat controllers', function() {
 
  describe('PhoneListCtrl', function(){
    var scope, ctrl;
 
    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {

      scope = $rootScope.$new();
      var myLocation = {path: function() {return "/client/home";}};
      ctrl = $controller(MainTabs, {$scope: scope, $location: myLocation});
    }));
    
    it('should says that it is active', function() {
        expect(scope.getClass(0)).toEqual('active');
        expect(scope.getClass(1)).toEqual('');
    });
  });
});

