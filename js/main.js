
var params = { width: window.innerWidth, height: window.innerHeight };
var hexagons = []
var hexInterval
var s = Snap(params.width, params.height)
var shapeGroup = s.g()
var shapeGroupContents = s.g()
var count = 0;
var text
var mask
var isMasked = false
var time = 0;
var mag = 7
var period = 50
init()

function init(){


	params = { width: window.innerWidth, height: window.innerHeight };
	shapeGroupContents.clear()
	shapeGroup.clear()

	s.clear()
	s.attr({
		"width": params.width,
		"height": params.height
	})

	shapeGroup.add(shapeGroupContents)
	s.add(shapeGroup)

	hexagons = []

	console.log(hexagons, s.children(), shapeGroup.children())

	var x = params.width / 2
	var y = params.height / 2
	var sl = Math.log(Math.max(params.width, params.height)) * 5

	addHexagon(sl, x, y)
	recursiveAdd(hexagons[0], true)


	// sc.attr({filter: s.filter(Snap.filter.sepia(1))})

	// console.log(sc.attr("mask"))

	// var clipGroup = s.g()


	text = s.text(0, 0, "@mjkaufer")


	text.attr({
		"font-family": "Leckerli One",
		"font-size": "15rem",
		"font-style": "italic",
		"font-weight": "700",
		"fill": "#fff"
	})

	var textBox = text.getBBox()

	var textMatrix = new Snap.Matrix()
	textMatrix.translate((params.width - textBox.width) / 2, (params.height + textBox.height / 2) / 2)

	text.transform(textMatrix)

	mask = s.mask()

	mask.add(text.clone())


	shapeGroup.attr("mask", mask)
	mask.attr({
		"display": "none",
		"maskUnits": "userSpaceOnUse",
		"maskContentUnits": "userSpaceOnUse"
	})




	if(Math.random() < 0.5)
		toggle()

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

	var hexagon = shapeGroupContents.g();

	for(var i = 30; i <= 270; i+= 120){
		var parallelogram = makeParallelogram(sideLength, i, {fill: randomColor()})
		hexagon.add(parallelogram)
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

	return x + sideLength + mag < 0 || x - sideLength - mag > params.width || y + sideLength + mag < 0 || y - sideLength - mag > params.height

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

var parallelogramShift = 1;
var hexagonShift = 1;

function shiftColors(stationary){
	for(var i = 0; i < hexagons.length; i++){
		var hexagon = hexagons[i]
		var prev = hexagons[(i + hexagonShift + hexagons.length) % hexagons.length]

		var children = hexagon.children()
		var prevChildren = prev.children()

		if(stationary)
			children[count].stagingFill = prev.children()[parallelogramShift].attr("fill")
		else
			children[count].stagingFill = prevChildren[(parallelogramShift + count) % prevChildren.length].attr("fill")

		// for(var j = 0; j < children.length; j++){
		// 	var parallelogram = children[j]
		// 	var prevParallelogram = prevChildren[(j + parallelogramShift + children.length) % children.length]
		// 	parallelogram.stagingFill = prevParallelogram.attr("fill")
		// 	// parallelogram.attr("fill", randomColor())
		// }
	}

	for(var i = 0; i < hexagons.length; i++){
		var hexagon = hexagons[i]

		var children = hexagon.children()
		for(var j = 0; j < children.length; j++){
			var parallelogram = children[j]
			if(parallelogram.stagingFill)
				parallelogram.attr("fill", parallelogram.stagingFill)
			parallelogram.stagingFill = null
		}
	}
	count++;
	count %= hexagons[0].children().length
}

window.onresize = init

window.onclick = function(){
	// shiftColors()
	toggle()
	// for(var i = 0; i < hexagons.length; i++){
	// 	var hexagon = hexagons[i]
	// 	var children = hexagon.children()
	// 	for(var j = 0; j < children.length; j++){
	// 		var parallelogram = children[j]
	// 		parallelogram.attr("fill", randomColor())

	// 	}
	// }`
}

function wiggle(time){
	var moveMatrix = new Snap.Matrix()
	moveMatrix.translate(mag * Math.cos(time / period), mag * Math.sin(time / period))
	shapeGroupContents.transform(moveMatrix)
}

// setInterval(toggle, 1000)

function toggle(){
	if(!isMasked){
		mask.attr("display", "")
		text.attr("display", "none")
	} else {
		text.attr("display", "")
		mask.attr("display", "none")
	}
	
	isMasked = !isMasked
}

setInterval(function(){
	wiggle(time++)
})