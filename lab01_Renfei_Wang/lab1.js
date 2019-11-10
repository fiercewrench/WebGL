

///////////////////////////////////////////////////////////////////////
//
//     CSE 5542 AU 2019  LAB 1
//     Renfei Wang
//
//
///////////////////////////////////////////////////////////////////////

var gl;  // the graphics context (gc) 
var shaderProgram;  // the shader program 

//viewport info 
var vp_minX, vp_maxX, vp_minY, vp_maxY, vp_width, vp_height; 

// Position Buffers
var lineVertexPositionBuffer;
var pointVertexPositionBuffer;
var triangleVertexPositionBuffer;
var squareVertexPositionBuffer;
var circleVertexPositionBuffer;

// Color Buffers
var lineVertexColorBuffer;
var pointVertexColorBuffer;
var triangleVertexColorBuffer;
var squareVertexColorBuffer;
var circleVertexColorBuffer;

// shape size counters
var line_size = 0;
var point_size = 0;
var triangle_size = 0;
var square_size = 0;
var circle_size =0;

// number of triangles need to be draw for a single specific type of shape
var num_tri_square = 2;
var num_tri_circle = 361;

// keep track of the number of vertices
var num_vertices;

// VBOs for vertices of different shapes
var vbo_lines = [];  // i only store line vertices, 2 points per click 
var vbo_points =[];
var vbo_triangles = [];
var vbo_squares = [];
var vbo_circles =[];

// VBOs for colors of different shapes
var vbo_colors = []; // the first one is a reference to other color vbos. add [r,g,b,1.0] to color vbos through this reference.
var color_lines =[];
var color_points =[];
var color_triangles = [];
var color_squares = [];
var color_circles =[];

// store what colors/shapes are in the list
var colors = [];   
var shapes = [];  

// default settings: red horizontal line
var polygon_mode = 'h';   
var color_mode  = 'r';

var canvas_win_width_ratio;
var canvas_win_height_ratio;
var canvas;

//////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.canvasWidth = canvas.width;

        gl.canvasHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}



///////////////////////////////////////////////////////////////

function webGLStart() {
    canvas = document.getElementById("lab1-canvas");
    canvas_win_width_ratio = canvas.width/window.screen.availWidth;
    canvas_win_height_ratio = canvas.height/window.screen.availHeight;
    initGL(canvas);
    initShaders();
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    initScene();
    window.addEventListener('resize', resizer,false); //window event listener
    document.addEventListener('mousedown', onDocumentMouseDown,false);
    document.addEventListener('keydown', onKeyDown, false);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////               LINE             ////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////               Create Line VBO              /////////////////
function CreateLineBuffer() {
    lineVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vbo_lines), gl.STATIC_DRAW);
    lineVertexPositionBuffer.itemSize = 3;  // NDC'S [x,y,0] 
    lineVertexPositionBuffer.numItems = line_size*2; // lines has two vertices

    lineVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color_lines), gl.STATIC_DRAW);
    console.log(color_lines);
    lineVertexColorBuffer.itemSize = 4; // [r,g,b,1.0]
    lineVertexColorBuffer.numItems = line_size*2; // for each vertex
}
/////////////               Draw Line              /////////////////
function draw_lines() {  
    gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, lineVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);


    gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, lineVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, lineVertexPositionBuffer.numItems);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////               POINT             ///////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////               Create Point VBO              ////////////////
function CreatePointBuffer() {
    pointVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vbo_points), gl.STATIC_DRAW);
    pointVertexPositionBuffer.itemSize = 3;  // NDC'S [x,y,0] 
    pointVertexPositionBuffer.numItems = point_size; // point only has one vertex 

    pointVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color_points), gl.STATIC_DRAW);
    pointVertexColorBuffer.itemSize = 4;
    pointVertexColorBuffer.numItems = point_size;
}
////////////               draw points            //////////////////
function draw_points() { 
    gl.bindBuffer(gl.ARRAY_BUFFER, pointVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, pointVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, pointVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, pointVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, pointVertexPositionBuffer.numItems);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////               TRIANGLE            /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////               Create Triangle VBO              /////////////////
function CreateTriangleBuffer() {
    triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vbo_triangles), gl.STATIC_DRAW);
    triangleVertexPositionBuffer.itemSize = 3;  // NDC'S [x,y,0] 
    triangleVertexPositionBuffer.numItems = triangle_size*3;// triangle has 3 vertices

    triangleVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color_triangles), gl.STATIC_DRAW);
    triangleVertexColorBuffer.itemSize = 4;
    triangleVertexColorBuffer.numItems = triangle_size*3;
}
////////////               Draw Triangle             /////////////////
function draw_triangles() {   // lab1 sample - draw lines only 
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////               SQAURE            /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////               Create Square VBO              /////////////////
function CreateSquareBuffer() {
    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vbo_squares), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;  // NDC'S [x,y,0] 
    squareVertexPositionBuffer.numItems = square_size*num_tri_square*3; // use triangles to draw square, each square has 2 triangles, each triangle has 3 vertices
    squareVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color_squares), gl.STATIC_DRAW);
    squareVertexColorBuffer.itemSize = 4;
    squareVertexColorBuffer.numItems = square_size*num_tri_square*3;
}
///////////               Draw Square              /////////////////
function draw_squares() {   // lab1 sample - draw lines only 
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, squareVertexPositionBuffer.numItems);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////               CIRCLE            /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////               Create Circle VBO              /////////////////
function CreateCircleBuffer() {
    circleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vbo_circles), gl.STATIC_DRAW);
    circleVertexPositionBuffer.itemSize = 3;  // NDC'S [x,y,0] 
    circleVertexPositionBuffer.numItems =circle_size*num_tri_circle*3;// use triangles to draw circle, each square has 361 triangles, each triangle has 3 vertices

    circleVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color_circles), gl.STATIC_DRAW);
    circleVertexColorBuffer.itemSize = 4;
    circleVertexColorBuffer.numItems = circle_size*num_tri_circle*3;
}

////////////               Draw Circle              /////////////////
function draw_circles() { 
    gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, circleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, circleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, circleVertexPositionBuffer.numItems);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function initScene() {
    vp_minX = 0; vp_maxX = gl.canvasWidth;  vp_width = vp_maxX- vp_minX+1; 
    vp_minY = 0; vp_maxY = gl.canvasHeight; vp_height = vp_maxY-vp_minY+1; 
    console.log(vp_minX, vp_maxX, vp_minY, vp_maxY); 
    gl.viewport(vp_minX, vp_minY, vp_width, vp_height); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function drawScene() {
    vp_minX = 0; vp_maxX = gl.canvasWidth;  vp_width = vp_maxX- vp_minX+1; 
    vp_minY = 0; vp_maxY = gl.canvasHeight; vp_height = vp_maxY-vp_minY+1; 
    console.log(vp_minX, vp_maxX, vp_minY, vp_maxY); 
    gl.viewport(vp_minX, vp_minY, vp_width, vp_height); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   
   // draw different shapes
    draw_lines();
    draw_points();
    draw_triangles();
    draw_squares();
    draw_circles();
}

function clearScreen(){ // init the scene and set all the according variables to the state before the program start 
  initScene();
  line_size = 0; 
  point_size = 0;
  triangle_size = 0;
  square_size = 0;
  circle_size = 0;

  vbo_lines = [];
  vbo_points =[];
  vbo_triangles = [];
  vbo_squares = [];
  vbo_circles =[];


  color_lines =[];
  color_points =[];
  color_triangles = [];
  color_squares = [];
  color_circles = [];

  colors = []; 
  shapes = []; 

  polygon_mode = 'h';
  color_mode  = 'r';
  CreateLineBuffer(); // create VBO for the lines 
  CreatePointBuffer();
  CreateTriangleBuffer();
  CreateSquareBuffer();
  CreateCircleBuffer();
}

function redisplayScreen(){ //redraw
  drawScene();
}


////////////////////////////////////////////////////////////////////////////////////
///////////////////////////          HANDLERS             //////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/////////////////          Mouse button handlers             ///////////////////////

function onDocumentMouseDown( event ) {
  event.preventDefault();
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mouseup', onDocumentMouseUp, false );
  document.addEventListener( 'mouseout', onDocumentMouseOut, false );
	 
	var NDC_X = (event.clientX - vp_minX)/vp_width*2 -1; 
	var NDC_Y = ((vp_height-event.clientY) - vp_minY)/vp_height*2 - 1 ;
	console.log("NDC click", event.clientX, event.clientY, NDC_X, NDC_Y);

	if (polygon_mode == 'h' ) {       // add the two points of h line
    line_size++; 
    num_vertices = 2; 
    vbo_colors=color_lines;
	  vbo_lines.push(NDC_X-0.1);
	  vbo_lines.push(NDC_Y);
	  vbo_lines.push(0.0);

	  vbo_lines.push(NDC_X+0.05);
	  vbo_lines.push(NDC_Y);
	  vbo_lines.push(0.0);

  }
	else if (polygon_mode == 'v' ) {  // add two end points of the v line 
    line_size++; 
    num_vertices = 2; 
    vbo_colors=color_lines;
	  vbo_lines.push(NDC_X);
	  vbo_lines.push(NDC_Y-0.1);
	  vbo_lines.push(0.0);

	  vbo_lines.push(NDC_X);
	  vbo_lines.push(NDC_Y+0.1);
	  vbo_lines.push(0.0);

	}
  else if (polygon_mode == 'p'){ // add one point for single point
    point_size++;
    num_vertices = 1; 
    vbo_colors=color_points;
    vbo_points.push(NDC_X);
    vbo_points.push(NDC_Y);
    vbo_points.push(0.0);
  }
  else if (polygon_mode == 't'){ // add three points for the three vertices of a triangle
    triangle_size++;
    num_vertices = 3; 
    vbo_colors=color_triangles;
    vbo_triangles.push(NDC_X);
    vbo_triangles.push(NDC_Y+0.05);
    vbo_triangles.push(0.0);

    vbo_triangles.push(NDC_X-0.04);
    vbo_triangles.push(NDC_Y-0.03);
    vbo_triangles.push(0.0);

    vbo_triangles.push(NDC_X+0.04);
    vbo_triangles.push(NDC_Y-0.03);
    vbo_triangles.push(0.0);
  }
  else if (polygon_mode == 'q'){ // split the square into two triangles, add three points for each triangle
    square_size++;
    num_vertices = 3*num_tri_square; 
    vbo_colors=color_squares;
    vbo_squares.push(NDC_X+0.05);
    vbo_squares.push(NDC_Y+0.05);
    vbo_squares.push(0.0);

    vbo_squares.push(NDC_X+0.05);
    vbo_squares.push(NDC_Y-0.05);
    vbo_squares.push(0.0);

    vbo_squares.push(NDC_X-0.05);
    vbo_squares.push(NDC_Y+0.05);
    vbo_squares.push(0.0);

    vbo_squares.push(NDC_X+0.05);
    vbo_squares.push(NDC_Y-0.05);
    vbo_squares.push(0.0);

    vbo_squares.push(NDC_X-0.05);
    vbo_squares.push(NDC_Y+0.05);
    vbo_squares.push(0.0);

    vbo_squares.push(NDC_X-0.05);
    vbo_squares.push(NDC_Y-0.05);
    vbo_squares.push(0.0);

  }
  else if (polygon_mode == 'o'){ // split the circle into 361 triangles, add three points for each triangle
    circle_size++;
    var radius = 0.05;
    num_vertices = num_tri_circle*3;
    vbo_colors=color_circles;
      
    for (var i = 0; i < num_tri_circle; i++){
      vbo_circles.push(NDC_X);
      vbo_circles.push(NDC_Y);
      vbo_circles.push(0.0);

      var theta = i * 2* Math.PI / num_tri_circle;
      vbo_circles.push(NDC_X + radius * Math.cos(theta));
      vbo_circles.push(NDC_Y + radius * Math.sin(theta));
      vbo_circles.push(0.0);

      var beta = (i+2) * 2* Math.PI / num_tri_circle;
      vbo_circles.push(NDC_X + radius * Math.cos(beta));
      vbo_circles.push(NDC_Y + radius * Math.sin(beta));
      vbo_circles.push(0.0);
    }
  }
	if(color_mode == 'r'){ // set color to red for each vertices
    for(var i = 0; i < num_vertices; i++){
      vbo_colors.push(1); // add [r,g,b,1.0] through reference vbo_colors to each color vbos
      vbo_colors.push(0);
      vbo_colors.push(0);
      vbo_colors.push(1);
    }
  }
  else if(color_mode == 'g'){ // set color to green for each vertices
    for(var i = 0; i < num_vertices; i++){
      vbo_colors.push(0);
      vbo_colors.push(1);
      vbo_colors.push(0);
      vbo_colors.push(1);
    }
  }
  else if(color_mode == 'b'){ // set color to green for each vertices
    for(var i = 0; i < num_vertices; i++){
      vbo_colors.push(0);
      vbo_colors.push(0);
      vbo_colors.push(1);
      vbo_colors.push(1);
    }
  }
   
	 shapes.push(polygon_mode);
	 colors.push(color_mode); 
	 
	 console.log("size=", line_size);
	 console.log("shape = ", polygon_mode);

	 CreateLineBuffer(); // create VBO for the lines 
   CreatePointBuffer();
   CreateTriangleBuffer();
   CreateSquareBuffer();
   CreateCircleBuffer();
   drawScene();	 // draw the VBO 
}


function onDocumentMouseMove( event ) {
  var mouseX = event.clientX;
  var mouseY = event.ClientY;
}

function onDocumentMouseUp( event ) {
  document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
  document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
  document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

function onDocumentMouseOut( event ) {
  document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
  document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
  document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

////////////////////          key stroke handler             ///////////////////////
function onKeyDown(event) {
      console.log(event.keyCode);
      switch(event.keyCode)  {
         case 72:
              if (event.shiftKey) {
                  console.log('enter H');
      polygon_mode = 'h' 
              }
              else {
      console.log('enter h');
      polygon_mode = 'h'      
              }
          break;
         case 86:
              if (event.shiftKey) {
                  console.log('enter V');
      polygon_mode = 'v'            
              }
              else {
      console.log('enter v');
      polygon_mode = 'v'          
              }
          break;
         case 82:
              if (event.shiftKey) {
                  console.log('enter R');
      color_mode = 'r'            
              }
              else {
      console.log('enter r');
      color_mode = 'r'          
              }
          break;
         case 71:
              if (event.shiftKey) {
                  console.log('enter G');
      color_mode = 'g'            
              }
              else {
      console.log('enter g');
      color_mode = 'g'          
              }
          break;
         case 66:
              if (event.shiftKey) {
                  console.log('enter B');
      color_mode = 'b'            
              }
              else {
      console.log('enter b');
      color_mode = 'b'          
              }
         break; 
         case 80:
              if (event.shiftKey) {
                  console.log('enter P');
                  polygon_mode = 'p'            
              }
              else {
                console.log('enter p');
                polygon_mode = 'p'          
              }
              break;  
        case 84:
              if (event.shiftKey) {
                  console.log('enter T');
                  polygon_mode = 't'            
              }
              else {
                console.log('enter t');
                polygon_mode = 't'          
              }
              break;      
      case 81:
              if (event.shiftKey) {
                  console.log('enter Q');
                  polygon_mode = 'q'            
              }
              else {
                console.log('enter q');
                polygon_mode = 'q'          
              }
              break;  
      case 67:
              if (event.shiftKey) {
                  console.log('enter C');            
              }
              else {
                console.log('enter c');          
              }
              console.log('clear screen');
              clearScreen();
              break;

      case 68:
              if (event.shiftKey) {
                  console.log('enter D');            
              }
              else {
                console.log('enter d');          
              }
              console.log('redisplay screen');
              redisplayScreen();
              break;
      case 79:
              if (event.shiftKey) {
                  console.log('enter O');
                  polygon_mode = 'o'            
              }
              else {
                console.log('enter o');
                polygon_mode = 'o'          
              }
              break; 
      }
    }
////////////////////          window size handler            ///////////////////////
function resizer(){

  canvas.width = window.innerWidth * canvas_win_width_ratio;
  canvas.height = window.innerHeight * canvas_win_height_ratio;
  if(canvas.width < canvas.height){
    canvas.height=canvas.width;
  }else{
    canvas.width=canvas.height;
  }
  console.log(canvas.width);
  console.log(canvas.height);
  initGL(canvas);
  initScene();
  drawScene();
  console.log("resized");
}

