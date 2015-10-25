function Bubble(areaId){
	var _self = this;
	
	this.areaId     = areaId; // Контейнер. Это должен быть элемент с position != static, поскольку относительно него будут задаваться координаты

	//Свойства по умолчанию
	this.settings = {
		textMaxWidth      : 200         // максимальная ширина текстового блока
	,	textAura          : 15          // "аура" текстового блока, окончания хвоста не может быть ближе к тектовому блоку чем указанная величина
	,	textPadding       : 10          // отступ от края текстового блока до текста внутри него
	,	borderWidth       : 1
	,	borderRadius      : 50          // радиус скругления углов у текстового блока
	,	fontSize          : 16          // размер шрифта
	,	baseTail          : 0.5         // коэффициент для положения основания хвоста (по умолчанию 0.5, т.е. хвост "растет" из середины ребра)
	,	baseTailWidth     : 10          // ширина основания хвоста
	,	backgroundColor   : '#FFF'      // цвет заливки хвоста и текстового блока (по умолчанию белый)
	,	borderColor       : '#000'      // цвет границ хвоста и текстового блока (по умолчанию черный)
	,	offset            : 1           // смещение основания хвоста(т.е. всего svg элемента) внутрь текстового блока		
	,	addWidth          : 5           // отступы в svg-элементе
	}

	this.create = function(text, bubbleX, bubbleY, tailX, tailY, Customize){
		/*
		text           - непосредственно текст (text)
		bubbleX        - 
		bubbleY        - координаты для верхнего левого края текстового блока в пикселах, относительно areaId (int, float)
		tailX          - 
		tailY          - координаты для окончания хвоста в пикселах, относительно areaId (int, float)

		Customize      - объект в котором можно явно задать свойства определяемые автоматически
			.p3 = [0, 1]    - кооэфициенты для координат точки изгиба гривых хвоста (от 0 до 1; если не передан, то берется по умолчанию)
			.direct         - сторона текстового блока из которой будет "расти" хвост (если не задан, то определяется по умолчанию)
			                  как правило, варианта может быть максимум два, т.е. нельзя указать 'up' когда хвост должен указывать вниз

			                - также в этом объекте можно явно задать любое из свойств по умолчанию
		*/

		// Если объект Customize не передан определяем его
		if(!Customize){
			var Customize = {};
		}

		
		// Если особые настройки не заданы, то оставляем их неопределенными (они будут расчитаны автоматически)
		var p3Cust     = Customize.p3    = (Customize.p3 === undefined) ? [undefined, undefined] : Customize.p3;

		if (Array.isArray(p3Cust)){
			var curveXCust = Customize.p3[0] = (Customize.p3[0] === undefined) ? undefined : Customize.p3[0];
			var curveYCust = Customize.p3[1] = (Customize.p3[1] === undefined) ? undefined : Customize.p3[1];			
		}

		var directCust = Customize.direct = (Customize.direct === undefined) ? undefined : Customize.direct;

		// Если свойства не заданы, то берем значения по умолчанию (с объекта)
		var prop = []; // асооциативный массив со свойствами
		for (property in _self.settings){
			prop[property] = Customize[property] = (Customize[property] === undefined) ? _self.settings[property] : Customize[property];
		}
	

		//контейнер
		var bubbleContainer = document.createElement("div");
		bubbleContainer.classList.add("bubbleContainer");

		//координаты в родительском элементе
		bubbleContainer.style.left = parseInt(bubbleX) + "px";
		bubbleContainer.style.top  = parseInt(bubbleY) + "px";

		//ширина
		bubbleContainer.style.width = parseInt(prop['textMaxWidth']) + "px";

		//Создаем текстовый блок
		var bubbleText = document.createElement("div");

		// Маркеруем его классом bubbleText
		bubbleText.classList.add("bubbleText");

		//Стилизуем
		bubbleText.style.borderWidth  = prop['borderWidth'] + "px ";
		bubbleText.style.borderColor  = prop['borderColor'];
		bubbleText.style.boxShadow    = "0 0 " + "3px " + "0px " + prop['borderColor'];
		bubbleText.style.borderRadius = prop['borderRadius'] + "px";
		bubbleText.style.fontSize     = prop['fontSize'] + "px";


		//Создаем дополнительный слой
		//это нужно чтобы хвост перекрывал границу, но не перекрывал фон
		var bubbleTextContent = document.createElement("div");
		
		// Маркеруем его классом bubbleTextContent
		bubbleTextContent.classList.add("bubbleTextContent");

		//Стилизуем
		bubbleTextContent.style.backgroundColor = prop['backgroundColor'];
		bubbleTextContent.style.padding = prop['textPadding'] + "px";

		var bubbleTextSpan = document.createElement("span");
		bubbleTextSpan.insertAdjacentHTML("beforeEnd", text);

		//вставляем текст в соответствующий блок
		bubbleTextContent.insertAdjacentElement("beforeEnd", bubbleTextSpan);

		//вставляем bubbleTextContent в bubbleText
		bubbleText.insertAdjacentElement("beforeEnd", bubbleTextContent);

		// вставляем блок с текстом в общий контейнер
		bubbleContainer.insertAdjacentElement("beforeEnd", bubbleText);

		//вставляем готовый пузырь в переданный родительский элемент
		_self.areaId.insertAdjacentElement("beforeEnd",bubbleContainer);
				
		//После вставки текстового блока в DOM определяем его фактические ширину и высоту
		var textHeight = parseInt(bubbleText.offsetHeight); //высота текстового блока
		var textWidth = parseInt(bubbleTextSpan.offsetWidth) + 2 * prop['textPadding'] + 1 + prop['borderWidth'] * 2;   //ширина текстового блока

		//Фиксируем ширину bubbleContainer
		bubbleContainer.style.width = textWidth + "px";


		//svg для отрисовки хвоста (вставляем отдельно т.к. нам нужно знать высоту текстового блока)		
		//создаем svg
		var bubbleTail = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		//маркеруем классом bubbleTail
		bubbleTail.classList.add("bubbleTail");
		
		//Определяем направление, положение и размеры хвоста

		//Направление хвоста
		var direct;

		//Координаты основания хвоста относительно bubbleContainer
		var baseTailX;
		var baseTailY;

		//Атрибуты svg
		var svgWidth;
		var svgHeight;
		var svgLeft;
		var svgTop;

		//Специальные координаты конца хвоста в svg элементе, для direct in ('up', 'down', 'left', 'right')
		var tailXSpec = 0; // понадобится для direct in ('up', 'down')
		var tailYSpec = 0; // понадобится для direct in ('left', 'right')


		if (((tailY < bubbleY - prop['textAura']) && !directCust) || directCust == 'up'){
			direct = 'up';

			// Определяем параметры для основания хвоста
			var Sizes = _self.calcBaseTailParams(textWidth, textHeight, prop['borderWidth'], prop['borderRadius'], prop['baseTailWidth'], prop['offset'], direct);

			// Положение основания хвоста
			baseTailX = Sizes.minBaseTailStart + (Sizes.maxBaseTailWidth - Sizes.realBaseTailWidth) * prop['baseTail'];
			baseTailY = bubbleY;

			if      (tailX < (bubbleX + baseTailX))                           {direct += '-left';} 
			else if (tailX > (bubbleX + baseTailX + Sizes.realBaseTailWidth)) {direct += '-right';}

			if (direct == 'up-left'){
				svgWidth = Math.abs(tailX - (bubbleX + baseTailX + Sizes.realBaseTailWidth));
				svgLeft  = (tailX - bubbleX);

			} else if (direct == 'up'){
				svgWidth     = Sizes.realBaseTailWidth;
				svgLeft = baseTailX;
				tailXSpec     = tailX - (bubbleX + baseTailX);

			} else if (direct == 'up-right'){
				svgWidth     = Math.abs(tailX - (bubbleX + baseTailX));
				svgLeft = baseTailX;
			}

			svgWidth += prop['addWidth'] * 2;
			svgLeft  -= prop['addWidth'];

			svgHeight   = Math.abs(tailY - baseTailY) + (Sizes['realTailOffset']);
			svgTop      = -(svgHeight) + (Sizes['realTailOffset']);

		} else if (((tailY > (bubbleY + textHeight + prop['textAura'])) && !directCust)  || directCust == 'down'){
			direct = 'down';

			// Определяем параметры для основания хвоста
			var Sizes = _self.calcBaseTailParams(textWidth, textHeight, prop['borderWidth'], prop['borderRadius'], prop['baseTailWidth'], prop['offset'], direct);

			// Положение основания хвоста
			baseTailX = Sizes.minBaseTailStart + (Sizes.maxBaseTailWidth - Sizes.realBaseTailWidth) * prop['baseTail'];
			baseTailY = bubbleY + textHeight;

			if      (tailX < (bubbleX + baseTailX))                           {direct += '-left';} 
			else if (tailX > (bubbleX + baseTailX + Sizes.realBaseTailWidth)) {direct += '-right';}

			if (direct == 'down-left'){
				svgWidth = Math.abs(tailX - (bubbleX + baseTailX + Sizes.realBaseTailWidth));
				svgLeft  = (tailX - bubbleX);

			} else if (direct == 'down'){
				svgWidth     = Sizes.realBaseTailWidth;
				svgLeft = baseTailX;
				tailXSpec     = tailX - (bubbleX + baseTailX);

			} else if (direct == 'down-right'){
				svgWidth     = Math.abs(tailX - (bubbleX + baseTailX));
				svgLeft = baseTailX;
			}

			svgWidth += prop['addWidth'] * 2;
			svgLeft  -= prop['addWidth'];

			svgHeight    = Math.abs(tailY - baseTailY) + (Sizes['realTailOffset']);
			svgTop = textHeight - (Sizes['realTailOffset']);

		} else if (((tailX < bubbleX - prop['textAura']) && !directCust)  || directCust == 'left'){
			direct = 'left';

			// Определяем параметры для основания хвоста
			var Sizes = _self.calcBaseTailParams(textWidth, textHeight, prop['borderWidth'], prop['borderRadius'], prop['baseTailWidth'], prop['offset'], direct);

			// Положение основания хвоста
			baseTailX = bubbleX;
			baseTailY = Sizes.minBaseTailStart + (Sizes.maxBaseTailWidth - Sizes.realBaseTailWidth) * prop['baseTail'];

			if      (tailY < (bubbleY + baseTailY))                           {direct += '-up';} 
			else if (tailY > (bubbleY + baseTailY + Sizes.realBaseTailWidth)) {direct += '-down';}

			if (direct == 'left-up'){
				svgHeight    = Math.abs((bubbleY +  baseTailY + Sizes.realBaseTailWidth) - tailY) + prop['addWidth'] * 2;
				svgTop  = baseTailY + Sizes.realBaseTailWidth - (svgHeight - prop['addWidth']);

			} else if (direct == 'left'){
				svgHeight    = Sizes.realBaseTailWidth + prop['addWidth'] * 2;
				svgTop  = baseTailY - prop['addWidth'];

				tailYSpec     = tailY - (bubbleY + baseTailY);

			} else if (direct == 'left-down'){
				svgHeight    = Math.abs((bubbleY + baseTailY) - tailY) + prop['addWidth'] * 2;
				svgTop  = baseTailY - prop['addWidth'];
			}

			svgWidth = Math.abs(tailX - bubbleX) + (Sizes['realTailOffset']);
			svgLeft  = -(svgWidth) + (Sizes['realTailOffset']);
	
		} else if (((tailX > (bubbleX + textWidth + prop['textAura'])) && !directCust)  || directCust == 'right'){
			direct = 'right';

			// Определяем параметры для основания хвоста
			var Sizes = _self.calcBaseTailParams(textWidth, textHeight, prop['borderWidth'], prop['borderRadius'], prop['baseTailWidth'], prop['offset'], direct);

			// Положение основания хвоста
			baseTailX = bubbleX + textWidth;
			baseTailY = Sizes.minBaseTailStart + (Sizes.maxBaseTailWidth - Sizes.realBaseTailWidth) * prop['baseTail'];

			if      (tailY < (bubbleY + baseTailY))                           {direct += '-up';} 
			else if (tailY > (bubbleY + baseTailY + Sizes.realBaseTailWidth)) {direct += '-down';}

			if (direct == 'right-up'){
				svgHeight    = Math.abs((bubbleY +  baseTailY + Sizes.realBaseTailWidth) - tailY) + prop['addWidth'] * 2;
				svgTop  = baseTailY + Sizes.realBaseTailWidth - (svgHeight - prop['addWidth']);

			} else if (direct == 'right'){
				svgHeight    = Sizes.realBaseTailWidth + prop['addWidth'] * 2;
				svgTop  = baseTailY - prop['addWidth'];

				tailYSpec     = tailY - (bubbleY + baseTailY);

			} else if (direct == 'right-down'){
				svgHeight    = Math.abs((bubbleY + baseTailY) - tailY) + prop['addWidth'] * 2;
				svgTop  = baseTailY - prop['addWidth'];
			}

			svgWidth = Math.abs(tailX - (bubbleX + textWidth)) + Sizes['realTailOffset'];
			svgLeft  = (textWidth) - (Sizes['realTailOffset']);

		} else {
			// кординаты конца хвоста внутри текстового блока (+аура)
			direct = 'no';
		}

		// Устанавливаем элементу svg атрибуты
		bubbleTail.style.width  = svgWidth + "px";
		bubbleTail.style.height = svgHeight + "px";
		bubbleTail.style.left   = svgLeft + "px";
		bubbleTail.style.top    = svgTop + "px";

		// Получаем объект с координатами для построения хвоста
		var Path = _self.getPoints(direct, svgWidth, svgHeight, Sizes.realBaseTailWidth, tailXSpec, tailYSpec, curveXCust, curveYCust, prop['addWidth']);

		// Преобразуем объект в формат JSON
		var pointsJSON = JSON.stringify(Path);

		// вставляем svg
		bubbleContainer.insertAdjacentElement("beforeEnd", bubbleTail);

		// рисуем хвост
		_self.drawTail(bubbleTail, prop['backgroundColor'], prop['borderWidth'], prop['borderColor'], direct, prop['addWidth'], Path);

		//возвращаем созданный элемент-контейнер нашего пузыря
		return bubbleContainer;

	}

	//
	// Вычисляем параметры для определения положения и ширины основания хвоста
	//
	this.calcBaseTailParams = function(textWidth, textHeight, borderWidth, borderRadius, baseTailWidth, offset, direct){

		var Params = {};

		// Определяем длину меньшей из границ текстового блока
		var smallerBorder = (textWidth < textHeight) ? textWidth : textHeight;

		// определяем длину границы из которой будет "расти" хвост
		var targetBorder = (direct == 'up' || direct == 'down') ? textWidth : textHeight;

		// определяем длину смежной границы 
		var otherBorder = (direct == 'up' || direct == 'down') ? textHeight : textWidth;

		// Вычисляем реальный радиус скругления углов текстового блока
		Params.realBorderRadius = Math.floor(((smallerBorder - borderRadius * 2) > 0) ? borderRadius : smallerBorder / 2);

		// Вычисляем длину прямой (не скгруленной) области границы
		Params.straightBorderArea = targetBorder - Params.realBorderRadius * 2;

		// offset не может быть меньше 1
		Params.realTailOffset = (offset < 1) ? 1 : offset + borderWidth;
		// Корректируем offset если хвост уходит вглубь больше чем ширина/высота текстового блока
		Params.realTailOffset = (offset > otherBorder) ? otherBorder : offset + borderWidth;


		//Максимально допустимая ширина основания хвоста
		if(Params.realTailOffset < 0 ){
			Params.maxBaseTailWidth = Params.straightBorderArea;

		} else if(Params.realTailOffset == 0){
			Params.maxBaseTailWidth = Params.straightBorderArea;

		} else if(Params.realTailOffset < Params.realBorderRadius){
			Params.maxBaseTailWidth = 2 * Math.sqrt(Math.pow(Params.realBorderRadius, 2) - Math.pow(Params.realBorderRadius - offset, 2)) + Params.straightBorderArea;

		} else if(Params.realTailOffset < otherBorder - Params.realBorderRadius){
			Params.maxBaseTailWidth = targetBorder;

		} else if(Params.realTailOffset < otherBorder){
			Params.maxBaseTailWidth = 2 * Math.sqrt(Math.pow(Params.realBorderRadius, 2) - Math.pow(Params.realBorderRadius - (otherBorder - offset), 2)) + Params.straightBorderArea; 
		}

		Params.maxBaseTailWidth = Math.floor(Params.maxBaseTailWidth);

		//Отступ, от границы контейнера, до места где может начинаться хвост
		Params.minBaseTailStart = ((targetBorder - Params.maxBaseTailWidth) / 2);

		//Реальная ширина хвоста
		Params.realBaseTailWidth = (baseTailWidth > Params.maxBaseTailWidth) ? Params.maxBaseTailWidth : baseTailWidth;

		// debugger

		return Params;
	}

	//
	//Получаем объект с координатам точек по которой будем рисовать хвост
	//
	this.getPoints = function(direct, width, height, baseTailWidth, xSpec, ySpec, curveXCust, curveYCust, addWidth){
		/*

		*/
		var p = {};

		if(direct.search(/left/i) >= 0){
			p.x1 = width;
			p.x2 = 0;
		} else {
			p.x1 = 0;
			p.x2 = (direct == 'up' || direct == 'down') ? xSpec : width;
		}

		if(direct.search(/up/i) >= 0){
			p.y1 = height;
			p.y2 = 0;
		} else{
			p.y1 = 0;
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

		if(direct.search(/right/i) > 0){
			p.x1 += addWidth;
			p.x2 -= addWidth;
			p.x3 += addWidth;
		} else if(direct.search(/left/i) > 0){
			p.x1 -= addWidth;
			p.x2 += addWidth;
			p.x3 -= addWidth;
		} else if(direct.search(/down/i) > 0){
			p.y1 += addWidth;
			p.y2 -= addWidth;
			p.y3 += addWidth;
		} else if(direct.search(/up/i) > 0){
			p.y1 -= addWidth;
			p.y2 += addWidth;
			p.y3 -= addWidth;
		}

		if(direct == 'left' || direct == 'right'){
			// debugger
			p.y1 += addWidth;
			p.y2 += addWidth;
			p.y3 -= addWidth;
		}

		if(direct == 'down' || direct == 'up'){
			// debugger
			p.x1 += addWidth;
			p.x2 += addWidth;
			p.x3 -= addWidth;
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
	this.drawTail = function(svg, backgroundColor, borderWidth, borderColor, direct, addWidth, P){
		/*
		svg             - svg (элемент DOM)
		backgroundColor - цвет заливки (если не передан, берет с объекта)
		borderColor     - цвет линий (если не передан, берет с объекта)
		direct          - направление
		P               - объект с координатами (Path)
		*/

		//Фильтр для тени хвоста
		var filter ="<defs><filter id=\"border\"><feGaussianBlur stdDeviation=\"" + 1 + "\"/></filter></defs>";

		//Вычисляем координаты точки где будет заканчиваться тень
		var t = 1/1.618; // коэффициент длины тени отностительно длины хвоста

		var x2Shadow = Math.pow((1 - t), 2) * ((P.x1 + P.x3) / 2) + 2 * (1 - t) * t * P.xBezier + t * t * P.x2;
		var y2Shadow = Math.pow((1 - t), 2) * ((P.y1 + P.y3) / 2) + 2 * (1 - t) * t * P.yBezier + t * t * P.y2;

		// Вычисляем точки изгиба для тени
		var xBezierShadow = P.xBezier * t;
		var yBezierShadow = P.yBezier * t;
		var x1Shadow = P.x1;
		var x3Shadow = P.x3;
		var y1Shadow = P.y1;
		var y3Shadow = P.y3;

		// debugger
		if(direct.search(/up/i) == 0 || direct.search(/down/i) == 0){
			var xBezierShadow = (P.xBezier + addWidth * t) * t;
			var yBezierShadow = P.yBezier * t;
		}

		if(direct.search(/left/i) == 0 || direct.search(/right/i) == 0){
			var xBezierShadow = P.xBezier * t;
			var yBezierShadow = (P.yBezier + addWidth * t) * t;
		}

		if(direct.search(/up/i) >= 0){   // если /up/
			yBezierShadow = P.yBezier + (P.y1 - P.yBezier) - (P.y1 - P.yBezier) * t;
		}

		if(direct.search(/left/i) >= 0){ // если /left/
			xBezierShadow = P.xBezier + (P.x1 - P.xBezier) - (P.x1 - P.xBezier) * t;
		}

		if(direct.search(/left/i) == 0 || direct.search(/right/i) == 0){
			if(direct.search(/up/i) > 0){
				y1Shadow = P.y1 + borderWidth;
				y3Shadow = P.y3 - borderWidth;
			} else{
				y1Shadow = P.y1 - borderWidth;
				y3Shadow = P.y3 + borderWidth;
			}
		} else if(direct.search(/up/i) == 0 || direct.search(/down/i) == 0){
			if(direct.search(/left/i) > 0){
				x1Shadow = P.x1 + borderWidth;
				x3Shadow = P.x3 - borderWidth;
			} else{
				x1Shadow = P.x1 - borderWidth;
				x3Shadow = P.x3 + borderWidth;
			}
		}



		// атрибут d для тени
		var dShadow = "\"M " + x1Shadow + "," + y1Shadow + " Q " + xBezierShadow + "," + yBezierShadow + " " + x2Shadow + "," + y2Shadow + " Q " + xBezierShadow + "," + yBezierShadow + " " + x3Shadow + "," + y3Shadow + " M 0,0 M " + svg.offsetWidth + "," + svg.offsetHeight +  "\"";
		// стиль тени
		var styleShadow = "\"stroke:" + borderColor + ";stroke-width:0px;fill:" + borderColor + "\"";
		// тень
		var pathShadow = "<path d = " + dShadow+ " style = " + styleShadow + " filter=\"url(#border)\"" + "/>";

		// атрибут d для хвоста
		var dMain   = "\"M " + P.x1 + "," + P.y1 + " Q " + P.xBezier + "," + P.yBezier + " " + P.x2 + "," + P.y2 + " Q " + P.xBezier + "," + P.yBezier + " " + P.x3 + "," + P.y3 + "\"";
		// стиль хвоста
		var styleMain = "\"stroke:" + borderColor + ";stroke-width:" + borderWidth + "px;fill:" + backgroundColor + "\"";
		// хвост
		var pathMain = "<path d = " + dMain + " style = " + styleMain + "/>";

		// вставляем в элемент svg
		svg.insertAdjacentHTML("beforeEnd", filter);     // фильтр
		svg.insertAdjacentHTML("beforeEnd", pathShadow); // путь для тени
		svg.insertAdjacentHTML("beforeEnd", pathMain);   // путь для хвоста
	}
}

