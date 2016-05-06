
/* Add your OneAll Subdomain Here */
var oneall_subdomain = '';

/* Leave As Is */
var oneall_connection_token = '';
var oneall_identity = '';
 
/* Routes */
var oneallApp = angular.module('social-login', ['ionic']).config(function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('login', {
			url: '/login',
			templateUrl: 'templates/login.html',
			controller: 'LoginController'
		})
		.state('welcome', {
			url: '/welcome',
			templateUrl: 'templates/welcome.html',
			controller: 'WelcomeController'
		});
		$urlRouterProvider.otherwise('/login');
});

/* Login / Callback */
oneallApp.controller('LoginController', function($scope, $http, $location) {	
	$scope.oneall_subdomain = oneall_subdomain;    

    $scope.social_login = function(social_network_key) {
		var nonce, callback_uri, connect_uri, window_ref, uid_v4, received_url;
		
		uid_v4 = function () {
			var g4 = function() {
				return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		    };
		    return (g4()+g4()+"-"+g4()+"-"+g4()+"-"+g4()+"-"+g4()+g4()+g4());

		}		
		
		nonce = uid_v4();
		
		callback_uri = 'http://localhost/callback';
		connect_uri = 'https://' + oneall_subdomain + '.api.oneall.com/socialize/connect/mobile/' + encodeURIComponent (social_network_key) + '/?nonce=' + encodeURIComponent (nonce) + '&callback_uri=' + encodeURIComponent (callback_uri);

        window_ref = window.open(connect_uri, '_blank', 'location=no');
        window_ref.addEventListener('loadstart', function(event) { 	
            if((event.url).startsWith(callback_uri)) {
			
				received_url = event.url;
				received_url = received_url.replace(/#.*$/,'');

                oneall_connection_token = received_url.split("connection_token=")[1];

                $http({
					method: "GET", 
					dataType: "json",
					aync: false,
					url: "https://" + oneall_subdomain + ".api.oneall.com/connection/" + oneall_connection_token + ".json",
					headers: {"Authorization": "OneallNonce " + nonce}
				})
				.success(function(data) {
                	oneall_identity = data.response.result.data.user.identity;
					$location.path("/welcome");
				})
				.error(function(data, status) {
					alert("ERROR: " + data);
				});

				window_ref.close();
            }
        });
    }
 
    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str){
            return this.indexOf(str) == 0;
        };
    }    
});


/* Callback Info */
oneallApp.controller('WelcomeController', function($scope, $http) {
     $scope.oneall_identity = oneall_identity;    
});