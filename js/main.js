
var params = { width: window.innerWidth, height: window.innerHeight };
var hexagons = []
var hexInterval
var s = Snap(params.width, params.height)

init()

function init(){
	s.clear()
	hexagons = []

	var x = params.width / 2
	var y = params.height / 2
	var sl = Math.log(Math.max(params.width, params.height)) * 5

	addHexagon(sl, x, y)
	// recursiveAdd(hexagons[0], true)
	recursiveAdd(hexagons[0], false)
	hexInterval = setInterval(function(){
		var length = hexagons.length
		hexagons.forEach(function(hexagon){
			recursiveAdd(hexagon)
		})
		
		if(hexagons.length - length == 0){
			clearInterval(hexInterval)
			done()
		}
	}, 500)

}

function makeParallelogram(sideLength, startAngle, attr){

	if(startAngle === undefined)
		startAngle = 30;

	if(typeof attr != "object")
		attr = {}

	/*
	<>
	Makes a parallelogram like that above, with the origin being the bottom middle vertex
	*/

	var vertices = [0, 0];

	for(var deg = startAngle; deg <= startAngle + 120; deg += 60){
		var rad = deg / 180 * Math.PI
		var x = sideLength * Math.cos(rad)
		var y = sideLength * Math.sin(rad)
		vertices.push(x, y)
	}

	return s.polygon(vertices).attr(attr);

}

function addHexagon(sideLength, startX, startY){


	if(offGrid(sideLength, startX, startY))
		return false

	for(var i = 0; i < hexagons.length; i++){
		var hexagon = hexagons[i]
		var distance = Math.pow(hexagon.x - startX, 2) + Math.pow(hexagon.y - startY, 2)

		if(distance < sideLength / 50)//already a hexagon there
			return false
	}

	var hexagon = s.g();

	for(var i = 30; i <= 270; i+= 120){
		hexagon.add(makeParallelogram(sideLength, i, {fill: randomColor()}))
	}

	hexagon.x = startX
	hexagon.y = startY
	hexagon.sideLength = sideLength
	hexagon.index = hexagons.length

	var translationMatrix = new Snap.Matrix()
	translationMatrix.translate(startX, startY)

	hexagon.transform(translationMatrix)

	hexagons.push(hexagon)

	return hexagon
}

function neighborHexagonCoords(sideLength, startX, startY, angle){
	var magnitude = Math.sqrt(3) * sideLength

	var x = magnitude * Math.cos(angle * Math.PI / 180)
	var y = -magnitude * Math.sin(angle * Math.PI / 180)
	return {x: x + startX, y: y + startY}
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

function recursiveAdd(hexagon, repeat){
	var recursiveHexagons = []
	for(var i = 0; i < 360; i+= 60){
		var coords = neighborHexagonCoords(hexagon.sideLength, hexagon.x, hexagon.y, i)
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
	
	return recursiveHexagons
}