
gui.overlay();
$$$();

tdtsth="";
if(window.state){
	try{
		tdtsth=JSON.stringify(state);
	}catch(e){
		tdtsth="";
	}
}

var cuLS=true;
try{
	window.localStorage;
}catch(e){
	cuLS=false;
	gui.msg("Cookies","LocalStorage use denied.\nEnable cookies if you wanna save filters, camera, and other unimportant stuff.\nThe important stuff is saved to the server :)");
}
originalState={stars:[],cities:[],resources:[],buildings:[],projects:[]};
originalLocalState={selectedStarIndex:-1,dev:false,blur:false,simple:false,filter:""};
try{
	state=window.state||(localStorage.une&&JSON.parse(localStorage.une))||originalState;
	localState=(localStorage.uneLocal&&JSON.parse(localStorage.uneLocal))||originalLocalState;
	for(var i in originalState)if(typeof state[i]=="undefined")state[i]=originalState[i];
	for(var i in originalLocalState)if(typeof localState[i]=="undefined")localState[i]=originalLocalState[i];
}catch(e){
	state=window.state||originalState;
	localState=originalLocalState;
}

setTimeout(function(){
	setInterval(save,100);
	// setInterval(function(){
	// 	save(true);
	// },1060);
},300);

function save(andUpload){
	localState.camera={
		theta: starmap.theta,
		radius: starmap.cameraRadiusTo,
	};
	var uneJSON = JSON.stringify(state);
	var uneLocalJSON = JSON.stringify(localState);
	try{
		localStorage.une=uneJSON;
		localStorage.uneLocal=uneLocalJSON;
	}catch(e){}
	if(andUpload && tdtsth!==uneJSON){
		post('save.py',tdtsth=uneJSON);
	}
}

//////////////////
/////////////////

var starmap = {
	init: function(){
	
		this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
		this.camera.position.set(0, 300, 500);
	
		this.scene = new THREE.Scene();
	
		this.hoverStar = null;
		this.selectedStar = null;
		this.stars = [];
		
		if(state!=originalState && state.stars && state.stars.length){
			try{
				if(typeof localState.dev !== "boolean"){
					throw "boolean state.dev === "+state.dev;
				}
				if(typeof localState.filter !== "string"){
					throw "localState.filter isnt string";
				}
				for (var i=0; i<state.stars.length; i++) {
					var s=state.stars[i];
					var particle = new THREE.Particle(new THREE.ParticleCanvasMaterial({ color: s.color, program: this.programNormal }));
					particle.position.x = s.x;
					particle.position.y = s.y;
					particle.position.z = s.z;
					particle.scale.x = particle.scale.y = s.scale;
					this.scene.add(particle);
			
					var star = {part:particle,name:s.name,planets:s.planets};
					/*for(var j=0; j<s.planets.length; j++){
						var planet={name:s.planets[j].name,ents:s.planets[j].ents};
						star.planets.push(planet);
					}*/
					this.stars.push(star);
					//backlink
					particle.star=star; 
					
					if(i===localState.selectedStarIndex){
						this.selectStar(star);
						this.cameraX = this.cameraXto;
						this.cameraY = this.cameraYto;
						this.cameraZ = this.cameraZto;
					}
				}
				if((localState.camera && localState.camera.theta)){
					this.theta = localState.camera.theta;
					this.cameraRadiusTo = this.cameraRadius = localState.camera.radius;
				}
			}catch(e){
				gui.err(e);
				gui.yn("Savestate incomplete!","Would you like to reset the savestate?",function(doReset){
					if(doReset){
						state=originalState;
						localState=originalLocalState;
						gui.yn("Devmode","Would you like to [re]enable devmode?",function(dev){
							if(dev){
								localState.dev=true;
							}
							save(true);
							history.go(0);
						});
					}
				});
			}
		}else{
			for (var i = 0; i < 100; i ++) {
				var c=Math.random() * 0x808080 + 0x808080;
				var particle = new THREE.Particle(new THREE.ParticleCanvasMaterial({ color: c, program: this.programNormal }));
				particle.position.x = Math.random() * 800 - 400;
				particle.position.y = Math.random() * 800 - 400;
				particle.position.z = Math.random() * 800 - 400;
				particle.scale.x = particle.scale.y = Math.random() * 10 + 10;
				this.scene.add(particle);
		
				var star = {part:particle,name:randomName(),planets:[]};
				/*for("Hurr";Math.random()>0.9;"Durr"){
					var planet={name:randomName(),ents:[]};
					star.planets.push(planet);
					
					//var c2=Math.random() * 0x808080 + 0x808080;
					var p = new THREE.Particle(new THREE.ParticleCanvasMaterial({ color: c, program: this.programNormal }));
					p.position.x = Math.random() * 800 - 400;
					p.position.y = Math.random() * 800 - 400;
					p.position.z = Math.random() * 800 - 400;
					p.scale.x = p.scale.y = Math.random() * 10 + 10;
					this.scene.add(p);
				}*/
				this.stars.push(star);
				state.stars.push({	x:particle.position.x,
									y:particle.position.y,
									z:particle.position.z,
									scale:particle.scale.x,
									color:c,
									name:star.name,
									planets:star.planets	});
				//backlink
				particle.star=star;
			}
		}
	
		this.projector = new THREE.Projector();
	
		this.renderer = new THREE.CanvasRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	
		$starmap.appendChild(this.renderer.domElement);
		
		if(localState.dev){
			this.stats = new Stats();
			var m=new Modal();
			m.title("Stats");
			m.$m.appendChild(this.stats.domElement);
			m.$t.style.fontSize=9+"px";
			m.className="lil";
			m.position("bottom left");
		}
		
		addEventListener('mousemove', this.onMouseMove, false);
		gui.element.addEventListener("mousemove",function(){starmap.mouse.overGUI=true;},false);
		$starmap.addEventListener('mousemove', function(){starmap.mouse.overGUI=false;}, false);
		$starmap.addEventListener('mousewheel', this.onMouseWheel, false);
		$starmap.addEventListener('DOMMouseScroll', this.onMouseWheel, false);
		$starmap.addEventListener('click', this.onClick, false);
		$starmap.addEventListener('mousedown', this.onMouseDown, false);
		addEventListener('mousedown', this.onMiddleMouseDown, false);
		addEventListener('mouseup', this.onMouseUp, false);
		addEventListener('contextmenu', prevent, false );
		addEventListener('resize', this.onResize, false);
	},
	
	animate: function() {
		starmap.draw();
		starmap.stats&&starmap.stats.update();
		requestAnimationFrame(starmap.animate,starmap);
	},
	
	draw: function() {
		this.renderer.domElement.getContext("2d").clearRect(0,0,2000,2000);
		
		if(this.mouse.d && this.mouse.x!=-1){
			this.theta.x -= (this.mouse.x-this.mouse.xp)*50;
			this.theta.y += (this.mouse.y-this.mouse.yp)*50;
		}
		this.mouse.xp = this.mouse.x;
		this.mouse.yp = this.mouse.y;
		
		this.cameraX += (this.cameraXto-this.cameraX)/10;
		this.cameraY += (this.cameraYto-this.cameraY)/10;
		this.cameraZ += (this.cameraZto-this.cameraZ)/10;
		this.cameraRadius += (this.cameraRadiusTo-this.cameraRadius)/10;
		// rotate camera
		if(this.rotating){
			this.theta.x += 0.1;
			this.theta.y += 0.1;
		}else{
			//this.theta *= 0.9;
			//this.theta.x += 5;
			//this.theta.y += 5;
		}
		var r=2200-Math.sqrt(this.cameraRadius)*50;
		this.camera.position.x = this.cameraX + r * Math.sin(THREE.Math.degToRad(this.theta.x));
		this.camera.position.y = this.cameraY + r * Math.sin(THREE.Math.degToRad(this.theta.y));
		this.camera.position.z = this.cameraZ + r * Math.cos(THREE.Math.degToRad(this.theta.x));
		this.camera.lookAt(new THREE.Vector3(this.cameraX,this.cameraY,this.cameraZ));
		
		
		// find intersections
		this.camera.updateMatrixWorld();
		
		if(this.mouse.overGUI){
			if(this.hoverStar) if(this.hoverStar!=this.selectedStar) this.hoverStar.part.material.program = this.programNormal;
		}else{
			var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
			this.projector.unprojectVector(vector, this.camera);
			var raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());
			var intersects = raycaster.intersectObjects(this.scene.children);
		
			if(intersects.length > 0) {
				//if(this.i != intersects[0].object) {
					if(this.i) if(this.i.star!=this.selectedStar) this.i.material.program = this.programNormal;
					this.i = intersects[0].object;
					if(this.i.star){
						if(this.i.star!=this.selectedStar)
							this.i.material.program = this.programHover;
						this.i.star.hover=true;
						this.hoverStar = this.i.star;
					}
				//}
			} else {
				if(this.i) {
					if(this.i.star!=this.selectedStar)
						this.i.material.program = this.programNormal;
					this.i.star.hover=false;
				}
				this.i = null;
				this.hoverStar = null;
			}
		}
	
		this.renderer.render(this.scene, this.camera);
	
	},
	selectStar: function(s){
		if(starmap.selectedStar){
			starmap.selectedStar.part.material.program = starmap.programNormal;
		}
		//console.log("Selected: ",s.name);
		localState.selectedStarIndex = starmap.stars.indexOf(s);
		starmap.selectedStar = s;
		starmap.cameraXto = s.part.position.x;
		starmap.cameraYto = s.part.position.y;
		starmap.cameraZto = s.part.position.z;
		starmap.rotating = false;
		s.part.material.program = starmap.programSelected;
	},

	onResize: function(e) {
		starmap.camera.aspect = window.innerWidth / window.innerHeight;
		starmap.camera.updateProjectionMatrix();
		starmap.renderer.setSize(window.innerWidth, window.innerHeight);
	},
	onMouseWheel: function(e) {
		var delta = ((-e.detail)||(e.wheelDelta)||(console.error("#error"))<0);
		starmap.cameraRadiusTo = Math.min(1700,Math.max(10,starmap.cameraRadiusTo+delta));
	},
	onMouseMove: function(e) {
		starmap.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
		starmap.mouse.y = 1 - (e.clientY / window.innerHeight) * 2;
	},
	onClick: function(e){
		if(e.button!==0)return;
		var s=starmap.hoverStar;
		if(s){
			starmap.selectStar(s);
		}
	},
	onMouseDown: function(e){
		if(e.button===0)return;
		starmap.mouse.d = true;
	},
	onMiddleMouseDown: function(e){
		if(e.button===1)
			starmap.mouse.d = true;
	},
	onMouseUp: function(e){
		starmap.mouse.d = false;
	},

	cameraRadius: 600, cameraRadiusTo: 600,
	cameraX: 0, cameraXto: 0,
	cameraY: 0, cameraYto: 0,
	cameraZ: 0, cameraZto: 0,
	rotating: true,
	
	theta: { x: 0, y: 0 },
	i: null,
	mouse: { x: 0, y: 0, xp: 0, yp: 0, d: 0, overGUI: false },
	programNormal: function (context) {
		context.beginPath();
		context.arc(0, 0, 1, 0, Math.PI * 2, true);
		context.closePath();
		context.fill();
	},
	programHover: function (context) {
		context.beginPath();
		context.arc(0, 0, 1, 0, Math.PI * 2, true);
		context.closePath();
		context.fill();
		
		//context.strokeStyle = ;
		/*context.lineWidth = 0.1;
		context.beginPath();
		context.arc(0, 0, 1.3, 0, Math.PI * 2, true);
		context.arc(0, 0, 0.3, 0, Math.PI * 2, true);
		//ontext.arc(0, 0, 0.85, 0, Math.PI * 1, false);
		context.closePath();
		context.stroke();*/
		/*context.beginPath();
		context.arc(0, 0, 0.85,Math.PI * 1.7,  Math.PI * 1.4, true);
		context.closePath();
		context.stroke();*/
		context.strokeStyle = "rgba(255,255,255,0.5)";
		context.lineWidth = 0.3;
		context.beginPath();
		context.arc(0, 0, 1.3, 0, Math.PI * 2, true);
		context.arc(0, 0, 0.3, 0, Math.PI * 2, true);
		//ontext.arc(0, 0, 0.85, 0, Math.PI * 1, false);
		context.closePath();
		context.stroke();
	},
	programSelected: function (context) {
		context.beginPath();
		context.arc(0, 0, 1, 0, Math.PI * 2, true);
		context.closePath();
		context.fill();
		
		context.globalAlpha = 0.5;
		context.lineWidth = 0.3;
		context.beginPath();
		context.arc(0, 0, 1.3, 0, Math.PI * 2, true);
		context.closePath();
		context.stroke();
	},
};

starmap.init();
starmap.animate();
/*
var Entity = {
	init: function(){},
	type: "factory",
	name: "spaceship factory",
	production: [
		{itTakes:[{amt:50,of:"metal"}],toMake:{name:"shitty spaceship"}},
		{itTakes:[{amt:500,of:"metal"},{amt:200,of:"awesome"}],toMake:{name:"non-shitty spaceship"}},
	]
};

	Greetings! I hail from the planet earth! I come in peace! I bring good tidings! You have nothing to fear! 
	
	This is an important message from the united planet earth. We humbly request that you refrain from entering this sector. Thank you for your cooperation and resistance is futile anyways, so, you know.

*/

function openDefineBuildingModal(){
	var m=new Modal();
	m.position("center");
	m.title("Defining a building");
	m.content("<div style='padding-todp:5px'>"
			+ "<label>Name: <input type='text' class='name'/></label><br>"
			+ "<label>Description: <br><textarea class='description'></textarea></label><br>"
			+ "<label>Construction time: <input type=number value=100 min=0 max=9999 class='construction-time'/>ø </label><br>"
			+ "<label>Construction cost: &lt;editable list of amounts of various resources&gt;</label><br>"
			+ "<label>Project Slots: </label><br>"
			+ "<label>Research Project Slots: </label><br>"
			+ "<label>Operation Cost per 100ø: &lt;editable list of amounts of various resources&gt;<br>"
			+ "<label>Attributes (ask jadon about this)<br></div><button class='done'>Create</button>");
			//⌀øØ∅@O0oⱺօ˳
	//m.$c.style.padding="5px";
	m.$(".done").onclick=function(){
		var buildingType={
			name: m.$(".name").value,
			description: m.$(".description").value,
			constructionTime: Number(m.$(".construction-time").value),
			//constructionCost: m.$(".construction-cost").valueses,
			
		};
		m.content(JSON.stringify(buildingType));
	};
}

var openCityModals=[];
function openCityModal(city){
	//for(var i in openCityModals)if(openCityModals[i])
	var g=32+6;
	//console.log(city);
	openBuildingsModal();
	var mCity=new Modal();
	mCity.position("center");
	mCity.title("City View: "+city.name);
	mCity.content("<div class='city'><table class='citytable'></table></div><br>"
			+ "<button class='destroy-city'>Destroy City</button>"
			+ "<button class='rename-city'>Rename City</button>"
			+ "<button class='create-project'>Create Project</button>");
	//mCity.$m.style.padding="5px";
	var $t=mCity.$(".citytable");
	mCity.$(".destroy-city").onclick=function(){
		gui.yn("Confirmation","Are you sure you want to destroy this city?",function(){
			mCity.close();
			state.cities.splice(state.cities.indexOf(city),1);
			updateCitiesModal();
		});
	};
	mCity.$(".rename-city").onclick=function(){
		gui.prompt("Rename city:",city.name,function(newName){
			city.name=newName;
			mCity.title("City View: "+city.name);
			updateCitiesModal();
		});
	};
	mCity.$(".create-project").onclick=function(){
		newProject(city);
	};
	
	for(var y=0; y<city.height; y++){
		var $tr=document.createElement("tr");
		for(var x=0; x<city.width; x++){
			var $td=E("td");
			$td.className="cityblock";
			$td.innerText=x+"x"+y;
			$td.ondragover=dragOverBlock;
			$td.ondragenter=dragOverBlock;
			$td.ondrop=dropOverBlock;
			$tr.appendChild($td);
		}
		$t.appendChild($tr);
	}
	var $c=mCity.$(".citytable");
	$c.style.position="relative";
	for(i in city.buildings){
		var b=city.buildings[i];
		var $b=E("div");
		$b.className="citybuilding";
		$b.style.position="absolute";
		$b.style.left=(2+b.x*g)+"px";
		$b.style.top=(2+b.y*g)+"px";
		$b.style.width=(b.w*g-4)+"px";
		$b.style.height=(b.h*g-4)+"px";
		$b.style.backgroundColor=b.c;
		$b.draggable=true;
		$b.ondragstart=(function(b,$b){return function(e){
			window.draggingBuilding=b;
			window.$draggingBuilding=$b;
			window.draggingFromCity=city;
			//window.$draggingFromCity=$c;
			e.dataTransfer.effectAllowed = "move";
			setTimeout(function(){
				$b.style.opacity=0.9;
				$b.style.pointerEvents="none";
			},1);
		};})(b,$b);
		$b.ondragend=(function(b,$b){return function(e){
			window.draggingBuilding=null;
			window.$draggingBuilding=null;
			window.draggingFromCity=null;
			//window.$draggingFromCity=null;
			//$b.style.left=(2+x*g)+"px";
			//$b.style.top=(2+y*g)+"px";
			$b.style.opacity=1;
			$b.style.pointerEvents="all";
			//$ghost.style.opacity=0;
		};})(b,$b);
		$c.appendChild($b);
	}
	/*var $ghost=document.createElement("div");
	$ghost.className="citybuilding ghost";
	$ghost.style.position="absolute";
	$ghost.style.opacity=0;
	$ghost.style.pointerEvents="none";
	$c.appendChild($ghost);*/
	function dragOverBlock(e){
		//console.log();
		var xy=e.target.innerText.split("x"),x=Number(xy[0]),y=Number(xy[1]);
		if(window.draggingBuilding){
			var b=window.draggingBuilding;
			var $b=window.$draggingBuilding;
			var c=window.draggingFromCity;
			//var $c=window.$draggingFromCity;
			var bx=b.x,by=b.y;
			b.x=x; b.y=y;
			if(canPlaceBuilding(city,b)){
				if(city!==c){
					$c.appendChild($b);
					c.buildings.splice(c.buildings.indexOf(c),1);
					window.draggingFromCity=city;
					city.buildings.push(b);
					console.log("ONCE");
				}
				$b.style.left=(2+x*g)+"px";
				$b.style.top=(2+y*g)+"px";
				$b.style.width=(b.w*g-4)+"px";
				$b.style.height=(b.h*g-4)+"px";
				$b.style.opacity=0.8;
				$b.style.backgroundColor=b.c;
				e.preventDefault();
				return false;
			}else{
				b.x=bx;
				b.y=by;
			}
		}else{
			console.log("hey");
		}
	}
	function dropOverBlock(e){
		var xy=e.target.innerText.split("x"),x=xy[0],y=xy[1];
		if(window.draggingBuilding){
			var b=window.draggingBuilding;
			var $b=window.$draggingBuilding;
			if(canPlaceBuilding(city,b)){
				$b.style.left=(2+x*g)+"px";
				$b.style.top=(2+y*g)+"px";
				$b.style.opacity=1;
				//$ghost.style.opacity=0;
			}
		}else{
			console.log("hey");
		}
	}
}
var mBuildings=null;
function openBuildingsModal(){
	if(mBuildings){
		mBuildings.position("bounds");
	}else{
		mBuildings=new Modal();
		mBuildings.position("top right");
		mBuildings.title("Buildings (List)");
		mBuildings.content("<div class='buildings list'></div>"
				+ "<button class=opendefinebuilding>Define New Building</button>");
		//mBuildings.$m.style.padding="5px";
		mBuildings.$(".opendefinebuilding").onclick=openDefineBuildingModal;
	}
}
/*
var mProjects=null;
function openProjectsModal(){
	if(mProjects){
		mProjects.position("bounds");
	}else{
		mProjects=new Modal();
		mProjects.position("bottom right");
		mProjects.title("Projects (List)");
		mProjects.content("<div class='projects list'></div>"
				+ "<button class=newproject>New Project</button>");
		//mProjects.$m.style.padding="5px";
		mProjects.$(".newproject").onclick=newProject;
	}
}*/

var mCities=null;
function openCitiesModal(){
	if(mCities){
		mCities.position("bounds");
	}else{
		mCities=new Modal();
		mCities.position("center right");
		mCities.title("Cities (List)");
		mCities.content( "<div class='cities list'></div>"
						+"<button class=newcity>New City</button>");
		//mCities.$m.style.padding="5px";
		mCities.$(".newcity").onclick=function(){
			var city=newCity();
			state.cities.push(city);
			addCity(city);
		};
	}
	updateCitiesModal();
}
function addCity(city){
	var $li=E("div");
	$li.innerText=city.name;
	$li.onclick=function(){
		openCityModal(city);
	};
	mCities.$(".cities").appendChild($li);
	mCities.position("bounds");
}
function updateCitiesModal(){
	var $cities=mCities.$(".cities");
	while($cities.firstChild)$cities.removeChild($cities.firstChild);
	for(var i=0;i<state.cities.length;i++){
		addCity(state.cities[i]);
	}
}
var mSettings=null;
function openSettingsModal(){
	if(mSettings){
		mSettings.position("bounds");
	}else{
		mSettings=new Modal();
		mSettings.position("bottom");
		mSettings.title("Settings");
		mSettings.content(""
				+ "<label><input type=checkbox id='blur'/>Blur Starmap</label>"
				+ "<br><label><input type=checkbox id='simple'/>Simple mode</label>"
				+ "<br><button id='filters'>Filters</button>"
				+ "<button id='test'>Resources</button>"
				+ "<button id='test'>Buildings</button>"
				+ "<button id='test'>Cities</button>"
				+ "<button id='projects'>Projects</button>"
				+ "<br><button id='test'>Players</button>"
				+ "<button id='test'>Stats</button>"
				+ "<button id='test'>Skills</button>"
				+ "<button id='test'>Diplomacy</button>"
				+ "<button id='test'>Tactics</button>"
				+ "<br><button id='test'>About</button>"
				+ "<button id='test'>Help</button>"
				+ "<button id='test'>Facebook</button>"
				+ "<button id='test'>Twitter</button>"
				+ "<button id='test'>Google+</button>");
		//mSettings.$m.style.padding="5px";
		//
		mSettings.$("#blur").checked=!!localState.blur;
		mSettings.$("#blur").onclick=function(){
			$starmap.className=this.checked?"blur":"";
			localState.blur=this.checked;
		};
		//
		mSettings.$("#simple").checked=!!localState.simple;
		mSettings.$("#simple").onclick=function(){
			$body.className=this.checked?"simple":"";
			localState.simple=this.checked;
		};
		//
		mSettings.$("#test").onclick=function(){
			gui.msg("Testing","testing <input type=number value='123'/>");
			mSettings.$("#test").onclick=function(){
				history.go(0);
			};
		};
		//
		mSettings.$("#filters").onclick=function(){
			openFiltersModal();
		};
		/*mSettings.$("#projects").onclick=function(){
			openProjectsModal();
		};*/
	}
}

filtersModals=[];
function openFiltersModal(){
	var l=filtersModals.length;
	for(i in filtersModals)filtersModals[i].close();
	filtersModals=[];
	if(l>1)return;
	var mList=new Modal().title("Available Filters");
	mList.position("top left");
	mList.content("<div class='available-filters'></div>");
	var mFilters=new Modal().title("Filters");
	mFilters.position(200,10);
	mFilters.content("<div class='filters'><div class='placeholder'>Drag filters here.</div></div><div><button class='clear'>Clear</button></div>");
	mFilters.$(".clear").onclick=function(){
		while($fs.firstChild)$fs.removeChild($fs.firstChild);
		updateFilter();
	};
	filtersModals.push(mFilters);
	filtersModals.push(mList);
	
	var filterStrings="hue-rotate(deg) grayscale(%) sepia(%) brightness(%+) saturate(%+) contrast(n) invert() blur(px)".split(" ");
	//var filters=[];
	var $afs=mList.$(".available-filters");
	var $fs=mFilters.$(".filters");
	var namesTo$s={};
	for(var i=0; i<filterStrings.length; i++){
		var s=filterStrings[i];
		var args=s.match(/\(.*\)/)[0];
		var $f=E("div");
		$f.className="filter";
		$f.draggable=true;
		$f.ondragstart=dragstart;
		if($f.children[0])$f.children[0].onchange=updateFilter;
		switch(args){
			case "()": $f.innerHTML=s; break;
			case "(n)": $f.innerHTML=s.replace(/\(.*\)/,"(<input type=number min=0 value=2 step=0.1 class='farg'>)"); break;
			case "(%)": $f.innerHTML=s.replace(/\(.*\)/,"(<input type=number min=0 max=100 value=100 step=10 class='farg'>%)"); break;
			case "(%+)": $f.innerHTML=s.replace(/\(.*\)/,"(<input type=number min=0 value=100 step=10 class='farg'>%)"); break;
			case "(deg)": $f.innerHTML=s.replace(/\(.*\)/,"(<input type='number' min='-360' max='360' value='180' step='10' class='farg'>deg)"); break;
			case "(px)": $f.innerHTML=s.replace(/\(.*\)/,"(<input type='number' min='0' max='400' value='3' step='1' class='farg'>px)"); break;
		}
		$afs.appendChild($f);
		namesTo$s[s.match(/[\-a-z]+/)[0]]=$f;
		//filters.push(f);
	} 
	var filterStrings=localState.filter.replace(/\s+/," ").split(" ");
	if(filterStrings.length && filterStrings[0]!=""){
		var $p=mFilters.$(".placeholder");
		if($p)$fs.removeChild($p);
		for(var i=0; i<filterStrings.length; i++){
			var s=filterStrings[i];
			var $f=namesTo$s[s.match(/[\-a-z]+/)[0]];
			/*if(!$f){
				console.log("$f=",$f);
				console.log("s=",s);
				continue;
			}*/
			var v=s.match(/\(([^\)]*)\)/),val="0";
			if(v && v.length){
				val=(v[1]).replace(/%\+?|px|deg|n/,"");
			}else{
				console.error("no end paren )))))!");
			}
			//console.log(s,val);
			$f=$f.cloneNode(true);
			if($f.children[0]){
				$f.children[0].onchange=updateFilter;
				$f.children[0].onkeypress=updateFilter;
				$f.children[0].value=val;
			}
			//$f.ondragstart=dragstart2;
			var $x=E("span");
			$x.className="close-x";
			//$x.innerText=$x.textContent="×";
			$x.onclick=(function($f){return function(e){
				if(e.button!==0)return;
				$f.removeChild(this);
				$fs.removeChild($f);
				updateFilter();
			}})($f);
			$f.appendChild($x);
			$f.draggable=false;
			$f.onmousedown=dragstart2;
			$fs.appendChild($f);
		}
	}
	mFilters.$m.ondragover=mFilters.$m.ondragenter=function(e){
		e.preventDefault();
		return false;
	};
	mFilters.$m.ondrop=function(e){
		var $p=mFilters.$(".placeholder");
		if($p)$fs.removeChild($p);
		var $f=window.dragging||console.error("($fs.ondrop) !window.dragging");window.dragging=null;
		$f=$f.cloneNode(true);
		if($f.children[0]){
			$f.children[0].onchange=updateFilter;
			$f.children[0].onkeypress=updateFilter;
		}
		$f.draggable=false;
		$f.onmousedown=dragstart2;
		var $x=E("span");
		$x.className="close-x";
		//$x.innerText=$x.textContent="×";
		$x.onclick=(function($f){return function(e){
			if(e.button!==0)return;
			$f.removeChild(this);
			$fs.removeChild($f);
			updateFilter();
		}})($f);
		$f.appendChild($x);
		$fs.appendChild($f);
		updateFilter();
	};
	function updateFilter(){
		var filter="";
		for(var i=0; i<$fs.children.length; i++){
			var $f=$fs.children[i];
			//console.log($f.innerHTML);
			var f=$f.innerHTML.replace(/<input[^>]+>/,$f.children[0]&&$f.children[0].value);
			filter+=" "+f;
			//filter += $f.innerText;
		}
		filter=filter.trim().replace(/<span class="close-x"><\/span>/g,"");
		$doc.style.filter=$doc.style.webkitFilter=filter;
		localState.filter=filter;
	}
	function dragstart(){
		window.dragging=this;
	}
	function dragstart2(e){
		return;
		window.dragging2=this;
		window.dragging2yoff=e.clientY;
		this.style.position="absolute";
		this.style.left="0";
		this.style.right="0";
	}
	addEventListener("mousemove",function(e){
		var $f=window.dragging2;
		if($f){
			$f.style.top=(e.clientY-dragging2yoff)+"px";
			if($f.nextSibling){
				if($f.clientY > $f.nextSibling.clientY-30){
					$fs.insertBefore($f,$f.nextSibling);
				}
			}
			if($f.previousSibling){
				//same thing
			}
		}
	},false);
	addEventListener("mouseup",function(){
		
		window.dragging2=null;
	},false);
}

if(typeof localState.filter!=="string")localState.filter="";
$doc.style.transition="none";
$doc.style.webkitTransition="none";
$doc.style.filter=localState.filter;
$doc.style.webkitFilter=localState.filter;
$doc.style.transition="filter 1s ease";
$doc.style.webkitTransition="filter 1s ease";

var mConsole=null;
function openConsole(){
	if(mConsole){
		mConsole.position("bounds");
	}else{
		mConsole=new Modal();
		mConsole.position("center");
		mConsole.resizable();
		mConsole.title("Console");
		mConsole.content("<div class='log' style='overflow:auto;max-height:300px;min-height:50px;'></div>"
				+ "<input class=cmd type=text/>");
		//mConsole.$m.style.padding="5px";
		mConsole.$m.onclick=function(){
			mConsole.$(".cmd").focus();
		};
		//autocomplete="";
		mConsole.$(".cmd").onkeypress=function(e){
			if(e.keyCode===13){
				clog(this.value);
				var str="?", rets="  ";
				try{
					var ev=eval(this.value);
					if(ev===undefined)str="undefined";
					str=ev.toString();
				}catch(e){
					str="X "+e;
				}
				var $entry=clog("⤷ "+str);
				this.value="";
			}else{
				///autocomplete:
				var that=this;
				setTimeout(function(){
					var m=that.value.match(/.*?([\w_$]+(?:\.[\w_$]+|\[[^\]]+\])*\.?)$/);
					if(!m)return false;
					var acstr=m[1];
					acstr=acstr.replace(/\[["']?/g,".").replace(/["']?\]/g,""),ac="",o=window,a=acstr.split("."),r=new RegExp("^"+a[a.length-1]);
					for(i=0;i<a.length-1;i++){o=o[a[i]];}
					for(i in o){if(i.match(r)){ac=i;}}
					
					if(ac!==""){
						clog("[tab] "+ac);
					}
					console.log(m,acstr);
				},1);
			}
		};
		mConsole.$(".cmd").onkeydown=function(e){
			if(e.keyCode===9){
				e.preventDefault();
				console.log("!!!!");
				///autocomplete:
				var m=this.value.match(/.*?([\w_$]+(?:\.[\w_$]+|\[[^\]]+\])*\.?)$/);
				if(!m)return false;
				var acstr=m[1];
				acstr=acstr.replace(/\[["']?/g,".").replace(/["']?\]/g,""),ac="",o=window,a=acstr.split("."),r=new RegExp("^"+a[a.length-1]);
				for(i=0;i<a.length-1;i++){o=o[a[i]];}
				for(i in o){if(i.match(r)){ac=i;}}
				
				var m=this.value.match(/(\.|^)?[\w_$]+$/);
				if(!m)m=[""];m=m[0].replace(/^\./,"");
				console.log(ac,m,ac.replace(m,""));
				this.value+=ac.replace(m,"");
			}
		};
	}
}
function clog(str){
	var $l=E("div");
	if(str)
		$l.innerText=$l.textContent=str;
	mConsole.$(".log").appendChild($l);
	return $l;
}
///

function newCity(){
	var w=10, h=8;
	var city={name:randomName(),buildings:[],width:w,height:h};
	
	for(var _=0;_<15;_++){
		var c=randomCSSColor();
		var b={type:null,x:irandom(w),y:irandom(h),w:irandom(1)+1,h:irandom(1)+1,c:c,acr:/[a-z]([A-Z][a-z])?/.generate()};
		if(canPlaceBuilding(city, b)){
			city.buildings.push(b);
		}
	}
	
	openCityModal(city);
	return city;
}
function newProject(city){
	var project={};
	
	var mProject=new Modal();
	mProject.title("New Project in "+city.name);
	mProject.content("some stuff here"
		+ "<br><button class='finish'>Create</button>");
	mProject.position("center");
	mProject.$(".finish").onclick=function(){
		gui.msg("Missing Functionality","obvs");
		mProject.close();
	};
}
function canPlaceBuilding(city, building){
	var b=building;
	//console.log(city, building);
	if((b.x+b.w>city.width || b.y+b.h>city.height))return false;
	for(var i in city.buildings){
		var b2=city.buildings[i];
		if(b2===b)continue;
		//if((b.x+b.w>b2.x && b2.x+b2.w>=b.x))return false;
		//if((b.y+b.h>b2.y && b2.y+b2.h>=b.y))return false;
	}
	return true;
}

/////

openBuildingsModal();
openCitiesModal();
//openProjectsModal();
openSettingsModal();
if(localState.dev){
	openConsole();
}else{
	mSettings.position("bottom left");
}

$body.style.transition="none";
$body.style.webkitTransition="none";
$starmap.style.transition="none";
$starmap.style.webkitTransition="none";

$body.className=localState.simple?"simple":"";
$starmap.className=localState.blur?"blur":"";

setTimeout(function(){
	$body.style.transition="all 1s ease";
	$body.style.webkitTransition="all 1s ease";
	$starmap.style.transition="all 1s ease";
	$starmap.style.webkitTransition="all 1s ease";
},100);

for(var i=0; i<gui.modals.length; i++){
	gui.modals[i].finishAnimating();
}

//////

document.addEventListener("keydown",function(e){
	if(e.keyCode===192){
		gui.yn("Devmode","Would you like to "+(localState.dev?"dis":"en")+"able devmode?",function(doReset){
			if(doReset){
				localState.dev=!localState.dev;
				save();
				history.go(0);
			}
		});
	}else{
		window.kkkkeys=window.kkkkeys||{};
		window.kkkkeys[e.charCode]=e.keyCode;
		console.log(e.keyCode);
	}
},false);
//////////////////////

function choose(a){
	if(!(a instanceof Array) && (typeof a!="string" || arguments.length>1)) 
		a=Array.prototype.slice.call(arguments);
	return a[Math.floor(Math.random()*a.length)];
}
function chooseKeyFromObject(o){
	var a=[],i;for(i in o)if(o.hasOwnProperty(i))a.push(i);
	return a[Math.floor(Math.random()*a.length)];
}
function chooseValueFromObject(o){
	var a=[],i;for(i in o)if(o.hasOwnProperty(i))a.push(o[i]);
	return a[Math.floor(Math.random()*a.length)];
}
function prevent(e){e.stopPropagation();e.preventDefault();return false;}
function functionThatReturns(v){return function(){return v;}}
function E(t,c){return document.createElement(t);}
function $(q){return document.querySelector(q);}
function $$(q){return document.querySelectorAll(q);}
function $$$(){
	//window.beginProperties=currentProperties();Array.prototype.diff=function(a){return this.filter(function(i){return a.indexOf(i)<0;});};
	var c=function(s){return s.replace(/-\w/,function(m){return m[1].toUpperCase();});};
	var _=$$("[id]");for(var i=0;i<_.length;i++){window[c("$"+_[i].id)]=_[i];}
	$body=document.body;$doc=document.documentElement;
}
function irandom(x){
	return Math.floor(Math.random()*(x+1));
}
function randomCSSColor(){
	return "hsla("+Math.floor(Math.random()*360)+","+Math.floor(Math.random()*100)+"%,"+Math.floor(Math.random()*100)+"%,0.9)";
}
function randomName(){
	if(Math.random()<0.1){
		return randomName()+" "+randomName();
	}
	
	var name = "",
		cons = "wrttyplkgwrttyplccbbbkgkgfjhfddsdsszxcvbnm",
		endcons = "rttplkgwrttplccbbbkkfjhfddsdssxcvbnm",
		vowsy = "aeiouaeiouy",
		vows = "aeiouaeiou",
		len = irandomRange(2,8);
	
	while(name.length<len){
		if(Math.random()<0.99){
			name +=	choose(
						choose(cons),
						choose(cons),
						choose(
							"qu","w","r","t","tr","wr","sw","p","ps","s","st","fr","g","cr","cz","pr",
							"gl","pl","j","br","n","m","v","vl","se","dr","f","x","c","l","k","ph",
							"h","pr","dr","b","f","v","d","p","s","dr","cl","pl","sl","sc","y","dr",
							"sh","th","thr","ch","c","c","z","m","s","dr","cl","pl","sl","sc","y","gn",
							"tt","pp","ll","gg","nn","bb","rr","bb","ss"
						)
					)+choose(
						choose(vowsy),
						choose(vows),
						choose(
							"ae","ea","ai","ia","oo","oa","ao","eu","au","eo","oe","io","ay","ah","ie","ey",
							"ia","iu","ou","ai","ae","ow","eu","au","al","ee","o","a","ie","ao","oi","ue",
							"er","ar","or","ur","ir","a","i","e","o","i","ae","e","oh","eh","al","y","'"
						)
					);
		}else{
			name += choose(
						choose("+-_."),
						choose(
							choose("+-_."),
							choose("$%^&*+-_.:"),
							choose("$%^&*()+-_.:#@!~"),
							choose("0123456789"),
							choose("QWERTYUIOPASDFGHJKLZXCVBNM"),
							"0x"+choose("0123456789ABCDEF")+choose("0123456789ABCDEF")+choose("0123456789ABCDEF")
						)
					);
		}
	}
	if(vows.indexOf(name[name.length-1])!=-1 && Math.random()<0.6){
		name += choose(
			"st","rt","lt","mt","pt","rl","sta","p","ps","s","st","fr","g","ts","xes","ves",
			"lg","lp","j","b","n","m","ve","ve","se","d","f","x","ck","l","b","p",
			"h","pre","dr","b","f","v","d","p","s","dre","cle","ple","sle","sk","s","j",
			"sh","s","tch","ch","th","c","d","p","s","v","cla","pl","nd","sc","v","z",
			"rl","rg","b","mb","mb","nt","nle","r"+choose("tpsdnm")
		);
	}
	name = name.replace(/iy/g, function(){return "i"+choose(cons);});
	name = name.replace(/yau/g, function(){return "t"+choose(cons);});
	name = name.replace(/yy/g, function(){return "y"+choose(cons);});
	name = name.replace(/hth/g, function(){return "th"+choose(cons);});
	name = name.replace(/cie/g, function(){return "cei"+choose(cons);});
	name = name.replace(/^y/g, function(){return choose(vows);});
	name = name.replace(/f/g, function(){return choose(vows);});
	name = name.replace(/[aeiou][aeuio]ck/g, function(){return choose(vows)+"ck";});
	
	return name.replace(/^\w/,function(m){return m.toUpperCase();});
	function irandom(n){return Math.round(Math.random()*n);}
	function irandomRange(n1,n2){return Math.round(Math.random()*(n2-n1))+n1;}
}
//function currentProperties(){var w=[],i;for(i in window)w.push(i);return w;}
//console.log(currentProperties().diff(beginProperties));


/*
*/
function log(s){console.warn(s);}
function post(url, json){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if(xhr.readyState==4){
			console.log(xhr.responseText)
			if(xhr.responseText!=="saved\n"){
				//gui.err("Error: "+xhr.responseText);
				var m=new Modal().title("Error").position("center").content("Could not save. <br> <button id='close'>Close</button><button id='retry'>Retry</button>");
				m.$("#close").onclick=function(){
					m.close();
				};
				m.$("#retry").onclick=function(){
					m.close();
					tdtsth="out of date, whatever it is";
				};
			}
		}
	};
	xhr.open("POST", url, true);
	xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	xhr.send("json="+json);
	console.log("saving");
}
function get(url, callback){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if(xhr.readyState==4 && (xhr.status==200 || xhr.status==304)) {
			callback(xhr.responseText);
		}
	};
	xhr.open("GET", url, true);
	xhr.send();
}