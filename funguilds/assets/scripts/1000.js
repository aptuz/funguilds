

guild.game('DotsGame', ['Hotkeys', 'jQuery', 'WS4Redis'], function(Hotkeys, jQuery, WS4Redis){

	$ = jQuery;

	Hotkeys.on('return', function(){
		render(5, 5);
	});

	var Boxes;
	var HDashes;
	var VDashes;

	var html = "";
	var EvenRows = [], OddRows = [];
	function render(cols, rows){
		var x, y;
		Boxes = new Array(rows);
		HDashes = new Array(rows+1);
		VDashes = new Array(rows);
		for(y = 0;y < rows+1; y++){
			var evenString = "<div>", oddString = "<div>";
			
			if(y<rows){
				Boxes[y] = [];
			}
				
				
				VDashes[y] = [];
				HDashes[y] = [];
			
			
			for(x = 0; x < cols+1; x++){
				
				if(x<cols)
					HDashes[y][x] = 0;
				if(y<rows && x < cols){
					VDashes[y][x] = 0;
					Boxes[y][x] = 0;
				}
			
				if(x < cols){
					evenString += "<div class='dot'></div><div class='hl' id='even-x_"+x+"-y_"+y+"'></div>";
					if(y <rows)
						oddString += "<div class='vl' id='odd-x_"+x+"-y_"+y+"'></div><div class='box'></div>";
				}
				else{
					evenString += "<div class='dot'></div>";
					if(y<rows)
						oddString += "<div class='vl' id='odd-x_"+x+"-y_"+y+"'></div>";
				}
			}
			evenString += "</div>";
			oddString += "</div>";
			EvenRows.push(evenString);
			OddRows.push(oddString);
		}

		for(var i = 0, j = 0; i<EvenRows.length, j<OddRows.length;i++, j++){
			html = html + EvenRows[i] + OddRows[j];
		}

		$('#game_area').html(html);
		console.log(HDashes);
		console.log(VDashes);
	}

	var token = 0;

	
	

	$('[id*="even-"]').live('click', function(){
		if(token == 0){
			var x_y = getXY($(this).attr('id'));
			HDashes[x_y.y][x_y.x] = 1;
			$(this).addClass('activeblue');
			token = 1;
			gameHCheck(x_y.x, x_y.y);
			//broadcast here
		}		
	});

	//Act as a multiplayer(need to remove)
	$('[id*="even-"]').live('dblclick', function(){
		if(token == 1){
			var x_y = getXY($(this).attr('id'));
			HDashes[x_y.y][x_y.x] = 2;
			$(this).addClass('activered');
			token = 0;
			gameHCheck(x_y.x, x_y.y);
			//broadcast here
		}
	});


	$('[id*="odd-"]').live('click', function(){
		if(token == 0){
			var x_y = getXY($(this).attr('id'));
			VDashes[x_y.y][x_y.x] = 1;
			$(this).addClass('activeblue');
			token = 1;
			gameVCheck(x_y.x, x_y.y);
			//broadcast here
		}
	});

	//Act as a multiplayer(need to remove)
	$('[id*="odd-"]').live('dblclick', function(){
		if(token == 1){
			var x_y = getXY($(this).attr('id'));
			VDashes[x_y.y][x_y.x] = 2;
			$(this).addClass('activered');
			token = 0;
			gameVCheck(x_y.x, x_y.y);
			//broadcast here
		}
	});

	function getXY(id){
		var col, row;
		var temp = id.split("-");
		col = temp[1].split("_")[1];
		row = temp[2].split("_")[1];
		return {x:parseInt(col), y:parseInt(row)};
	}

	// HDashes[3][3] = 1;
	// VDashes[3][2] = 2;


	//Call this when broadcast(recieved) or you can refresh only updated element
	function refreshGame(){
		//update HDashes
		for(var y = 0; y < HDashes.length; y++){
			for(x = 0; x < HDashes[y].length; x++){
				if(HDashes[y][x] == 0)
					$('#even-x_'+x+'-y_'+y).css('background-color','#222');
				if(HDashes[y][x] == 1)
					$('#even-x_'+x+'-y_'+y).css('background-color','blue');
				if(HDashes[y][x] == 2)
					$('#even-x_'+x+'-y_'+y).css('background-color','#FFF');
			}
		}
		//update VDashes
		for(var y = 0; y < VDashes.length; y++){
			for(x = 0; x < VDashes[y].length; x++){
				if(VDashes[x][y] == 0)
					$('#odd-x_'+x+'-y_'+y).css('background-color','#222');
				if(VDashes[x][y] == 1)
					$('#odd-x_'+x+'-y_'+y).css('background-color','blue');
				if(VDashes[x][y] == 2)
					$('#odd-x_'+x+'-y_'+y).css('background-color','#FFF');
			}
		}
		//update Boxes
		for(var iter = 0; iter < Boxes.length; iter++){
			
		}
	}

	
	function checkTop(x, y){
		if(y == 0){
			return 0;
		} else {
			if(HDashes[y-1][x] != 0)
				return true;
			else
				return false;
		}
	}
	function checkBottom(x, y){
		var cols = HDashes[0].length;
		console.log(y+"-"+HDashes.length);
		if(y == cols-1){
			return 0;
		} else {
			console.log(y+1);
			if(HDashes[y+1][x] != 0)
				return true;
			else
				return false;
		}
	}
	function checkLeft(x, y){
		if(x == 0){
			return 0;
		} else {
			if(VDashes[y][x-1] != 0)
				return true;
			else
				return false;
		}
	}
	function checkRight(x, y){
		console.log(VDashes);
		var rows = HDashes.length;
		if(x == rows-1){
			return 0;
		} else {
			if(VDashes[y][x+1] != 0)
				return true;
			else
				return false;
		}
	}
	//Common for hdashes and vdashes
	function checkTopLeft(type, x, y){
		if(type == "vertical") {
			if(x == 0){
				return 0;
			} else {
				if(HDashes[y][x-1] != 0)
					return true;
				else
					return false;
			}	
		} else {
			if(y == 0) {
				return 0;
			} else {
				if(VDashes[x][y-1] != 0)
					return true;
				else
					return false;
			}
		}
	}
	function checkTopRight(type, x, y){
		var rows = HDashes.length;
		var cols = HDashes[0].length;
		if(type == "vertical"){
			if(x == cols){
				return 0;
			} else {
				if(HDashes[y][x] != 0)
					return true;
				else
					return false;
			}
		} else {
			if(y == 0) {
				return 0;
			} else {
				if(VDashes[y-1][x+1] != 0)
					return true;
				else
					return false;
			}
		}
	}
	function checkBottomLeft(type, x, y){
		var rows = HDashes.length;
		var cols = HDashes[0].length;
		if(type == "vertical") {
			if(x == 0){
				return 0;
			} else {
				if(HDashes[y+1][x-1] != 0)
					return true;
				else
					return false;
			}	
		} else {
			if(y == rows-1) {
				return 0;
			} else {
				if(VDashes[y][x] != 0)
					return true;
				else
					return false;
			}
		}
	}
	function checkBottomRight(type, x, y){
		var rows = HDashes.length;
		var cols = HDashes[0].length;
		if(type == "vertical") {
			if(x == cols){
				return 0;
			} else {
				if(HDashes[y][x] != 0)
					return true;
				else
					return false;
			}	
		} else {
			if(y == cols-1) {
				return 0;
			} else {
				if(VDashes[y][x+1] != 0)
					return true;
				else
					return false;
			}
		}
	}

	function gameHCheck(x, y){
		//check if game is completed or not

		//check if it is the last move
		// if(checkTopLeft("horizontal", x, y) &&
		//    checkTopRight("horizontal", x, y) &&
		//    checkTop(x, y) &&
		//    checkBottom(x, y) &&
		//    checkBottomLeft("horizontal", x, y) &&
		//    checkBottomRight("horizontal", x, y)){
			

		// 	//fillUser(x, y);
		// }

		console.log("topleft-"+checkTopLeft("horizontal", x, y));
		console.log("topright-"+checkTopRight("horizontal", x, y));
		console.log("top-"+checkTop(x, y));
		console.log("bottom-"+checkBottom(x, y));
		console.log("botleft-"+checkBottomLeft("horizontal", x, y));
		console.log("botright-"+checkBottomRight("horizontal", x, y));

	}


	function gameVCheck(x, y){
		//check if game is completed or not

		//check if it is the last move
		// if(checkTopLeft("horizontal", x, y) &&
		//    checkTopRight("horizontal", x, y) &&
		//    checkTop(x, y) &&
		//    checkBottom(x, y) &&
		//    checkBottomLeft("horizontal", x, y) &&
		//    checkBottomRight("horizontal", x, y)){
			

		// 	//fillUser(x, y);
		// }

		console.log("topleft-"+checkTopLeft("vertical", x, y));
		console.log("topright-"+checkTopRight("vertical", x, y));
		console.log("left-"+checkLeft(x, y));
		console.log("right-"+checkRight(x, y));
		console.log("botleft-"+checkBottomLeft("vertical", x, y));
		console.log("botright-"+checkBottomRight("vertical", x, y));

	}

	function fillUser(x, y){
		Boxes[x][y] = 1;//|| 2
		//update UI here

		//reassign the token here
	}

	// WS4Redis.onRecieve(function(data){
	// 	console.log(data);
	// 	render(5, 5);
	// });

	// refreshGame();
});