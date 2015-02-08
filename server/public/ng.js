var app = angular.module('myApp', []);

app.controller('jobsController', ['$scope', function($scope) {

	$scope.job = {};

	$scope.devices = {};

	$scope.update = function() {
		$scope.job.progress = parseInt($scope.job.progress) + 1;
	}

}]);






