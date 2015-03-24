/* Author: Aptuz
*/


mainApp.constant("appConstants", {
    'homePath': '/',
    'loginPath': '/login/',
    'apiPath' : '/webservices/api/1/',
    'templateDir' : 'partials/',
    'imageDir' : 'images/',
});

/* Partial Routes */
mainApp.constant("urlRoutes", [
    {'path':'/','templatePath':'home.html','controller':'HomeController'},
    {'path':'/guild_detail/:game/','templatePath':'guild_detail.html','controller':'GuildDtlController', 'userTemplate':true},
    {'path':'/bingo/','templatePath':'bingo.html','controller':'bingoController'},
    {'path':'/dots/','templatePath':'dots.html','controller':'dotsController'},
    {'path':'/snakes/','templatePath':'lader.html','controller':'snakesController'},
]);

//Filters
mainApp.filter('range', function() {
    return function(input, total) {
        total = parseInt(total);
        for (var i=0; i<total; i++)
            input.push(i);
        return input;
    };
});

//base Controller
mainApp.controller('baseController',['$scope','Constants','$location','growl','$http','$timeout', '$modal', 'loadTemplate', '$routeParams',
    function($scope,Constants,$location,growl,$http,$timeout,$modal,loadTemplate,$routeParams){        
        $scope.username = Constants.get("userSiteObj")['username'];
		$scope.requestGame = function(game){
            /*var user = parseInt(window.prompt("Enter User PK"));
            var options = {
                'method': 'GET',
                'url': '/games/request_game/',
                'params': {
                    'user': user,
                    'requestee': Constants.get('userSiteObj').pk,
                    'game': game
                }
            };
            $http(options).success(function (data) {

            }).error(function(data){
                alert('error');
            }); */
            var modalInstance = $modal.open({
                templateUrl: loadTemplate(Constants.get('staticLink'),Constants.get('templateDir'),'guilds_users.html'),
                backdrop: true,
                controller: function ($scope, $modalInstance, $http, transformRequestAsFormPost, user_id, guild_id, game) {
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                    var options = {
                        'method': 'GET',
                        'url': '/webservices/api/1/guild/'+guild_id+"/"
                    };

                    $http(options).success(function(data){
                        $scope.guild_members = data.guild_members;
                    }).error(function(data){

                    });
                       
                    $scope.request_member = function (id) {
                        var options = {
                            'method': 'GET',
                            'url': '/games/request_game/',
                            'params': {
                                'user': id,
                                'requestee': user_id,
                                'game': game
                            }
                        };
                        $http(options).success(function (data) {

                        }).error(function(data){
                            alert('error');
                        });
                    }
                },
                size: 'md',
                resolve: {
                    'user_id' : function () {
                        return Constants.get('userSiteObj')['pk'];
                    },
                    'guild_id': function () {
                        return $routeParams.game;
                    },
                    'game': function () {
                        return game
                    }
                }
            });
            modalInstance.result.then(function (data) {
               
            }, function () {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        };             
        var notifications = WS4Redis({
            uri: Constants.get('webSocketURI')+'notifications?subscribe-user',
            heartbeat_msg: Constants.get('heartBeatMessage'),
            receive_message: function(data){
                data = JSON.parse(data);
                console.log(data);
                if(data['mode'] === 'game_request'){
                    var choice = window.confirm('User '+data['userName']+' is requesting you to play '+data['gameName']+' with them. Do you want to accept?');
                    if(choice){
                        var options = {
                            'method': 'GET',
                            'url': '/games/accept_game/',
                            'params': {
                                'acceptee': Constants.get('userSiteObj').pk,
                                'gameID': data['gameID'],
                                'mode': 'accept_request'
                            }
                        };
                        $http(options).success(function (data) {
                            console.log(data);
                        }).error(function (data) {
                            console.log(data);
                        });
                    }
                }
                else if(data['mode'] === 'game_start1'){
                    var choice = window.confirm('User '+data['userName']+' is ready to play '+data['gameName']+' with you. Do you want to start?');
                    if(choice){
                        //grqyout screen
                        var options = {
                            'method': 'GET',
                            'url': '/games/accept_game/',
                            'params': {
                                'acceptee': data['userName'],
                                'requestee': Constants.get('userSiteObj').pk,
                                'gameID': data['gameID'],
                                'mode': 'accept_start1'
                            }
                        };
                        $http(options).success(function (data) {
                            console.log(data);
                        }).error(function (data) {
                            console.log(data);
                        });
                    }
                }
                else if(data['mode'] === 'game_start2'){
                    var choice = window.confirm('User '+data['userName']+' is ready to play '+data['gameName']+' with you. Do you want to start?');
                    if(choice){
                        var options = {
                            'method': 'GET',
                            'url': '/games/accept_game/',
                            'params': {
                                'acceptee': Constants.get('userSiteObj').pk,
                                'gameID': data['gameID'],
                                'mode': 'accept_start2'
                            }
                        };
                        $http(options).success(function (data) {
                            console.log(data);
                        }).error(function (data) {
                            console.log(data);
                        });
                    }
                }
                else if(data['mode'] === 'game_deploy'){
                    var acceptee = data['acceptee'];
                    var requestee = data['requestee'];
                    var gameID = data['gameID'];
                    var gameName = data['gameName'];
                    if(gameName === 'Bingo'){
                        window.location = '/bingo/?requestee='+requestee+'&acceptee='+acceptee+'&gameID='+gameID;
                    }
                }
            }
        });
        $scope.create_guild = function () {
            var modalInstance = $modal.open({
                templateUrl: loadTemplate(Constants.get('staticLink'),Constants.get('templateDir'),'create_guild.html'),
                backdrop: true,
                controller: function ($scope, $modalInstance, $http, transformRequestAsFormPost, user_id) {
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                    
                    $scope.guild_create = function ($event, gname, gdesc) {
                        $event.target.setAttribute('disabled', 'disabled');
                        var options = {
                            'transformRequest': transformRequestAsFormPost,
                            'method': 'POST',
                            'url': '/webservices/api/1/guild/',
                            'data': {
                                'name': gname,
                                'description': gdesc,
                                'group_type': 'Public',
                                'created_by': parseInt(user_id)
                            }
                        };
                        $http(options).success(function (data) {
                            $modalInstance.close(data);
                        }).error(function (data) {
                            $event.target.removeAttribute('disabled');
                        });
                    };
                },
                size: 'md',
                resolve: {
                    'user_id' : function () {
                        return Constants.get('userSiteObj')['pk'];
                    }
                }
            });
            modalInstance.result.then(function (data) {
                $scope.ownedGuilds = data;
            }, function () {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        };
}]).directive('enter',function($document){
    return function(scope,elem,attrs){
        $("body").on('keyup',function(e) {
           if(e.keyCode == 13){
                if($(".active").text() == "Sign-In"){
                    $("input[value='Sign In']").trigger('click');
                }
                else{
                    $("input[value='Join Feazt']").trigger('click');
                }
           }
        });
    }
}).directive('dropdown',function($document){
    return function(scope,elem,attrs){
        $(document.body).on('click', function (e) {
            var obj = e.target;
            if (!$(obj).hasClass('dropdown-handler--name') && !$(obj).hasClass('dropdown-handler')) {
                if (!$(".dropdown-list").hasClass("hide")) {
                    $(".dropdown-list").addClass("hide");
                }
            }
        });
        $(".dropdown-handler").on('click',function(e) {
            $(".dropdown-list").toggleClass("hide");
        });
    }
}).directive('dropdownnoty',function($document){
    return function(scope,elem,attrs){
        $(document.body).on('click', function (e) {
            var obj = e.target;
            if (!$(obj).hasClass('noty-wrap') && !$(obj).hasClass('fa-bell')) {
                if (!$(".noty-req-wrap").hasClass("hide")) {
                    $(".noty-req-wrap").addClass("hide");
                }
            }
        });
        $(".noty-wrap").on('click',function(e) {
            $(".noty-req-wrap").toggleClass("hide");
        });

    }
});

mainApp.controller('HomeController',['$scope','Constants','$location','growl','$http','$timeout',
    function($scope,Constants,$location,growl,$http,$timeout){ 
        $scope.user_id = parseInt(Constants.get("userSiteObj")["pk"]);
        var admin_options = {
            'method': 'GET',
            'url': Constants.get('apiPath')+'guild/?format=json',
            'params': {
                'user': Constants.get('userSiteObj').pk,
                'admin': 'yes'
            }
        };
        $http(admin_options).success(function (data) {
            console.log(data);
            $scope.ownedGuilds = data;
        }).error(function (data) {
            console.log(data);
        });
        var member_options = {
            'method': 'GET',
            'url': Constants.get('apiPath')+'guild/?format=json',
            'params': {
                'user': Constants.get('userSiteObj').pk,
                'member': 'yes'
            }
        };
        $http(member_options).success(function (data) {
            console.log(data);
            $scope.joinedGuilds = data;
        }).error(function (data) {
            console.log(data);
        });
        var open_options = {
            'method': 'GET',
            'url': Constants.get('apiPath')+'guild/?format=json',
            'params': {
                'user': Constants.get('userSiteObj').pk,
                'open': 'yes'
            }
        };
        $http(open_options).success(function (data) {
            console.log(data);
            $scope.openGuilds = data;
        }).error(function (data) {
            console.log(data);
        });

}]);

mainApp.controller('GuildDtlController',['$scope','Constants','$location','growl','$http','$timeout','$routeParams', '$modal', 'loadTemplate', 'transformRequestAsFormPost',
    function($scope,Constants,$location,growl,$http,$timeout, $routeParams, $modal, loadTemplate, transformRequestAsFormPost){        
        $scope.user_id = parseInt(Constants.get("userSiteObj")['pk']);
        $scope.gameID = $routeParams.game;
        $scope.is_joined = "NOT REQUESTED";
        var options = {
            'method': 'GET',
            'url': '/webservices/api/1/guild/'+$scope.gameID+"/"
        };

        $http(options).success(function(data){
            $scope.GuildData = data;
            if (data.is_guild_admin) {
                var options = {
                    'method': 'GET',
                    'url': '/webservices/api/1/guildrequest/',
                    'params':{
                        'guild':data.pk,
                        'status': "REQUESTED",
                    }
                };
                $http(options).success(function(data){
                    $scope.requests = data;
                }).error(function(data){

                });
            } else {
                var options = {
                    'method': 'GET',
                    'url': '/webservices/api/1/guildrequest/',
                    'params':{
                        'guild':data.pk,
                        'requested_from':$scope.user_id,
                    }
                };
                $http(options).success(function(data){
                    data.forEach(function (val) {
                        if (val.guild === options.params.guild && val.requested_from === $scope.user_id) {
                            $scope.is_joined = val.status;
                        }
                    });
                }).error(function(data){

                });
            }
            
        }).error(function(data){

        });

        $scope.add_games = function () {
            var modalInstance = $modal.open({
                templateUrl: loadTemplate(Constants.get('staticLink'),Constants.get('templateDir'),'games_modal.html'),
                backdrop: true,
                controller: function($scope, $modalInstance, $http, guild_id){
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                    var options = {
                        'method': 'GET',
                        'url': '/webservices/api/1/games/'
                    };

                    $http(options).success(function(data){
                        $scope.sys_games = data;
                        console.log(data);
                    }).error(function(data){

                    });

                    $scope.game_add = function (id) {
                        var options = {
                            'method': 'GET',
                            'url': '/add_games/'+guild_id+'/'+id+'/'
                        };
                        
                        $http(options).success(function(data){
                            
                            console.log(data);
                        }).error(function(data){

                        });
                    };
                },
                size: 'md',
                resolve: {
                    'guild_id' : function(){
                      return $scope.gameID;
                    },
                }
            });
            modalInstance.result.then(function () {
                    
            }, function () {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.join_guild = function () {
            var options = {
                'transformRequest': transformRequestAsFormPost,
                'method': 'POST',
                'url': '/webservices/api/1/guildrequest/',
                'data': {
                    'guild': $scope.gameID,
                    'status': 'REQUESTED',
                }
            };

            $http(options).success(function(data){
                console.log(data)
                $scope.is_joined = "REQUESTED";
            }).error(function(data){

            });
        };

        $scope.add_to_guild = function (id, index) {
            var options = {
                'method': 'PATCH',
                'url': '/webservices/api/1/guildrequest/'+id+'/',
                'data': {
                    'status': 'ACCEPTED',
                }
            };
            $scope.requests.pop($scope.requests[index]);
            $http(options).success(function(data){
                console.log(data)
                $scope.is_joined = "ACCEPTED";
            }).error(function(data){

            });
        };

        $scope.delete_from_guild = function (id, index) {
            var options = {
                'method': 'DELETE',
                'url': '/webservices/api/1/guildrequest/'+id+'/',
            };
            $scope.requests.pop($scope.requests[index]);
            $http(options).success(function(data){
                console.log(data)
            }).error(function(data){

            });
        };
        
}]);

mainApp.controller('accountsController',['$scope','Constants','$location','growl','$http','$timeout', 'transformRequestAsFormPost',
    function($scope,Constants,$location,growl,$http,$timeout, transformRequestAsFormPost){        
        
        $scope.login = function ($event, lname, lpwd) {
            $event.target.setAttribute('disabled', 'disabled');
            var options = {
                'transformRequest': transformRequestAsFormPost,
                'method': 'POST',
                'url': '/login/',
                'data': {
                    'username': lname,
                    'password': lpwd,
                }
            };
            $http(options).success(function (data) {
                if (data.message === "success") {
                    window.location.href = "/";
                }
            }).error(function (data) {
                $event.target.removeAttribute('disabled');
            });
        };

        $scope.register = function ($event, rname, remail, rpwd) {
            $event.target.setAttribute('disabled', 'disabled');
            var options = {
                'transformRequest': transformRequestAsFormPost,
                'method': 'POST',
                'url': '/register/',
                'data': {
                    'username': rname,
                    'email': remail,
                    'password': rpwd,
                }
            };
            $http(options).success(function (data) {
                if (data.message === "success") {
                    window.location.href = "/";
                }
            }).error(function (data) {
                $event.target.removeAttribute('disabled');
            });
        };
}]);

mainApp.controller('bingoController',['$scope','Constants','$location','growl','$http','$timeout','djangoConstants','transformRequestAsFormPost','$routeParams',
    function($scope,Constants,$location,growl,$http,$timeout,djangoConstants,transformRequestAsFormPost,$routeParams){       
        //alert(djangoConstants['staticLink']+"audio/click.mp3");
        var clickSnd = new Audio(djangoConstants['staticLink']+"audio/click1.mp3");
        var winSnd = new Audio(djangoConstants['staticLink']+"audio/winner.mp3");
        var looseSnd = new Audio(djangoConstants['staticLink']+"audio/looser.mp3");
        //var rowCompleted = new Audio("audio/rowCompleted.mp3");
        //var win_sound= new Audio("audio/win_sound.mp3");
        $scope.playerID = Constants.get('userSiteObj').pk;
        $scope.acceptee = $routeParams['acceptee'];
        $scope.requestee = $routeParams['requestee'];
        $scope.gameID = $routeParams['gameID'];
        var JsonState=[];

        $scope.MyCount = 0;
        $scope.OpponentCount = 0;


        var JSONBingo = {"squares": [
                {"square": "1"},
                {"square": "2"},
                {"square": "3"},
                {"square": "4"},
                {"square": "5"},
                {"square": "6"},
                {"square": "7"},
                {"square": "8"},
                {"square": "9"},
                {"square": "10"},
                {"square": "11"},
                {"square": "12"},
                {"square": "13"},
                {"square": "14"},
                {"square": "15"},
                {"square": "16"},
                {"square": "17"},
                {"square": "18"},
                {"square": "19"},
                {"square": "20"},
                {"square": "21"},
                {"square": "22"},
                {"square": "23"},
                {"square": "24"},       
                {"square": "25"}
            ]
        };

        completed=[];
        function server (id) {
	        grayout(0);
            $scope.publishBingoGame('click', id);
        }

        function rowcompleted (arg) {
	        //arg = row, diag ,col
            $scope.publishBingoGame('completed_row', 'row');
            $scope.MyCount++;
            renderBingo('me');
        }

        function renderBingo(user){
            var cls = '', data;
            if(user == 'me'){ cls = 'a'; data = $scope.MyCount; }
            else { cls = 'b';data = $scope.OpponentCount; }
            for(var iter = 1; iter < data+1;iter++){
                console.log('.'+cls+iter);
                $('.'+cls+iter).addClass('active');
            }
        }


        function p_rowcompleted(){
            //other player row completed
            $scope.OpponentCount++;
            renderBingo('other');
        }
        function winner () {
	        $scope.publishBingoGame('winner', 'win');
            $('#board').addClass("f-darkgray-dark p-5 txt-c bold");
            $('#board').html("You Won");
        }
        function p_winner(){
            //other player won
           grayout(0);
           $('#board').addClass("f-darkgray-dark p-5 txt-c bold");
           $('#board').html("Other Player Won");
           looseSnd.play();
        }
        //grayout(0)  : To grayout the UI
        //grayout(1)  : To activate the UI

        $scope.publishBingoGame = function(mode,data){
            if(mode === 'shuffle'){
                var options = {
                    'transformRequest': transformRequestAsFormPost,
                    'method': 'POST',
                    'url': '/games/bingo/game_state/',
                    'data': {
                        'playerID': Constants.get('userSiteObj').pk,
                        'gameData': data,
                        'gameID': $scope.gameID
                    },
                    'params': {
                        'type': 'shuffle'
                    }
                };
                $http(options).success(function (data) {

                }).error(function (data) {
                    console.log(data);
                });
            }
            else if(mode === 'completed_row'){
                var options = {
                    'transformRequest': transformRequestAsFormPost,
                    'method': 'POST',
                    'url': '/games/bingo/game_state/',
                    'data': {
                        'playerID': Constants.get('userSiteObj').pk,
                        'gameData': data,
                        'gameID': $scope.gameID
                    },
                    'params': {
                        'type': 'completed_row'
                    }
                };
                $http(options).success(function (data) {

                }).error(function (data) {
                    console.log(data);
                });
            }
            else if(mode === 'winner'){
                var options = {
                    'transformRequest': transformRequestAsFormPost,
                    'method': 'POST',
                    'url': '/games/bingo/game_state/',
                    'data': {
                        'playerID': Constants.get('userSiteObj').pk,
                        'gameData': data,
                        'gameID': $scope.gameID
                    },
                    'params': {
                        'type': 'winner'
                    }
                };
                $http(options).success(function (data) {

                }).error(function (data) {
                    console.log(data);
                });
            }
            else if(mode == 'click'){
                var options = {
                    'transformRequest': transformRequestAsFormPost,
                    'method': 'POST',
                    'url': '/games/bingo/game_state/',
                    'data': {
                        'playerID': Constants.get('userSiteObj').pk,
                        'gameData': data,
                        'gameID': $scope.gameID
                    },
                    'params': {
                        'type': 'click'
                    }
                };
                $http(options).success(function (data) {

                }).error(function (data) {
                    console.log(data);
                });
            }
        }

        $scope.startBingo = function() {
            $('#board').html('');
	        shuffle(JSONBingo.squares);//replace with state json

            $scope.publishBingoGame('shuffle', JSON.stringify(JSONBingo.squares));
	
	        for (i=0; i<25; i++)	{  //below string replaced by $('#board').append("<div data-value='+JSONBingo.states[i].square+' class='square' id='sq"+i+"'><div class='text'><br/>"+JSONBingo.squares[i].square+"</div></div>");
	
		
		        $('#board').append("<div data-value='0' class='square' data-numb="+JSONBingo.squares[i].square+" id='sq"+i+"'><div class='text'><br/>"+JSONBingo.squares[i].square+"</div></div>");
		
          }
            row_list=[0,0,0,0,0]
            col_list=[0,0,0,0,0]
            diag_list=[0,0,0,0,0]
	        $('div.square').click(function () {
	          if($(this).hasClass('gray') || $(this).hasClass('selected')){}
	          else{


	              $(this).addClass('selected');
	              if ($(this).data('value') == 1) {
	                    //alert(event.target.id);
	              		//do nothing
	              	}
	              else {
	                    server($(this).attr('data-numb'));
	              		$(this).data('value', 1); }
	              		
	               clickSnd.play();
			        var row1 = ($('#sq0').data('value')+$('#sq1').data('value')+$('#sq2').data('value')+$('#sq3').data('value')+$('#sq4').data('value'));
			
			        var row2 = ($('#sq5').data('value')+$('#sq6').data('value')+$('#sq7').data('value')+$('#sq8').data('value')+$('#sq9').data('value'));
			        var row3 = ($('#sq10').data('value')+$('#sq11').data('value')+$('#sq12').data('value')+$('#sq13').data('value')+$('#sq14').data('value'));
			        var row4 = ($('#sq15').data('value')+$('#sq16').data('value')+$('#sq17').data('value')+$('#sq18').data('value')+$('#sq19').data('value'));	
			        var row5 = ($('#sq20').data('value')+$('#sq21').data('value')+$('#sq22').data('value')+$('#sq23').data('value')+$('#sq24').data('value'));			

			        var col1 = ($('#sq0').data('value')+$('#sq5').data('value')+$('#sq10').data('value')+$('#sq15').data('value')+$('#sq20').data('value'));
			        var col2 = ($('#sq1').data('value')+$('#sq6').data('value')+$('#sq11').data('value')+$('#sq16').data('value')+$('#sq21').data('value'));
			        var col3 = ($('#sq2').data('value')+$('#sq7').data('value')+$('#sq12').data('value')+$('#sq17').data('value')+$('#sq22').data('value'));
			        var col4 = ($('#sq3').data('value')+$('#sq8').data('value')+$('#sq13').data('value')+$('#sq18').data('value')+$('#sq23').data('value'));	
			        var col5 = ($('#sq4').data('value')+$('#sq9').data('value')+$('#sq14').data('value')+$('#sq19').data('value')+$('#sq24').data('value'));			

			        var diag1 = ($('#sq0').data('value')+$('#sq6').data('value')+$('#sq12').data('value')+$('#sq18').data('value')+$('#sq24').data('value'));	
			        var diag2 = ($('#sq4').data('value')+$('#sq8').data('value')+$('#sq12').data('value')+$('#sq16').data('value')+$('#sq20').data('value'));	
			
			        if ((row1 == 5 && !row_list[0]) || (row2 == 5 && !row_list[1]) || (row3 == 5 && !row_list[2]) || (row4 == 5 && !row_list[3]) || (row5 == 5 && !row_list[4])) {
				        //rowCompleted.play();
				        rowcompleted('row');
				
	            		
	            	}
	            	if ((diag1 == 5 && !diag_list[0]) || (diag2 == 5 && !diag_list[1])) {
				        //rowCompleted.play();
				        rowcompleted('diag');
				
	            		
	            	}
	            	if ((col1 == 5 && !col_list[0]) || (col2 == 5 && !col_list[1]) || (col3 == 5 && !col_list[2])  || (col4 == 5 && !col_list[3])  || (col5 == 5 && !col_list[4])) {
				        //rowCompleted.play();
				        rowcompleted('col');
				
	            		
	            	}
	            	if(row1==5){row_list[0]=1;}
			        if(row2==5){row_list[1]=1;}
			        if(row3==5){row_list[2]=1;}
			        if(row4==5){row_list[3]=1;}
			        if(row5==5){row_list[4]=1;}
			        if(col1==5){col_list[0]=1;}
			        if(col2==5){col_list[1]=1;}
			        if(col3==5){col_list[2]=1;}
			        if(col4==5){col_list[3]=1;}
			        if(col5==5){col_list[4]=1;}
			        if(diag1==5){diag_list[0]=1;}
			        if(diag2==5){diag_list[1]=1;}
	            	win_dec=row_list[0]+row_list[1]+row_list[2]+row_list[3]+row_list[4]+col_list[0]+col_list[1]+col_list[2]+col_list[3]+col_list[4]+diag_list[0]+diag_list[1]
   	                if (win_dec>=5) {
				        winSnd.play();
				        winner();
				        //alert('win');

	            		
	            	} 
	            } 
            });
                
        }
        $scope.acceptBingo = function() {

            
            $('#board').html('');
            shuffle(JSONBingo.squares);//replace with state json

            $scope.publishBingoGame('shuffle', JSON.stringify(JSONBingo.squares));
    
            for (i=0; i<25; i++)    {  //below string replaced by $('#board').append("<div data-value='+JSONBingo.states[i].square+' class='square' id='sq"+i+"'><div class='text'><br/>"+JSONBingo.squares[i].square+"</div></div>");
    
        
                $('#board').append("<div data-value='0' class='square' data-numb="+JSONBingo.squares[i].square+" id='sq"+i+"'><div class='text'><br/>"+JSONBingo.squares[i].square+"</div></div>");
        
          }
            row_list=[0,0,0,0,0]
            col_list=[0,0,0,0,0]
            diag_list=[0,0,0,0,0]
            $('div.square').click(function () {
              if($(this).hasClass('gray') || $(this).hasClass('selected')){}
              else{


                  $(this).addClass('selected');
                  if ($(this).data('value') == 1) {
                        //alert(event.target.id);
                        //do nothing
                    }
                  else {
                        server($(this).attr('data-numb'));
                        $(this).data('value', 1); }
                        
                     //clickSnd.play();
                    var row1 = ($('#sq0').data('value')+$('#sq1').data('value')+$('#sq2').data('value')+$('#sq3').data('value')+$('#sq4').data('value'));
            
                    var row2 = ($('#sq5').data('value')+$('#sq6').data('value')+$('#sq7').data('value')+$('#sq8').data('value')+$('#sq9').data('value'));
                    var row3 = ($('#sq10').data('value')+$('#sq11').data('value')+$('#sq12').data('value')+$('#sq13').data('value')+$('#sq14').data('value'));
                    var row4 = ($('#sq15').data('value')+$('#sq16').data('value')+$('#sq17').data('value')+$('#sq18').data('value')+$('#sq19').data('value'));  
                    var row5 = ($('#sq20').data('value')+$('#sq21').data('value')+$('#sq22').data('value')+$('#sq23').data('value')+$('#sq24').data('value'));          

                    var col1 = ($('#sq0').data('value')+$('#sq5').data('value')+$('#sq10').data('value')+$('#sq15').data('value')+$('#sq20').data('value'));
                    var col2 = ($('#sq1').data('value')+$('#sq6').data('value')+$('#sq11').data('value')+$('#sq16').data('value')+$('#sq21').data('value'));
                    var col3 = ($('#sq2').data('value')+$('#sq7').data('value')+$('#sq12').data('value')+$('#sq17').data('value')+$('#sq22').data('value'));
                    var col4 = ($('#sq3').data('value')+$('#sq8').data('value')+$('#sq13').data('value')+$('#sq18').data('value')+$('#sq23').data('value'));    
                    var col5 = ($('#sq4').data('value')+$('#sq9').data('value')+$('#sq14').data('value')+$('#sq19').data('value')+$('#sq24').data('value'));            

                    var diag1 = ($('#sq0').data('value')+$('#sq6').data('value')+$('#sq12').data('value')+$('#sq18').data('value')+$('#sq24').data('value'));   
                    var diag2 = ($('#sq4').data('value')+$('#sq8').data('value')+$('#sq12').data('value')+$('#sq16').data('value')+$('#sq20').data('value'));   
            
                    if ((row1 == 5 && !row_list[0]) || (row2 == 5 && !row_list[1]) || (row3 == 5 && !row_list[2]) || (row4 == 5 && !row_list[3]) || (row5 == 5 && !row_list[4])) {
                        //rowCompleted.play();
                        rowcompleted('row');
                
                        
                    }
                    if ((diag1 == 5 && !diag_list[0]) || (diag2 == 5 && !diag_list[1])) {
                        //rowCompleted.play();
                        rowcompleted('diag');
                
                        
                    }
                    if ((col1 == 5 && !col_list[0]) || (col2 == 5 && !col_list[1]) || (col3 == 5 && !col_list[2])  || (col4 == 5 && !col_list[3])  || (col5 == 5 && !col_list[4])) {
                        //rowCompleted.play();
                        rowcompleted('col');
                
                        
                    }
                    if(row1==5){row_list[0]=1;}
                    if(row2==5){row_list[1]=1;}
                    if(row3==5){row_list[2]=1;}
                    if(row4==5){row_list[3]=1;}
                    if(row5==5){row_list[4]=1;}
                    if(col1==5){col_list[0]=1;}
                    if(col2==5){col_list[1]=1;}
                    if(col3==5){col_list[2]=1;}
                    if(col4==5){col_list[3]=1;}
                    if(col5==5){col_list[4]=1;}
                    if(diag1==5){diag_list[0]=1;}
                    if(diag2==5){diag_list[1]=1;}
                    win_dec=row_list[0]+row_list[1]+row_list[2]+row_list[3]+row_list[4]+col_list[0]+col_list[1]+col_list[2]+col_list[3]+col_list[4]+diag_list[0]+diag_list[1]
                    if (win_dec>=5) {
                        //win_sound.play();
                        winner();
                        //alert('win');

                        
                    } 
                } 
            });
        grayout(0);       
        }
        $scope.resumeBingo = function(data) {

            

            data=JSON.parse(data);
            data1=data[0];
            data2=data[1];
            data3=data[2];
            //$scope.publishBingoGame('shuffle', JSON.stringify(JSONBingo.squares));
    
            for (i=0; i<25; i++)    {  //below string replaced by $('#board').append("<div data-value='+JSONBingo.states[i].square+' class='square' id='sq"+i+"'><div class='text'><br/>"+JSONBingo.squares[i].square+"</div></div>");
    
        
                $('#board').append("<div data-value='0' class='square' data-numb="+data1[i].square+" id='sq"+i+"'><div class='text'><br/>"+data1[i].square+"</div></div>");
        
          }
            row_list=[0,0,0,0,0]
            col_list=[0,0,0,0,0]
            diag_list=[0,0,0,0,0]
            $('div.square').click(function () {
              if($(this).hasClass('gray') || $(this).hasClass('selected')){}
              else{


                  $(this).addClass('selected');
                  if ($(this).data('value') == 1) {
                        //alert(event.target.id);
                        //do nothing
                    }
                  else {
                        server($(this).attr('data-numb'));
                        $(this).data('value', 1); }
                        
                     //clickSnd.play();
                    var row1 = ($('#sq0').data('value')+$('#sq1').data('value')+$('#sq2').data('value')+$('#sq3').data('value')+$('#sq4').data('value'));
            
                    var row2 = ($('#sq5').data('value')+$('#sq6').data('value')+$('#sq7').data('value')+$('#sq8').data('value')+$('#sq9').data('value'));
                    var row3 = ($('#sq10').data('value')+$('#sq11').data('value')+$('#sq12').data('value')+$('#sq13').data('value')+$('#sq14').data('value'));
                    var row4 = ($('#sq15').data('value')+$('#sq16').data('value')+$('#sq17').data('value')+$('#sq18').data('value')+$('#sq19').data('value'));  
                    var row5 = ($('#sq20').data('value')+$('#sq21').data('value')+$('#sq22').data('value')+$('#sq23').data('value')+$('#sq24').data('value'));          

                    var col1 = ($('#sq0').data('value')+$('#sq5').data('value')+$('#sq10').data('value')+$('#sq15').data('value')+$('#sq20').data('value'));
                    var col2 = ($('#sq1').data('value')+$('#sq6').data('value')+$('#sq11').data('value')+$('#sq16').data('value')+$('#sq21').data('value'));
                    var col3 = ($('#sq2').data('value')+$('#sq7').data('value')+$('#sq12').data('value')+$('#sq17').data('value')+$('#sq22').data('value'));
                    var col4 = ($('#sq3').data('value')+$('#sq8').data('value')+$('#sq13').data('value')+$('#sq18').data('value')+$('#sq23').data('value'));    
                    var col5 = ($('#sq4').data('value')+$('#sq9').data('value')+$('#sq14').data('value')+$('#sq19').data('value')+$('#sq24').data('value'));            

                    var diag1 = ($('#sq0').data('value')+$('#sq6').data('value')+$('#sq12').data('value')+$('#sq18').data('value')+$('#sq24').data('value'));   
                    var diag2 = ($('#sq4').data('value')+$('#sq8').data('value')+$('#sq12').data('value')+$('#sq16').data('value')+$('#sq20').data('value'));   
            
                    if ((row1 == 5 && !row_list[0]) || (row2 == 5 && !row_list[1]) || (row3 == 5 && !row_list[2]) || (row4 == 5 && !row_list[3]) || (row5 == 5 && !row_list[4])) {
                        //rowCompleted.play();
                        rowcompleted('row');
                
                        
                    }
                    if ((diag1 == 5 && !diag_list[0]) || (diag2 == 5 && !diag_list[1])) {
                        //rowCompleted.play();
                        rowcompleted('diag');
                
                        
                    }
                    if ((col1 == 5 && !col_list[0]) || (col2 == 5 && !col_list[1]) || (col3 == 5 && !col_list[2])  || (col4 == 5 && !col_list[3])  || (col5 == 5 && !col_list[4])) {
                        //rowCompleted.play();
                        rowcompleted('col');
                
                        
                    }
                    if(row1==5){row_list[0]=1;}
                    if(row2==5){row_list[1]=1;}
                    if(row3==5){row_list[2]=1;}
                    if(row4==5){row_list[3]=1;}
                    if(row5==5){row_list[4]=1;}
                    if(col1==5){col_list[0]=1;}
                    if(col2==5){col_list[1]=1;}
                    if(col3==5){col_list[2]=1;}
                    if(col4==5){col_list[3]=1;}
                    if(col5==5){col_list[4]=1;}
                    if(diag1==5){diag_list[0]=1;}
                    if(diag2==5){diag_list[1]=1;}
                    win_dec=row_list[0]+row_list[1]+row_list[2]+row_list[3]+row_list[4]+col_list[0]+col_list[1]+col_list[2]+col_list[3]+col_list[4]+diag_list[0]+diag_list[1]
                    if (win_dec>=5) {
                        winner();
                        alert('win');

                        
                    } 
                } 
            });
            for (id in data2) {
                    $('.square').each(function(){
                        if($(this).attr('data-numb')==id){$(this).trigger('click');grayout(1);return false;}
                
                        
                    });
            }
            if(data3){
                grayout(1)
            }        
        }
        shuffle = function(v){
            	for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
            	return v;
        };

        function grayout(val){
            $('.bg-user1').removeClass('active');
            $('.bg-user2').removeClass('active');
	        if(val){
                $('.bg-user1').addClass('active');
		        $('.square').each(function(){
	         		$(this).removeClass('gray');
                });
	        }
	        else{
                $('.bg-user2').addClass('active');
		        $('.square').each(function(){
			        if($(this).hasClass('gray')){}
			        else{$(this).addClass('gray');}
	         		
                });
	        }
	         
        }

        function receive(id){
	        // grayout(1);
	        // $('.square').each(function(){
			      //   if($(this).attr('data-numb')==id){$(this).trigger('click');grayout(1);return false;}
			
	         		
            // });
            k='';
            $('.gray').each(function(){
                    
                    if($(this).attr('data-numb')==id){
                        // alert(id);
                        // if($(this).hasClass('selected')){grayout(0);return false; }
                        // else{
                        //   $(this).trigger('click');grayout(1);return false;  
                        // }

                     k= $(this);  
                    }
            
                    
            });
            $('.square').each(function(){
                    
                    if($(this).attr('data-numb')==id){
                     k= $(this);
                     return false;  
                    }
            
                    
            });

            if(k.hasClass('selected')){}
              else{


                  k.addClass('selected');
                  if (k.data('value') == 1) {
                        //alert(event.target.id);
                        //do nothing
                    }
                  else {
                        //server($(this).attr('data-numb'));
                        k.data('value', 1); }
                        
                   clickSnd.play();
                    var row1 = ($('#sq0').data('value')+$('#sq1').data('value')+$('#sq2').data('value')+$('#sq3').data('value')+$('#sq4').data('value'));
            
                    var row2 = ($('#sq5').data('value')+$('#sq6').data('value')+$('#sq7').data('value')+$('#sq8').data('value')+$('#sq9').data('value'));
                    var row3 = ($('#sq10').data('value')+$('#sq11').data('value')+$('#sq12').data('value')+$('#sq13').data('value')+$('#sq14').data('value'));
                    var row4 = ($('#sq15').data('value')+$('#sq16').data('value')+$('#sq17').data('value')+$('#sq18').data('value')+$('#sq19').data('value'));  
                    var row5 = ($('#sq20').data('value')+$('#sq21').data('value')+$('#sq22').data('value')+$('#sq23').data('value')+$('#sq24').data('value'));          

                    var col1 = ($('#sq0').data('value')+$('#sq5').data('value')+$('#sq10').data('value')+$('#sq15').data('value')+$('#sq20').data('value'));
                    var col2 = ($('#sq1').data('value')+$('#sq6').data('value')+$('#sq11').data('value')+$('#sq16').data('value')+$('#sq21').data('value'));
                    var col3 = ($('#sq2').data('value')+$('#sq7').data('value')+$('#sq12').data('value')+$('#sq17').data('value')+$('#sq22').data('value'));
                    var col4 = ($('#sq3').data('value')+$('#sq8').data('value')+$('#sq13').data('value')+$('#sq18').data('value')+$('#sq23').data('value'));    
                    var col5 = ($('#sq4').data('value')+$('#sq9').data('value')+$('#sq14').data('value')+$('#sq19').data('value')+$('#sq24').data('value'));            

                    var diag1 = ($('#sq0').data('value')+$('#sq6').data('value')+$('#sq12').data('value')+$('#sq18').data('value')+$('#sq24').data('value'));   
                    var diag2 = ($('#sq4').data('value')+$('#sq8').data('value')+$('#sq12').data('value')+$('#sq16').data('value')+$('#sq20').data('value'));   
            
                    if ((row1 == 5 && !row_list[0]) || (row2 == 5 && !row_list[1]) || (row3 == 5 && !row_list[2]) || (row4 == 5 && !row_list[3]) || (row5 == 5 && !row_list[4])) {
                        //rowCompleted.play();
                        rowcompleted('row');
                
                        
                    }
                    if ((diag1 == 5 && !diag_list[0]) || (diag2 == 5 && !diag_list[1])) {
                        //rowCompleted.play();
                        rowcompleted('diag');
                
                        
                    }
                    if ((col1 == 5 && !col_list[0]) || (col2 == 5 && !col_list[1]) || (col3 == 5 && !col_list[2])  || (col4 == 5 && !col_list[3])  || (col5 == 5 && !col_list[4])) {
                        //rowCompleted.play();
                        rowcompleted('col');
                
                        
                    }
                    if(row1==5){row_list[0]=1;}
                    if(row2==5){row_list[1]=1;}
                    if(row3==5){row_list[2]=1;}
                    if(row4==5){row_list[3]=1;}
                    if(row5==5){row_list[4]=1;}
                    if(col1==5){col_list[0]=1;}
                    if(col2==5){col_list[1]=1;}
                    if(col3==5){col_list[2]=1;}
                    if(col4==5){col_list[3]=1;}
                    if(col5==5){col_list[4]=1;}
                    if(diag1==5){diag_list[0]=1;}
                    if(diag2==5){diag_list[1]=1;}
                    win_dec=row_list[0]+row_list[1]+row_list[2]+row_list[3]+row_list[4]+col_list[0]+col_list[1]+col_list[2]+col_list[3]+col_list[4]+diag_list[0]+diag_list[1]
                    if (win_dec>=5) {
                        winSnd.play();
                        winner();                        
                    } 
                } 
            
          grayout(1);
	         
        }
        var notifications = WS4Redis({
            uri: Constants.get('webSocketURI')+'bingo_'+$scope.gameID+'?subscribe-broadcast',
            heartbeat_msg: Constants.get('heartBeatMessage'),
            receive_message: function(data){
                data = JSON.parse(data);console.log(data);
                if(parseInt(data['playerID']) !== parseInt($scope.playerID)){
                    if(data['id'] == 'win'){
                        p_winner();
                    }
                    else if(data['id'] == 'row'){
                        p_rowcompleted();
                    }
                    else{
                        receive(data['id']);
                    }
                }
            }
        });
        $scope.startBingoGame = function(){console.log('po');console.log($scope.requestee); console.log($scope.playerID);
            if(parseInt($scope.requestee) === parseInt($scope.playerID)){
                $scope.startBingo();
            }
            else{
                $scope.acceptBingo();
            }
        }; 
        $scope.startBingoGame();
}]);

mainApp.controller('snakesController',['$scope','Constants','$location','growl','$http','$timeout','djangoConstants','transformRequestAsFormPost','$routeParams',
    function($scope,Constants,$location,growl,$http,$timeout,djangoConstants,transformRequestAsFormPost,$routeParams){ 
        
        var dice = new Array(djangoConstants['staticLink']+"images/dice-one.png",
                    djangoConstants['staticLink']+"images/dice-two.png",
                    djangoConstants['staticLink']+"images/dice-three.png",
                    djangoConstants['staticLink']+"images/dice-four.png",
                    djangoConstants['staticLink']+"images/dice-five.png",
                    djangoConstants['staticLink']+"images/dice-six.png");

        $scope.iDice1 = djangoConstants['staticLink']+"images/dice-five.png";
        $scope.iDice2 = djangoConstants['staticLink']+"images/dice-six.png";
        $scope.playerID = Constants.get('userSiteObj').pk;
        $scope.x = $scope.playerID;
        current_user = 'user'+$scope.playerID
        
        var position = {} 
        var color = {}
        position[current_user] = 0;
        color[current_user] = '#00f';

        $scope.acceptSnl = function(id) {
            opponent = 'user'+id
            position[opponent] = 0;
            color[opponent] = '#f00';
        }

        function shake_rolldice(id){
            user='user'+id
            var num1 = Math.floor (Math.random ( ) * 6 + 1);
	        changedice(user,num1);
	        from = position[user];
            console.log(position[user]);
            position[user] = parseInt(position[user]) + num1;    
            to = position[user]
            moveuser(user,from,to);            
            srl = check_user_position(user,to);
            if (srl){
                position[user] = parseInt(srl);
                moveuser(user,to,position[user]);
            }
	        if (position[user] >= 100) { 
                alert("You WON!!"); 
                location.reload(true); 
            }
            //server_call(id);
        }
        
        function moveuser(user,from,to){
   
            if (to>0){ 
                if (to>=100){to=100}  
            	document.getElementById('box'+to).style.backgroundColor = color[user];
                if (from >= 1){
                	document.getElementById('box'+from).style.backgroundColor = "transparent";
                }
            }
        }

        function check_user_position(user,a){
            snake_head={'17':'7','54':'34','62':'19','64':'60','87':'24','93':'73','95':'75','98':'79'}
            lader_foot={'1':'38','4':'14','9':'31','21':'42','28':'84','51':'67','80':'100','71':'91'}
            if ( a in snake_head){
                position_msg = "You are at "+a+".\nOh No! It's a Snake!";
                a = snake_head[a];
            }
            else if ( a in lader_foot){
                position_msg = "You are at "+a+".\nYay! A ladder!";
                a = lader_foot[a];    
            }
	        else if (a === 100){
                position_msg = "Congratulations You WON..";
            }
            else{
                position_msg = '';
		    }
            $('#location1').text("You are now at " +a+ "!");
            $('#position1').text(position_msg);            
            if (position_msg === '' ){
                return false;
            }            
            return a;
        }

        function changedice(user,a){
            document.getElementById('first-dice').src = dice[a-1]
        }

        $scope.validatePlayer = function(id){
            if(parseInt($scope.playerID) === parseInt($scope.x)){
                return true;                
            }
            else{
                alert("It's opponent's turn");
                return false;
            }
        };
        
        $scope.diceroller = function(id){    
            if ($scope.validatePlayer(id)){
            	$scope.$evalAsync(shake_rolldice(id))
            	var roll_dice_mp3 = new Audio(djangoConstants['staticLink']+"audio/muscic.mp3");
            	roll_dice_mp3.play()
            }
	    }

        function reciever_call(data){
            data=JSON.parse(data);
            user = data["user"];
            opp_position = data["position"];
            color = data["color"];            
            from=position[user];
            to=opp_position[user];
            diff = parseInt(to)-parseInt(from);
            position=opp_position;
            document.getElementById('second-dice').src = dice[diff-1]
            $('#location1').text("Opponent is now at " +to+ "!");
            moveuser(user,from,to);
            $scope.x = $scope.playerID;
                  
        }

        function server_call(id){
            data["user"] = 'user'+id;
            data["position"] = JSON.stringify(position);
            data["color"] = JSON.stringify(color);
            $scope.x = 0;
            
                        


        }        
}]);       




