

///////////////////////////////////////////////////////////////////////
//
//     CSE 5542 AU 2019  LAB 2  
//     Renfei Wang
//     10/01/2019 
//
//
///////////////////////////////////////////////////////////////////////

var gl;  // the graphics context (gc) 
var shaderProgram;  // the shader program 

//viewport info 
var vp_minX, vp_maxX, vp_minY, vp_maxY, vp_width, vp_height; 

// Position buffers
var LineVertexPositionBuffer;
var PointVertexPositionBuffer;
var TriangleVertexPositionBuffer;
var SquareVertexPositionBuffer;
var VerticalLineVertexPositionBuffer;

// Color buffers
var VertexLineRedBuffer;
var VertexLineGreenBuffer;
var VertexLineBlueBuffer;

var VertexTriangleRedBuffer;
var VertexTriangleGreenBuffer;
var VertexTriangleBlueBuffer;

var VertexPointRedBuffer;
var VertexPointGreenBuffer;
var VertexPointBlueBuffer;

var VertexSquareRedBuffer;
var VertexSquareGreenBuffer;
var VertexSquareBlueBuffer;

var VertexVlineRedBuffer;
var VertexVlineGreenBuffer;
var VertexVlineBlueBuffer;

var shape_size = 0;     // shape size counter 
var triangle_size = 0;
var square_size = 0;
var point_size = 0;
var vline_size = 0;

var colors = [];   // I am not doing colors, but you should :-) 
var shapes = [];   // the array to store what shapes are in the list

// store colors for different shapes
var line_colors=[];
var triangle_colors=[];
var square_colors=[];
var point_colors=[];
var vline_colors=[];

//transformations for lines
var shapes_tx=[];   // x translation  
var shapes_ty=[];   // y translation 
var shapes_rotation=[];  // rotation angle 
var shapes_scale=[];   // scaling factor (uniform is assumed)  

// transformations for triangles
var triangles_tx = [];
var triangles_ty = [];
var triangles_rotation = [];
var triangles_scale = [];

// transformations for points
var points_tx = [];
var points_ty = [];
var points_rotation =[];
var points_scale =[];

// transformations for square
var squares_tx = [];
var squares_ty = [];
var squares_rotation = [];
var squares_scale = [];

// transformations for vertical lines
var vlines_tx = [];
var vlines_ty = [];
var vlines_rotation = [];
var vlines_scale =[];

// global rotation for lines
var global_rotation=[];
var global_mode = [];
var global_key = false;

// global rotation for triangles
var global_triangle_mode=[];
var global_triangle_rotation =[];

// global rotation for squares
var global_square_mode=[];
var global_square_rotation =[];

// global rotation for squares
var global_point_mode=[];
var global_point_rotation =[];

// global rotation for vertical lines
var global_vline_mode=[];
var global_vline_rotation=[];

var polygon_mode = 'h';  //default = h line 
var color_mode  = 'r';

var select_mode = false;
var min_mode;
var min_index;

var global_scale = 1;

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
    var canvas = document.getElementById("lab2-canvas");
    initGL(canvas);
    initShaders();
    ////////
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    ////////
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram,"aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    // the variable that store the address of the uniform matrix variable in the shader, to be use later when you draw
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    initScene();
    
    document.addEventListener('mousedown', onDocumentMouseDown,false);
    document.addEventListener('keydown', onKeyDown, false);
}


function CreateLineColorBuffer(num_vertices){
  var red_vertices=[];
  var green_vertices=[];
  var blue_vertices=[];

// red color buffer for line
    for(var i = 0; i < num_vertices; i++){
      red_vertices.push(1); // add [r,g,b,1.0] through reference vbo_colors to each color vbos
      red_vertices.push(0);
      red_vertices.push(0);
      red_vertices.push(1);
    }
    VertexLineRedBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VertexLineRedBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(red_vertices), gl.STATIC_DRAW);
  VertexLineRedBuffer.itemSize = 4;
  VertexLineRedBuffer.numItems = num_vertices;

// green color buffer for line
    for(var i = 0; i < num_vertices; i++){
      green_vertices.push(0); // add [r,g,b,1.0] through reference vbo_colors to each color vbos
      green_vertices.push(1);
      green_vertices.push(0);
      green_vertices.push(1);
    }
    VertexLineGreenBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VertexLineGreenBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(green_vertices), gl.STATIC_DRAW);
  VertexLineGreenBuffer.itemSize = 4;
  VertexLineGreenBuffer.numItems = num_vertices;

// blue color buffer for line
    for(var i = 0; i < num_vertices; i++){
      blue_vertices.push(0); // add [r,g,b,1.0] through reference vbo_colors to each color vbos
      blue_vertices.push(0);
      blue_vertices.push(1);
      blue_vertices.push(1);
    }
    VertexLineBlueBuffer = gl.createBuffer();
    console.log("Create blue buffer");
  gl.bindBuffer(gl.ARRAY_BUFFER, VertexLineBlueBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blue_vertices), gl.STATIC_DRAW);
  VertexLineBlueBuffer.itemSize = 4;
  VertexLineBlueBuffer.numItems = num_vertices;
}

function CreatePointColorBuffer(num_vertices){
  var red_vertices=[];
  var green_vertices=[];
  var blue_vertices=[];

   // for(var i = 0; i < num_vertices; i++){
      red_vertices.push(1); // add [r,g,b,1.0] through reference vbo_colors to each color vbos
      red_vertices.push(0);
      red_vertices.push(0);
      red_vertices.push(1);
   // }
    VertexPointRedBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VertexPointRedBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(red_vertices), gl.STATIC_DRAW);
  VertexPointRedBuffer.itemSize = 4;
  VertexPointRedBuffer.numItems = num_vertices;

   // for(var i = 0; i < num_vertices; i++){
      green_vertices.push(0); // add [r,g,b,1.0] through reference vbo_colors to each color vbos
      green_vertices.push(1);
      green_vertices.push(0);
      green_vertices.push(1);
  //  }
    VertexPointGreenBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VertexPointGreenBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(green_vertices), gl.STATIC_DRAW);
  VertexPointGreenBuffer.itemSize = 4;
  VertexPointGreenBuffer.numItems = num_vertices;

   // for(var i = 0; i < num_vertices; i++){
      blue_vertices.push(0); // add [r,g,b,1.0] through reference vbo_colors to each color vbos
      blue_vertices.push(0);
      blue_vertices.push(1);
      blue_vertices.push(1);
   // }
    VertexPointBlueBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VertexPointBlueBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blue_vertices), gl.STATIC_DRAW);
  VertexPointBlueBuffer.itemSize = 4;
  VertexPointBlueBuffer.numItems = num_vertices;
}

function CreateTriangleColorBuffer(num_vertices){
  var red_vertices=[];
  var green_vertices=[];
  var blue_vertices=[];

    for(var i = 0; i < num_vertices; i++){
      red_vertices.push(1); // add [r,g,b,1.0] through reference vbo_colors to each color vbos
      red_vertices.push(0);
      red_vertices.push(0);
      red_vertices.push(1);
    }
    VertexTriangleRedBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VertexTriangleRedBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(red_vertices), gl.STATIC_DRAW);
  VertexTriangleRedBuffer.itemSize = 4;
  VertexTriangleRedBuffer.numItems = num_vertices;

    for(var i = 0; i < num_vertices; i++){
      green_vertices.push(0); // add [r,g,b,1.0] through reference vbo_colors to each color vbos
      green_vertices.push(1);
      green_vertices.push(0);
      green_vertices.push(1);
    }
    VertexTriangleGreenBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VertexTriangleGreenBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(green_vertices), gl.STATIC_DRAW);
  VertexTriangleGreenBuffer.itemSize = 4;
  VertexTriangleGreenBuffer.numItems = num_vertices;

    for(var i = 0; i < num_vertices; i++){
      blue_vertices.push(0); // add [r,g,b,1.0] through reference vbo_colors to each color vbos
      blue_vertices.push(0);
      blue_vertices.push(1);
      blue_vertices.push(1);
    }
    VertexTriangleBlueBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VertexTriangleBlueBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blue_vertices), gl.STATIC_DRAW);
  VertexTriangleBlueBuffer.itemSize = 4;
  VertexTriangleBlueBuffer.numItems = num_vertices;

}

function CreateSquareColorBuffer(num_vertices){
  var red_vertices=[];
  var green_vertices=[];
  var blue_vertices=[];

  if(color_mode == 'r'){
    for(var i = 0; i < num_vertices; i++){
      red_vertices.push(1); // add [r,g,b,1.0] through reference vbo_colors to each color vbos
      red_vertices.push(0);
      red_vertices.push(0);
      red_vertices.push(1);
    }
    VertexSquareRedBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VertexSquareRedBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(red_vertices), gl.STATIC_DRAW);
  VertexSquareRedBuffer.itemSize = 4;
  VertexSquareRedBuffer.numItems = num_vertices;

    for(var i = 0; i < num_vertices; i++){
      green_vertices.push(0); // add [r,g,b,1.0] through reference vbo_colors to each color vbos
      green_vertices.push(1);
      green_vertices.push(0);
      green_vertices.push(1);
    }
    VertexSquareGreenBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VertexSquareGreenBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(green_vertices), gl.STATIC_DRAW);
  VertexSquareGreenBuffer.itemSize = 4;
  VertexSquareGreenBuffer.numItems = num_vertices;

    for(var i = 0; i < num_vertices; i++){
      blue_vertices.push(0); // add [r,g,b,1.0] through reference vbo_colors to each color vbos
      blue_vertices.push(0);
      blue_vertices.push(1);
      blue_vertices.push(1);
    }
    VertexSquareBlueBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VertexSquareBlueBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blue_vertices), gl.STATIC_DRAW);
  VertexSquareBlueBuffer.itemSize = 4;
  VertexSquareBlueBuffer.numItems = num_vertices;
  }
}

function CreateVlineColorBuffer(num_vertices){
  var red_vertices=[];
  var green_vertices=[];
  var blue_vertices=[];

    for(var i = 0; i < num_vertices; i++){
      red_vertices.push(1); // add [r,g,b,1.0] through reference vbo_colors to each color vbos
      red_vertices.push(0);
      red_vertices.push(0);
      red_vertices.push(1);
    }
    VertexVlineRedBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VertexVlineRedBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(red_vertices), gl.STATIC_DRAW);
  VertexVlineRedBuffer.itemSize = 4;
  VertexVlineRedBuffer.numItems = num_vertices;

    for(var i = 0; i < num_vertices; i++){
      green_vertices.push(0); // add [r,g,b,1.0] through reference vbo_colors to each color vbos
      green_vertices.push(1);
      green_vertices.push(0);
      green_vertices.push(1);
    }
    VertexVlineGreenBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VertexVlineGreenBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(green_vertices), gl.STATIC_DRAW);
  VertexVlineGreenBuffer.itemSize = 4;
  VertexVlineGreenBuffer.numItems = num_vertices;

    for(var i = 0; i < num_vertices; i++){
      blue_vertices.push(0); // add [r,g,b,1.0] through reference vbo_colors to each color vbos
      blue_vertices.push(0);
      blue_vertices.push(1);
      blue_vertices.push(1);
    }
    VertexVlineBlueBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VertexVlineBlueBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blue_vertices), gl.STATIC_DRAW);
  VertexVlineBlueBuffer.itemSize = 4;
  VertexVlineBlueBuffer.numItems = num_vertices;
  
}

//////////////////////////////////////////////////////////////////
///////               Create a Line VBO          /////////////////
function CreateBuffer() {
    var line_vertices = [         // A VBO for horizontal line in a standard position. To be translated to position of mouse click 
             -0.1, 0.0,  0.0,
        0.1, 0.0,  0.0
        ];
    LineVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, LineVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(line_vertices), gl.STATIC_DRAW);
    LineVertexPositionBuffer.itemSize = 3;  // NDC'S [x,y,0] 
    LineVertexPositionBuffer.numItems = 2;// this buffer only contains A line, so only two vertices 
}

function CreateVerticalLineBuffer() {
    var vline_vertices = [         // A VBO for vertical line in a standard position. To be translated to position of mouse click 
             0.0, -0.1,  0.0,
        0.0, 0.1,  0.0
        ];
    VerticalLineVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VerticalLineVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vline_vertices), gl.STATIC_DRAW);
    VerticalLineVertexPositionBuffer.itemSize = 3;  // NDC'S [x,y,0] 
    VerticalLineVertexPositionBuffer.numItems = 2;// this buffer only contains A line, so only two vertices 
}

function CreatePointBuffer(){
  var point_vertex = [0.0, 0.0, 0.0];
  PointVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, PointVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(point_vertex), gl.STATIC_DRAW);
  PointVertexPositionBuffer.itemSize = 3;
  PointVertexPositionBuffer.numItems = 1;
}

function CreateTriangleBuffer(){
  var triangle_vertices = [
              0.0, 0.05, 0.0,
              -0.04, -0.03, 0.0,
              0.04, -0.03, 0.0];
  TriangleVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, TriangleVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertices), gl.STATIC_DRAW);
  TriangleVertexPositionBuffer.itemSize = 3;
  TriangleVertexPositionBuffer.numItems = 3;
}

function CreateSquareBuffer(){
  var square_vertices = [
              0.05, 0.05, 0.0,
              0.05, -0.05, 0.0,
              -0.05, 0.05, 0.0,
              -0.05, -0.05, 0.0];
  SquareVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, SquareVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(square_vertices), gl.STATIC_DRAW);
  SquareVertexPositionBuffer.itemSize = 3;
  SquareVertexPositionBuffer.numItems = 4;
}

///////////////////////////////////////////////////////

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

////////////////////////////////////////////////////////////////////////////////////
//
//   Create transformation matrix for a shape
// 
////////////////////////////////////////////////////////////////////////////////////
function create_matrix(index, global_mode,global_rotation,shapes_tx,shapes_ty,shapes_rotation,shapes_scale){
  var mvMatrix = mat4.create();   // this is the matrix for transforming each shape before draw
  //set into an identity matrix (after create you don't know if there's junk in it)
  // set identity - fresh matrix
  mat4.identity(mvMatrix); 
  if(global_mode[index]){
    for(var j = 0; j < global_rotation[index].length; j++){
      mat4.rotate(mvMatrix,degToRad(global_rotation[index][j]),[0,0,1]);
    }  
    var scale = [1,1,1];
  scale[0] = scale[1] = scale[2] = global_scale;
  // finish consruct matrix here but haven't set it
  mvMatrix = mat4.scale(mvMatrix, scale);
  }
  var trans = [0,0,0];
  trans[0] = shapes_tx[index]; 
  trans[1] = shapes_ty[index];
  trans[2] = 0.0;
  //translate is multiplied to the right side of the mvMatrix 
  mvMatrix = mat4.translate(mvMatrix, trans);  // move from origin to mouse click
  //2d x-y in 3d x-z rotate around z
  // only accept radian, not degree. so we use degToRad
  mvMatrix = mat4.rotate(mvMatrix, degToRad(shapes_rotation[index]), [0, 0, 1]);  // rotate if any 
  var scale = [1,1,1];
  scale[0] = scale[1] = scale[2] = shapes_scale[index];
  // finish consruct matrix here but haven't set it
  mvMatrix = mat4.scale(mvMatrix, scale);  // scale if any 
  //var mvMatrix1 = mat4.inverse(mvMatrix);
  //mvMatrix = mat4.multiply(mvMatrix1,mvMatrix);
  return mvMatrix;
}

////////////////////////////////////////////////////////////////////////////////////
//
//   Draw a shape
// 
////////////////////////////////////////////////////////////////////////////////////
function draw_shapes(VertexPositionBuffer,shape_size,global_mode,global_rotation,shapes_tx,shapes_ty,shapes_rotation,shapes_scale,shapes_colors,VertexRedBuffer,VertexGreenBuffer,VertexBlueBuffer,draw_mode) {   // lab1 sample - draw lines only 
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexPositionBuffer);    // make the line current buffer 
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
// global put the beginning or the end - center of the screen
// every shape has its own trasformation so we use for loop here
    for (var i=0; i<shape_size; i++){  // draw the line vbo buffer multiple times, one with a new transformation specified by mouse click 
  
      var mvMatrix = create_matrix(i, global_mode,global_rotation,shapes_tx,shapes_ty,shapes_rotation,shapes_scale);
      console.log("mvMatrix created: " + mvMatrix);
      // every time before I draw line - can use the method or not
      // set matrix
      // give mbMatrix to the mvMatrixUniform. If we don't do that, your shader (mvMatrixUniform) is not initiated
      gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false,mvMatrix );  // pass the matrix to the vertex shader 
  
      if(shapes_colors[i] == 'r'){
        gl.bindBuffer(gl.ARRAY_BUFFER, VertexRedBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,VertexRedBuffer.itemSize,gl.FLOAT,false,0,0);
      }else if(shapes_colors[i] == 'g'){
        gl.bindBuffer(gl.ARRAY_BUFFER, VertexGreenBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,VertexGreenBuffer.itemSize,gl.FLOAT,false,0,0);
      }else if(shapes_colors[i] == 'b'){
        gl.bindBuffer(gl.ARRAY_BUFFER, VertexBlueBuffer);

        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,VertexBlueBuffer.itemSize,gl.FLOAT,false,0,0);
      }
      //draw every object
      gl.drawArrays(draw_mode, 0, VertexPositionBuffer.numItems);
    }

}
///////////////////////////////////////////////////////////////////////
// this is the function that you create all shape VBOs to be drawn later 
function initScene() {
    vp_minX = 0; vp_maxX = gl.canvasWidth;  vp_width = vp_maxX- vp_minX+1; 
    vp_minY = 0; vp_maxY = gl.canvasHeight; vp_height = vp_maxY-vp_minY+1; 
    console.log(vp_minX, vp_maxX, vp_minY, vp_maxY); 
    gl.viewport(vp_minX, vp_minY, vp_width, vp_height); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    CreateBuffer(); 
    CreatePointBuffer();
    CreateTriangleBuffer();
    CreateSquareBuffer();
    CreateVerticalLineBuffer();
    CreateLineColorBuffer(2);
    CreateTriangleColorBuffer(3);
    CreatePointColorBuffer(1);
    CreateSquareColorBuffer(4);
    CreateVlineColorBuffer(2);
}

///////////////////////////////////////////////////////////////////////

function drawScene() {
    vp_minX = 0; vp_maxX = gl.canvasWidth;  vp_width = vp_maxX- vp_minX+1; 
    vp_minY = 0; vp_maxY = gl.canvasHeight; vp_height = vp_maxY-vp_minY+1; 
    console.log(vp_minX, vp_maxX, vp_minY, vp_maxY); 
    gl.viewport(vp_minX, vp_minY, vp_width, vp_height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    draw_shapes(LineVertexPositionBuffer,shape_size,global_mode,global_rotation,shapes_tx,shapes_ty,shapes_rotation,shapes_scale,line_colors,VertexLineRedBuffer,VertexLineGreenBuffer,VertexLineBlueBuffer,gl.LINES);
    draw_shapes(TriangleVertexPositionBuffer,triangle_size,global_triangle_mode,global_triangle_rotation,triangles_tx,triangles_ty,triangles_rotation,triangles_scale,triangle_colors,VertexTriangleRedBuffer,VertexTriangleGreenBuffer,VertexTriangleBlueBuffer,gl.TRIANGLES);
    draw_shapes(SquareVertexPositionBuffer,square_size,global_square_mode,global_square_rotation,squares_tx,squares_ty,squares_rotation,squares_scale,square_colors,VertexSquareRedBuffer,VertexSquareGreenBuffer,VertexSquareBlueBuffer,gl.TRIANGLE_STRIP);
    draw_shapes(VerticalLineVertexPositionBuffer,vline_size,global_vline_mode,global_vline_rotation,vlines_tx,vlines_ty,vlines_rotation,vlines_scale,vline_colors,VertexVlineRedBuffer,VertexVlineGreenBuffer,VertexVlineBlueBuffer,gl.LINES);
    draw_shapes(PointVertexPositionBuffer,point_size,global_point_mode,global_point_rotation,points_tx,points_ty,points_rotation,points_scale,point_colors,VertexPointRedBuffer,VertexPointGreenBuffer,VertexPointBlueBuffer,gl.POINTS);

    }

////////////////////////////////////////////////////////////////////////////////////
//
//   Select the shape already been drawn based on mouse click
// 
////////////////////////////////////////////////////////////////////////////////////
function select_shape(min_distance,NDC_X,NDC_Y,shape_size, global_mode,global_rotation,shapes_tx,shapes_ty,shapes_rotation,shapes_scale,mode){
  for(var i = 0; i < shape_size; i++){
        var mvMatrix = create_matrix(i, global_mode,global_rotation,shapes_tx,shapes_ty,shapes_rotation,shapes_scale);
        console.log("mvMatrix created in select: " + mvMatrix);
        mvMatrix = mat4.inverse(mvMatrix);
        console.log("mvMatrix inversed:" + mvMatrix);
        var click = vec3.create([NDC_X,NDC_Y,0.0]);
        var reverse_pos = mat4.multiplyVec3(mvMatrix,click);
        console.log(reverse_pos);
        var temp_distance = Math.pow(0-reverse_pos[0],2)+Math.pow(0-reverse_pos[1],2);

        if(temp_distance < min_distance){
          min_distance = temp_distance;
          min_mode = mode;
          min_index = i;
        } 
        
  }
  console.log("min_index " +min_index);
  return min_distance;
}

function clearScreen(){ // init the scene and set all the according variables to the state before the program start 
  initScene();
  shape_size = 0;     // shape size counter 
  triangle_size = 0;
  square_size = 0;
  point_size = 0;
  vline_size = 0;

  colors = [];   // I am not doing colors, but you should :-) 
  shapes = [];   // the array to store what shapes are in the list

// store colors for different shapes
  line_colors=[];
  triangle_colors=[];
  square_colors=[];
  point_colors=[];
  vline_colors=[];

//transformations for lines
  shapes_tx=[];   // x translation  
  shapes_ty=[];   // y translation 
  shapes_rotation=[];  // rotation angle 
  shapes_scale=[];   // scaling factor (uniform is assumed)  

// transformations for triangles
  triangles_tx = [];
  triangles_ty = [];
  triangles_rotation = [];
  triangles_scale = [];

// transformations for points
  points_tx = [];
  points_ty = [];
  points_rotation =[];
  points_scale =[];

// transformations for square
  squares_tx = [];
  squares_ty = [];
  squares_rotation = [];
  squares_scale = [];

// transformations for vertical lines
  vlines_tx = [];
  vlines_ty = [];
  vlines_rotation = [];
  vlines_scale =[];

// global rotation for lines
  global_rotation=[];
  global_mode = [];
  global_key = false;

// global rotation for triangles
  global_triangle_mode=[];
  global_triangle_rotation =[];

// global rotation for squares
  global_square_mode=[];
  global_square_rotation =[];

// global rotation for squares
  global_point_mode=[];
  global_point_rotation =[];

// global rotation for vertical lines
  global_vline_mode=[];
  global_vline_rotation=[];

  polygon_mode = 'h';  //default = h line 
  color_mode  = 'r';

  select_mode = false;
  min_mode;
  min_index;

  global_scale = 1;
  CreateBuffer(); 
    CreatePointBuffer();
    CreateTriangleBuffer();
    CreateSquareBuffer();
    CreateVerticalLineBuffer();
    CreateLineColorBuffer(2);
    CreateTriangleColorBuffer(3);
    CreatePointColorBuffer(1);
    CreateSquareColorBuffer(4);
    CreateVlineColorBuffer(2);
}

function redisplayScreen(){ //redraw
  drawScene();
}

////////////////////////////////////////////////////////////////////////////////////
//
//   rotate globally
// 
////////////////////////////////////////////////////////////////////////////////////
function global_rotate(shape_size,global_mode,Z_angle,global_rotation){
  for(var i = 0; i < shape_size; i++){ // if this line need to be rotated globally
    if(global_mode[i] == true){
      var rotation_line = global_rotation[i];
      rotation_line.push(Z_angle);
      global_rotation[i] = rotation_line;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////
//
//   Set color after selecting a shape
// 
////////////////////////////////////////////////////////////////////////////////////
function set_color(color_mode){
  if(min_mode == 'h'){
      line_colors[min_index]=color_mode;
  }else if(min_mode == 'v'){
      vline_colors[min_index]=color_mode;
  }else if(min_mode == 't'){
      triangle_colors[min_index]=color_mode;
  }else if(min_mode == 'q'){
      square_colors[min_index]=color_mode;
  }else if(min_mode == 'p'){
      point_colors[min_index]=color_mode;
  }
}

////////////////////////////////////////////////////////////////////////////////////
//
//   Scaling the last shape you drew
// 
////////////////////////////////////////////////////////////////////////////////////
function set_scaling(scaling_coef){
  if(shapes[shapes.length-1] == 'h'){
    shapes_scale[shape_size-1]*=scaling_coef;            
  }
  else if(shapes[shapes.length-1] == 'v'){
    vlines_scale[vline_size-1]*=scaling_coef;
  }else if(shapes[shapes.length-1] == 't'){
    triangles_scale[triangle_size-1]*=scaling_coef;
  }else if(shapes[shapes.length-1] == 'q'){
    squares_scale[square_size-1]*=scaling_coef;
  }else if(shapes[shapes.length-1] == 'p'){
    // point doesn't has such effect
  }
}

////////////////////////////////////////////////////////////////////////////////////
//
//   Scaling after selecting a shape
// 
////////////////////////////////////////////////////////////////////////////////////
function select_scaling(scaling_coef){
  if(min_mode == 'h'){
    shapes_scale[min_index]*=scaling_coef;
  }else if(min_mode == 'v'){
    vlines_scale[min_index]*=scaling_coef;
  }else if(min_mode == 't'){
    triangles_scale[min_index]*=scaling_coef;
  }else if(min_mode == 'q'){
    squares_scale[min_index]*=scaling_coef;
  }else if(min_mode == 'p'){
    //do nothing
  } 
}

////////////////////////////////////////////////////////////////////////////////////
//
//   Set the shape under the global mode
// 
////////////////////////////////////////////////////////////////////////////////////
function set_global_mode(){
  for(var i = 0; i < shape_size; i++){
    global_mode[i] = true;  
  }
  for(var i = 0; i < triangle_size; i++){
    global_triangle_mode[i] = true;  
  }
  for(var i = 0; i < square_size; i++){
    global_square_mode[i] = true;  
  }
  for(var i = 0; i < point_size; i++){
    global_point_mode[i] = true;  
  }
  for(var i = 0; i < vline_size; i++){
    global_vline_mode[i] = true;  
  }
}

///////////////////////////////////////////////////////////////
//   Below are mouse and key event handlers 
//

var Z_angle = 0.0;
var lastMouseX = 0, lastMouseY = 0;

///////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////
//
//   Mouse button handlers
// 
////////////////////////////////////////////////////////////////////////////////////
function onDocumentMouseDown( event ) {
         event.preventDefault();
         document.addEventListener( 'mousemove', onDocumentMouseMove, false );
         document.addEventListener( 'mouseup', onDocumentMouseUp, false );
         document.addEventListener( 'mouseout', onDocumentMouseOut, false );

   var mouseX = event.clientX;
         var mouseY = event.ClientY; 
         lastMouseX = mouseX;
         lastMouseY = mouseY;
   
   
   var NDC_X = (event.clientX - vp_minX)/vp_width*2 -1; 
   var NDC_Y = ((vp_height-event.clientY) - vp_minY)/vp_height*2 - 1 ;
   console.log("NDC click", event.clientX, event.clientY, NDC_X, NDC_Y);

   shapes.push(polygon_mode);
   colors.push(color_mode);
   
   
   
   if(select_mode){
    console.log("NDC click in", event.clientX, event.clientY, NDC_X, NDC_Y);
      var min_distance = Infinity;
      min_distance = select_shape(min_distance,NDC_X,NDC_Y,shape_size, global_mode,global_rotation,shapes_tx,shapes_ty,shapes_rotation,shapes_scale,'h');
      min_distance = select_shape(min_distance,NDC_X,NDC_Y,triangle_size, global_triangle_mode,global_triangle_rotation,triangles_tx,triangles_ty,triangles_rotation,triangles_scale,'t');
      min_distance = select_shape(min_distance,NDC_X,NDC_Y,square_size, global_square_mode,global_square_rotation,squares_tx,squares_ty,squares_rotation,squares_scale,'q');
      min_distance = select_shape(min_distance,NDC_X,NDC_Y,vline_size, global_vline_mode,global_vline_rotation,vlines_tx,vlines_ty,vlines_rotation,vlines_scale,'v');
      min_distance = select_shape(min_distance,NDC_X,NDC_Y,point_size, global_point_mode,global_point_rotation,points_tx,points_ty,points_rotation,points_scale,'p');
      console.log(min_mode);

   }
   Z_angle = 0.0;
   if(!select_mode && !global_key){
    if(polygon_mode == 'h'){
      shape_size++;
      // if the W has been pressed - in the global rotation mode
      if(!global_key){
       // the line being added when is not the global rotation mode
        global_mode[shape_size] = false;
        if(!select_mode){
          line_colors.push(color_mode);
          shapes_tx.push(NDC_X); shapes_ty.push(NDC_Y); shapes_rotation.push(0.0); shapes_scale.push(1.0);
        }
      }
      //create a global rotation series for each of the line
      var rotation = [];
      global_rotation.push(rotation);
     
      
   }else if(polygon_mode == 'v'){
    vline_size++;
    if(!global_key){
      global_mode[vline_size] = false;
      if(!select_mode){
        vline_colors.push(color_mode);
         vlines_tx.push(NDC_X); vlines_ty.push(NDC_Y); vlines_rotation.push(0.0); vlines_scale.push(1.0);
      }
    }
    var rotation = [];
    global_vline_rotation.push(rotation);
     
   }
   else if(polygon_mode == 't'){
    triangle_size++;

    if(!global_key){
      global_triangle_mode[triangle_size] = false; 
      if(!select_mode){
        triangle_colors.push(color_mode);
        triangles_tx.push(NDC_X); triangles_ty.push(NDC_Y); triangles_rotation.push(0.0); triangles_scale.push(1.0); 
      }    
    }
    var rotation = [];
    global_triangle_rotation.push(rotation);

    
   
   }else if(polygon_mode == 'q'){
    square_size++;

    if(!global_key){
      global_square_mode[square_size] = false; 
      if(!select_mode){
        square_colors.push(color_mode);
        squares_tx.push(NDC_X); squares_ty.push(NDC_Y); squares_rotation.push(0.0); squares_scale.push(1.0);   
      }  
    }
    var rotation = [];
    global_square_rotation.push(rotation);

    
    
   }else if(polygon_mode == 'p'){
    point_size++;
    if(!global_key){
      global_point_mode[point_size] = false;
      if(!select_mode){
        point_colors.push(color_mode);
        points_tx.push(NDC_X); points_ty.push(NDC_Y); points_rotation.push(0.0); points_scale.push(1.0);  
      }
    }
    var rotation = [];
    global_point_rotation.push(rotation);
   }
   console.log("shape = ", polygon_mode);
   console.log("color = ", color_mode);
   }
   
   drawScene();  // draw the VBO 
}

     function onDocumentMouseMove( event ) {  //update the rotation angle 
	       var mouseX = event.clientX;
         var mouseY = event.ClientY; 

         var diffX = mouseX - lastMouseX;
         var diffY = mouseY - lastMouseY;

         Z_angle = Z_angle + diffX/5;
	 
         lastMouseX = mouseX;
         lastMouseY = mouseY;
         if(select_mode){
          if(min_mode == 'h'){
            shapes_rotation[min_index] = Z_angle;   // update the rotation angle 
          }else if(min_mode == 'v'){
            vlines_rotation[min_index] = Z_angle;
          }else if(min_mode == 't'){
            triangles_rotation[min_index] = Z_angle;
          }else if(min_mode == 'q'){
            squares_rotation[min_index] = Z_angle;
          }else if(min_mode == 'p'){
            //points rotation has no effect
          }
         }else{
          if(global_key){ // only do global rotation under the global rotation mode
            global_rotate(shape_size,global_mode,Z_angle,global_rotation);
            global_rotate(triangle_size,global_triangle_mode,Z_angle,global_triangle_rotation);
            global_rotate(square_size,global_square_mode,Z_angle,global_square_rotation);
            global_rotate(point_size,global_point_mode,Z_angle,global_point_rotation);
            global_rotate(vline_size,global_vline_mode,Z_angle,global_vline_rotation);
          }else{
            if(polygon_mode == 'h'){
              shapes_rotation[shape_size-1] = Z_angle;   // update the rotation angle 
            }else if(polygon_mode == 't'){
              triangles_rotation[triangle_size-1] = Z_angle;
            }else if(polygon_mode == 'q'){
              squares_rotation[square_size-1] = Z_angle;
            }else if(polygon_mode == 'p'){
            // point does not has the rotation behavior
            }else if(polygon_mode == 'v'){
              vlines_rotation[vline_size-1] = Z_angle;
            }
         }  
        }
        drawScene();	 // draw the VBO 
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


/////////////////////////////////////////////////////////////////////////////////
//
//  key stroke handler 
//
//////////////////////////////////////////////////////////////////////////////////
    function onKeyDown(event) {
      var caps_lock_on = event.getModifierState('CapsLock');
      console.log(event.keyCode);
      switch(event.keyCode)  {
         case 67:
              clearScreen();
              break;
         case 68:
              redisplayScreen();
         case 72:
		          polygon_mode = 'h';
          break;
         case 86:
		          polygon_mode = 'v';			  	  
          break;
         case 82:
              if(select_mode){
                set_color('r');
              }else{
                color_mode = 'r';
              }
          break;
         case 71:
              if(select_mode){
                set_color('g');
              }else{
                color_mode = 'g';
              }
          break;
         case 66:
              if(select_mode){
                set_color('b');
              }else{
                color_mode = 'b';
              }
          break;
          case 83:
              if(!global_key && !select_mode){
                if(caps_lock_on){
                  if (event.shiftKey) {
                    set_scaling(0.9);
                 }else{
                    set_scaling(1.1);
                  }
              }else{
                if (event.shiftKey) {
                    set_scaling(1.1);
                  }else{
                    set_scaling(0.9);
                  }
              }
              }
              
              
              if(global_key){
                if(caps_lock_on){
                  if (event.shiftKey) {
                    global_scale *= 0.9;   
                  }
                  else {
                    global_scale *= 1.1;
                                   
                  }
                
                }else{
                  if (event.shiftKey) {
                    global_scale *= 1.1;          
                  }
                  else {
                    global_scale *= 0.9;                    
                  }
                }
              }
              if(select_mode){
                if(caps_lock_on){
                  if (event.shiftKey) {
                    select_scaling(0.9);            
                  }
                  else {
                    select_scaling(1.1);               
                  }
                }else{
                  if (event.shiftKey) {
                    select_scaling(1.1);          
                  }
                  else {
                    select_scaling(0.9);                
                  }
                }
                
              }     
          break;
          case 84:
              polygon_mode = 't';
              break;  
          case 81:
              polygon_mode = 'q';
              break;
          case 87:
              if(caps_lock_on){
                if (event.shiftKey) {
                  global_key = false;          
              }
              else {
                set_global_mode();
                 global_key = true;         
              }
              }else{
                if (event.shiftKey) {
                  set_global_mode();
                 global_key = true;
                            
              }
              else {
                global_key = false;         
              }
              }
              
              break; 
          case 80:
              polygon_mode = 'p';
              break; 
          case 65:
              if(caps_lock_on){
                if (event.shiftKey) {
                  select_mode = false;            
              }
              else {
                select_mode = true;          
              }
              }else{
                if (event.shiftKey) {
                  select_mode = true;            
              }
              else {
                select_mode = false;          
              }
              }
              
              break; 	  
      }
	console.log('polygon mode =', polygon_mode);
	console.log('color mode =', color_mode);

	drawScene();	 // draw the VBO 
    }

