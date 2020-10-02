
//////////////////////////////////////////////////////////////////
//
//  This example is similar to code03.html, but I am showing you how to
//  use gl elemenntary array, i.e, triangle indices, to draw faces 
//

var gl;
var shaderProgram;
var Mstack = [];


  // set up the parameters for lighting 
  var light_ambient = [1,1,1,1]; 
  var light_diffuse = [.8,.8,.8,1];
  var light_specular = [1,1,1,1]; 
  var light_pos = [0,0,0,-10];   // world space position 

  var mat_ambient = [0.2, 0, 0.5, 1]; 
  var mat_diffuse= [1, 1, 0, 1]; 
  var mat_specular = [.9, .9, .9,1]; 
  var mat_shine = [50]; 
  var camera_pos = [0,0,5];

//////////// Init OpenGL Context etc. ///////////////

    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!gl) {
            alert("Error in initialise WebGL");
        }
    }

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

  var squareVertexPositionBuffer;
    var squareVertexNormalBuffer;
    var squareVertexColorBuffer;
    var squareVertexIndexBuffer;


   ////////////////    Initialize VBO  ////////////////////////

    function initBuffers(size) {

        squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        //stor vertex positions and their connectivity separately
        // vertex positions
        var vertices = [
             size, size, size,  -size, size, size,  -size,-size, size,   size,-size, size,
          size, size, size,   size,-size, size,   size,-size,-size,   size, size,-size,
          size, size, size,   size, size,-size,  -size, size,-size,  -size, size, size,
         -size, size, size,  -size, size,-size,  -size,-size,-size,  -size,-size, size,
         -size,-size,-size,   size,-size,-size,   size,-size, size,  -size,-size, size,
          size,-size,-size,  -size,-size,-size,  -size, size,-size,   size, size,-size      
      
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer.itemSize = 3;
        squareVertexPositionBuffer.numItems = 24;

        var sqnormals = [
          0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
          1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,
          0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
         -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,
          0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,
          0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0
        ];

        squareVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqnormals), gl.STATIC_DRAW);
        squareVertexNormalBuffer.itemSize = 3;
        squareVertexNormalBuffer.numItems = 24;

        var indices = [
        0, 1, 2,   0, 2, 3,
        4, 5, 6,   4, 6, 7,
        8, 9,10,   8,10,11,
        12,13,14,  12,14,15,
        16,17,18,  16,18,19,
        20,21,22,  20,22,23
        ];
  squareVertexIndexBuffer = gl.createBuffer();  
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer); 
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);  
        squareVertexIndexBuffer.itemsize = 1;
        squareVertexIndexBuffer.numItems = 36;  

        squareVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
        var colors = [
            1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1,  1, 0, 1, 1,
          1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,  1, 1, 0, 1,
          1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,  1, 0, 0, 1,
          0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,  0, 1, 0, 1,
          0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1,  0, 1, 1, 1,
          0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,  0, 0, 1, 1    
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        squareVertexColorBuffer.itemSize = 4;
        squareVertexColorBuffer.numItems = 24;

    }

var cyverts = [];
var cycolors = []; 
var cyindicies = [];
var cynormals = [];

var spverts = [];
var spcolors = []; 
var spindicies = [];
var spnormals = [];

function InitCylinder(nslices, nstacks, radius, height) 
{
  var nvertices = nslices * nstacks;
    
  var Dangle = 2*Math.PI/(nslices-1); 

  for (j =0; j<nstacks; j++)
    for (i=0; i<nslices; i++) {
      var idx = j*nslices + i; // mesh[j][i] 
      var angle = Dangle * i; 
      //radius divide by 3 - decrease radius
      cyverts.push(Math.cos(angle)*radius); 
      cyverts.push(Math.sin(angle)*radius); 
      //height - multiply 3.0
      //position - substract 1.5
      cyverts.push(j*height/(nstacks-1)-1.5);

      cynormals.push(Math.cos(angle)); 
      cynormals.push(Math.sin(angle));
      cynormals.push(0.0);

      // every vertex needs color
      cycolors.push(Math.cos(angle)/3); 
      cycolors.push(Math.sin(angle)/3); 
      cycolors.push(j*1.0/(nstacks-1)); 
      cycolors.push(1.0); 
    }
  // now create the index array 
  for (j =0; j<nstacks-1; j++)
    for (i=0; i<=nslices; i++) {
      var mi = i % nslices;
      var mi2 = (i+1) % nslices;
      var idx = (j+1) * nslices + mi; 
      var idx2 = j*nslices + mi; // mesh[j][mi] 
      var idx3 = (j) * nslices + mi2;
      var idx4 = (j+1) * nslices + mi;
      var idx5 = (j) * nslices + mi2;
      var idx6 = (j+1) * nslices + mi2;
  
      cyindicies.push(idx); 
      cyindicies.push(idx2);
      cyindicies.push(idx3); 
      cyindicies.push(idx4);
      cyindicies.push(idx5); 
      cyindicies.push(idx6);
    }
}

function InitSphere(nslices, nstacks,  radius) 
{
  var nvertices = nslices * nstacks;
    
  var Dangle_i = 2*Math.PI/(nslices-1); 
  var Dangle_j = 2*Math.PI/(nstacks-1);

  for (j =0; j<nstacks; j++){
    var angle_j = Dangle_j*j;
    var sin_j = Math.sin(angle_j);
    var cos_j = Math.cos(angle_j);
    for (i=0; i<nslices; i++) {
      var idx = j*nslices + i; // mesh[j][i] 
      var angle_i = Dangle_i*i; 
      var sin_i = Math.sin(angle_i);
      var cos_i = Math.cos(angle_i);
      //radius divide by 3 - decrease radius
      spverts.push(sin_i*sin_j*radius); //x
      spverts.push(cos_j*radius); //y
      //height - multiply 3.0
      //position - substract 1.5
      spverts.push(cos_i*sin_j*radius);//z

      spnormals.push(sin_i*sin_j); 
      spnormals.push(cos_j);
      spnormals.push(cos_i*sin_j);

      // every vertex needs color
      spcolors.push(sin_i*sin_j/3); 
      spcolors.push(cos_j/3); 
      spcolors.push(cos_i*sin_j/3); 
      spcolors.push(1.0); 
    }
  }
  // now create the index array 
  for (j =0; j<nstacks-1; j++){
    for (i=0; i<=nslices; i++) {
      var mi = i % nslices;
      var mi2 = (i+1) % nslices;
      var idx = (j+1) * nslices + mi; 
      var idx2 = j*nslices + mi; // mesh[j][mi] 
      var idx3 = (j) * nslices + mi2;
      var idx4 = (j+1) * nslices + mi;
      var idx5 = (j) * nslices + mi2;
      var idx6 = (j+1) * nslices + mi2;
  
      spindicies.push(idx); 
      spindicies.push(idx2);
      spindicies.push(idx3); 
      spindicies.push(idx4);
      spindicies.push(idx5); 
      spindicies.push(idx6);
    }
  }
}

var cylinderVertexPositionBuffer;
var cylinderVertexNormalBuffer;
var cylinderVertexColorBuffer;
var cylinderVertexIndexBuffer;

var shpereVertexPositionBuffer;
var shpereVertexNormalBuffer;
var shpereVertexColorBuffer;
var shpereVertexIndexBuffer; 

    function initCylinderBuffers(radius,height){
      var nslices = 30;
        var nstacks = 10; 
        InitCylinder(nslices,nstacks,radius,height);
    
        cylinderVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cyverts), gl.STATIC_DRAW);
        cylinderVertexPositionBuffer.itemSize = 3;
        cylinderVertexPositionBuffer.numItems = nslices * nstacks; 

         cylinderVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cynormals), gl.STATIC_DRAW);
        cylinderVertexNormalBuffer.itemSize = 3;
        cylinderVertexNormalBuffer.numItems = nslices * nstacks;  

       cylinderVertexIndexBuffer = gl.createBuffer(); 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinderVertexIndexBuffer); 
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cyindicies), gl.STATIC_DRAW);  
        cylinderVertexIndexBuffer.itemsize = 1;
        cylinderVertexIndexBuffer.numItems = (nstacks-1)*6*(nslices+1);

        cylinderVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cycolors), gl.STATIC_DRAW);
        cylinderVertexColorBuffer.itemSize = 4;
        cylinderVertexColorBuffer.numItems = nslices * nstacks;
    }

    function initSphereBuffers(radius){
        var nslices = 20;
        var nstacks = 20; 
        InitSphere(nslices,nstacks,radius);
    
        sphereVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(spverts), gl.STATIC_DRAW);
        sphereVertexPositionBuffer.itemSize = 3;
        sphereVertexPositionBuffer.numItems = nslices * nstacks; 

        sphereVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(spnormals), gl.STATIC_DRAW);
        sphereVertexNormalBuffer.itemSize = 3;
        sphereVertexNormalBuffer.numItems = nslices * nstacks;  

        sphereVertexIndexBuffer = gl.createBuffer(); 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer); 
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(spindicies), gl.STATIC_DRAW);  
        sphereVertexIndexBuffer.itemsize = 1;
        sphereVertexIndexBuffer.numItems = (nstacks-1)*6*(nslices+1);

        sphereVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(spcolors), gl.STATIC_DRAW);
        sphereVertexColorBuffer.itemSize = 4;
        sphereVertexColorBuffer.numItems = nslices * nstacks;
    }


////////////////    Initialize JSON geometry file ///////////
var json;
var houseVertexPositionBuffers =[];
var houseVertexNormalBuffers = [];
var houseVertexIndexBuffers = [];
var houseVertexColorBuffers = [];
function initJSON()
{
    var request = new  XMLHttpRequest();
    request.open("GET", "model.json");    
    request.onreadystatechange =
      function () {
        if (request.readyState == 4) {
        json = JSON.parse(request.responseText);
          //create all VBOs (buffer)
          for (var i = 0; i < json.meshes.length; i++){
            houseVertexPositionBuffers.push(gl.createBuffer());
            houseVertexNormalBuffers.push(gl.createBuffer());
            houseVertexIndexBuffers.push(gl.createBuffer());
            buffff = gl.createBuffer();
            handleLoadedHouse(json.meshes[i],houseVertexPositionBuffers[i],houseVertexNormalBuffers[i],houseVertexIndexBuffers[i]);
            houseVertexColorBuffers.push(houseVertexNormalBuffers[i]);
          }  
          //draw - draw each face separately
         drawScene();            
        }
      }
      request.overrideMimeType("application/json");
     request.send();
}

//be used to create VBOs (buffer)
function handleLoadedHouse(data,positionBuffer,normalBuffer,indexBuffer)
{
    console.log(" in hand LoadedTeapot"); 
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data.vertexPositions),gl.STATIC_DRAW);
    positionBuffer.itemSize=3;
    positionBuffer.numItems=data.vertexPositions.length/3; 
    
    gl.bindBuffer(gl.ARRAY_BUFFER,  normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertexNormals), gl.STATIC_DRAW);
    normalBuffer.itemSize=3;
    normalBuffer.numItems= data.vertexNormals.length/3;

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(data.indices), gl.STATIC_DRAW);
    indexBuffer.itemSize=1;
    indexBuffer.numItems=data.indices.length;     
}

// pass a translation matrix and a rotation angle
    function createModelMatrix(trans,angle,rot_axis,scale_axis,scale_val){
      var matrix = mat4.create();
      mat4.identity(matrix); 
        matrix = mat4.translate(matrix,trans);
        matrix = mat4.rotate(matrix, degToRad(angle), rot_axis); 
        var scale = [1,1,1];
        if(scale_axis == 'x'){
          scale[0] = scale_val;
        }else if(scale_axis == 'y'){
          scale[1] = scale_val;
        }else if(scale_axis == 'z'){
          scale[2] = scale_val;
        }else if(scale_axis == "xyz"){
          scale[0] = scale[1] = scale[2] = scale_val;
        }
        matrix = mat4.scale(matrix, scale);  // scale if any 
        
        return matrix;
    }

function initScene(){
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    initBuffers(0.5); 
    initCylinderBuffers(1/6,1.0);
    initSphereBuffers(1/6);
    initJSON();
}

function draw_faces(matrix){
  for(var i = 0; i<houseVertexPositionBuffers.length;i++){
    gl.bindBuffer(gl.ARRAY_BUFFER, houseVertexPositionBuffers[i]);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, houseVertexPositionBuffers[i].itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, houseVertexNormalBuffers[i]);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, houseVertexNormalBuffers[i].itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, houseVertexColorBuffers[i]);  
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,houseVertexColorBuffers[i].itemSize, gl.FLOAT, false, 0, 0);
  

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, houseVertexIndexBuffers[i]);  

    setMatrixUniforms(matrix);   // pass the modelview mattrix and projection matrix to the shader 

   gl.drawElements(gl.TRIANGLES, houseVertexIndexBuffers[i].numItems, gl.UNSIGNED_SHORT, 0);
  }
}

function drawShape(matrix,VertexPositionBuffer,VertexNormalBuffer, VertexColorBuffer,VertexIndexBuffer){
      mat4.identity(nMatrix); 
      nMatrix = mat4.multiply(nMatrix, vMatrix);
      nMatrix = mat4.multiply(nMatrix, matrix);  
      nMatrix = mat4.inverse(nMatrix);
      nMatrix = mat4.transpose(nMatrix); 

      gl.bindBuffer(gl.ARRAY_BUFFER, VertexPositionBuffer);
      gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, VertexNormalBuffer);
      gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, VertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);


  // draw elementary arrays - triangle indices 
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, VertexIndexBuffer); 

        //send two matrix mvmatrix and pmatrix
      setMatrixUniforms(matrix);   // pass the modelview mattrix and projection matrix to the shader 
       gl.drawElements(gl.TRIANGLES, VertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0); 
    }

// pass a base matrix of limb
    function drawlimb(matrix){
      //calculate the model matrix for limb
      var mMatrix_limb =mat4.create(matrix);
      var trans = [0,0,0];
       var mMatrix1 = createModelMatrix(trans,90,[0, 1, 0],null,null);
       mMatrix_limb = mat4.multiply(mMatrix_limb,mMatrix1);
        drawShape(mMatrix_limb,cylinderVertexPositionBuffer,cylinderVertexNormalBuffer,cylinderVertexColorBuffer,cylinderVertexIndexBuffer);

        trans = [0,0,0];
        trans[0] = 0;
        trans[1] = 0;
        trans[2] = -1.5;
        var mMatrix_hand = createModelMatrix(trans,0,[1, 0, 0],null,null);
       mMatrix_limb = mat4.multiply(mMatrix_limb,mMatrix_hand);
       // pass the model matrix to draw shape
        drawShape(mMatrix_limb,sphereVertexPositionBuffer,sphereVertexNormalBuffer,sphereVertexColorBuffer,sphereVertexIndexBuffer);
    }

//pass a base matrix of robot
    function drawRobot(matrix_bot){
        //console.log(trans_mat_bot);     
        var mMatrix_bot =mat4.create(matrix_bot);
        Mstack.push(mMatrix_bot);
        //body
        drawShape(mMatrix_bot,squareVertexPositionBuffer,squareVertexNormalBuffer,squareVertexColorBuffer,squareVertexIndexBuffer);

      //left arm
       drawlimb(mMatrix_bot);

      //base matrix
      var model_Matrix = Mstack.pop();

       //right arm
       mMatrix_bot= mat4.create(model_Matrix);
       mMatrix_bot = mat4.rotate(mMatrix_bot,degToRad(180),[0,1,0]);
       drawlimb(mMatrix_bot);
       
      //left leg
      mMatrix_bot = mat4.create(model_Matrix);
       mMatrix_bot = mat4.rotate(mMatrix_bot,degToRad(70),[0,0,1]);
       drawlimb(mMatrix_bot);

       //right leg
       mMatrix_bot = mat4.create(model_Matrix);
       mMatrix_bot = mat4.rotate(mMatrix_bot,degToRad(110),[0,0,1]);

       drawlimb(mMatrix_bot);

       //head
        trans = [0,0,0];
        trans[0] = 0;
        trans[1] =0.7;
        trans[2] = 0;
        mMatrix_bot = mat4.create(model_Matrix);
        var mMatrix_head = createModelMatrix(trans,0,[1, 0, 0],"xyz",1.5);
       mMatrix_bot = mat4.multiply(mMatrix_bot,mMatrix_head);
        drawShape(mMatrix_bot,sphereVertexPositionBuffer,sphereVertexNormalBuffer,sphereVertexColorBuffer,sphereVertexIndexBuffer);
    }


    function drawThreeRobot(base_matrix){
        var model_middle = mat4.scale(mat4.create(base_matrix), [0.4,0.4,0.4]);
        //for base cube
        drawRobot(model_middle);
        var model_left = createModelMatrix([-1.33,0,0],0,[1,0,0],'xyz',0.4);
        model_left = mat4.multiply(mat4.create(base_matrix),model_left);
         drawRobot(model_left);
         var model_right = createModelMatrix([1.33,0,0],0,[1,0,0],'xyz',0.4);
        model_right = mat4.multiply(mat4.create(base_matrix),model_right);
         drawRobot(model_right);
    }


///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

    
    var vMatrix = mat4.create(); // view matrix
    var pMatrix = mat4.create();  //projection matrix
    var nMatrix = mat4.create();  // normal matrix


    function transformation_house(matrix){
      var matrix1 = mat4.create(matrix);
      matrix1 =mat4.translate(matrix1,[0.8,-0.6,0]); 
      matrix1 = mat4.scale(matrix1, [1/15, 1/15, 1/15]);
      matrix1 = mat4.rotate(matrix1, degToRad(90), [0, 1, 0]);
      matrix1 = mat4.rotate(matrix1, degToRad(-90), [1, 0, 0]);
     
      

      mat4.identity(nMatrix); 
      nMatrix = mat4.multiply(nMatrix, vMatrix);
      nMatrix = mat4.multiply(nMatrix, matrix1);  
      nMatrix = mat4.inverse(nMatrix);
      nMatrix = mat4.transpose(nMatrix); 
      return matrix1;
    }

    function transformation_men(){
      var matrix1 = mat4.create();
      mat4.identity(matrix1);
      matrix1 =mat4.translate(matrix1,[-1.2,-0.5,0]); 
      return matrix1;
    }

    function transformation_sphere(){
      var matrix1 = mat4.create();
      mat4.identity(matrix1);
      matrix1 = mat4.translate(matrix1,[-0.5,0.5,0]);
      return matrix1;
    }

    function setMatrixUniforms(matrix) {
        gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, matrix);
        gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);		
    }

    function setLightingUniforms(){
      gl.uniform3f(shaderProgram.camera_posUniform,camera_pos[0],camera_pos[1],camera_pos[2]);
      gl.uniform4f(shaderProgram.light_posUniform,light_pos[0], light_pos[1], light_pos[2], light_pos[3]);  
      gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0); 
      gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0); 
      gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2],1.0); 
      gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]); 

      gl.uniform4f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2], 1.0); 
      gl.uniform4f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2], 1.0); 
      gl.uniform4f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2],1.0); 
    }

     function degToRad(degrees) {
        return degrees * Math.PI / 180;
     }
    var Z_angle_pitch = 0.0;
    var Z_angle_yaw = 0.0;
    var Z_angle_roll = 0.0;
    var rotation_mode = 'yaw';
    var view_rotation = mat4.create();
    var which_object = 1;
    mat4.identity(view_rotation);

    var move_matrix = mat4.create();
    mat4.identity(move_matrix);

     function projection(){
      mat4.perspective(60, 1.0, 0.1, 100, pMatrix);  // set up the projection matrix 
      //pMatrix = 
    }
    function view(){
       vMatrix = mat4.identity(vMatrix);
        vMatrix = mat4.multiply(vMatrix,view_rotation);
        var vMatrix_look = mat4.create();
        vMatrix_look = mat4.lookAt(camera_pos, [0,0,0], [0,1,0], vMatrix_look);  // set up the view matrix, multiply into the modelview matrix
        vMatrix = mat4.multiply(vMatrix,vMatrix_look);
      
    }

///////////////////////////////////////////////////////////////
    var model_move = mat4.create();
    var model3_move = mat4.create();
    var model2_move = mat4.create();

    mat4.identity(model_move);
    mat4.identity(model3_move);
    mat4.identity(model2_move);
    function drawScene() {
      gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      projection();
      view();
      var mMatrix = mat4.create();  // model matrix
      mat4.identity(mMatrix);
  
      mMatrix = mat4.multiply(mMatrix,model_move);
      Mstack.push(mMatrix);  
      var model = transformation_house(mMatrix);
      
    	setLightingUniforms();
      
  		draw_faces(model);
      var model1 = Mstack.pop();
      var model2 = transformation_men();
      model2 = mat4.multiply(model2,model1);
      model2 = mat4.multiply(model2,model2_move); 
       model2 = mat4.scale(model2, [1/4, 1/4, 1/4]);
      drawThreeRobot(model2);
      
      var model3 = transformation_sphere();

      model3 = mat4.multiply(model3,model2);
      model3 = mat4.scale(model3, [4, 4, 4]);
      model3 = mat4.multiply(model3,model3_move);
      
      drawShape(model3,sphereVertexPositionBuffer,sphereVertexNormalBuffer,sphereVertexColorBuffer,sphereVertexIndexBuffer);
    }


    ///////////////////////////////////////////////////////////////

     var lastMouseX = 0, lastMouseY = 0;

    ///////////////////////////////////////////////////////////////

     function onDocumentMouseDown( event ) {
          event.preventDefault();
          document.addEventListener( 'mousemove', onDocumentMouseMove, false );
          document.addEventListener( 'mouseup', onDocumentMouseUp, false );
          document.addEventListener( 'mouseout', onDocumentMouseOut, false );
          var mouseX = event.clientX;
          var mouseY = event.clientY;

          lastMouseX = mouseX;
          lastMouseY = mouseY; 

      }

     function onDocumentMouseMove( event ) {
          var mouseX = event.clientX;
          var mouseY = event.clientY; 

          var diffX = mouseX - lastMouseX;
          var diffY = mouseY - lastMouseY;
          
          if(rotation_mode == "yaw"){
            diff = diffX/5;
            Z_angle_yaw += diff;
            var rot = mat4.create();
            mat4.identity(rot);
            rot= mat4.rotate(rot,degToRad(Z_angle_yaw),[0,1,0]);
            view_rotation = mat4.multiply(rot, view_rotation);
          }
          if(rotation_mode == "pitch"){
            diff = diffY/5;
            Z_angle_pitch+= diff;
            var rot = mat4.create();
            mat4.identity(rot);
            rot= mat4.rotate(rot,degToRad(Z_angle_pitch),[1,0,0]);
            view_rotation = mat4.multiply(rot, view_rotation);
        
          }
          if(rotation_mode == "roll"){
            diff = diffX/5; 
            Z_angle_roll+=diff; 
            var rot = mat4.create();
            mat4.identity(rot);
            rot= mat4.rotate(rot,degToRad(Z_angle_roll),[0,0,1]); 
            view_rotation = mat4.multiply(rot, view_rotation);
          }
          lastMouseX = mouseX;
          lastMouseY = mouseY;

          drawScene();
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

    ///////////////////////////////////////////////////////////////

    function webGLStart() {
        var canvas = document.getElementById("code12-canvas");
        initGL(canvas);
        initShaders();

	gl.enable(gl.DEPTH_TEST); 

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
	
        shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
	
        shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
        shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");	

        shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
        shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "ambient_coef");	
        shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "diffuse_coef");
        shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "specular_coef");
        shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");

        shaderProgram.light_ambientUniform = gl.getUniformLocation(shaderProgram, "light_ambient");	
        shaderProgram.light_diffuseUniform = gl.getUniformLocation(shaderProgram, "light_diffuse");
        shaderProgram.light_specularUniform = gl.getUniformLocation(shaderProgram, "light_specular");
        shaderProgram.camera_posUniform = gl.getUniformLocation(shaderProgram, "camera_pos");


	     initScene();	

        gl.clearColor(0.0, 0.0, 0.0, 1.0);

       document.addEventListener('mousedown', onDocumentMouseDown,
       false); 
       document.addEventListener('keydown', onKeyDown,false); 
    }


function onKeyDown(event){
      switch(event.keyCode){
        case 87:
        //w
          if (which_object == 1)
              model_move = mat4.translate(model_move, [0,0,0.1]);               
          if (which_object == 2)
              model2_move = mat4.translate(model2_move, [0,0,0.1]);                         
          if (which_object == 3)
              model3_move = mat4.translate(model3_move, [0,0,0.1]);
          break;
        case 65:
          //a
          if (which_object == 1)
              model_move = mat4.translate(model_move, [-0.1, 0, 0]);               
          if (which_object == 2)
              model2_move = mat4.translate(model2_move, [-0.1, 0, 0]);                         
          if (which_object == 3)
              model3_move = mat4.translate(model3_move, [-0.1, 0, 0]);
          break;
        case 68:
          //d
          if (which_object == 1)
              model_move = mat4.translate(model_move, [0.1, 0, 0]);               
          if (which_object == 2)
              model2_move = mat4.translate(model2_move, [0.1, 0, 0]);                         
          if (which_object == 3)
              model3_move = mat4.translate(model3_move, [0.1, 0, 0]);
          break;
        case 83:
          //s
         if (which_object == 1)
              model_move = mat4.translate(model_move, [0,0,-0.1]);               
          if (which_object == 2)
              model2_move = mat4.translate(model2_move, [0,0,-0.1]);                         
          if (which_object == 3)
              model3_move = mat4.translate(model3_move, [0,0,-0.1]);
          break;
        case 81:
          //s
         if (which_object == 1)
              model_move = mat4.translate(model_move, [0,0.1,0]);               
          if (which_object == 2)
              model2_move = mat4.translate(model2_move, [0,0.1,0]);                         
          if (which_object == 3)
              model3_move = mat4.translate(model3_move, [0,0.1,0]);
          break;
        case 90:
          //s
         if (which_object == 1)
              model_move = mat4.translate(model_move, [0,-0.1,0]);               
          if (which_object == 2)
              model2_move = mat4.translate(model2_move, [0,-0.1,0]);                         
          if (which_object == 3)
              model3_move = mat4.translate(model3_move, [0,-0.1,0]);
          break;
        case 80:
          //pitch (look up and down)
          cam_rot_axis = [1,0,0];
          rotation_mode = "pitch";
          break;
        case 89:
          // yaw (look left and right)
          cam_rot_axis = [0,1,0];
          rotation_mode = "yaw";
          break;
        case 82:
          // roll (look clockwise/counterclockwise)
          cam_rot_axis = [0,0,1];
          rotation_mode = "roll";
          break;
        case 38:
          light_pos[1]+=1;
          break;
        case 40:
          light_pos[1]-=1;
          break;
        case 37:
          light_pos[0]-=1;
          break;
        case 39:
          light_pos[0]+=1;
          break;
        case 33:
          light_pos[2]+=1;
          break;
        case 34:
          light_pos[2]-=1;
          break;

      }
      drawScene();
    }

function obj(object_id) {

    which_object = object_id;
    drawScene();

} 