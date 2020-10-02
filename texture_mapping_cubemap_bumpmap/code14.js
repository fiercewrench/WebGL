
//////////////////////////////////////////////////////////////////
//
//  This example is similar to code03.html, but I am showing you how to
//  use gl elemenntary array, i.e, triangle indices, to draw faces 
//

var gl;
var shaderProgram;
var draw_type=2;
var use_texture = 0; 
var bump_texture=0;
var set_bump = 0;


  // set up the parameters for lighting 
  var light_ambient = [0,0,0,1]; 
  var light_diffuse = [.8,.8,.8,1];
  var light_specular = [3,3,3,3]; 
  var light_pos = [0,0,0,0];   // eye space position 

  var mat_ambient = [0, 0, 0, 1]; 
  var mat_diffuse= [1, 1, 0, 1]; 
  var mat_specular = [.9, .9, .9,1]; 
  var mat_shine = [100]; 
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
            alert("Could not initialise WebGL, sorry :-(");
        }
    }

var normalmapTexture;

function initNormalMapTextures(){
  normalmapTexture = gl.createTexture();
    normalmapTexture.image = new Image();
    normalmapTexture.image.onload = function() { handleNormalTextureLoaded(normalmapTexture); }
    normalmapTexture.image.src = "44830-norm.jpg";
}

function handleNormalTextureLoaded(normalmapTexture) {
  console.log(normalmapTexture);
    gl.bindTexture(gl.TEXTURE_2D, normalmapTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,normalmapTexture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
}

//texture for sphere
var sampletexture;
function initTextures() {
    sampletexture = gl.createTexture();
    sampletexture.image = new Image();
    sampletexture.image.onload = function() { handleTextureLoaded(sampletexture); }
    sampletexture.image.src = "brick.png";
}

function handleTextureLoaded(sampletexture) {
 // console.log(sampletexture);
    gl.bindTexture(gl.TEXTURE_2D, sampletexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,sampletexture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
}
///////////////////////////////////////////////////////////////

//prepare the cubmap for the object in the environment
var cubemapTexture;
function initCubeMap() {
    cubemapTexture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);

    var face_pos_x = gl.TEXTURE_CUBE_MAP_POSITIVE_X;
    var right_image = new Image();
    right_image.onload = function() {handleCubemapTextureLoaded(cubemapTexture, face_neg_x, right_image);}
    right_image.src ="right.png";
    var face_neg_x = gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
    var left_image = new Image();
    left_image.onload = function() {handleCubemapTextureLoaded(cubemapTexture, face_pos_x, left_image);}
    left_image.src ="left.png";
    var face_pos_y = gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
    var top_image = new Image();
    top_image.onload = function() {handleCubemapTextureLoaded(cubemapTexture, face_pos_y, top_image);}
    top_image.src ="top.png";
    var face_neg_y = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
    var bottom_image = new Image();
    bottom_image.onload = function() {handleCubemapTextureLoaded(cubemapTexture, face_neg_y, bottom_image);}
    bottom_image.src ="bottom.png";
    var face_pos_z = gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
    var front_image = new Image();
    front_image.onload = function() {handleCubemapTextureLoaded(cubemapTexture, face_pos_z, front_image);}
    front_image.src ="front.png";
    var face_neg_z = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
    var back_image = new Image();
    back_image.onload = function() {handleCubemapTextureLoaded(cubemapTexture, face_neg_z, back_image);}
    back_image.src ="back.png";
}

function handleCubemapTextureLoaded(cubemapTexture, face, image) {
   gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR); 
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
  gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}

//5 textures for wall
var backTexture;
var leftTexture;
var rightTexture;
var topTexture;
var bottomTexture;

function initBackTextures() {
    backTexture = gl.createTexture();
    backTexture.image = new Image();
    backTexture.image.onload = function() { handleWallTextureLoaded(backTexture); }
    backTexture.image.src = "backwall.png";
}

function initLeftTextures() {
    leftTexture = gl.createTexture();
    leftTexture.image = new Image();
    leftTexture.image.onload = function() { handleWallTextureLoaded(leftTexture); }
    leftTexture.image.src = "leftwall.png";
}

function initRightTextures() {
    rightTexture= gl.createTexture();
    rightTexture.image = new Image();
    rightTexture.image.onload = function() { handleWallTextureLoaded(rightTexture); }
    rightTexture.image.src = "rightwall.png";
}

function initTopTextures() {
    topTexture = gl.createTexture();
    topTexture.image = new Image();
    topTexture.image.onload = function() { handleWallTextureLoaded(topTexture); }
    topTexture.image.src = "topwall.png";
}

function initBottomTextures() {
    bottomTexture = gl.createTexture();
    bottomTexture.image = new Image();
    bottomTexture.image.onload = function() { handleWallTextureLoaded(bottomTexture); }
    bottomTexture.image.src = "bottomwall.png";
}

//front wall?

function handleWallTextureLoaded(tex) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //console.log(tex);
}



var psverts = [];
var pscolors = []; 
var psindicies = [];
var psnormals = [];
var pstexcoords = [];
function InitParametricSurface(nslices, nstacks,rout,rin) 
{    

  var Dangle_i = 2*Math.PI/(nslices-1); 
  var Dangle_j = 2*Math.PI/(nstacks-1);

for (j =0; j<nstacks; j++){
    var angle_j = Dangle_j*j;              // Iterates over all strip rounds
    for (i=0; i<nslices; i++) {
      var angle_i = Dangle_i*i;// Iterates along the torus section
        var x, y, z;
 
        psverts.push(x = Math.cos(angle_j)*(rout+Math.cos(angle_i)*rin)); // X
        psverts.push(y = Math.sin(angle_j)*(rout+Math.cos(angle_i)*rin)); // Y
        psverts.push(z = rin*Math.sin(angle_i));
 

 //3 for loops, derivatives with respect to 3 var
        // tangent vector with respect to u
      tx = -Math.sin(angle_j);
      ty = Math.cos(angle_j);
      tz = 0;

      // tangent vector with respect to v
      sx = Math.cos(angle_j)*(-Math.sin(angle_i));
      sy = Math.sin(angle_j)*(-Math.sin(angle_i));
      sz = Math.cos(angle_i);

      //normal is cross-product of tangents
      nx = ty*sz+tz*sy;
      ny = tz*sx - tx*sz;
      nz = tx*sy-ty*sx;

      //normalize the normals
      length = Math.sqrt(nx*nx + ny*ny + nz*nz);
      nx /= length;
      ny /= length;
      nz /= length;
    
        psnormals.push(nx);  // R
        psnormals.push(ny);  // G
        psnormals.push(nz);  // B
        // Colors
        pscolors.push(0.5+0.5*x);  // R
        pscolors.push(0.5+0.5*y);  // G
        pscolors.push(0.5+0.5*z);  // B
        pscolors.push(1.0);  // Alpha

        //tex coords
        pstexcoords.push(1/nslices*i);
        pstexcoords.push(1/nstacks*j);
     // }
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
  
      psindicies.push(idx); 
      psindicies.push(idx2);
      psindicies.push(idx3); 
      psindicies.push(idx4);
      psindicies.push(idx5); 
      psindicies.push(idx6);
    }
  }
}

 var psVertexPositionBuffer;
    var psVertexNormalBuffer;
    var psVertexColorBuffer;
    var psVertexIndexBuffer;
    var psVertexTexCoordsBuffer;

    function initParametricSurfaceBuffers(){
        var nslices = 80;
        var nstacks = 80; 
        InitParametricSurface(nslices,nstacks,0.6,0.03);
    
        psVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, psVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(psverts), gl.STATIC_DRAW);
        psVertexPositionBuffer.itemSize = 3;
        psVertexPositionBuffer.numItems = nslices * nstacks; 

        psVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, psVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(psnormals), gl.STATIC_DRAW);
        psVertexNormalBuffer.itemSize = 3;
        psVertexNormalBuffer.numItems = nslices * nstacks;  

        psVertexIndexBuffer = gl.createBuffer(); 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, psVertexIndexBuffer); 
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(psindicies), gl.STATIC_DRAW);  
        psVertexIndexBuffer.itemsize = 1;
        psVertexIndexBuffer.numItems = (nstacks-1)*6*(nslices+1);

        psVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, psVertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pscolors), gl.STATIC_DRAW);
        psVertexColorBuffer.itemSize = 4;
        psVertexColorBuffer.numItems = nslices * nstacks;

        psVertexTexCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, psVertexTexCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pstexcoords), gl.STATIC_DRAW);
        psVertexTexCoordsBuffer.itemSize = 2;
        psVertexTexCoordsBuffer.numItems = nslices * nstacks; 
    }

var squareVertexPositionBuffer;
var squareVertexNormalBuffer;
var squareVertexColorBuffer;
var squareVertexIndexBuffer;
var squareVertexTexCoordsBuffer;

var sqvertices = [];
var sqnormals = []; 
var sqindices = [];
var sqcolors = [];
var sqTexCoords=[]; 


//for the walls
function InitSquare()
{
        sqvertices = [
             0.5,  0.5,  0,
      -0.5,  0.5,  0, 
      - 0.5, -0.5, 0,
      0.5, -0.5,  0,
        ];
  sqindices = [0,1,2, 0,2,3]; 
        sqcolors = [
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
        ];    
        sqnormals = [
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
        ];    
        sqTexCoords = [0.0,0.0,1.0,0.0,1.0,1.0,0.0,1.0]; 
}


function initSQBuffers() {

        InitSquare(); 
        squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqvertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer.itemSize = 3;
        squareVertexPositionBuffer.numItems = 4;

        squareVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqnormals), gl.STATIC_DRAW);
        squareVertexNormalBuffer.itemSize = 3;
        squareVertexNormalBuffer.numItems = 4; 

        squareVertexTexCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTexCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqTexCoords), gl.STATIC_DRAW);
        squareVertexTexCoordsBuffer.itemSize = 2;
        squareVertexTexCoordsBuffer.numItems = 4; 

  squareVertexIndexBuffer = gl.createBuffer();  
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer); 
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sqindices), gl.STATIC_DRAW);  
        squareVertexIndexBuffer.itemsize = 1;
        squareVertexIndexBuffer.numItems = 6;  

        squareVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqcolors), gl.STATIC_DRAW);
        squareVertexColorBuffer.itemSize = 4;
        squareVertexColorBuffer.numItems = 4;

}

    var cubeVertexPositionBuffer;
    var cubeVertexNormalBuffer;
    var cubeVertexColorBuffer;
    var cubeVertexIndexBuffer;
    var cubeVertexTexCoordsBuffer;

   ////////////////    Initialize VBO  ////////////////////////

    function initBuffers(size) {

        cubeVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
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
        cubeVertexPositionBuffer.itemSize = 3;
        cubeVertexPositionBuffer.numItems = 24;

        var texcoord = [
          0.0,0.0, 1.0,0.0, 1.0,1.0, 0.0,1.0,
                               0.0,0.0, 1.0,0.0, 1.0,1.0, 0.0,1.0,
                               0.0,0.0, 1.0,0.0, 1.0,1.0, 0.0,1.0,
                               0.0,0.0, 1.0,0.0, 1.0,1.0, 0.0,1.0,
                               0.0,0.0, 1.0,0.0, 1.0,1.0, 0.0,1.0,
                               0.0,0.0, 1.0,0.0, 1.0,1.0, 0.0,1.0
        ];

        cubeVertexTexCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTexCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoord), gl.STATIC_DRAW);
        cubeVertexTexCoordsBuffer.itemSize = 2;
        cubeVertexTexCoordsBuffer.numItems = 24; 

        var cbnormals = [
          0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
          1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,
          0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
         -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,
          0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,
          0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0
        ];

        cubeVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cbnormals), gl.STATIC_DRAW);
        cubeVertexNormalBuffer.itemSize = 3;
        cubeVertexNormalBuffer.numItems = 24;

        var indices = [
        0, 1, 2,   0, 2, 3,
        4, 5, 6,   4, 6, 7,
        8, 9,10,   8,10,11,
        12,13,14,  12,14,15,
        16,17,18,  16,18,19,
        20,21,22,  20,22,23
        ];
  cubeVertexIndexBuffer = gl.createBuffer();  
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer); 
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);  
        cubeVertexIndexBuffer.itemsize = 1;
        cubeVertexIndexBuffer.numItems = 36;  

        cubeVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
        var colors = [
            1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1,  1, 0, 1, 1,
          1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,  1, 1, 0, 1,
          1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,  1, 0, 0, 1,
          0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,  0, 1, 0, 1,
          0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1,  0, 1, 1, 1,
          0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,  0, 0, 1, 1    
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        cubeVertexColorBuffer.itemSize = 4;
        cubeVertexColorBuffer.numItems = 24;

    }
var spverts = [];
var spcolors = []; 
var spindicies = [];
var spnormals = [];
var sptexcoords =[];
function InitSphere(nslices, nstacks,  radius) 
{    

  var Dangle_i = 2*Math.PI/(nslices-1); 
  var Dangle_j = 2*Math.PI/(nstacks-1);

for (j =0; j<nstacks; j++){
    var angle_j = Dangle_j*j;
    var sin_j = Math.sin(angle_j);
    var cos_j = Math.cos(angle_j);              // Iterates over all strip rounds
    for (i=0; i<nslices; i++) {
      var angle_i = Dangle_i*i;// Iterates along the torus section
        //var x, y, z;
 
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
        // Colors
      spcolors.push(Math.cos(angle_j)*Math.cos(angle_i)/3); 
      spcolors.push(Math.cos(angle_j)*Math.sin(angle_i)/3); 
      spcolors.push(Math.sin(angle_j)/3); 
      spcolors.push(1.0); 

        //tex coords
        sptexcoords.push(Math.atan2(sin_i*sin_j, cos_i*sin_j) / (2*Math.PI) + 0.5);
        sptexcoords.push(cos_j * 0.5 + 0.5);
     // }
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
   
var sphereVertexPositionBuffer;
var sphereVertexNormalBuffer;
var sphereVertexColorBuffer;
var sphereVertexIndexBuffer; 
var sphereVertexTexCoordsBuffer;
function initSphereBuffers(radius){
        var nslices = 50;
        var nstacks = 50; 
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

        sphereVertexTexCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTexCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sptexcoords), gl.STATIC_DRAW);
        sphereVertexTexCoordsBuffer.itemSize = 2;
        sphereVertexTexCoordsBuffer.numItems = nslices * nstacks;   

    }


///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

    var mMatrix = mat4.create();    // model matrix
    var vMatrix = mat4.create();    // view matrix
    var pMatrix = mat4.create();    // projection matrix
    var nMatrix = mat4.create();    // normal matrix
    var v2wMatrix = mat4.create();  // eye space to world space matrix 
   // var Z_angle = 0.0;

    function setMatrixUniforms(matrix) {
        gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, matrix);
        gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);	
        gl.uniformMatrix4fv(shaderProgram.v2wMatrixUniform, false, v2wMatrix);		
    }

     function degToRad(degrees) {
        return degrees * Math.PI / 180;
     }

///////////////////////////////////////////////////////////////

function setLightUniforms(){
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

 //draw 6 walls - texture mapping
    function drawPlane(matrix, texture){

      vMatrix = mat4.lookAt(camera_pos, [0,0,0], [0,1,0], vMatrix);  // set up the view matrix, multiply into the modelview matrix
       
      gl.uniform1i(shaderProgram.use_textureUniform, 1); 
        mat4.identity(nMatrix); 
        nMatrix = mat4.multiply(nMatrix, vMatrix);
        nMatrix = mat4.multiply(nMatrix, matrix);  
        nMatrix = mat4.inverse(nMatrix);
        nMatrix = mat4.transpose(nMatrix); 

        //plane position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //plane normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, squareVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //plane texture coordinate buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTexCoordsBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, squareVertexTexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //plane color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //plane index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);

        setMatrixUniforms(matrix);

        //
        gl.activeTexture(gl.TEXTURE2);   // set texture unit 0 to use 
        gl.bindTexture(gl.TEXTURE_2D, texture);    // bind the texture object to the texture unit 
        gl.uniform1i(shaderProgram.textureUniform, 2);   // pass the texture unit to the shader 
        
        //
        if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, squareVertexPositionBuffer.numItems); 
        else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, squareVertexPositionBuffer.numItems);
        else if (draw_type==2) gl.drawElements(gl.TRIANGLES, squareVertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0);
    }

    function transPlane(trans1,degree,axis,trans2){
      var result_mat = mat4.create();
      mat4.identity(result_mat);
      result_mat = mat4.translate(result_mat,trans1);
      result_mat = mat4.rotate(result_mat,degToRad(degree),axis);
      result_mat = mat4.translate(result_mat,trans2);

      return result_mat;

    }


function drawShape(matrix, VertexPositionBuffer,VertexNormalBuffer,VertexTexCoordsBuffer,VertexColorBuffer,VertexIndexBuffer){
 vMatrix = mat4.identity(vMatrix);
        vMatrix = mat4.multiply(vMatrix,view_rotation);
        var vMatrix_look = mat4.create();
        vMatrix_look = mat4.lookAt(camera_pos, [0,0,0], [0,1,0], vMatrix_look);  // set up the view matrix, multiply into the modelview matrix
        vMatrix = mat4.multiply(vMatrix,vMatrix_look);

  mat4.identity(nMatrix); 
  nMatrix = mat4.multiply(nMatrix, vMatrix);
  nMatrix = mat4.multiply(nMatrix, matrix);  
  nMatrix = mat4.inverse(nMatrix);
  nMatrix = mat4.transpose(nMatrix);

  gl.bindBuffer(gl.ARRAY_BUFFER, VertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, VertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, VertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, VertexColorBuffer);  
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,VertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  

        //plane texture coordinate buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, VertexTexCoordsBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, VertexTexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, VertexIndexBuffer);

        setMatrixUniforms(matrix);

        gl.activeTexture(gl.TEXTURE1);   // set texture unit 1 to use 
         gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);    // bind the texture object to the texture unit 
        gl.uniform1i(shaderProgram.cube_map_textureUniform, 1);   // pass the texture unit to the shader
   
       var texture;
        if(use_texture == 1){
            bump_texture = 1;
          }else{
            bump_texture = 0;
        }
          if(bump_texture ==1){
          texture = sampletexture;
         //
          }else if(bump_texture == 0){
            texture = normalmapTexture;
          }
         //
        
        gl.activeTexture(gl.TEXTURE0);   // set texture unit 0 to use 
        gl.bindTexture(gl.TEXTURE_2D, texture);    // bind the texture object to the texture unit 
        gl.uniform1i(shaderProgram.textureUniform, 0);   // pass the texture unit to the shader 

  if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, VertexPositionBuffer.numItems); 
  else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, VertexPositionBuffer.numItems);
  else if (draw_type==2) gl.drawElements(gl.TRIANGLES, VertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0);  


}
mat4.identity(mMatrix);
var mat = mat4.create(mMatrix);
//var mat_ps = mat4.create(mMatrix);

var model_move = mat4.create();
    var model3_move = mat4.create();
    var model2_move = mat4.create();

    mat4.identity(model_move);
    mat4.identity(model3_move);
    mat4.identity(model2_move);

var rotation = mat4.create();
mat4.identity(rotation);
function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	pMatrix = mat4.perspective(60, 1.0, 0.1, 100, pMatrix);  // set up the projection matrix 

        
        mat4.identity(mMatrix);


        mat4.identity(v2wMatrix);
        v2wMatrix = mat4.multiply(v2wMatrix, vMatrix);
//        v2wMatrix = mat4.inverse(v2wMatrix);     
        v2wMatrix = mat4.transpose(v2wMatrix); 

	setLightUniforms();

	
        //setMatrixUniforms();   // pass the modelview mattrix and projection matrix to the shader
	       gl.uniform1i(shaderProgram.use_textureUniform, use_texture);  
         gl.uniform1i(shaderProgram.set_textureUniform, set_bump);    


      var mat = mat4.create(mMatrix);
        
        mat = mat4.multiply(rotation,mat);
        var mat_ps=mat4.create(mat);
        mat_ps =  mat4.multiply(mat_ps,model_move);
        drawShape(mat_ps,psVertexPositionBuffer,psVertexNormalBuffer,psVertexTexCoordsBuffer,psVertexColorBuffer,psVertexIndexBuffer);
       var mat_sphere = mat4.create(mat_ps);
        mat_sphere = mat4.multiply(mat_sphere,model2_move);
        drawShape(mat_sphere, sphereVertexPositionBuffer,sphereVertexNormalBuffer,sphereVertexTexCoordsBuffer,sphereVertexColorBuffer,sphereVertexIndexBuffer);
        
      // var mat_cube = mat4.create(mat);
        var mat_cube = mat4.translate(mat_sphere,[0,0.8,0]);
         mat_cube = mat4.scale(mat_cube,[1,6,1]);
         mat_cube = mat4.multiply(mat_cube,model3_move);
         drawShape(mat_cube, cubeVertexPositionBuffer,cubeVertexNormalBuffer,cubeVertexTexCoordsBuffer,cubeVertexColorBuffer,cubeVertexIndexBuffer);
          
         //back*/
         mMatrix = mat4.scale(mMatrix,[4,4,4]);
        mMatrix = mat4.translate(mMatrix,[0,0,-0.6]);
        drawPlane(mMatrix,backTexture);

        //left
        var left_mat = transPlane([-0.5,0,0],90,[0,1,0],[-0.5,0,0]);
        var mat1 = mat4.create(mMatrix);
        left_mat = mat4.multiply(mat1,left_mat);
        drawPlane(left_mat,leftTexture);

       //right
        var mat1 = mat4.create(mMatrix);
        var right_mat = transPlane([0.5,0,0],-90,[0,1,0],[0.5,0,0]);
        right_mat = mat4.multiply(mat1,right_mat);
        drawPlane(right_mat,rightTexture);

        //top
        var mat1 = mat4.create(mMatrix);
        var top_mat = transPlane([0,0.5,0],90,[1,0,0],[0,0.5,0]);
        top_mat = mat4.multiply(mat1,top_mat);
        drawPlane(top_mat,topTexture);

        ///bottom
        var mat1 = mat4.create(mMatrix);
        var bottom_mat = transPlane([0,-0.5,0],-90,[1,0,0],[0,-0.5,0]);
        bottom_mat = mat4.multiply(mat1,bottom_mat);
        drawPlane(bottom_mat,bottomTexture);
       

    }

    var then = 0;

      // Draw the scene repeatedly
      function render(now) {
       // gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
     // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //now *= 0.001;  // convert to seconds
        const deltaTime = now - then; // subtract the previous time from the current time
        then = now; // remember the current time for the next frame
          drawScene();
        //drawShape(mat, cubeVertexPositionBuffer,cubeVertexNormalBuffer,cubeVertexColorBuffer,cubeVertexIndexBuffer);
        rotation  = mat4.rotate(rotation,degToRad(1),[1,1,1]);
       // mat_ps = mat4.rotate(mat_ps,degToRad(-1),[1,1,1]);
        //drawPlane(mMatrix,backTexture);
        
        requestAnimationFrame(render);
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

var Z_angle_pitch = 0.0;
    var Z_angle_yaw = 0.0;
    var Z_angle_roll = 0.0;
    var rotation_mode = 'pitch';
    var view_rotation = mat4.create();
    var which_object = 1;
    mat4.identity(view_rotation);
     function onDocumentMouseMove( event ) {
          var mouseX = event.clientX;
          var mouseY = event.clientY; 

          var diffX = mouseX - lastMouseX;
          var diffY = mouseY - lastMouseY;

          if(rotation_mode == "yaw"){
            diff = diffX/5;
            Z_angle_yaw += diff/100;
            var rot = mat4.create();
            mat4.identity(rot);
            rot= mat4.rotate(rot,degToRad(Z_angle_yaw),[0,1,0]);
            view_rotation = mat4.multiply(rot, view_rotation);
          }
          if(rotation_mode == "pitch"){
            diff = diffY/5;
            Z_angle_pitch+= diff/100;
            var rot = mat4.create();
            mat4.identity(rot);
            rot= mat4.rotate(rot,degToRad(Z_angle_pitch),[1,0,0]);
            view_rotation = mat4.multiply(rot, view_rotation);
        
          }
          if(rotation_mode == "roll"){
            diff = diffX/5; 
            Z_angle_roll+=diff/100; 
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
        var canvas = document.getElementById("code13-canvas");
        initGL(canvas);
        initShaders();
        initBuffers(0.1);
        initSphereBuffers(0.5);
        initSQBuffers();
        initCubeMap();    
        initBackTextures();
       initLeftTextures();
        initRightTextures();
        initTopTextures();
        initBottomTextures();
        initTextures();
        initParametricSurfaceBuffers();
        initNormalMapTextures();
	       gl.enable(gl.DEPTH_TEST); 

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

         //for texture mapping
        shaderProgram.vertexTexCoordsAttribute = gl.getAttribLocation(shaderProgram, "aVertexTexCoords");
        gl.enableVertexAttribArray(shaderProgram.vertexTexCoordsAttribute);
   /////////
	
        shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
        shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
	shaderProgram.v2wMatrixUniform = gl.getUniformLocation(shaderProgram, "uV2WMatrix");		

        shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
        shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "ambient_coef");	
        shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "diffuse_coef");
        shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "specular_coef");
        shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");

        shaderProgram.light_ambientUniform = gl.getUniformLocation(shaderProgram, "light_ambient");	
        shaderProgram.light_diffuseUniform = gl.getUniformLocation(shaderProgram, "light_diffuse");
        shaderProgram.light_specularUniform = gl.getUniformLocation(shaderProgram, "light_specular");	

        shaderProgram.camera_posUniform = gl.getUniformLocation(shaderProgram, "camera_pos");
	shaderProgram.textureUniform = gl.getUniformLocation(shaderProgram, "myTexture");
	shaderProgram.cube_map_textureUniform = gl.getUniformLocation(shaderProgram, "cubeMap");	
        shaderProgram.use_textureUniform = gl.getUniformLocation(shaderProgram, "use_texture");
        shaderProgram.bump_map_textureUniform = gl.getUniformLocation(shaderProgram, "bumpMapTexture");
       shaderProgram.bump_textureUniform = gl.getUniformLocation(shaderProgram, "bump_texture");
       shaderProgram.set_textureUniform = gl.getUniformLocation(shaderProgram, "set_bump");
  
	
	

requestAnimationFrame(render);

  document.addEventListener('mousedown', onDocumentMouseDown,false); 
   document.addEventListener('keydown', onKeyDown,false);
       
    }

function redraw() {
    draw_type=2;
    use_texture = 0; 
    bump_texture=0;
    set_bump = 0;
    Z_angle_pitch = 0.0;
    Z_angle_yaw = 0.0;
    Z_angle_roll = 0.0;
    rotation_mode = 'pitch';
    view_rotation = mat4.create();
    which_object = 1;
    mat4.identity(view_rotation);
    then = 0;
    model_move = mat4.create();
    model3_move = mat4.create();
    model2_move = mat4.create();

    mat4.identity(model_move);
    mat4.identity(model3_move);
    mat4.identity(model2_move);

    rotation = mat4.create();
    mat4.identity(rotation);
    drawScene();
}
    

function geometry(type) {

    draw_type = type;
    drawScene();

}

function t_texture(value) {

    use_texture = value;
    drawScene();

} 

function b_texture(value) {

    set_bump = value;
    drawScene();

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
          rotation_mode = "pitch";
          break;
        case 89:
          // yaw (look left and right)
          rotation_mode = "yaw";
          break;
        case 82:
          // roll (look clockwise/counterclockwise)
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
