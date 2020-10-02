

	/** Class implementing 3D terrain. */
	class Terrain{   
	/**
	 * Initialize members of a Terrain object
	 * @param {number} div Number of triangles along x axis and y axis
	 * @param {number} minX Minimum X coordinate value
	 * @param {number} maxX Maximum X coordinate value
	 * @param {number} minY Minimum Y coordinate value
	 * @param {number} maxY Maximum Y coordinate value
	 */
		constructor(div,minX,maxX,minY,maxY){
			this.div = div;
			this.minX=minX;
			this.minY=minY;
			this.maxX=maxX;
			this.maxY=maxY;
			
			// Allocate vertex array
			this.vBuffer = [];
			
			// Allocate triangle array
			this.fBuffer = [];
			
			// Allocate normal array
			this.nBuffer = [];//(normals here)
			
			// Allocate array for edges so we can draw wireframe
			this.eBuffer = [];
			
			this.cBuffer = [];//color
			
			this.nvBuffer = [];//every vertex 's normal vector

			//New added:
			this.glyphBuffer = [];
			this.glyphColor = [];
			this.glyphNormal = [];

			this.cyverts = [];
			this.cynormals = []; 
			this.cycolors = []; 
			this.cyindicies = [];
	        this.nslices = 80;
	        this.nstacks = 100;	

			//////////////////////////////
			this.PI = 3.1415926536;
			this.dem = [];
			this.genTerrain();

			//////////////////////////////

			this.generateTriangles();
			 
			this.generateLines();
			
			this.generateNormals();

			//New added:
			// this.InitCylinder(80, 100, 0.1, 0.05);
			// 	 InitCylinder(nslices, nstacks, radius, height) 
			this.InitCylinder(80, 100, 1, 3*0.5-1.35);

			
			this.generateGlyph();

			this.generateColors();
			 
			this.printBuffers();			


			// Get extension for 4 byte integer indices for drwElements
			var ext = gl.getExtension('OES_element_index_uint');
			if (ext ==null){
				alert("OES_element_index_uint is unsupported by your browser and terrain generation cannot proceed.");
			}
		}
		
		/**
		* Set the x,y,z coords of a vertex at location(i,j)
		* @param {Object} v an an array of length 3 holding x,y,z coordinates
		* @param {number} i the ith row of vertices
		* @param {number} j the jth column of vertices
		*/
		setVertex(v,i,j)
		{
			//Your code here
			var vid = 3(i*(this.div +1 ) + j);
			
			this.vBuffer[vid] = v[0];
			this.vBuffer[vid+1] = v[1];
			this.vBuffer[vid+2] = v[2];	
		}
		
		/**
		* Return the x,y,z coordinates of a vertex at location (i,j)
		* @param {Object} v an an array of length 3 holding x,y,z coordinates
		* @param {number} i the ith row of vertices
		* @param {number} j the jth column of vertices
		*/
		getVertex(i,j)
		{
			//Your code here
			var v=[0,0,0];
			if ( i < 0  ||  j < 0 || i > this.div  || j > this.div  )
				return v;
			var vid = 3 * (i * (this.div +1) + j);
			if (vid < 0)
				return v;
			
			if (vid > 3* (1+this.div )*(1+ this.div))
				return v;
			v[0] = this.vBuffer[vid];
			v[1] = this.vBuffer[vid+1];
			v[2] = this.vBuffer[vid+2];	 
		 	//console.log(v);
			return v;
		}
 
	 
		/**
		* Send the buffer objects to WebGL for rendering 
		*/
		loadBuffers()
		{
			// Specify the vertex coordinates
			this.VertexPositionBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);      
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vBuffer), gl.STATIC_DRAW);
			this.VertexPositionBuffer.itemSize = 3;
			this.VertexPositionBuffer.numItems = this.numVertices;
			 
		
			// Specify normals to be able to do lighting calculations
			this.VertexNormalBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.nBuffer), gl.STATIC_DRAW);
			this.VertexNormalBuffer.itemSize = 3;
			this.VertexNormalBuffer.numItems = this.numVertices;
		 
		
			// Specify faces of the terrain 
			this.IndexTriBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.fBuffer),
					  gl.STATIC_DRAW);
			this.IndexTriBuffer.itemSize = 1;
			this.IndexTriBuffer.numItems = this.fBuffer.length;
			 
			
			//color
			this.VertexColorBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER,this.VertexColorBuffer);	
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cBuffer), gl.STATIC_DRAW);
			this.VertexColorBuffer.itemSize = 3;
			this.VertexColorBuffer.numItems = this.numVertices;
			 	
				
				
			//Setup Edges  
			this.IndexEdgeBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.eBuffer),gl.STATIC_DRAW);
			this.IndexEdgeBuffer.itemSize = 1;
			this.IndexEdgeBuffer.numItems = this.eBuffer.length;
			

			//New added: Setup glyphs
			this.glyphPositionBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.glyphPositionBuffer);      
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.glyphBuffer), gl.STATIC_DRAW);
			this.glyphPositionBuffer.itemSize = 3;
			this.glyphPositionBuffer.numItems = this.glyphBuffer.length /3;
			
			
			this.glyphColorBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.glyphColorBuffer);      
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.glyphColor), gl.STATIC_DRAW);
			this.glyphColorBuffer.itemSize = 3;
			this.glyphColorBuffer.numItems = this.glyphColor.length/3;		
						
			
			this.glyphNormalBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.glyphNormalBuffer);      
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.glyphNormal), gl.STATIC_DRAW);
			this.glyphNormalBuffer.itemSize = 3;
			this.glyphNormalBuffer.numItems = this.glyphNormal.length/3;
	

////////////// Added:	
	        this.vertex_buffer = gl.createBuffer();
	        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
	        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cyverts), gl.STATIC_DRAW);
	        this.vertex_buffer.itemSize = 3;
	        this.vertex_buffer.numItems = this.nslices * this.nstacks; 

	        this.index_buffer = gl.createBuffer();  
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer); 
	        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.cyindicies), gl.STATIC_DRAW);  
	        this.index_buffer.itemsize = 1;
	        this.index_buffer.numItems = (this.nstacks-1)*6*(this.nslices+1);

	        this.color_buffer = gl.createBuffer();
	        gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
	        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cycolors), gl.STATIC_DRAW);
	        this.color_buffer.itemSize = 4;
	        this.color_buffer.numItems = this.nslices * this.nstacks;

	        this.cylinderVertexNormalBuffer = gl.createBuffer();
	        gl.bindBuffer(gl.ARRAY_BUFFER, this.cylinderVertexNormalBuffer);
	        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cynormals), gl.STATIC_DRAW);
	        this.cylinderVertexNormalBuffer.itemSize = 3;
	        this.cylinderVertexNormalBuffer.numItems = this.nslices * this.nstacks; 
		}
		
		/**
		* Render the triangles 
		*/
/////////////// Added:
		drawCircle() {
			 
	         gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
	         gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false,0,0);

	         gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
	         gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 3, gl.FLOAT, false,0,0);

	         // Bind normal buffer
			gl.bindBuffer(gl.ARRAY_BUFFER, this.cylinderVertexNormalBuffer);
			gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.cylinderVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);   
		
			//Draw 
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
			gl.drawElements(gl.TRIANGLES, this.index_buffer.numItems, gl.UNSIGNED_SHORT,0);
// index_buffer
// cylinderVertexNormalBuffer


		}


		drawTriangles(){

			gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
			gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
							 
			gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexColorBuffer);
			gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, this.VertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
			// Bind normal buffer
			gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
			gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.VertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);   
		
			//Draw 
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
			gl.drawElements(gl.TRIANGLES, this.IndexTriBuffer.numItems, gl.UNSIGNED_INT,0);

		}
		

		/**
		* Render the triangle edges wireframe style 
		*/
		drawEdges(){
		
			gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
			gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexColorBuffer);
			gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, this.VertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
			
			// Bind normal buffer
			gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
			gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.VertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0); 
		 	
			//Draw 
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
			gl.drawElements(gl.LINES, this.IndexEdgeBuffer.numItems, gl.UNSIGNED_INT,0);   
		}

		//New added: draw glyphs !!!!!!!!!!!!!
		drawGlyph(){
		
			gl.bindBuffer(gl.ARRAY_BUFFER, this.glyphPositionBuffer);
			gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.glyphPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this.glyphColorBuffer);
			gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, this.glyphColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
			
			// Bind normal buffer
			gl.bindBuffer(gl.ARRAY_BUFFER, this.glyphNormalBuffer);
			gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.glyphNormalBuffer.itemSize, gl.FLOAT, false, 0, 0); 
		 	
			gl.drawArrays(gl.LINES, 0, this.glyphPositionBuffer.numItems);
		}		

	/**
	 * Fill the vertex and buffer arrays 
	 */    
/////
//Added: Cylinder:
InitCylinder(nslices, nstacks, radius, height) 
{
  var nvertices = this.nslices * this.nstacks;
    
  var Dangle = 2*Math.PI/(nslices-1); 

  for (var j =0; j<this.nstacks; j++)
    for (var i=0; i<this.nslices; i++) 
    {
      var idx = j*nslices + i;  
      var angle = Dangle * i; 
      //radius divide by 3 - decrease radius
      this.cyverts.push(Math.cos(angle)*radius); 
      this.cyverts.push(Math.sin(angle)*radius); 
      //height - multiply 3.0
      //position - substract 1.5
      this.cyverts.push(j*height/(nstacks-1));

      //  cyverts.push(Math.cos(angle)); 
      // cyverts.push(Math.sin(angle)); 
      // cyverts.push(j*3.0/(nstacks-1)-1.5);

      this.cynormals.push(Math.cos(angle)); 
      this.cynormals.push(Math.sin(angle));
      this.cynormals.push(0.0);

      // every vertex needs color
      this.cycolors.push(1); 
      this.cycolors.push(0.5); 
      this.cycolors.push(0.5); 
      this.cycolors.push(0.5); 
    }
  // now create the index array 
  for (j =0; j<this.nstacks-1; j++)
    for (i=0; i<=this.nslices; i++) {
      var mi = i % this.nslices;
      var mi2 = (i+1) % this.nslices;
      var idx = (j+1) * this.nslices + mi; 
      var idx2 = j*this.nslices + mi; // mesh[j][mi] 
      var idx3 = (j) * this.nslices + mi2;
      var idx4 = (j+1) * this.nslices + mi;
      var idx5 = (j) * this.nslices + mi2;
      var idx6 = (j+1) * this.nslices + mi2;
  
      this.cyindicies.push(idx); 
      this.cyindicies.push(idx2);
      this.cyindicies.push(idx3); 
      this.cyindicies.push(idx4);
      this.cyindicies.push(idx5); 
      this.cyindicies.push(idx6);
    }
}
    



	generateTriangles()
	{
		//Your code here
		var  deltaX = (this.maxX - this.minX) / this.div;
		var deltaY = (this.maxY - this.minY)  /this.div;

		// k=freq
		// 				constructor(size, grid_size, point_num, k, a, f_0, omega_0)
		// var gabor = new Gabor_Noise(this.div+1, 40, 16, 1, 0.06, 0.15, 0.7);

		for ( var i=0; i <= this.div; i++)
		{
			for (var j =0; j<= this.div; j++)
			{
				// console.log(i, j);
				this.vBuffer.push(this.minX + deltaX * j); //x 
				// this.vBuffer.push( 0.35 * Math.random());// Y 
				var x = this.minX + deltaX * j;
				var r = Math.random();
				// var ramVal = Math.abs(noise.perlin3(i/60, j/60, j/200,globalSeed));
				var ramVal = this.dem[i][j];
				// console.log(ramVal);
				// var ramVal = Math.abs(gabor.getNoise(i, j));

				this.vBuffer.push(1.7*ramVal);// Y 
				this.vBuffer.push(this.minY + deltaY * i); //z
				
				this.nBuffer.push(0);
				this.nBuffer.push(0);
				this.nBuffer.push(0);
				
				this.cBuffer.push(0);
				this.cBuffer.push(0);
				this.cBuffer.push(0);
			}
			
		}
		
	  	for ( var i =0; i< this.div; i++)
		{
			for (var j =0; j<  this.div;j++)
			{
				var c = (i ) * (this.div +1  ) + j;
			
				this.fBuffer.push(c);
				this.fBuffer.push(c + 1);
				this.fBuffer.push(c + this.div + 1);
				
		 
				this.fBuffer.push(c+1);
				this.fBuffer.push(c + 1 + this.div + 1);
				this.fBuffer.push(c+this.div + 1);
		 				
				//every vertex signify a cube
			}
		}
	 
		this.numVertices = this.vBuffer.length/3;
		this.numFaces = this.fBuffer.length/3;
	}
/////////////////////////////////////////////////////////////////////////////
	genTerrain()
	{
		var i; var j;

		for (i = 0; i < 601 ; i++) 
		{
			var temp = [];
			for (j = 0; j < 601 ; j++) 
			{
				temp.push(1);
			}
			this.dem.push(temp);
		}

		this.mkDataMap();
	}


	/* Random interger between [0 - 999] */
	MRand()	
	{	
		// var r = Math.floor(Math.random() * (999 - 0) ) + 0;
		var randInt = Math.random() * 32767;
		var r = Math.round(randInt % 1000);
	    return (r/1000.0 - 0.5);
	}

	normalize2()
	{
		var min = 1000.0; 
		var max = -1000.0;
		
		for (var i = 0; i < 601; ++i) {
			for (var j = 0; j < 601; ++j)
			{
				if (this.dem[i][j] < min) 
					min = this.dem[i][j];
				if (this.dem[i][j] > max) 
					max = this.dem[i][j];
			}
		}
		var range = max - min;
	
		for (var i = 0; i<601; ++i) {
			for (var j = 0; j<601; ++j) {
				this.dem[i][j] = (this.dem[i][j] - min) / range;	
			}	
		}
	}


	mkDataMap()
	{
		var lx = 0.5*(601 );
		var ly = 0.5*(601 );

		for (var k = 0; k < 300; k++)
		{
			var kx = Math.ceil(lx + this.MRand()*lx);
			var ky = Math.ceil(ly + this.MRand()*ly);
			var sz = 50.0 + this.MRand()*15.0;  // 16-32;

			// var r = (Math.random() * (1 - 0) ) + 0; //random [0-1]
			var r =Math.random();
			if (r < 0.5) { r = Math.floor(r) }
			else { r = Math.ceil(r) } 
			var sign = (2 * r % 2) - 1; 
			var angle = (this.MRand()+0.5)*360.0;

			this.gabor(kx, ky, angle, sz, 0.10*sz*sign+4, 0.3);
		}

		// for (var i=0; i<300; ++i)
		// 	for (var j=0; j<300; ++j) {
		// 		if (this.dem[i][j] < -5)
		// 			console.log(this.dem[i][j]);
		// 		}		 

		this.normalize2();
	}

	gabor(cx, cy, r, size, contrast, rat)
	{
		// console.log(this.dem);
		var TPATCH = Math.ceil(size*2);


	    var ccx = cx - Math.ceil(TPATCH/2);
	    var ccy = cy - Math.ceil(TPATCH/2);

	    var r = r*Math.PI/180.0;

	    var sinr = Math.sin(r);
	    var cosr = (-Math.cos(r));

	    var halfx = TPATCH/2.0;
	    var halfy = TPATCH/2.0;

	    var freq = 2.0*Math.PI/size;
	    var rat = 1.0/(rat*2.0*Math.PI);
	    var rat = -rat*rat;

    	for (var ix = 0; ix < TPATCH; ++ix) {

			for(var iy = 0; iy < TPATCH; ++iy)
			{
				var x = (ix-halfx)*freq;
				var y = (iy-halfy)*freq;
				/* rotate x and y */
				var gx = cosr*x + sinr*y;
				var gy = cosr*y  - sinr*x;
				var prod = (cosr*x + sinr*y);

				// console.log(prod);
				// console.log((contrast*Math.cos(prod)*Math.exp((gx*gx +gy*gy)*rat)));
				this.dem[ix + ccx][iy + ccy] = this.dem[ix + ccx][iy + ccy] + (contrast*Math.cos(prod)*Math.exp((gx*gx +gy*gy)*rat));
				// console.log(this.dem[ix + ccx][iy + ccy]);
				// console.log(ix + ccx, iy + ccy, this.dem[ix + ccx][iy + ccy] + (contrast*Math.cos(prod)*Math.exp((gx*gx +gy*gy)*rat)));
			}

		}
	}
/////////////////////////////////////////////////////////////////////////////






/////////////////////////////////////////////////////////////////////////////


	/**
	 * Print vertices and triangles to console for debugging
	 */
	printBuffers()
	{
		// console.log(this.vBuffer.length/3); //10201 
		// console.log(this.nBuffer.length/3); //10201 normal xyz
		// console.log(this.cyverts);
		// this.genTerrain()
		
		// console.log(this.dem);

	}

	/**
	 * Generates line values from faces in faceArray
	 * to enable wireframe rendering
	 */
	generateLines()
	{
		var numTris=this.fBuffer.length/3;

		// for(var f=0;f<numTris;f++)
		// {
			// var fid=f*3;
			// this.eBuffer.push(this.fBuffer[fid]);
			// this.eBuffer.push(this.fBuffer[fid+1]);
			
			// this.eBuffer.push(this.fBuffer[fid+1]);
			// this.eBuffer.push(this.fBuffer[fid+2]);
			
			//this.eBuffer.push(this.fBuffer[fid+2]);
			//this.eBuffer.push(this.fBuffer[fid]);
		// }
		
		
		for ( var i =0; i< this.div; i++)
		{
			for (var j =0; j< this.div; j++)
			{
				var c = (i) * (this.div + 1) + j;
												
				this.eBuffer.push(c);
				this.eBuffer.push(c + 1);
				
				this.eBuffer.push(c);
				this.eBuffer.push(c + this.div + 1);
					
				this.eBuffer.push(c + 1);
				this.eBuffer.push(c + 1 + this.div + 1);
				
				this.eBuffer.push(c + 1 + this.div + 1);
				this.eBuffer.push(c + this.div + 1);				
								
				//every vertex signify a cube
			}
		}	
	}

	//New added:
	// compare face normal with three vertex normals in a triangle,
	// return the 
	dot_product(vector1, vector2) {
	  var result = 0;
	  for (var i = 0; i < 3; i++) {
	    result += vector1[i] * vector2[i];
	  }
	  return result;
	}
	getMaxCosinVertex(p0,p1,p2,n0,n1,n2,p_face,n_face)
	{ 
		var vectorA = [n_face[0], n_face[1], n_face[2]];
		var lengthA = Math.sqrt(n_face[0]*n_face[0]+n_face[1]*n_face[1]+n_face[2]*n_face[2]);

		// (1) compare p_face with n0
		var vectorB0 = [n0[0], n0[1], n0[2]];
		var dot0 = this.dot_product(vectorA, vectorB0);
		var lengthB0 = Math.sqrt(n0[0]*n0[0]+n0[1]*n0[1]+n0[2]*n0[2]);
		var theta0 = Math.acos( dot0 / (lengthA * lengthB0) )
		// (2) compare p_face with n1
		var vectorB1 = [n1[0], n1[1], n1[2]];
		var dot1 = this.dot_product(vectorA, vectorB1);
		var lengthB1 = Math.sqrt(n1[0]*n1[0]+n1[1]*n1[1]+n1[2]*n1[2]);
		var theta1 = Math.acos( dot1 / (lengthA * lengthB1) )
		// (3) compare p_face with n2
		var vectorB2 = [n2[0], n2[1], n2[2]];
		var dot2 = this.dot_product(vectorA, vectorB2);
		var lengthB2 = Math.sqrt(n2[0]*n2[0]+n2[1]*n2[1]+n2[2]*n2[2]);
		var theta2 = Math.acos( dot2 / (lengthA * lengthB2) )

		// console.log(theta0,theta1,theta2);
		var rtVertex;
		if (theta0>theta1 && theta0>theta2) {
			rtVertex = p0; 
		}
		else if (theta1>theta0 && theta1>theta2) {
			rtVertex = p1; 
		}
		else if (theta2>theta0 && theta2>theta1) {
			rtVertex = p2; 
		}
		else {
			rtVertex = p0; 
		}		 
		return rtVertex
	}


	//New added:
	generateGlyph()
	{
	    for( var i=0; i<this.numFaces-2; i+=3)
	    {
	    	// console.log(this.numFaces);

			//get index, it's a triangle of 3 vertexs
	        var ia = this.fBuffer[3*i + 0];
	        var ib = this.fBuffer[3*i + 1];
	        var ic = this.fBuffer[3*i + 2];

			//every vertex and x,y,z components
			var p0=[];
			p0[0] = this.vBuffer[3*ia + 0];
			p0[1] = this.vBuffer[3*ia + 1];
			p0[2] = this.vBuffer[3*ia + 2];

			var p1 =[];
			p1[0] = this.vBuffer[3*ib + 0];
			p1[1] = this.vBuffer[3*ib + 1];
			p1[2] = this.vBuffer[3*ib + 2];

			var p2 =[];
			p2[0] = this.vBuffer[3*ic + 0];
			p2[1] = this.vBuffer[3*ic + 1];
			p2[2] = this.vBuffer[3*ic + 2];

			var v_face = []; 	// face middle vertex !!!!!!!!!!!!
			v_face[0] = (p0[0]+p1[0]+p2[0])/3;
			v_face[1] = (p0[1]+p1[1]+p2[1])/3;
			v_face[2] = (p0[2]+p1[2]+p2[2])/3;
			// console.log(v_face);

			// get normals of each vertex:
			var n0=[];
			n0[0] = this.nBuffer[3*ia + 0];
			n0[1] = this.nBuffer[3*ia + 1];
			n0[2] = this.nBuffer[3*ia + 2];

			var n1 =[];
			n1[0] = this.nBuffer[3*ib + 0];
			n1[1] = this.nBuffer[3*ib + 1];
			n1[2] = this.nBuffer[3*ib + 2];

			var n2 =[];
			n2[0] = this.nBuffer[3*ic + 0];
			n2[1] = this.nBuffer[3*ic + 1];
			n2[2] = this.nBuffer[3*ic + 2];
		////////////////////////////////////////////////////////////	
			 // var n_face =[];
			// n_face[0] = (n0[0]+n1[0]+n2[0])/3;
			// n_face[1] = (n0[1]+n1[1]+n2[1])/3;
			// n_face[2] = (n0[2]+n1[2]+n2[2])/3;
 		//////////////////////////////////////////////////
 
 
			var n_face = []; 	// face normal !!!!!!!!!!!!
			n_face[0] = (p1[1]-p0[1])*(p2[2]-p0[2])-(p2[1]-p0[1])*(p1[2]-p0[2]);
			n_face[1] = (p1[2]-p0[2])*(p2[0]-p0[0])-(p1[0]-p0[0])*(p2[2]-p0[2]);
			n_face[2] = (p1[0]-p0[0])*(p2[1]-p0[1])-(p2[0]-p0[0])*(p1[1]-p0[1]);

			// console.log(n_face);
			var maxVretex = this.getMaxCosinVertex(p0,p1,p2,n0,n1,n2,v_face,n_face);
			// console.log(maxVretex);
			
	    	
    		this.glyphBuffer.push(v_face[0]);
			this.glyphBuffer.push(v_face[1]);
			this.glyphBuffer.push(v_face[2]);

			this.glyphBuffer.push((maxVretex[0]+v_face[0])/2);
			this.glyphBuffer.push((maxVretex[1]+v_face[1])/2);
		    this.glyphBuffer.push((maxVretex[2]+v_face[2])/2);
			
			
			//////////////////////////////////////////
			// this.glyphBuffer.push((n_face[0]/5+v_face[0]));
		 	// this.glyphBuffer.push((n_face[1]/5+v_face[1]));
		 	// this.glyphBuffer.push((n_face[2]/5+v_face[2]));
			///////////////////////////////////////////////////////////
			
			this.glyphColor.push(1);
			this.glyphColor.push(0);
			this.glyphColor.push(0);
			
			this.glyphColor.push(1);
			this.glyphColor.push(0);
			this.glyphColor.push(0);
			
			this.glyphNormal.push(v_face[0]);
			this.glyphNormal.push(v_face[1]);
			this.glyphNormal.push(v_face[2]);
			this.glyphNormal.push(v_face[0]);
			this.glyphNormal.push(v_face[1]);
			this.glyphNormal.push(v_face[2]);

	    }
 
	}




	getNormal(p0,p1,p2)
	{
		var u=[],v=[];
		u[0] = p1[0]-p0[0];
		u[1] = p1[1]-p0[1];
		u[2] = p1[2]-p0[2];	
		  
			v[0] = p2[0] -p0[0];
			v[1] = p2[1] -p0[1];
			v[2] = p2[2] -p0[2];



	  var r = [ 
			u[1]*v[2] - u[2]*v[1],
			u[2]*v[0] - u[0]*v[2],
			u[0]*v[1] - u[1]*v[0]
		];
		
		u=null;
		 v =null;
	return r;
		
	}
		
		
 
	normalize(i,j,k)
	{
		var v=[0,0,0];
		var len = Math.sqrt(i*i+j*j+k*k);
 
		if(len ==0)
		{
			return v;
		}
		else
		{	
			v = [i / len, j / len, k/len];
		}
			return v;
	}

	generateNormals()
	{
	    for( var i=0; i<this.numFaces-2; i+=3)
	    {

			//get index, it;s a triangle of 3 vertexs
	        var ia = this.fBuffer[3*i + 0];
	        var ib = this.fBuffer[3*i + 1];
	        var ic = this.fBuffer[3*i + 2];
			//every vertex and x,y,z components
			var p0=[];
			p0[0] = this.vBuffer[3*ia + 0];
			p0[1] = this.vBuffer[3*ia + 1];
			p0[2] = this.vBuffer[3*ia + 2];

			var p1 =[];
			p1[0] = this.vBuffer[3*ib + 0];
			p1[1] = this.vBuffer[3*ib + 1];
			p1[2] = this.vBuffer[3*ib + 2];

			var p2 =[];
			p2[0] = this.vBuffer[3*ic + 0];
			p2[1] = this.vBuffer[3*ic + 1];
			p2[2] = this.vBuffer[3*ic + 2];

			//use three components to calculate the normal vector
	       var n = this.getNormal(p1,p0,p2);
			//three vertexs have the same normal vector, add them all
 			this.nBuffer[3*ia+0] += n[0];
 			this.nBuffer[3*ia+1] += n[1];
 			this.nBuffer[3*ia+2] += n[2];

			this.nBuffer[3*ib+0] += n[0];
 			this.nBuffer[3*ib+1] += n[1];
 			this.nBuffer[3*ib+2] += n[2];

 			this.nBuffer[3*ic+0] += n[0];
 			this.nBuffer[3*ic+1] += n[1];
 			this.nBuffer[3*ic+2] += n[2];
			//put every vertex involved
	    }

       for (var i =0; i< this.nBuffer.length-2;i+=3)
       {
       		//get the normal vector (v)
			var v = this.normalize(this.nBuffer[i],this.nBuffer[i+1],this.nBuffer[i+2]);
			this.nBuffer[i] = v[0];
			this.nBuffer[i+1] = v[1];
			this.nBuffer[i+2] = v[2];
       }

		// console.log("the normals: ", this.nBuffer); 
	}
		
 
	generateColors()
	{

		for(var i = 0;i < this.numVertices;i++)
		{
				this.cBuffer[3*i + 0]  = 0.94;
				this.cBuffer[3*i + 1]  = 0.94;
				this.cBuffer[3*i + 2]  = 0.94;
		}		
    }
	 
		
	 
	}






