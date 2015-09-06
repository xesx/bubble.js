function Bubble(containerId){
	var _self = this;
	
	this.containerId     = containerId; // Контейнер. Это должен быть элемент с position != static, поскольку относительно него будут задаваться координаты

	//Параметры пузыря
	this.textMaxWidth    = 200; // максимальная ширина текстового блока
	this.textPadding     = 15;  // отступ от края текстового блока до текста внутри него
	this.fontSize        = 14;  // размер шрифта
	this.borderRadius    = 50;  // радиус скругления углов у текстового блока
	this.textAura        = 20;  // "аура" текстового блока, окончания хвоста не может быть ближе к тектовому блоку чем указанная величина
	this.baseTailWidth   = 16;  // ширина основания хвоста
	this.backGroundColor = '#FFF' // цвет заливки (по умолчанию белый)
	this.borderColor     = '#000' // цвет границ (по умолчанию черный)

	this.create = function(text, bubbleX, bubbleY, tailX, tailY, Customize){
		/*
		text           - непосредственно текст (text)
		bubbleX        - 
		bubbleY        - координаты для верхнего левого края текстового блока в пикселах, относительно containerId (int, float)
		tailX          - 
		tailY          - координаты для окончания хвоста в пикселах, относительно containerId (int, float)

		Customize      - объект в котором можно явно задать свойства определяемые автоматически
			.curveXCust     -
			.curveYCust     - кооэфициент для координат точки изгиба гривых хвоста (от 0 до 1; если не передан, то берется по умолчанию)
			.directCust     - сторона текстового блока из которой будет "расти" хвост (если не задан, то определяется по умолчанию)
		*/

		var curveXCust = undefined;
		var curveYCust = undefined;
		var directCust = undefined;

		if(Customize){
			curveXCust = Customize.curveX = Customize.curveX || undefined;
			curveYCust = Customize.curveY = Customize.curveY || undefined;
			directCust = Customize.direct = Customize.direct || undefined;			
		}		

		//контейнер
		var bubbleContainer = document.createElement("div");
		bubbleContainer.classList.add("bubbleContainer");

		var realBaseTailWidth;

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
		bubbleText.style.padding = _self.textPadding + "px";
		bubbleText.style.fontSize = _self.fontSize + "px";

		//вставляем текст в соответствующий блок
		bubbleText.insertAdjacentHTML("beforeEnd", "<span>" + text + "</span>");

		// вставляем блок с текстом в общий контейнер
		bubbleContainer.insertAdjacentElement("beforeEnd", bubbleText);

		//вставляем готовый пузырь в переданный родительский элемент
		_self.containerId.insertAdjacentElement("beforeEnd",bubbleContainer);
		
		

		//высота текстового блока
		var textHeight = parseFloat(bubbleText.clientHeight);
		
		//ширина текстового блока
		var textWidth = parseFloat(bubbleText.clientWidth);

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

		//Специальные координаты конца хвоста в самом canvas-е для direct in ('up', 'down', 'left', 'right')
		var tailXSpec = 0; // понадобится для direct in ('up', 'down')
		var tailYSpec = 0; // понадобится для direct in ('left', 'right')

		if (((tailY < bubbleY - textAura) && !directCust) || directCust == 'up'){
			direct = 'up';

			// Уменьшаем ширину основания хвоста, если текстовый блок слишком маленький
			realBaseTailWidth = _self.calcBaseTailWidth(textWidth, textHeight, direct);

			baseTailX = parseFloat(textWidth) / 2 - parseFloat(realBaseTailWidth) / 2;
			baseTailY = bubbleY;

			if      (tailX < (bubbleX + baseTailX))                     {direct += '-left';} 
			else if (tailX > (bubbleX + baseTailX + realBaseTailWidth)) {direct += '-right';}

			if (direct == 'up-left'){
				canvasWidth     = Math.abs(tailX - (bubbleX + baseTailX + realBaseTailWidth));
				canvasHeight    = Math.abs(tailY - baseTailY);
				canvasStyleLeft = (tailX - bubbleX);

			} else if (direct == 'up'){
				canvasWidth     = realBaseTailWidth;
				canvasHeight    = Math.abs(tailY - baseTailY);
				canvasStyleLeft = baseTailX;
				tailXSpec     = tailX - (bubbleX + baseTailX);

			} else if (direct == 'up-right'){
				canvasWidth     = Math.abs(tailX - (bubbleX + baseTailX));
				canvasHeight    = Math.abs(tailY - baseTailY);
				canvasStyleLeft = baseTailX;
			}

			canvasStyleTop = -(canvasHeight) + 1;
			canvasHeight += 1;

		} else if (((tailY > (bubbleY + textHeight + textAura)) && !directCust)  || directCust == 'down'){
			direct = 'down';

			// Уменьшаем ширину основания хвоста, если текстовый блок слишком маленький
			realBaseTailWidth = _self.calcBaseTailWidth(textWidth, textHeight, direct);

			baseTailX = parseFloat(textWidth) / 2 - parseFloat(realBaseTailWidth) / 2;
			baseTailY = bubbleY + textHeight;

			if      (tailX < (bubbleX + baseTailX))                 {direct += '-left';} 
			else if (tailX > (bubbleX + baseTailX + realBaseTailWidth)) {direct += '-right';}

			if (direct == 'down-left'){
				canvasWidth     = Math.abs(tailX - (bubbleX + baseTailX + realBaseTailWidth));
				canvasHeight    = Math.abs(tailY - baseTailY);
				canvasStyleLeft = (tailX - bubbleX);

			} else if (direct == 'down'){
				canvasWidth     = realBaseTailWidth;
				canvasHeight    = Math.abs(tailY - baseTailY);
				canvasStyleLeft = baseTailX;
				tailXSpec     = tailX - (bubbleX + baseTailX);

			} else if (direct == 'down-right'){
				canvasWidth     = Math.abs(tailX - (bubbleX + baseTailX));
				canvasHeight    = Math.abs(tailY - baseTailY);
				canvasStyleLeft = baseTailX;
			}

			canvasStyleTop = textHeight - 2;
			canvasHeight += 2;

		} else if (((tailX < bubbleX - textAura) && !directCust)  || directCust == 'left'){
			direct = 'left';

			// Уменьшаем ширину основания хвоста, если текстовый блок слишком маленький
			realBaseTailWidth = _self.calcBaseTailWidth(textWidth, textHeight, direct);

			baseTailX = bubbleX;
			baseTailY = parseFloat(textHeight) / 2 - parseFloat(realBaseTailWidth) / 2;

			if      (tailY < (bubbleY + baseTailY))                     {direct += '-up';} 
			else if (tailY > (bubbleY + baseTailY + realBaseTailWidth)) {direct += '-down';}

			if (direct == 'left-up'){
				canvasWidth     = Math.abs(tailX - bubbleX);
				canvasHeight    = Math.abs((bubbleY +  baseTailY + realBaseTailWidth) - tailY);
				canvasStyleTop  = baseTailY + realBaseTailWidth - canvasHeight;

			} else if (direct == 'left'){
				canvasWidth     = Math.abs(tailX - bubbleX);
				canvasHeight    = realBaseTailWidth;
				canvasStyleTop  = baseTailY;
				tailYSpec     = tailY - (bubbleY + baseTailY);

			} else if (direct == 'left-down'){
				canvasWidth     = Math.abs(tailX - bubbleX);
				canvasHeight    = Math.abs((bubbleY + baseTailY) - tailY);
				canvasStyleTop  = baseTailY;
			}

			canvasStyleLeft = -(canvasWidth) + 1;
			canvasWidth += 1;
	
		} else if (((tailX > (bubbleX + textWidth + textAura)) && !directCust)  || directCust == 'right'){
			direct = 'right';

			// Уменьшаем ширину основания хвоста, если текстовый блок слишком маленький
			realBaseTailWidth = _self.calcBaseTailWidth(textWidth, textHeight, direct);

			baseTailX = bubbleX + textWidth;
			baseTailY = parseFloat(textHeight) / 2 - parseFloat(realBaseTailWidth) / 2;

			if      (tailY < (bubbleY + baseTailY))                     {direct += '-up';} 
			else if (tailY > (bubbleY + baseTailY + realBaseTailWidth)) {direct += '-down';}

			if (direct == 'right-up'){
				canvasWidth     = Math.abs(tailX - (bubbleX + textWidth));
				canvasHeight    = Math.abs((bubbleY +  baseTailY + realBaseTailWidth) - tailY);
				canvasStyleTop  = baseTailY + realBaseTailWidth - canvasHeight;

			} else if (direct == 'right'){
				canvasWidth     = Math.abs(tailX - (bubbleX + textWidth));
				canvasHeight    = realBaseTailWidth;
				canvasStyleTop  = baseTailY;

				tailYSpec     = tailY - (bubbleY + baseTailY);

			} else if (direct == 'right-down'){
				canvasWidth     = Math.abs(tailX - (bubbleX + textWidth));
				canvasHeight    = Math.abs((bubbleY + baseTailY) - tailY);
				canvasStyleTop  = baseTailY;
			}

			canvasStyleLeft = (textWidth) - 1;
			canvasWidth += 1;

		} else {
			// кординаты конца хвоста внутри текстового блока
			direct = 'no';
		}


		// Устанавливаем canvas-у атрибуты
		bubbleTail.style.left = canvasStyleLeft + "px";
		bubbleTail.style.top  = canvasStyleTop + "px";

		bubbleTail.setAttribute("width",  canvasWidth + "px");
		bubbleTail.setAttribute("height", canvasHeight + "px");


		var pointsObject = _self.getPoints(direct, canvasWidth, canvasHeight, realBaseTailWidth, tailXSpec, tailYSpec, curveXCust, curveYCust);

		var pointsJSON = JSON.stringify(pointsObject);

		bubbleTail.setAttribute("path", pointsJSON);



		// вставляем canvas
		bubbleContainer.insertAdjacentElement("beforeEnd", bubbleTail);

		// рисуем хвост
		// if(curveX && curveY){
		// 	alert('ahtung');
		// } else{
			_self.drawTail(bubbleTail);
		// }
			

		//возвращаем созданный элемент-контейнер нашего пузыря
		return bubbleContainer;

	}

	//
	// Вычисляем оптимальную ширину основания хвоста (если блок слишком маленький)
	//
	this.calcBaseTailWidth = function(textWidth, textHeight, direct){

		// Определяем длину меньшей из границ текстового блока
		var smallerBorder = (textWidth < textHeight) ? textWidth : textHeight;

		// определяем длину границы из которой будет "расти" хвост
		var targetBorder = (direct == 'up' || direct == 'down') ? textWidth : textHeight;

		// Вычисляем реальный радиус скругления углов текстового блока
		var realBorderRadius = ((smallerBorder - _self.borderRadius * 2) > 0) ? _self.borderRadius : smallerBorder / 2;

		// Вычисляем длину прямой (не скгруленной) области границы
		var straightBorderArea = targetBorder - realBorderRadius * 2;

		// alert('realBorderRadius    = ' + realBorderRadius
		// 	+ ' straightBorderArea = ' + straightBorderArea
		// 	);

		//Максимально допустимая ширина основания хвоста
		var maxBaseTailWidth = realBorderRadius * 1/2 + straightBorderArea;

		return (_self.baseTailWidth > maxBaseTailWidth) ? maxBaseTailWidth : _self.baseTailWidth;
	}

	//
	//Получаем объект с координатам точек по которой будем рисовать хвост
	//
	this.getPoints = function(direct, width, height, baseTailWidth, xSpec, ySpec, curveXCust, curveYCust){
		/*

		*/
		var p = {};

		if(direct.search(/left/i) >= 0){
			p.x1 = width - 1;
			p.x2 = 0;
		} else{
			p.x1 = 1;
			p.x2 = (direct == 'up' || direct == 'down') ? xSpec : width;
		}

		if(direct.search(/up/i) >= 0){
			p.y1 = height - 1;
			p.y2 = 0;
		} else{
			p.y1 = 1;
			p.y2 = (direct == 'left' || direct == 'right') ? ySpec : height;
		}

		if(direct.search(/left/i) == 0 || direct == 'up' || direct == 'down'){
			p.x3 = width;
		} else if(direct.search(/right/i) == 0){
			p.x3 = 0;
		} else if(direct.search(/right/i) > 0){
			p.x3 = baseTailWidth;
		} else if(direct.search(/left/i) > 0){
			p.x3 = width - baseTailWidth;
		}

		if(direct.search(/up/i) == 0 || direct == 'left' || direct == 'right'){
			p.y3 = height;
		} else if(direct.search(/down/i) == 0){
			p.y3 = 0;
		} else if(direct.search(/down/i) > 0){
			p.y3 = baseTailWidth;
		} else if(direct.search(/up/i) > 0){
			p.y3 = height - baseTailWidth;
		}

		//Если коэффициенты координат точки изгиба заданы явно, то используем их
		if(curveXCust !== undefined || curveYCust !== undefined){
			//Проверяем корректность коэффициентов, т.е. вхождение в промежуток [0, 1]
			if(!(curveXCust < 0 || curveXCust > 1 || curveYCust < 0 || curveYCust > 1)){
				//Вычисляем координаты
				p.xBezier = Math.round(width  * curveXCust);
				p.yBezier = Math.round(height * curveYCust);

				return p;
			}
		}


		//Иначе определяем координаты точки изгиба кривой по умолчанию
		if(direct == 'up' || direct == 'down' || direct.search(/left/i) == 0 || direct.search(/right/i) == 0){
			p.xBezier = width / 2;
		} else if (direct.search(/left/i) > 0){
			p.xBezier = width;
		} else if (direct.search(/right/i) > 0){
			p.xBezier = 0;
		}

		if(direct.search(/up/i) > 0 || direct.search(/down/i) > 0){
			p.yBezier = 0;
		} else{
			p.yBezier = height/2;
		} 

		return p;

	}

	//
	// Отрисовка хвоста на холсте
	//
	this.drawTail = function(canvas, backGroundColor, borderColor){
		/*
		canvas          - canvas (элемент DOM)
		backGroundColor - цвет заливки (если не передан, берет с объекта)
		borderColor     - цвет линий (если не передан, берет с объекта)
		*/

		var p = JSON.parse(canvas.getAttribute("path"));

		backGroundColor = backGroundColor || _self.backGroundColor;
		borderColor     = borderColor || _self.borderColor;

		// alert (canvas.dataset.direct);

		var ctx = canvas.getContext('2d');

		//Очищаем canvas
		ctx.clearRect(0, 0, canvas.getAttribute("width"), canvas.getAttribute("height"));

		ctx.beginPath();

		ctx.moveTo(p.x1, p.y1);

		ctx.quadraticCurveTo(p.xBezier, p.yBezier, p.x2, p.y2);
		ctx.quadraticCurveTo(p.xBezier, p.yBezier, p.x3, p.y3);

		// Границы
		ctx.strokeStyle = borderColor;
		ctx.stroke();
		
		// Заливка
		ctx.fillStyle = backGroundColor;
		ctx.fill();
	}
}

