var app = angular.module('myApp', []);

app.controller('jobsController', ['$scope', function($scope) {

	$scope.job = {
		name	: 'MD5 Cracking',
		progress: 50
	};

	$scope.update = function() {
		$scope.job.progress += 1;
	}


}]);

app.controller('devicesController', ['$scope', function($scope) {

  	$scope.devices = [
	  { name: 'Ari'},
	  { name: 'Q'},
	  { name: 'Sean'},
	  { name: 'Anand'},
	  { name: 'Anand'},
	  { name: 'Anand'},
	  { name: 'Anand'}
  	];

}]);




