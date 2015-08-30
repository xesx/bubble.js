window.onload = function(){


    var cont = document.getElementById("cont");
    var bubble = new Bubble(cont);
    bubble.create("test test test test test test test test test test test ", 150, 50, 50, 500, 500);

    bubble.create("test test test test test test test test test test test ", 150, 250, 250, 500, 495);

}

function Bubble(containerId){
	var _self = this;

	this.baseTailWidth = 15; // ширина основания хвоста

	this.containerId = containerId;

	this.create = function(text, width, bubbleX, bubbleY, tailX, tailY){

		//расстояние от левого края контейнера до начала основания хвоста
		var baseTailX = parseFloat(width) / 2 - parseFloat(_self.baseTailWidth) / 2;
		var baseTailY;

		//контейнер
		var bubbleContainer = document.createElement("div");
		bubbleContainer.classList.add("bubbleContainer");

		//координаты в родительском элементе
		bubbleContainer.style.left = parseFloat(bubbleX) + "px";
		bubbleContainer.style.top = parseFloat(bubbleY) + "px";

		//ширина
		bubbleContainer.style.width = parseFloat(width) + "px";

		//блок с текстом
		var bubbleText = document.createElement("div");
		bubbleText.classList.add("bubbleText");

		//вставляем текст в соответствующий блок
		bubbleText.insertAdjacentHTML("beforeEnd", text);


		

		// вставляем блок с текстом в общий контейнер
		bubbleContainer.insertAdjacentElement("beforeEnd", bubbleText);


		//вставляем готовый пузырь в переданный родительский элемент
		_self.containerId.insertAdjacentElement("beforeEnd",bubbleContainer);
		
		//высота текстового блока
		var bubbleTextStyle = getComputedStyle(bubbleText);

		//canvas для отрисовки хвоста (вставляем отдельно т.к. нам нужно знать высоту текстового блока)
		var bubbleTail = document.createElement("canvas");
		bubbleTail.classList.add("bubbleTail");
		bubbleTail.style.left = baseTailX + "px";

		// baseTailY = parseFloat(bubbleTextStyle.height);
		baseTailY = bubbleY + parseFloat(bubbleText.clientHeight);
		
		bubbleTail.setAttribute("width",  (tailX - baseTailX - bubbleX) + "px");
		bubbleTail.setAttribute("height", (tailY - baseTailY + "px"));

		// вставляем canvas
		bubbleContainer.insertAdjacentElement("beforeEnd", bubbleTail);

		_self.drawTail(bubbleTail);

	}

	//
	//отрисовка хвоста на холсте
	//
	this.drawTail = function(canvas){
		var width  = parseFloat(canvas.getAttribute("width"));
		var height = parseFloat(canvas.getAttribute("height"));

		var ctx = canvas.getContext('2d');

		ctx.beginPath();
		ctx.moveTo(0, 0);
		
		ctx.quadraticCurveTo(0, height, width, height);
		ctx.quadraticCurveTo(0, height, _self.baseTailWidth, 0);
		
		ctx.strokeStyle = "#000";
		ctx.stroke();
		
		ctx.fillStyle = "#FFF";
		ctx.fill();

	}

}

