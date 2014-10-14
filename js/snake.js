	//For adding sounds effect
	var startMusic = document.getElementById("start_music");
	var	mainMusic = document.getElementById("main_music");
	startMusic.play();

	//Game over messages Random selection
	var msgsSelf = [];
	msgsSelf[0] = "There's plenty of food. Don't eat yourself!";
	msgsSelf[1] = "Is your body tastier than the food?";
	msgsSelf[2] = "AArrgghhh!! I bit myself!!";	
	msgsSelf[3] = "Do you have Autophagia?";	
	
	var msgsWall = [];
	msgsWall[0] = "You broke your head!";
	msgsWall[1] = "The wall is stronger than it seems!";
	msgsWall[2] = "There's no way to escape the game...";
	msgsWall[3] = "LOOK MA! NO HEAD..!!";
	msgsWall[4] = "Can't see the wall? Huh?";

	var msgsPoison = [];
	msgsPoison[0] = "Hey!!! Do you like poison...";
	msgsPoison[1] = "Do you have poison food deficiency...";
	msgsPoison[2] = "Be Carefull!!! Avoid Poison Food!!!";
	
	//global variables
	var bonus_time=10;//bonus food remain for 10 sec
	var layer1,layer2,bg_image,foodx,foody;
	var w=$("#bg").width();
	var h=$("#bg").height();
	var cw = 20;
	var d;
	var food;
	var food_bonus={x:-1,y:-1};
	var counter,flag=0,hitType,gameRepeater;
	var score;
	var levelchanged = 0;
	var bonus=0;
	var highestScore=0;
	var snake_array;
	var bonus_food_type = 0;
	var powerSaver = 0;//initially no power saver is given
	var wallShaker = 0;
	var snakeShaker = 0;
    /*
    0:yellow-Points fruit
    1:yellow-Points fruit
    2:red-poison fruit
    3:blue-power up fruit
    4:white-new level fruit
    */
	var prey_image=new Image();
	prey_image.src = "images/prey.png";
	var gameLevel = [{
	    speed: 200,
        length:3
	},
	{
	    speed: 190,
	    length: 6
	},
	{
	    speed: 180,
	    length: 10
	}];
	var level = 0;

$(function(){
	
		// prepare layer 1 (bg)
		var canvas_bg = document.getElementById("bg");
		layer1 = canvas_bg.getContext("2d");	 			
		
		
		// prepare layer 2 (game)
		var canvas = document.getElementById("game");  
		var ctx = canvas.getContext("2d");
		layer2 = ctx;
		
		
		
		// draw a splash screen when loading the game background
		// This is for safety purpose if someone click at once start link of welcome page before the game background is loaded
		
		var bg_gradient = ctx.createLinearGradient(0,0,0,ctx.canvas.height);
		bg_gradient.addColorStop(0, "#cccccc");
		bg_gradient.addColorStop(1, "#efefef");
		ctx.fillStyle = bg_gradient;
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		
		// draw the loading text
		
		ctx.font = "34px 'Arial'";
		ctx.textAlign = "center";
		ctx.fillStyle = "#333333";
		ctx.fillText("loading...",ctx.canvas.width/2,canvas.height/2);


		// load the background image
		
		bg_image = new Image();	
		bg_image.onload = function() {
			
			drawLayerBG();
			init();		
		}
		
		bg_image.onerror = function() {
		
			console.log("Error loading the image.");
		}
		
		bg_image.src = "images/board.png";
		
		
		$("#start").click(function(){ 
		
		    $("#menu").hide();
		    $("#powerUpBoard").show();
			startMusic.pause();
			mainMusic.play();
			gameRepeater = setInterval(gameloop, gameLevel[level].speed);
			
		});
		
		$("#restart").click(function(){ 
		
			init();
			mainMusic.play();
			$("#reMenu").hide();
			$("#powerUpBoard").show();
			level = 0;
			gameRepeater = setInterval(gameloop, gameLevel[level].speed);
			
		});
	    	
});

function changeGameLevel() {
    if (level == 2) {
        gameover();
    } else {
        level++;
        $("#levelNum").text(level+1);
        clearInterval(gameRepeater);
        init();
        
        gameRepeater = setInterval(gameloop, gameLevel[level].speed);
        
    }
}

function init()
{
       
		d = "right"; //default direction
		create_snake();
		
		create_food(); //Now we can see the food particle
    //finally lets display the score
		if (level == 0) {
		    score = 0;
		}
		bonus=0;
		bonus_time = 10;
		bonus_food_type = 0;
		flag=0;
		highestScore=localStorage.getItem("SnakeGameHigh");
		if(highestScore==null)
		{
			highestScore=0;
		}else
		{
			$("#highScore").text("Game Best : "+parseInt(highestScore)).show();
		}
}

function gameloop() {	
    
		drawLayerGame();
		
}

// draw graphics that related to the bg canvas
function drawLayerBG()
{
		var ctx = layer1;
		clear(ctx);
		// draw the image background
		ctx.drawImage(bg_image, 0, 0);
}



// draw graphics that related to the game canvas
function drawLayerGame()
{
    
		// get the reference of the canvas element and the drawing context.
		var ctx = layer2;				
		
		// draw the game state visually
		// clear the canvas before drawing.
		clear(ctx);
		
		paint();
		
		function paint()
		{
			//To avoid the snake trail we need to paint the BG on every frame
			//Lets paint the layer2 now
			drawLayerBG();
			
			
			drawWalls();
			//The movement code for the snake to come here.
			//The logic is simple
			//Pop out the tail cell and place it infront of the head cell
			var nx = snake_array[0].x;
			var ny = snake_array[0].y;
			
			//These were the position of the head cell.
			//We will increment it to get the new head position
			//Lets add proper direction based movement now
			if(d == "right") nx++;
			else if(d == "left") nx--;
			else if(d == "up") ny--;
			else if(d == "down") ny++;
			
			//Lets add the game over clauses now
			//This will restart the game if the snake hits the wall
			//Lets add the code for body collision
			//Now if the head of the snake bumps into its body, the game will restart
			if (nx == -1 || nx == w / cw || ny == -1 || ny == h / cw - 1 || check_collision(nx, ny, snake_array) || check_collision_wall(nx, ny))
			{
			    if (powerSaver == 0) {
			        hitType = "wall";

			        if (check_collision(nx, ny, snake_array))
			            hitType = "self";

			        gameover();
			        //Lets organize the code a bit now.
			        //return;
			    }
			    else {
			        powerSaver--;
			        snakeShaker = 5;
			        $("#life" + (powerSaver + 1)).hide();
			        if (nx == -1) {//left
			            nx++;
			            ny++;
                        
			            if ((ny + 1) > (h / (2*cw)))
			            {
			                ny--;
			                d = "up";
			            } else {
			                ny++;
			                d = "down";
			            }
			            
			        }
			        else if (ny == -1) {//up
			            ny++;

			            if ((nx + 1) > (w / (2 * cw))) {
			                nx--;
			                d = "left";
			            } else {
			                nx++;
			                d = "right";
			            }

			        }
			        else if (nx == w / cw) {//right
			            nx--;

			            if ((ny + 1) > (h / (2 * cw))) {
			                ny--;
			                d = "up";
			            } else {
			                ny++;
			                d = "down";
			            }

			        } else if (ny == h / cw - 1) {//down
			            ny--;

			            if ((nx + 1) > (w / (2 * cw))) {
			                nx--;
			                d = "left";
			            } else {
			                nx++;
			                d = "right";
			            }
			            
			        }
			        if (check_collision_wall(nx, ny))
			        {
			            if (level == 1) {
			                if (nx == 18 && ny >= 4 && ny <= 16) {
			                    if (d == "right") {
			                        if (ny <= 10) {
			                            nx--;
			                            ny--;
			                            d = "up";
			                        }
			                        else {
			                            nx--;
			                            ny++;
			                            d = "down";
			                        }
			                    }
			                    else if (d == "left") {
			                        if (ny <= 10) {
			                            nx++;
			                            ny--;
			                            d = "up";
			                        }
			                        else {
			                            nx++;
			                            ny++;
			                            d = "down";
			                        }
			                    }
			                    else if (d == "up") {


			                        nx--;
			                        ny++;
			                        d = "left";

			                    }
			                    else if (d == "down") {
			                        ny--;
			                        nx--;
			                        d = "left";
			                    }


			                }
			            }
			            
			            else if (level == 2)
			            {
			                if (nx == 18 && ny >= 4 && ny <= 16) {
			                    if (d == "right") {
			                        if (ny <= 10) {
			                            nx--;
			                            ny--;
			                            d = "up";
			                        }
			                        else {
			                            nx--;
			                            ny++;
			                            d = "down";
			                        }
			                    }
			                    else if (d == "left") {
			                        if (ny <= 10) {
			                            nx++;
			                            ny--;
			                            d = "up";
			                        }
			                        else {
			                            nx++;
			                            ny++;
			                            d = "down";
			                        }
			                    }
			                    else if (d == "up") {


			                        nx--;
			                        ny++;
			                        d = "left";

			                    }
			                    else if (d == "down") {
			                        ny--;
			                        nx--;
			                        d = "left";
			                    }


			                }
			                else if (ny == 10 && nx >= 7 && ny <= 30) {

			                    if (d == "up") {
			                        if (nx >= 18) {
			                            nx++;
			                            ny++;
			                            d = "right";
			                        }
			                        else {
			                            nx--;
			                            ny++;
			                            d = "left";
			                        }
			                    }
			                    else if (d == "down") {
			                        if (nx >= 18) {
			                            nx++;
			                            ny--;
			                            d = "right";
			                        }
			                        else {
			                            nx--;
			                            ny--;
			                            d = "left";
			                        }
			                    }
			                    else if (d == "left") {


			                        nx++;
			                        ny--;
			                        d = "right";

			                    }
			                    else if (d == "right") {
			                        ny--;
			                        nx--;
			                        d = "left";
			                    }


			                }
			            }
			        }
			        
			    }
				
			}
			
			//Lets write the code to make the snake eat the food
			//The logic is simple
			//If the new head position matches with that of the food,
			//Create a new head instead of moving the tail
			if(nx == food.x && ny == food.y)
			{
				var tail = {x: nx, y: ny};
				score=score+10;
				if(score>highestScore){
					$("#highScore").text("...New High Score!!!...").show();
				}
				bonus++;
				//Create new food
				create_food();
				if(bonus==3){//bonus food will come after eating 3 normal food
					bonus=0;
					bonus_time = 10;
					
					bonus_food_type = bonus_food_type % 5;//will give value 0-4
					
					create_bonus_food();
							
					
					flag=1;
				}
			}
			else if(nx == food_bonus.x && ny == food_bonus.y)
			{
				var tail = {x: nx, y: ny};
				if (bonus_time < 0) bonus_time = 0;

				switch (bonus_food_type)
				{
				    case 0:
				    case 1:
				        score = score + 10 * bonus_time;
				        break;
				    case 2://poison
				        if (powerSaver == 0) {
				            hitType = "poisonFood";
				            gameover();
				        }
				        else {
				            powerSaver--;
				            $("#life" + (powerSaver + 1)).hide();
				        }
				        break;
				    case 3://power up
				        powerSaver++;
				        $("#life" + powerSaver).show();
                        break;
				   case 4://resize
				                //for (l = 0; l < 22;l++)
				                // snake_array.pop();
				        //Level changer
				        changeGameLevel();
				        levelchanged = 1;
				        break;
				}

				
				if(score>highestScore){
					$("#highScore").text("...New High Score!!!...").show();
				}
				food_bonus.x =-1;
				food_bonus.y=-1;
				$("#bottom_msg").hide();
				$("#food_timer").text(15);
				clearInterval(counter);
				bonus_food_type++;
			}
			else
			{
				var tail = snake_array.pop(); //pops out the last cell
				tail.x = nx; tail.y = ny;
			}
			//The snake can now eat the food.
			if (levelchanged == 1) {
			    levelchanged = 0;
			    var tail = snake_array.pop();
			    tail.x = snake_array[0].x; tail.y = snake_array[0].y;
			}
			snake_array.unshift(tail); //puts back the tail as the first cell
			
			for(var i = 0; i < snake_array.length; i++)
			{
				var c = snake_array[i];
				//Lets paint 10px wide cells
				if(i<=snake_array.length-2&&i>=1){
				paint_cell(c.x, c.y,true);}else{
				paint_cell(c.x, c.y,false);
				}
			}
			
			//Lets paint the food
			
			
			//paint_cell(food.x, food.y);
			
			ctx.drawImage(prey_image,food.x*cw, food.y*cw,20,20);
			
			//for bonus
			if(food_bonus.x!=-1){
			drawCircle(ctx, food_bonus.x*cw+10, food_bonus.y*cw+10, 10);
			if(flag==1){
			flag=0;
			$("#bottom_msg").show();
			decreaseTimer();
			}
			}
			
			//Lets paint the score
			var score_text = "Your Score: " + score;
			
			$("#scoreBoard").html(score_text);
			
		}
		
		function decreaseTimer(){
		
			counter=setInterval(decreaseCounter,1000);

		}
		function decreaseCounter(){bonus_time--;
			$("#food_timer").text(bonus_time);
			if(bonus_time==0)
			{
					$("#bottom_msg").hide();
					$("#food_timer").text(15);
					clearInterval(counter);
					food_bonus.x=-1;
					food_bonus.y = -1;
					bonus_food_type++;
			}
		}
		
		//Lets first create a generic function to paint cells
		function paint_cell(x, y,stroke)
		{
		    if (level == 0) {
		        ctx.fillStyle = "green";
		        if (snakeShaker != 0)
		        {
		            ctx.fillStyle = "red";
		            snakeShaker--;
		        }
		    }
		    else if (level == 1) {
		        ctx.fillStyle = "blue";
		        if (snakeShaker != 0) {
		            ctx.fillStyle = "red";
		            snakeShaker--;
		        }
		    }
		    else if (level == 2)
		    {
		        ctx.fillStyle = "#7A8017";
		        if (snakeShaker != 0) {
		            ctx.fillStyle = "red";
		            snakeShaker--;
		        }
		    }
			ctx.fillRect(x*cw, y*cw, cw, cw);
			if(stroke==true){
			ctx.strokeStyle = "white";
			ctx.strokeRect(x*cw, y*cw, cw, cw);
			}
		}
		
    //functions to make obstacle based on level
		function drawWalls() {
		    switch (level) {
		        case 0:
		            break;
		        case 1:
		            ctx.fillStyle = "#653232";
		            if (wallShaker != 0)
		            {
		                ctx.fillStyle = "red";
		                wallShaker--;
		            }
		            for (var k = 4; k <= 16; k++)
		            {
		                ctx.fillRect(18 * cw, k * cw, cw, cw);
		                ctx.strokeStyle = "black";
		                ctx.strokeRect(18 * cw, k * cw, cw, cw);
		            }

		            break;
		        case 2:
		            ctx.fillStyle = "#653232";
		            if (wallShaker != 0) {
		                ctx.fillStyle = "red";
		                wallShaker--;
		            }
		            for (var k = 4; k <= 16; k++) {
		                ctx.fillRect(18 * cw, k * cw, cw, cw);
		                ctx.strokeStyle = "black";
		                ctx.strokeRect(18 * cw, k * cw, cw, cw);
		            }
		            for (var l = 7; l <= 30; l++) {
		                ctx.fillRect(l * cw, 10 * cw, cw, cw);
		                ctx.strokeStyle = "black";
		                ctx.strokeRect(l * cw, 10 * cw, cw, cw);
		            }
		            break;
		        default:
		            console.log("error in drawWalls function");
		    }

		}
		function check_collision_wall(x,y)
		{
		    if (level != 0) {

		        //if level is either 1 or 2
		        if (x == 18) {
		            if (y >= 4 && y <= 16)//colliding with wall
		            {
		                wallShaker = 4;
		                return true;
		                
		            }

		        }

		        if (level == 2) {
		            if (y == 10) {
		                if (x >= 7 && x <= 30)//colliding with wall
		                {
		                    wallShaker = 4;
		                    return true;
		                }


		            }
		        }

		    }
		    return false;
		}

		
		
		//Lets add the keyboard controls now
		$(document).keydown(function(e){
			var key = e.which;
			e.preventDefault();
			//We will add another clause to prevent reverse gear
			if(key == "37" && d != "right") d = "left";
			else if(key == "38" && d != "down") d = "up";
			else if(key == "39" && d != "left") d = "right";
			else if(key == "40" && d != "up") d = "down";
			//The snake is now keyboard controllable
	});
	

}



function create_snake()
{
		var length = gameLevel[level].length; //Length of the snake
		snake_array = []; //Empty array to start with
		for(var i = length-1; i>=0; i--)
		{
			//This will create a horizontal snake starting from the top left
		    snake_array.push({ x: i, y: 0 });
		    //console.log(snake_array[length - 1 - i].x, snake_array[length - 1 - i].y);
		}
		
}
	
//Lets create the food now
function create_food()
{
		food = {
			x: Math.round(Math.random()*(w-cw)/cw), 
			y: Math.round(Math.random()*(h-cw)/cw), 
		};
		if(food.y>=21)
			food.y=14;
   
		changeFoodLocationIfcollideWall(1);//1 for simple food and 2 for bonus food
}

function create_bonus_food()
{
		food_bonus = {
			x: Math.round(Math.random()*(w-cw)/cw), 
			y: Math.round(Math.random()*(h-cw)/cw), 
		};
		if(food_bonus.y>=21)
			food_bonus.y=14;
}


function check_collision(x, y, array) {
    //This function will check if the provided x/y coordinates exist
    //in an array of cells or not
    for (var i = 0; i < array.length; i++) {
        if (array[i].x == x && array[i].y == y)
            return true;
    }

    return false;
}
function changeFoodLocationIfcollideWall(foodType)
{
    if (level == 0) {
        return;
    }
    var locX, locY;
    if (foodType == 1) {
        locX = food.x;
        locY = food.y;
    } else {
        locX = food_bonus.x;
        locY = food_bonus.y;
    }
    //checking whether collide with snake
    if (check_collision(locX, locY, snake_array))//means when collide
    {
        if (foodType == 1)
            create_food();
        else
            create_bonus_food();
        return;
    }
   //if( check_collision_wall(locX, locY)

    //if level is either 1 or 2
    if (locX == 18) {
        if (locY >= 4 && locY <= 16)//colliding with wall
        {
            locX = Math.round(Math.random() * 37);
            loxY = Math.round(Math.random() * 3);
        }
        if (foodType == 1) {
            food.x=locX;
            food.y=locY;
        } else {
            food_bonus.x=locX;
            food_bonus.y=locY;
        }
        return;//As now it will not collide in any level case
    }

    if (level == 2)
    {
        if (locY == 10) {
            if (locX >= 7 && locX <= 30)//colliding with wall
            {
                locX = Math.round(Math.random() * 6);
                loxY = Math.round(Math.random() * 20);
            }
            if (foodType == 1) {
                food.x = locX;
                food.y = locY;
            } else {
                food_bonus.x = locX;
                food_bonus.y = locY;
            }
            return;
        }
    }
}
//to clear canvas

function clear(ctx) {	

		ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height); 

}

//to draw bonus food
function drawCircle(ctx, x, y, radius) {

    // prepare the radial gradients fill style
        var circle_gradient = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, radius);
        switch(bonus_food_type){
            case 0:
                circle_gradient.addColorStop(0, "#fff");
                circle_gradient.addColorStop(1, "#ff0");
                break;
            case 1://yellow-points fruite
                circle_gradient.addColorStop(0, "#fff");
                circle_gradient.addColorStop(1, "#ff0");
                break;
            case 2://red-poison fruite
                circle_gradient.addColorStop(0, "#fff");
                circle_gradient.addColorStop(1, "#f00");
                break;
            case 3://blue-power up fruite
                circle_gradient.addColorStop(0, "#fff");
                circle_gradient.addColorStop(1, "#00f");
                break;
            case 4://white-next level fruite
                circle_gradient.addColorStop(0, "#fff");
                circle_gradient.addColorStop(1, "#fff");
                break;
        }

		ctx.fillStyle = circle_gradient;
		
		// draw the path
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI*2, true); 
		ctx.closePath();
		
		// actually fill the circle path
		ctx.fill();
}

function gameover() {

		clearInterval(gameRepeater);
		mainMusic.pause();
		$("#powerUpBoard").hide();
		if(score>highestScore)
		{
			localStorage.setItem("SnakeGameHigh",score);
			highestScore=score;
		}
			
		var tweet = document.getElementById("tweet");
		tweet.href='http://twitter.com/share?text=I scored ' +score+ ' points in the Snake Game by Jagraj Singh...';
			
		var goText = document.getElementById("info2");
			
		//Show the messages
		if(hitType == "wall") {
			
			goText.innerHTML = msgsWall[Math.floor(Math.random() * msgsWall.length)];
			
		}
		else if(hitType == "self") {
				
			goText.innerHTML = msgsSelf[Math.floor(Math.random() * msgsSelf.length)];
			
		}
		else if (hitType == "poisonFood") {

		    goText.innerHTML = msgsPoison[Math.floor(Math.random() * msgsPoison.length)];

		}
			
		$("#reMenu").show();
			
}


