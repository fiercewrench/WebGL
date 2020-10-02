
/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas we draw on */
var canvas;

/** @global A simple GLSL shader program */
var shaderProgram;

/** @global The Modelview matrix */
var mvMatrix = mat4.create();

/** @global The Projection matrix */
var pMatrix = mat4.create();

/** @global The Normal matrix */
var nMatrix = mat3.create();

/** @global The matrix stack for hierarchical modeling */
var mvMatrixStack = [];

/** @global The angle of rotation around the y axis */
var viewRot = 10;

/** @global A glmatrix vector to use for transformations */
var transformVec = vec3.create();    

// Initialize the vector....
vec3.set(transformVec,0.0,0.0,-2.0);

/** @global An object holding the geometry for a 3D terrain */
var myTerrain;

var currentAngle = [20.0,0];//rotate
var tranx=0,trany=0;
var scalex=1,scaley=1,scalez=1;
// View parameters
/** @global Location of the camera in world coordinates */ // ????????????????????????????
// var eyePt = vec3.fromValues(0.0,0.0,8.0);
/** @global Location of the camera in world coordinates */ // ????????????????????????????
// var eyePt = vec3.fromValues(0.0,0.0,8.0);
//view change: x value left and right
//             y value up and down
//             z value near and far
var eyePt = vec3.fromValues(0.4,-0.2,4.5);
// var eyePt = vec3.fromValues(0.0,2.0,2.0);
/** @global Direction of the view in world coordinates */
var viewDir = vec3.fromValues(0.0,0.0,-1.0);
/** @global Up vector for view matrix creation, in world coordinates */
var up = vec3.fromValues(0.0,1.0,0.0);
/** @global Location of a point along viewDir in world coordinates */
var viewPt = vec3.fromValues(0.0,0.0,0.0);

//Light parameters
/** @global Light position in VIEW coordinates */
// var lightPosition = [0,5,5];
var lightPosition = [-20,20,60];
/** @global Ambient light color/intensity for Phong reflection */
var lAmbient = [0.5,0.5,0.5];
/** @global Diffuse light color/intensity for Phong reflection */
var lDiffuse = [0.8,0.85,0.85];
/** @global Specular light color/intensity for Phong reflection */
var lSpecular =[0,0,0];

//Material parameters
/** @global Ambient material color/intensity for Phong reflection */
var kAmbient = [0.5,0.5,0.5];
/** @global Diffuse material color/intensity for Phong reflection */
var kTerrainDiffuse = [0.8,0.85,0.85];
/** @global Specular material color/intensity for Phong reflection */
var kSpecular = [0,0,0];
/** @global Shininess exponent for Phong reflection */
var shininess = 0;
/** @global Edge color for wireframeish rendering */
var kEdge = [0,0,0];
var KEdgeN = [0,0,0]; 
var globalSeed = 0;
 
var left_right_quat = quat.create(); //四元数
var up_down_quat = quat.create();
var rotate = vec3.fromValues(1,0,0);//rotation !!!

 
//-------------------------------------------------------------------------
/**
 * Sends Modelview matrix to shader
 */
function uploadModelViewMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

//-------------------------------------------------------------------------
/**
 * Sends projection matrix to shader
 */
function uploadProjectionMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, 
                      false, pMatrix);
}

//-------------------------------------------------------------------------
/**
 * Generates and sends the normal matrix to the shader
 */
function uploadNormalMatrixToShader() {
  mat3.fromMat4(nMatrix,mvMatrix);
  mat3.transpose(nMatrix,nMatrix);
  mat3.invert(nMatrix,nMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
}

//----------------------------------------------------------------------------------
/**
 * Pushes matrix onto modelview matrix stack
 */
function mvPushMatrix() {
    var copy = mat4.clone(mvMatrix);
    mvMatrixStack.push(copy);
}


//----------------------------------------------------------------------------------
/**
 * Pops matrix off of modelview matrix stack
 */
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

//----------------------------------------------------------------------------------
/**
 * Sends projection/modelview matrices to shader
 */
function setMatrixUniforms() {
    uploadModelViewMatrixToShader();
    uploadNormalMatrixToShader();
    uploadProjectionMatrixToShader();
}

//----------------------------------------------------------------------------------
/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}

//----------------------------------------------------------------------------------
/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

//----------------------------------------------------------------------------------
/**
 * Loads Shaders
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}

//----------------------------------------------------------------------------------
/**
 * Setup the fragment and vertex shaders
 */
function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram,"vColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");

  shaderProgram.uniformLightPositionLoc = gl.getUniformLocation(shaderProgram, "uLightPosition");    
  shaderProgram.uniformAmbientLightColorLoc = gl.getUniformLocation(shaderProgram, "uAmbientLightColor");  
  shaderProgram.uniformDiffuseLightColorLoc = gl.getUniformLocation(shaderProgram, "uDiffuseLightColor");
  shaderProgram.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram, "uSpecularLightColor");
  shaderProgram.uniformShininessLoc = gl.getUniformLocation(shaderProgram, "uShininess");    
  shaderProgram.uniformAmbientMaterialColorLoc = gl.getUniformLocation(shaderProgram, "uKAmbient");  
  shaderProgram.uniformDiffuseMaterialColorLoc = gl.getUniformLocation(shaderProgram, "uKDiffuse");
  shaderProgram.uniformSpecularMaterialColorLoc = gl.getUniformLocation(shaderProgram, "uKSpecular");
  
  shaderProgram.uniformWireframeLoc = gl.getUniformLocation(shaderProgram, "wireframe");
  shaderProgram.uniformLighttypeLoc = gl.getUniformLocation(shaderProgram, "lighttype");
}

//-------------------------------------------------------------------------
/**
 * Sends material information to the shader
 * @param {Float32} alpha shininess coefficient
 * @param {Float32Array} a Ambient material color
 * @param {Float32Array} d Diffuse material color
 * @param {Float32Array} s Specular material color
 */
function setMaterialUniforms(alpha,a,d,s,w) {

  gl.uniform1i(shaderProgram.uniformWireframeLoc, w); //wireframe + orignal?
  // gl.uniform1i(shaderProgram.uniformOrignalLoc, ori); //orignal?

  gl.uniform1f(shaderProgram.uniformShininessLoc, alpha);
  gl.uniform3fv(shaderProgram.uniformAmbientMaterialColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseMaterialColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularMaterialColorLoc, s);
}
 
//-------------------------------------------------------------------------
/**
 * Sends light information to the shader
 * @param {Float32Array} loc Location of light source
 * @param {Float32Array} a Ambient light strength
 * @param {Float32Array} d Diffuse light strength
 * @param {Float32Array} s Specular light strength
 */
function setLightUniforms(loc, a, d, s, t) {
 //   console.log(t);
  gl.uniform1f(shaderProgram.uniformLighttypeLoc, t); //light type
  gl.uniform3fv(shaderProgram.uniformLightPositionLoc, loc);
  gl.uniform3fv(shaderProgram.uniformAmbientLightColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseLightColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularLightColorLoc, s);
}

//----------------------------------------------------------------------------------
/**
 * Populate buffers with data
 */
function setupBuffers() {
    myTerrain = new Terrain(600,-10,10,-10,10);
    myTerrain.loadBuffers();
}

//----------------------------------------------------------------------------------
/**
 * Draw call that applies matrix transformations to model and draws model in frame
 */
function draw() { 
 

    var transformVec = vec3.create();
    var scalexyz = vec3.create();
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // We'll use perspective 
    mat4.perspective(pMatrix,degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 200.0);
           
    vec3.add(viewPt, eyePt, viewDir);
    // We want to look down -z, so create a lookat point in that direction    
    vec3.add(viewPt, eyePt, viewDir);
    // Then generate the lookat matrix and initialize the MV matrix to that view
    mat4.lookAt(mvMatrix,eyePt,viewPt,up);    
 
    //Draw Terrain
    mvPushMatrix();
     vec3.set(transformVec,tranx,trany,-3.0);
     mat4.translate(mvMatrix, mvMatrix,transformVec);
     /*****
     ADD!!!
     ******/
     mat4.rotateX(mvMatrix, mvMatrix, degToRad(60));
     vec3.set(scalexyz,scalex,scaley,scalez);
     // mat4.translate(mvMatrix,mvMatrix,[0, 1, 0]);     //temp added
     // mat4.scale(mvMatrix,mvMatrix,scalexyz); //scaling

     setMatrixUniforms();
     let type = 2;
     if ((document.getElementById("ambient").checked)) {
         type = 1;
      }
     if ((document.getElementById("diffuse").checked)) {
         type = 2;
      }
     if ((document.getElementById("specular").checked)) {
         type = 3;
      }
     if ((document.getElementById("phong").checked)) {
         type = 0;
     }
	   if ((document.getElementById("normalphong").checked)) {
         type = 4;
     }
	  
     setLightUniforms(lightPosition, lAmbient, lDiffuse, lSpecular, type);
    
    if (document.getElementById("polygon").checked)
    { 
      setMaterialUniforms(shininess, kAmbient, kTerrainDiffuse, kSpecular,false); 
      myTerrain.drawTriangles();
      setMaterialUniforms(shininess,kEdge, kEdge, kEdge,true); 
      myTerrain.drawCircle();
    }
    if(document.getElementById("wireframe").checked)
    {
        setMaterialUniforms(shininess, kAmbient, kTerrainDiffuse, kSpecular, false);
        myTerrain.drawTriangles();
        setMaterialUniforms(shininess,kEdge, kEdge, kEdge,true);  
        myTerrain.drawEdges();

        /* !!! Added: transfermation of circle */       
        mat4.rotateX(mvMatrix, mvMatrix, (90));
        mat4.translate(mvMatrix,mvMatrix,[0, 0, -3]);
        mat4.rotateX(mvMatrix, mvMatrix, degToRad(currentAngle[0]));
        mat4.rotateY(mvMatrix, mvMatrix, degToRad(currentAngle[1]));
        mat4.scale(mvMatrix, mvMatrix, [0.1,0.1,0.1]);
        // mat4.rotateX(mvMatrix, mvMatrix, degToRad(90));
        // mat4.translate(mvMatrix,mvMatrix,[0, 2, 0]);
        setMatrixUniforms();
        setMaterialUniforms(shininess, kAmbient, kTerrainDiffuse, kEdge, false);
        myTerrain.drawCircle();
        mat4.scale(mvMatrix, mvMatrix, [0.03,0.03,10]);
       // model_base = mat4.translate(model_base,[-50,0,0]);
        setMatrixUniforms();
        setMaterialUniforms(shininess, kAmbient, kTerrainDiffuse, kEdge, false);
        myTerrain.drawCircle();

    }
    if(document.getElementById("normal").checked) //Glyph
    {
        setMaterialUniforms(shininess, kAmbient, kTerrainDiffuse, kSpecular, false);
        myTerrain.drawTriangles();
        setMaterialUniforms(shininess,KEdgeN, KEdgeN, KEdgeN,true);  
        myTerrain.drawGlyph();

        /* Added: transfermation of circle */        
        // mat4.translate(mvMatrix,mvMatrix,[0.1, 0, 1]);
        // mat4.rotateX(mvMatrix, mvMatrix, degToRad(90));
        // mat4.scale(mvMatrix, mvMatrix, 6);
        setMatrixUniforms();
        setMaterialUniforms(shininess, kAmbient, kTerrainDiffuse, kSpecular, false);
        myTerrain.drawCircle();
    }   
    
    mvPopMatrix();

  
}

//----------------------------------------------------------------------------------
/**
 * Startup function called from html code to start program.
 */
 function startup() {

  var loopCounter = globalLoopStartID; // change here !
  globalSeed = loopCounter+687685;


  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  
  setupShaders();
  setupBuffers();
  initMouseControl(canvas,currentAngle);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);


  elem.addEventListener('click', () => {

    while (loopCounter < globalGenNumber) {

        if (loopCounter%200 == 0)
          console.log(loopCounter);

        globalSeed = loopCounter+687685;

        draw();
        canvas.toBlob((blob) => { 
          blobs.push(blob);
          if (blobs.length%1000 == 0)
            console.log("Blobs: ", blobs.length);
          // console.log(blobs.length);
          // window.location.reload(); //reload to update to new randomed image
          // saveBlob(blob, `terrain-wireframe-${loopCounter}.png`); //change 'checked' in HTML

        });
            //  update images !!!!!!!!!!!!
            setupShaders();
            setupBuffers();
            initMouseControl(canvas,currentAngle);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
         
            loopCounter ++;
    }

    console.log("Generate Done!!!");

  });

  download_btn.addEventListener('click', () => {
      console.log(blobs.length);

      for (var i = globalStartID; i < globalGenNumber; i++) { // chenge here !!

        saveBlob(blobs[i-globalStartID], `terrain-wireframe-${i+1}.png`); //change 'checked' in HTML
      }
  });

  tick();
}

 
//----------------------------------------------------------------------------------
/**
 * Keeping drawing frames....
 */
function tick() {


  draw();
  requestAnimFrame(tick);
}

//add mouse in canvas
function initMouseControl(canvas,currentAngle)
{
 
    var dragging1 = false, dragging2 = false, dragging3 = false;
    var lastX = -1, lastY = -1;
 
        canvas.onmousedown = function (event) {//press mouse to run event
 
            var x = event.clientX, y = event.clientY;
            switch (event.button) {
                case 0:
                case 1:      //mouse left and middle
                    var rect1 = event.target.getBoundingClientRect();
                    if (rect1.left <= x && x < rect1.right && rect1.top <= y && y < rect1.bottom) {
                        lastX = x;
                        lastY = y;
                        dragging1 = true;
                        
                    }
                    break;
 
                case 2:      //mouse right
                    var rect2 = event.target.getBoundingClientRect();
                    if (rect2.left <= x && x < rect2.right && rect2.top <= y && y < rect2.bottom) {
                        lastX = x;
                        lastY = y;
                        dragging2 = true;
                        canvas.oncontextmenu = function () {
                            return false;
                        }
                    }
                    break;
            }
 
        };
 
 
        //scale
           canvas.onmousewheel = function (event) {
 
               
                   //console.log(event.wheelDelta);
                   factor = event.wheelDelta / 1200;
                   scalex += factor / 5;//scale in x direction
                   scaley += factor / 5;//scale in y direction 
                   scalez += factor / 5;//scale in z direction
                
 
           };
 
        //loose the mouse
        canvas.onmouseup = function (event) {
 
            switch (event.button) {
                case 0:
                case 1:
                    dragging1 = false;
                    
                    break;
                case 2:
                    dragging2 = false;
                    break;
            }
 
        };
 
        //move mouse
        canvas.onmousemove = function (event) {
            var x = event.clientX, y = event.clientY;
 
            //rotate
            if ((dragging1  )) {
                var factor1 = 200 / canvas.height;//speed of rotate
                var dx1 = factor1 * (x - lastX);
                var dy1 = factor1 * (y - lastY);
 
                //confine the range of x
                currentAngle[0] = currentAngle[0] + dy1;//Math.max(Math.min(currentAngle[0] + dy1, 90), -90);
                currentAngle[1] = currentAngle[1] + dx1;
            }
 
            //translate
            if (dragging2) {
                var factor2 = 2 / canvas.height;//speed of move
                var dx2 = factor2 * (x - lastX);
                var dy2 = factor2 * (y - lastY);
 
                //confine the range of move
                tranx = Math.max(Math.min(tranx + dx2, 500), -500);
                trany = Math.max(Math.min(trany - dy2, 300), -300);
            }
 
            //update the position
            lastX = x;
            lastY = y;
        };
 
    }



