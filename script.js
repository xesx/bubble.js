window.onload = function(){


    var cont = document.getElementById("cont");
    var bubble = new Bubble(cont);


    //test
    bubble.textMaxWidth = 150;
    //up
    // var div = bubble.create("test qweqwe qweqwe qweqwe ", 200, 200, 100, 50);
    // var div = bubble.create("test qweqwe qweqwe qweqwe ", 200, 200, 250, 50);
    var div = bubble.create(" ", 200, 200, 300, 50);
    //down
	// var div = bubble.create("test qweqwe qweqwe qweqwe ", 200, 200, 100, 450);
	// var div = bubble.create("test qweqwe qweqwe qweqwe ", 200, 200, 250, 450);
	// var div = bubble.create("test qweqwe qweqwe qweqwe ", 200, 200, 300, 450);
	//left
	// var div = bubble.create("test qweqwe qweqwe qweqwe ", 200, 200, 50, 200);
	// var div = bubble.create("test ", 200, 200, 50, 240);
	// var div = bubble.create("test qweqwe qweqwe qweqwe ", 200, 200, 50, 275);
	//right
	// var div = bubble.create("", 200, 200, 450, 200);
	// var div = bubble.create("test qweqwe qweqwe qweqwe ", 200, 200, 450, 240);
	// var div = bubble.create("test qweqwe qweqwe qweqwe ", 200, 200, 450, 275);



    div.addEventListener("mouseenter", 
    	function(){
    		// alert("test" + this.style.backGroundColor);
    		// this.style.backgroundColor = 'blue';
    		var bubbleText = this.getElementsByClassName('bubbleText')[0];
    		var bubbleTail = this.getElementsByClassName('bubbleTail')[0];

    		bubbleText.style.backgroundColor = "#ff9";

    		bubble.drawTail(bubbleTail, "#ff9", "#FFF");

    	})

    div.addEventListener("mouseleave", 
    	function(){
    		// alert("test" + this.style.backGroundColor);
    		// this.style.backgroundColor = 'blue';
    		var bubbleText = this.getElementsByClassName('bubbleText')[0];
    		var bubbleTail = this.getElementsByClassName('bubbleTail')[0];

    		bubbleText.style.backgroundColor = "#fff";

    		bubble.drawTail(bubbleTail, "#fff");

    	})
    

}

function Bubble(containerId){
	var _self = this;
	
	this.containerId     = containerId; // Контейнер. Это должен быть элемент с position != static, поскольку относительно него будут задаваться координаты

	//Параметры пузыря
	this.textMaxWidth    = 150; // максимальная ширина текстового блока
	this.borderRadius    = 30;  // радиус скругления углов у текстового блока
	this.textAura        = 20;  // "аура" текстового блока, окончания хвоста не может быть ближе к тектовому блоку чем указанная величина
	this.baseTailWidth   = 16;  // ширина основания хвоста
	this.backGroundColor = '#FFF' // цвет заливки (по умолчанию белый)
	this.borderColor     = '#000' // цвет границ (по умолчанию черный)

	this.create = function(text, bubbleX, bubbleY, tailX, tailY){
		/*
		text           - непосредственно текст (text)
		bubbleX        - координата X для верхнего левого края текстового блока в пикселах, относительно containerId (int, float)
		bubbleY        - координата Y для верхнего левого края текстового блока в пикселах, относительно containerId (int, float)
		tailX          - координата X для окончания хвоста в пикселах, относительно containerId (int, float)
		tailY          - координата X для окончания хвоста в пикселах, относительно containerId (int, float)
		*/

		//контейнер
		var bubbleContainer = document.createElement("div");
		bubbleContainer.classList.add("bubbleContainer");

		var baseTailWidth = _self.baseTailWidth;

		// "аура" не должна быть меньше 15 пикселей		
		var textAura = (_self.textAura > 15) ? _self.textAura : 15;

		//координаты в родительском элементе
		bubbleContainer.style.left = parseFloat(bubbleX) + "px";
		bubbleContainer.style.top = parseFloat(bubbleY) + "px";

		//ширина
		bubbleContainer.style.maxWidth = parseFloat(_self.textMaxWidth) + "px";

		//блок с текстом
		var bubbleText = document.createElement("div");
		bubbleText.classList.add("bubbleText");
		bubbleText.style.borderRadius = _self.borderRadius + "px";

		//вставляем текст в соответствующий блок
		bubbleText.insertAdjacentHTML("beforeEnd", text);


		// вставляем блок с текстом в общий контейнер
		bubbleContainer.insertAdjacentElement("beforeEnd", bubbleText);


		//вставляем готовый пузырь в переданный родительский элемент
		_self.containerId.insertAdjacentElement("beforeEnd",bubbleContainer);
		
		//высота текстового блока
		var textHeight = parseFloat(bubbleText.clientHeight);
		//ширина текстового блока

		// alert(bubbleText.clientWidth);
		// debugger
		var textWidth = parseFloat(bubbleText.clientWidth);

		// debugger
		bubbleContainer.style.width = textWidth + 1 + "px";

		




		//canvas для отрисовки хвоста (вставляем отдельно т.к. нам нужно знать высоту текстового блока)
		
		//создаем canvas
		var bubbleTail = document.createElement("canvas");

		//маркеруем его классом bubbleTail
		bubbleTail.classList.add("bubbleTail");
		
		//Определяем положение, направление и размеры хвоста
		var direct;

		//Координаты основания хвоста относительно bubbleContainer
		var baseTailX;
		var baseTailY;

		//Размеры canvas-а
		var canvasWidth;
		var canvasHeight;

		//Смещение canvas-а относительно свего изначального положения
		var canvasStyleLeft;
		var canvasStyleTop;

		//Координаты конца хвоста в самом canvas-е
		var canvasTailX = 0; // понадобится для direct in ('up', 'down')
		var canvasTailY = 0; // понадобится для direct in ('left', 'right')

		if (tailY < bubbleY - textAura){
			direct = 'up';

			// Уменьшаем ширину основания хвоста, если текстовый блок слишком маленький
			if (textWidth < 40){
				baseTailWidth = 10;
			} else if (textWidth < 60 + baseTailWidth) {
				baseTailWidth = textWidth - 60;
			}

			baseTailX = parseFloat(textWidth) / 2 - parseFloat(baseTailWidth) / 2;
			baseTailY = bubbleY;

			if      (tailX < (bubbleX + baseTailX))                 {direct += '-left';} 
			else if (tailX > (bubbleX + baseTailX + baseTailWidth)) {direct += '-right';}

			if (direct == 'up-left'){
				canvasWidth     = Math.abs(tailX - (bubbleX + baseTailX + baseTailWidth));
				canvasHeight    = Math.abs(tailY - baseTailY);
				canvasStyleLeft = (tailX - bubbleX);

			} else if (direct == 'up'){
				canvasWidth     = baseTailWidth;
				canvasHeight    = Math.abs(tailY - baseTailY);
				canvasStyleLeft = baseTailX;
				canvasTailX     = tailX - (bubbleX + baseTailX);

			} else if (direct == 'up-right'){
				canvasWidth     = Math.abs(tailX - (bubbleX + baseTailX));
				canvasHeight    = Math.abs(tailY - baseTailY);
				canvasStyleLeft = baseTailX;
			}

			canvasStyleTop = -(canvasHeight);

		} else if (tailY > (bubbleY + textHeight + textAura)){
			direct = 'down';

			// Уменьшаем ширину основания хвоста, если текстовый блок слишком маленький
			if (textWidth < 40){
				baseTailWidth = 10;
			} else if (textWidth < 60 + baseTailWidth) {
				baseTailWidth = textWidth - 60;
			}

			baseTailX = parseFloat(textWidth) / 2 - parseFloat(baseTailWidth) / 2;
			baseTailY = bubbleY + textHeight;

			if      (tailX < (bubbleX + baseTailX))                 {direct += '-left';} 
			else if (tailX > (bubbleX + baseTailX + baseTailWidth)) {direct += '-right';}

			if (direct == 'down-left'){
				canvasWidth     = Math.abs(tailX - (bubbleX + baseTailX + baseTailWidth));
				canvasHeight    = Math.abs(tailY - baseTailY);
				canvasStyleLeft = (tailX - bubbleX);

			} else if (direct == 'down'){
				canvasWidth     = baseTailWidth;
				canvasHeight    = Math.abs(tailY - baseTailY);
				canvasStyleLeft = baseTailX;
				canvasTailX     = tailX - (bubbleX + baseTailX);

			} else if (direct == 'down-right'){
				canvasWidth     = Math.abs(tailX - (bubbleX + baseTailX));
				canvasHeight    = Math.abs(tailY - baseTailY);
				canvasStyleLeft = baseTailX;
			}

			canvasStyleTop = textHeight;

		} else if (tailX < bubbleX - textAura){
			direct = 'left';

			// Уменьшаем ширину основания хвоста, если текстовый блок слишком маленький
			if (textHeight < 40){
				baseTailWidth = 10;
			} else if (textHeight < 60 + baseTailWidth) {
				baseTailWidth = textHeight - 60;
			}

			baseTailX = bubbleX;
			baseTailY = parseFloat(textHeight) / 2 - parseFloat(baseTailWidth) / 2;

			if      (tailY < (bubbleY + baseTailY))                 {direct += '-up';} 
			else if (tailY > (bubbleY + baseTailY + baseTailWidth)) {direct += '-down';}

			if (direct == 'left-up'){
				canvasWidth     = Math.abs(tailX - bubbleX);
				canvasHeight    = Math.abs((bubbleY +  baseTailY + baseTailWidth) - tailY);
				canvasStyleTop  = baseTailY + baseTailWidth - canvasHeight;

			} else if (direct == 'left'){
				canvasWidth     = Math.abs(tailX - bubbleX);
				canvasHeight    = baseTailWidth;
				canvasStyleTop  = baseTailY;
				canvasTailY     = tailY - (bubbleY + baseTailY);

			} else if (direct == 'left-down'){
				canvasWidth     = Math.abs(tailX - bubbleX);
				canvasHeight    = Math.abs((bubbleY + baseTailY) - tailY);
				canvasStyleTop  = baseTailY;
			}

			canvasStyleLeft = -(canvasWidth);
	
		} else if (tailX > (bubbleX + textWidth + textAura)){
			direct = 'right';

			// Уменьшаем ширину основания хвоста, если текстовый блок слишком маленький
			if (textHeight < 40){
				baseTailWidth = 10;
			} else if (textHeight < 60 + baseTailWidth) {
				baseTailWidth = textHeight - 60;
			}

			baseTailX = bubbleX + textWidth;
			baseTailY = parseFloat(textHeight) / 2 - parseFloat(baseTailWidth) / 2;

			if      (tailY < (bubbleY + baseTailY))                 {direct += '-up';} 
			else if (tailY > (bubbleY + baseTailY + baseTailWidth)) {direct += '-down';}

			if (direct == 'right-up'){
				canvasWidth     = Math.abs(tailX - (bubbleX + textWidth));
				canvasHeight    = Math.abs((bubbleY +  baseTailY + baseTailWidth) - tailY);
				canvasStyleTop  = baseTailY + baseTailWidth - canvasHeight;

			} else if (direct == 'right'){
				canvasWidth     = Math.abs(tailX - (bubbleX + textWidth));
				canvasHeight    = baseTailWidth;
				canvasStyleTop  = baseTailY;

				canvasTailY     = tailY - (bubbleY + baseTailY);

			} else if (direct == 'right-down'){
				canvasWidth     = Math.abs(tailX - (bubbleX + textWidth));
				canvasHeight    = Math.abs((bubbleY + baseTailY) - tailY);
				canvasStyleTop  = baseTailY;
			}

			canvasStyleLeft = (textWidth);

		} else {
			// кординаты конца хвоста внутри текстового блока
			direct = 'no';			
		}


		// Устанавливаем canvas-у атрибуты
		bubbleTail.style.left = canvasStyleLeft + "px";
		bubbleTail.style.top  = canvasStyleTop + "px";


		bubbleTail.setAttribute("width",  canvasWidth + "px");

		bubbleTail.setAttribute("height", canvasHeight + "px");

		bubbleTail.setAttribute("data-direct",  direct);

		bubbleTail.setAttribute("data-baseTailWidth",  baseTailWidth);		

		bubbleTail.setAttribute("data-x", canvasTailX);

		bubbleTail.setAttribute("data-y", canvasTailY);

		// вставляем canvas
		bubbleContainer.insertAdjacentElement("beforeEnd", bubbleTail);

		_self.drawTail(bubbleTail);

		return bubbleContainer;

	}

	//
	//отрисовка хвоста на холсте
	//
	this.drawTail = function(canvas, backGroundColor, borderColor){
		/*
		canvas          - canvas (элемент DOM)
		backGroundColor - цвет заливки (если не передан, берет с объекта)
		borderColor     - цвет линий (если не передан, берет с объекта)
		*/

		var width  = parseFloat(canvas.getAttribute("width"));
		var height = parseFloat(canvas.getAttribute("height"));
		var direct = canvas.getAttribute("data-direct");
		var baseTailWidth = canvas.getAttribute("data-baseTailWidth");

		backGroundColor = backGroundColor || _self.backGroundColor;
		borderColor     = borderColor || _self.borderColor;

		// alert (canvas.dataset.direct);

		var ctx = canvas.getContext('2d');

		//Очищаем canvas
		ctx.clearRect(0, 0, width, height);

		ctx.beginPath();

		//отрисовываем хвост в зависимости от направления
		switch(direct){
			case 'no':
				//ничего не делаем
				return;
			break
			case 'up-left':
				// alert('up-left');

				ctx.moveTo(width - 1, height);  // отступ в 1 пиксель по оси X сделан специально, иначе часть изгиба кривой не видно

				ctx.quadraticCurveTo(width, height/2, 0, 0);
				ctx.quadraticCurveTo(width, height/2, width - baseTailWidth, height);
			break

			case 'up':
				// alert('up');

				var x = canvas.dataset.x;
				ctx.moveTo(0, height);		
		
				ctx.quadraticCurveTo(width/2, height/2, x, 0);
				ctx.quadraticCurveTo(width/2, height/2, width, height);
			break

			case 'up-right':
				// alert('up-right');

				ctx.moveTo(1, height); // отступ в 1 пиксель по оси X сделан специально, иначе часть изгиба кривой не видно
		
				ctx.quadraticCurveTo(0, height/2, width, 0);
				ctx.quadraticCurveTo(0, height/2, baseTailWidth, height);
			break			
			
			case 'down-left':
				// alert('down-left');

				ctx.moveTo(width - 1, 0);  // отступ в 1 пиксель по оси X сделан специально, иначе часть изгиба кривой не видно

				ctx.quadraticCurveTo(width, height/2, 0, height);
				ctx.quadraticCurveTo(width, height/2, width - baseTailWidth, 0);
			break

			case 'down':
				// alert('down');

				var x = canvas.dataset.x;
				ctx.moveTo(0, 0);
		
				ctx.quadraticCurveTo(width/2, height/2, x, height);
				ctx.quadraticCurveTo(width/2, height/2, width, 0);
			break

			case 'down-right':
				// alert('down-right');

				ctx.moveTo(1, 0); // отступ в 1 пиксель по оси X сделан специально, иначе часть изгиба кривой не видно
		
				ctx.quadraticCurveTo(0, height/2, width, height);
				ctx.quadraticCurveTo(0, height/2, baseTailWidth, 0);
			break

			case 'left-up':
				// alert('left-up');

				ctx.moveTo(width, height);
		
				ctx.quadraticCurveTo(width/2, 0, 0, 0);
				ctx.quadraticCurveTo(width/2, 0, width, height - baseTailWidth);
			break

			case 'left':
				// alert('left');

				var y = canvas.dataset.y;
				ctx.moveTo(width, 0);
		
				ctx.quadraticCurveTo(width/2, height/2, 0, y);
				ctx.quadraticCurveTo(width/2, height/2, width, height);
			break

			case 'left-down':
				// alert('left-down');

				ctx.moveTo(width, 0);
		
				ctx.quadraticCurveTo(width/2, 0, 0, height);
				ctx.quadraticCurveTo(width/2, 0, width, baseTailWidth);
			break

			case 'right-up':
				// alert('right-up');

				ctx.moveTo(0, height);
		
				ctx.quadraticCurveTo(width/2, 0,  width, 0);
				ctx.quadraticCurveTo(width/2, 0, 0, height - baseTailWidth);
			break

			case 'right':
				// alert('right');

				var y = canvas.dataset.y;
				ctx.moveTo(0, 0);
		
				ctx.quadraticCurveTo(width/2, height/2, width, y);
				ctx.quadraticCurveTo(width/2, height/2, 0, height);
			break

			case 'right-down':
				// alert('right-down');

				ctx.moveTo(0, 0);
		
				ctx.quadraticCurveTo(width/2, 0, width, height);
				ctx.quadraticCurveTo(width/2, 0, 0, baseTailWidth);
			break

			default:
				alert('undefined direct - ' + direct);
			break
		}

		// Границы
		ctx.strokeStyle = borderColor;
		ctx.stroke();
		
		// Заливка
		ctx.fillStyle = backGroundColor;
		ctx.fill();
	}
}

