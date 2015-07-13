var hexInterval;
var params, two, hexagons

init();

function init(){
	// document.onmousemove = (function(e){document.getElementById('clipText').x.baseVal[0].value = e.clientX})
	var clipText = document.getElementById('clipText')
	// var textContainer = document.getElementById('text')
	// textContainer.width.baseVal.value = window.innerWidth
	// textContainer.height.baseVal.value = window.innerHeight
	clipText.y.baseVal[0].value = 200

	if(hexInterval)
		clearInterval(hexInterval)

	var elem = document.getElementById('two-output');
	elem.innerHTML = "";
	params = { width: window.innerWidth, height: window.innerHeight };
	two = new Two(params).appendTo(elem);

	hexagons = []
	var x = params.width / 2
	var y = params.height / 2
	var sl = Math.log(Math.max(params.width, params.height)) * 5

	addHexagon(sl, x, y)
	// recursiveAdd(hexagons[0].hexagon, true)
	recursiveAdd(hexagons[0].hexagon, false)
	hexInterval = setInterval(function(){
		var length = hexagons.length
		hexagons.forEach(function(el){
			recursiveAdd(el.hexagon)
		})
		
		if(hexagons.length - length == 0){
			clearInterval(hexInterval)
			done()
		}
	}, 500)

}

function done(){

}

function makeParallelogram(sideLength, startAngle){

	if(startAngle === undefined)
		startAngle = 30;
	/*
	<>
	Makes a parallelogram like that above, with the origin being the bottom middle vertex
	*/

	var vertices = [];

	vertices.push(new Two.Anchor(0, 0))
	for(var deg = startAngle; deg <= startAngle + 120; deg += 60){
		var rad = deg / 180 * Math.PI
		var x = sideLength * Math.cos(rad)
		var y = sideLength * Math.sin(rad)
		vertices.push(new Two.Anchor(x, y))
	}

	return new Two.Polygon(vertices, true, false)

}

function makeHexagon(sideLength, startX, startY){
	var group = new Two.Group()
	

	for(var i = 30; i <= 270; i+= 120){
		var p = makeParallelogram(sideLength, i);
		
		p.fill = p.stroke = randomColor()
		
		group.add(p)
	}

	group.translation.set(startX, startY)
	group.sideLength = sideLength

	return group
}

function neighborHexagonCoords(sideLength, startX, startY, angle){
	var magnitude = Math.sqrt(3) * sideLength

	var x = magnitude * Math.cos(angle * Math.PI / 180)
	var y = -magnitude * Math.sin(angle * Math.PI / 180)
	return {x: x + startX, y: y + startY}
}

function neighborHexagon(sideLength, startX, startY, angle){

	var coords = neighborHexagonCoords(sideLength, startX, startY, angle)

	return makeHexagon(sideLength, coords.x, coords.y)
}

function addHexagon(sideLength, startX, startY){
	if(offGrid(sideLength, startX, startY))
		return false

	for(var i = 0; i < hexagons.length; i++){
		var hexagon = hexagons[i]
		var distance = Math.pow(hexagon.x - startX, 2) + Math.pow(hexagon.y - startY, 2)

		if(distance < sideLength / 50)
			return false
	}
	var h = makeHexagon(sideLength, startX, startY)
	var index = hexagons.length
	h.index = index
	hexagons.push({
		hexagon: h,
		x: startX,
		y: startY
	})

	two.add(h)
	return h;
}

function offGrid(sideLength, x, y){

	return x + sideLength < 0 || x - sideLength > params.width || y + sideLength < 0 || y - sideLength > params.height

}

function recursiveAdd(hexagon, repeat){
	var recursiveHexagons = []
	for(var i = 0; i < 360; i+= 60){
		var coords = neighborHexagonCoords(hexagon.sideLength, hexagon.translation.x, hexagon.translation.y, i)
		recursiveHexagons.push(addHexagon(hexagon.sideLength, coords.x, coords.y))
	}

	recursiveHexagons = recursiveHexagons.filter(function(e){
		return e !== false
	})

	if(recursiveHexagons.length != 0 && repeat){
		recursiveHexagons.forEach(function(el){
			recursiveAdd(el, true)
		})
	}
	two.update()
	return recursiveHexagons
}

window.onresize = function(){
	init()
}