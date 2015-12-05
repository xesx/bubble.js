'use strict'

function Bubble(areaId){
	var _self = this;
	
	this.areaId     = getNotStaticElement(areaId); // Контейнер. Это должен быть элемент с position != static, поскольку относительно него будут задаваться координаты

	//Свойства по умолчанию
	this.optionsDefault = {
		textMaxWidth         : 200             // максимальная ширина текстового блока в пикселях (number)
	,	textPadding          : 20              // отступ от края пузыря до текста в пикселях (number)
	,	textAlign            : "center"        // выравнивание текста (string)
	,	fontFamily           : "Comic Sans MS" // семейство шрифтов для текста (string)
	,	fontSize             : "16px"          // размер шрифта (string)
	,	fontColor            : undefined       // цвет шрифта (color)
	,	borderWidth          : 0.5             // ширина границ (number)
	,	borderColor          : "#000000"       // цвет границ (color)
	,	borderRadius         : 9000            // радиус скругления углов границ
	,	fill                 : "#FFFFFF"       // цвет заливки (color)

	,	shadow               : true            // добавлять ли тень (boolean)
	,	shadowColor          : "#000000"       // цвет тени (color)
	,	shadowH              : 1               // смещение тени по горизонтали (number)
	,	shadowV              : -1               // смещение тени по вертикали (number)
	,	shadowBlurRadius     : 2               // радиус размытия тени (number)
	
	,	tailWidth            : 20              // ширина основания хвоста в пикселях (number)
	,	tailBaseAngle        : undefined       // параметр задает угол исходя из которого будет рассчитана точка основания хвоста на периметре тела (number)
	,	tailCurveP1          : {x: undefined, y: undefined}    // координаты первой опорной точки кривой Безье для отрисовки хвоста (object{x: (number), y: (number)})
	,	tailCurveP2          : {x: undefined, y: undefined}    // координаты второй опорной точки кривой Безье для отрисовки хвоста (object{x: (number), y: (number)})
	                                                           // координаты задаются в системе, где центр основания хвоста это точка [0, 0]
	,	className            : "bubble"        // имя класса контейнера пузыря (string)

	}

	//Объект для свойств создаваемого пузыря, получаемый слиянием свойств по умолчанию + свойства заданные при вызове функции create в параметре optionsCustom
	this.options = {};

	this.create = function(text, xBody, yBody, xTail, yTail, optionsCustom){
		/*
		text           - текст (string)
		xBody, yBody   - координаты для верхнего левого края текстового блока в пикселах, относительно areaId (number)
		xTail, yTail   - координаты конца хвоста в пикселах, относительно areaId (number)
		optionsCustom  - объект со свойствами пузыря, если не задано свойство или вообще объект, то берется из _self.optionsDefault (object)
		*/

		//Обнуляем при создании нового пузыря

		_self.options = {};

		if (!optionsCustom){
			var optionsCustom = {};
		}

		for(var option in _self.optionsDefault){
			_self.options[option] = (optionsCustom[option] === undefined) ? _self.optionsDefault[option] : optionsCustom[option];
		}

		//Записываем аргументы в options
		_self.optionAdd("text", text);
		_self.optionAdd("xBody", xBody);
		_self.optionAdd("yBody", yBody);
		_self.optionAdd("xTail", xTail);
		_self.optionAdd("yTail", yTail);

		var html = _self.createHTML(text, xBody, yBody);

		var svg  = _self.createSVG();

		html.insertAdjacentElement("afterBegin", svg);

		return html;

	}

	//
	//Создаем SVG
	//
	this.createSVG = function(html){
		/**
		* test
		*
		*		
		*/
		var xBody = _self.options.xBody;
		var yBody = _self.options.yBody;
		var xTail = _self.options.xTail;
		var yTail = _self.options.yTail;

		var svg = _self.optionAdd("SVGElement", document.createElementNS("http://www.w3.org/2000/svg", 'svg'));

		var bodyWidth  = _self.optionAdd("bodyWidth", _self.options.textWidth + _self.options.textPadding * 2);
		var bodyHeight = _self.optionAdd("bodyHeight", _self.options.textHeight + _self.options.textPadding * 2);

		//отступ
		var indent = _self.optionAdd("indent", _self.options.borderWidth + _self.getErValue("bigger", [_self.options.shadowH, _self.options.shadowV]) + _self.options.shadowBlurRadius * 3);

		//смещение
		var offsetX = _self.optionAdd("offsetX", ((xBody < xTail) ? 0 : Math.abs(xBody - xTail)) + indent); 
		var offsetY = _self.optionAdd("offsetY", ((yBody < yTail) ? 0 : Math.abs(yBody - yTail)) + indent);

		// Устанавливаем элементу svg атрибуты
		svg.style.position = "absolute";
		svg.style.left     = _self.optionAdd("xSVG", -offsetX) + "px";
		svg.style.top      = _self.optionAdd("ySVG", -offsetY) + "px";
		
		svg.style.width    = _self.optionAdd("SVGWidth", _self.getSVGSize(xBody, xTail, bodyWidth) + indent * 2) + "px";
		svg.style.height   = _self.optionAdd("SVGHeight", _self.getSVGSize(yBody, yTail, bodyHeight) + indent * 2) + "px";

		//Вычисляем реальный радиус скругления границ
		var realRadius = _self.optionAdd("realRadius", _self.getBorderRadius());

		//Рассчитываем координаты пузыря
		_self.calcBubbleCoordinatesInSVG();

		//Нужно ли увеличивать элемент SVG справа и/или снизу
		svg.style.width  = _self.optionAdd("SVGWidth",  _self.getErValue("b", [_self.options.SVGWidth, _self.options.tailCurveP1Abs.x, _self.options.tailCurveP2Abs.x]))  + "px";
		svg.style.height = _self.optionAdd("SVGHeight", _self.getErValue("b", [_self.options.SVGHeight, _self.options.tailCurveP1Abs.y, _self.options.tailCurveP2Abs.y])) + "px";

		//Нужно ли увеличивать элемент SVG слева и/или сверху
		var addSVGWidth  = _self.getErValue("s", [_self.options.SVGWidth, _self.options.tailCurveP1Abs.x, _self.options.tailCurveP2Abs.x]);
		var addSVGHeight = _self.getErValue("s", [_self.options.SVGHeight, _self.options.tailCurveP1Abs.y, _self.options.tailCurveP2Abs.y]);

		if(addSVGWidth < 0 || addSVGHeight < 0){ // если нужно
			addSVGWidth  = (addSVGWidth  < 0) ? Math.abs(addSVGWidth)  : 0; 
			addSVGHeight = (addSVGHeight < 0) ? Math.abs(addSVGHeight) : 0;

			// то пересчитываем размеры SVG
			_self.options.offsetX += addSVGWidth;
			_self.options.offsetY += addSVGHeight;

			svg.style.width = _self.optionAdd("SVGWidth", _self.options.SVGWidth + addSVGHeight) + "px";
			svg.style.left  = _self.optionAdd("xSVG", -_self.options.offsetX) + "px";

			svg.style.height = _self.optionAdd("SVGHeight", _self.options.SVGHeight + addSVGHeight) + "px";
			svg.style.top    = _self.optionAdd("ySVG", -_self.options.offsetY) + "px";

			//и координаты пузыря внутри элемента SVG
			_self.calcBubbleCoordinatesInSVG();

		}

		//сегменты в которых находятся точки основания
		var tailBaseP1Seg = _self.options.pathBody.getPathSegAtLength(_self.options.tailBaseP1Distance);
		var tailBaseP2Seg = _self.options.pathBody.getPathSegAtLength(_self.options.tailBaseP2Distance);

		//Формируем окончательный path для полного рисунка пузыря с хвостом
		var pathBodyMain   = _self.getPathForBodyWithTail();

		pathBodyMain.style.fill        = _self.options.fill;
		pathBodyMain.style.stroke      = _self.options.borderColor;
		pathBodyMain.style.strokeWidth = _self.options.borderWidth;

		pathBodyMain.setAttribute("class", "bubbleBodyMain");


		// фильтр для тени
		var defs = document.createElementNS("http://www.w3.org/2000/svg", 'defs');
		
		var filter = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
		filter.setAttribute("id", "shadow");

		var feGaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", 'feGaussianBlur');
		feGaussianBlur.setAttribute("stdDeviation", _self.options.shadowBlurRadius);

		filter.insertAdjacentElement("beforeEnd", feGaussianBlur);
		defs.insertAdjacentElement("beforeEnd", filter);

		// Тень
		if (_self.options.shadow){
			var pathBodyShadow = document.createElementNS("http://www.w3.org/2000/svg", 'path');
			
			var dPathBodyShadow = pathBodyMain.getAttribute("d");
			//Проходимся по все углам элемента чтобы при отрисовке path рисунок не обрезался
			//Особенно заметно отсутствие этой строки при большом значении shadowBlurRadius
			dPathBodyShadow += " M0,0 M" + _self.options.SVGWidth + ",0 M" + _self.options.SVGWidth + "," + _self.options.SVGHeight + " M0," + _self.options.SVGHeight + " ";
	
			pathBodyShadow.setAttribute("d", dPathBodyShadow);
			pathBodyShadow.setAttribute("filter", "url(#shadow)");
			pathBodyShadow.setAttribute("transform", "translate(" + _self.options.shadowH + "," + _self.options.shadowV + ")");
			
			pathBodyShadow.setAttribute("class", "bubbleBodyShadow");
	
			// shadowV
			pathBodyShadow.style.fill = _self.options.shadowColor;
	
			// вставляем в элемент svg
			svg.insertAdjacentElement("afterBegin", defs);
			svg.insertAdjacentElement("beforeEnd", pathBodyShadow);
		}

		svg.insertAdjacentElement("beforeEnd", pathBodyMain);

		return svg;
	}

	//
	//Рассчитываем координаты всех элементов пузыря
	//
	this.calcBubbleCoordinatesInSVG = function(){
		//Координаты верхнего левого угла тела пузыря в svg-элементе
		var xBodySVG = _self.optionAdd("xBodySVG", _self.options.offsetX);
		var yBodySVG = _self.optionAdd("yBodySVG", _self.options.offsetY);

		//Координаты конца хвоста в svg-элементе
		var temp = _self.coordinatesToSVG(_self.options.xTail, _self.options.yTail);
		var xTailSVG = _self.optionAdd("xTailSVG", temp.x);
		var yTailSVG = _self.optionAdd("yTailSVG", temp.y);
		
		// временный элемент path который описывает тело пузыря
		var pathBody = _self.optionAdd("pathBody", _self.getPathForBody(_self.options.xBodySVG, _self.options.yBodySVG));
		
		//Расчитываем координаты основания хвоста
		_self.calcTailBasePoints();
		//Расчитываем координаты опорных точек
		_self.calcTailCurvePoints();
	}

	//
	//Конвертирование точки из системы координат Container в SVG
	//
	this.coordinatesToSVG = function(x, y){
		var p = {};

		p.x = x - _self.options.xBody - _self.options.xSVG;
		p.y = y - _self.options.yBody - _self.options.ySVG;

		return p;
	}
	
	//
	//Определение точек основания хвоста
	//
	this.calcTailBasePoints = function(){
		// временный элемент path который описывает тело пузыря
		var pathBody = _self.options.pathBody;

		//длина периметра тела пузыря
		var bodyPrimeterLength = _self.optionAdd("bodyPrimeterLength", pathBody.getTotalLength());

		//угол
		var angle = _self.options.tailBaseAngle;

		if (angle === undefined){ // если не задан, то определяем по умолчанию
			angle = _self.getTailAngle();
		} else{
			angle = _self.options.tailBaseAngle % 360;
			angle = (angle > 0) ? angle : angle + 360;
		}

		//расстояние от начала path до центра основания хвоста
		var centerTailBaseDistance = _self.optionAdd("centerTailBaseDistance", angle/360 * bodyPrimeterLength);

		//точка - центр основания хвоста
		var centerTailBase = _self.optionAdd("centerTailBase", pathBody.getPointAtLength(centerTailBaseDistance));

		// _self.setPoint(_self.options.SVGElement, centerTailBase.x, centerTailBase.y);

		//ширина основания хвоста (не должна быть больше половины длины периметра)
		var tailWidth = (_self.options.tailWidth > bodyPrimeterLength/2) ? bodyPrimeterLength/2 : _self.options.tailWidth;

		//расстояние о начала path до точек основания хвоста
		var tailBaseP1Distance = centerTailBaseDistance - tailWidth/2;
		var tailBaseP2Distance = centerTailBaseDistance + tailWidth/2;

		tailBaseP1Distance = (tailBaseP1Distance > 0) ? tailBaseP1Distance : tailBaseP1Distance + bodyPrimeterLength;
		tailBaseP2Distance = (tailBaseP2Distance < bodyPrimeterLength) ? tailBaseP2Distance : tailBaseP2Distance - bodyPrimeterLength;

		_self.optionAdd("tailBaseP1Distance", tailBaseP1Distance);
		_self.optionAdd("tailBaseP2Distance", tailBaseP2Distance);

		//точки основания хвоста
		var tailBaseP1 = _self.optionAdd("tailBaseP1", pathBody.getPointAtLength(tailBaseP1Distance));
		var tailBaseP2 = _self.optionAdd("tailBaseP2", pathBody.getPointAtLength(tailBaseP2Distance));
	}

	//
	//Метод получения угла между центральной осью ординат и прямой проведенной из центра тела пузыря к точке окончания хвоста
	//
	this.getTailAngle = function(){
		//координаты центра тела пузыря
		var x1 = _self.options.xBodySVG + _self.options.bodyWidth/2;
		var y1 = _self.options.yBodySVG + _self.options.bodyHeight/2;
		//координаты окончания хвоста
		var x2 = _self.options.xTailSVG;
		var y2 = _self.options.yTailSVG;

		var angle = Math.atan((y2-y1)/(x2-x1)) * 180 / Math.PI;

		// debugger

		if (x1 <= x2 && y1 >= y2){        // up-right
			return 90 - Math.abs(angle);
		} else if (x1 <= x2 && y1 <= y2){ // down-right
			return Math.abs(angle) + 90;
		} else if (x1 >= x2 && y1 <= y2){ // down-left
			return 90 - Math.abs(angle) + 180;
		} else if (x1 >= x2 && y1 >= y2){ // up-left
			return Math.abs(angle) + 270;
		}

	}

	//
	//Получение размеров svg-элемента
	//
	this.getSVGSize = function(cBody, cTail, bodyLong){
		// cBody    - координата верхнего левого угла тела (x или y)
		// cTail    - координата конца хвоста (x или y)
		// bodyLong - длина тела (высота или ширина)

		// если надо получить ширину передаем координаты хвоста и тела по оси x и ширину
		// если надо получить высоту передаем координаты хвоста и тела по оси y и высоту

		if(cTail < cBody){
			return cBody + bodyLong - cTail;
		} else if(cTail <= (cBody + bodyLong)){
			return bodyLong;
		} else {
			return cTail - cBody;
		}
	}

	//
	//Расчитаем опорные точки кривой Безье для построения хвоста в SVG-элементе
	//
	this.calcTailCurvePoints = function(){
		var p1 = {}; // первая контрольная точка кривой Безье
		var p2 = {}; // вторая контрольная точка кривой Безье

		if(_self.options.tailCurveP1.x == undefined || _self.options.tailCurveP1.y == undefined){ // если координаты опорных точек не определены
			// p1.x = _self.options.xTailSVG;
			// p1.y = _self.options.yTailSVG;

			p1.x = _self.options.centerTailBase.x;
			p1.y = _self.options.centerTailBase.y;

			p1.defined = false;
		} else{
			// p1.x = _self.options.centerTailBase.x + Math.abs(_self.options.xTailSVG - _self.options.centerTailBase.x) * _self.options.tailCurveP1.x;
			// p1.y = _self.options.centerTailBase.y + Math.abs(_self.options.yTailSVG - _self.options.centerTailBase.y) * _self.options.tailCurveP1.y;
			p1.x = _self.options.centerTailBase.x + _self.options.tailCurveP1.x;
			p1.y = _self.options.centerTailBase.y + _self.options.tailCurveP1.y;
			p1.defined = true;
		}

		if(_self.options.tailCurveP2.x == undefined || _self.options.tailCurveP2.y == undefined){ // если координаты опорных точек не определены
			// p2 = p1;
			p2.x = _self.options.xTailSVG;
			p2.y = _self.options.yTailSVG;
			p2.defined = false;

		} else{
			// p2.x = _self.options.centerTailBase.x + Math.abs(_self.options.xTailSVG - _self.options.centerTailBase.x) * _self.options.tailCurveP2.x;
			// p2.y = _self.options.centerTailBase.y + Math.abs(_self.options.yTailSVG - _self.options.centerTailBase.y) * _self.options.tailCurveP2.y;
			p2.x = _self.options.centerTailBase.x + _self.options.tailCurveP2.x;
			p2.y = _self.options.centerTailBase.y + _self.options.tailCurveP2.y;

			// if (!p1.defined) p1 = p2; // на случай ели p2 определена, а p1 нет
		}

		_self.options.tailCurveP1Abs = p1;
		_self.options.tailCurveP2Abs = p2;
	}


	//
	//Формирование path пузыря с хвостом
	//
	this.getPathForBodyWithTail = function(){
		var path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
		var segList = path.pathSegList;

		var bodyPath = _self.options.bodyPath;
		var lengths  = _self.options.segBodyLenghts;
		var radius   = _self.options.realRadius;

		//номера сегментов
		var tailBaseP1SegNumber = bodyPath.getPathSegAtLength(_self.options.tailBaseP1Distance);
		var tailBaseP2SegNumber = bodyPath.getPathSegAtLength(_self.options.tailBaseP2Distance);

		segList.appendItem(path.createSVGPathSegMovetoAbs(_self.options.tailBaseP2.x, _self.options.tailBaseP2.y));

		//Тело
		var segment = tailBaseP2SegNumber
		var targetPoint = {};
		for (var i = 0; i <= 9; i++) {
			//целевая точка
			targetPoint = bodyPath.getPointAtLength(lengths[segment]);
			//проверяем - является ли текущий сегмент последним
			if(i > 1 && segment == tailBaseP1SegNumber){
				targetPoint = bodyPath.getPointAtLength(_self.options.tailBaseP1Distance);
				i = 9;	// заканчиваем цикл после текущей итерации
			}
			
			if(segment % 2 == 0){ // дуга
				segList.appendItem(path.createSVGPathSegArcAbs(targetPoint.x, targetPoint.y, radius, radius, 90, 0, 1));
			} else{ // прямая
				segList.appendItem(path.createSVGPathSegLinetoAbs(targetPoint.x, targetPoint.y));
			}

			// 1 <= segment <= 9
			segment = (++segment) % 10;
			segment = (segment != 0) ? segment : 1;
		};

		//Хвост
		var p1 = _self.options.tailCurveP1Abs; // первая контрольная точка кривой Безье
		var p2 = _self.options.tailCurveP2Abs; // вторая контрольная точка кривой Безье

		// _self.setPoint(_self.options.SVGElement, p1.x, p1.y, "white");
		// _self.setPoint(_self.options.SVGElement, p2.x, p2.y, "black");

		segList.appendItem(path.createSVGPathSegCurvetoCubicAbs(_self.options.xTailSVG  // x
															  , _self.options.yTailSVG  // y
															  , p1.x // x1
															  , p1.y // y1
															  , p2.x  // x2
															  , p2.y  // y2
															  ));


		segList.appendItem(path.createSVGPathSegCurvetoCubicAbs(_self.options.tailBaseP2.x  // x
															  , _self.options.tailBaseP2.y  // y
															  , p2.x  // x1
															  , p2.y  // y1
															  , p1.x  // x2
															  , p1.y  // y2
															  ));

		return path;
	}

	//
	//Формирование path тела пузыря
	//
	this.getPathForBody = function(xStart, yStart){
		/*
		xStart, yStart - координаты левого верхнего угла (без учета borderRadius) в рамках svg-элемента
		*/
		var path = document.createElementNS("http://www.w3.org/2000/svg", 'path');

		var bodyWidth  = _self.options.bodyWidth;
 		var bodyHeight = _self.options.bodyHeight;
 		var radius     = _self.options.realRadius;

 		var svgWidth   = _self.options.SVGWidth
 		var svgHeight  = _self.options.SVGHeight

		//длина прямых частей границ
		var horisontalStreight = _self.optionAdd("horisontalStreight", (bodyWidth - radius * 2));
		var verticalStreight   = _self.optionAdd("verticalStreight", (bodyHeight - radius * 2));

		var segList = path.pathSegList;

		var segBodyLenghts = [];

		segList.appendItem(path.createSVGPathSegMovetoAbs((xStart + bodyWidth/2), yStart));
		segBodyLenghts.push(path.getTotalLength());

		segList.appendItem(path.createSVGPathSegLinetoHorizontalRel(horisontalStreight/2));
		segBodyLenghts.push(path.getTotalLength());
		
		segList.appendItem(path.createSVGPathSegArcRel(radius, radius, radius, radius, 90, 0, 1));
		segBodyLenghts.push(path.getTotalLength());

		segList.appendItem(path.createSVGPathSegLinetoVerticalRel(verticalStreight));
		segBodyLenghts.push(path.getTotalLength());

		segList.appendItem(path.createSVGPathSegArcRel(-radius, radius, radius, radius, 90, 0, 1));
		segBodyLenghts.push(path.getTotalLength());

		segList.appendItem(path.createSVGPathSegLinetoHorizontalRel(-horisontalStreight));
		segBodyLenghts.push(path.getTotalLength());

		segList.appendItem(path.createSVGPathSegArcRel(-radius, -radius, radius, radius, 90, 0, 1));
		segBodyLenghts.push(path.getTotalLength());

		segList.appendItem(path.createSVGPathSegLinetoVerticalRel(-verticalStreight));
		segBodyLenghts.push(path.getTotalLength());

		segList.appendItem(path.createSVGPathSegArcRel(radius, -radius, radius, radius, 90, 0, 1));
		segBodyLenghts.push(path.getTotalLength());

		segList.appendItem(path.createSVGPathSegLinetoHorizontalRel(horisontalStreight/2));
		segBodyLenghts.push(path.getTotalLength());

		_self.optionAdd("segBodyLenghts", segBodyLenghts);

		return _self.optionAdd("bodyPath", path);
	}

	//
	//Радиус скругления углов границ
	//
	this.getBorderRadius = function(){
		var width  = _self.options.bodyWidth;
		var height = _self.options.bodyHeight;
		var radius = _self.options.borderRadius;

		// Определяем длину меньшей из границ
		var smallerBorder = _self.getErValue("smaller", [width, height]);

		// Вычисляем реальный радиус скругления углов
		var realBorderRadius = Math.floor(((smallerBorder - radius * 2) > 0) ? radius : smallerBorder / 2);

		return realBorderRadius;

	}

	//
	//Создаем html
	//
	this.createHTML = function(text, xBody, yBody){
		/*
		text           - текст (string)
		xBody
		yBody        - координаты для верхнего левого края текстового блока в пикселах, относительно areaId (number)
		*/

		//создаем общий контейнер для всего пузыря
		var bubbleContainer = document.createElement("div");

		bubbleContainer.style.position = "absolute";
		bubbleContainer.style.display  = "inline-block";
		bubbleContainer.style.width    = _self.options.textMaxWidth + "px";
		bubbleContainer.style.left     = xBody + "px";
		bubbleContainer.style.top      = yBody + "px";
		
		if(_self.options.className) bubbleContainer.className      = _self.options.className;

		//создаем элемент для текста
		var textContainer = document.createElement("span");
		textContainer.style.position   = "relative";
		textContainer.style.left       = _self.options.textPadding + "px";
		textContainer.style.top        = _self.options.textPadding + "px";
		
		//стилизуем
		textContainer.style.fontFamily = _self.options.fontFamily;
		textContainer.style.fontSize   = _self.options.fontSize;
		textContainer.style.color      = _self.options.fontColor;
		textContainer.style.textAlign  = _self.options.textAlign;
		textContainer.style.display    = "inline-block";

		// вставляем текст
		textContainer.innerHTML = text;


		//вставляем текстовый контейнер в общий
		bubbleContainer.insertAdjacentElement("beforeEnd",textContainer);

		//вставляем готовый пузырь в переданный родительский элемент
		_self.areaId.insertAdjacentElement("beforeEnd",bubbleContainer);

		//После вставки текстового блока в DOM определяем его фактические ширину и высоту
		var textWidth  = _self.optionAdd("textWidth", parseInt(textContainer.offsetWidth));
		var textHeight = _self.optionAdd("textHeight", parseInt(textContainer.offsetHeight));

		// Фиксируем ширину и высоту текстового контейнера
		textContainer.style.width    = textWidth + 2 + "px"; // добавляем пару пикселей на случай если ширина больше на десятые или сотые доли единицы
		textContainer.style.height   = textHeight + "px";
		textContainer.style.position = "absolute";


		//удаляем лишний атрибут у общего контейнера
		bubbleContainer.style.width = "";

		//возвращаем созданный элемент-контейнер нашего пузыря
		return bubbleContainer;
	}

	//
	//Получить большее или меньшее значение
	//
	this.getErValue = function(type, array){
		/*
		type   - какое значение вернуть - меньшее ("s[maller]") или большее ("b[igger]") (string)
		array  - массив значений для сравнения (array)
		*/

		type = type.substr(0, 1).toLowerCase();

		if (!Array.isArray(array)) return false;

		array.sort(function(a, b){
								  if (a > b) return 1;
								  if (a < b) return -1;
								  });

		if(type == "s"){
			return array[0];
		} else if(type == "b"){
			return array[array.length - 1];
		} else{
			return false;
		}
	}

	//
	//Добавляем свойство в объект options
	//
	this.optionAdd = function(name, value){
		_self.options[name] = value;
		return value;
	}

	//
	//Отладочный метод для добавления точки в svg-элемент
	//
	this.setPoint = function(svg, x, y, color){
		var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
		circle.setAttribute("cx", x);
		circle.setAttribute("cy", y);
		circle.setAttribute("r", 2);

		color = (color === undefined) ? "green" : color;

		circle.style.fill = color;

		svg.insertAdjacentElement("beforeEnd", circle);
	}
}

//
//Проверка свойства position элемента
//Если position у переданного элемента равно "static", то возвращается первый родительский элемент с position != "static"
//
function getNotStaticElement(elem){
	var position = getComputedStyle(elem).position;

	while(position == "static" && elem.tagName != "BODY"){
		elem = elem.parentNode;
	}

	return elem;
}

// Полифиллы insertAdjacent* для FireFox 
if (typeof HTMLElement != "undefined" && !HTMLElement.prototype.insertAdjacentElement){
    HTMLElement.prototype.insertAdjacentElement = function(where, element) {
        switch (where){
            case 'beforeBegin':
                this.parentNode.insertBefore(element, this);
            break;

            case 'afterBegin':
                this.insertBefore(element, this.firstChild);
            break;
            
            case 'beforeEnd':
                this.appendChild(element);
            break;
      
            case 'afterEnd':
                if (this.nextSibling){
                    this.parentNode.insertBefore(element, this.nextSibling);
                } else {
                    this.parentNode.appendChild(element);
                }
            break;
        }
    }
}

if (typeof SVGElement != "undefined" && !SVGElement.prototype.insertAdjacentElement){
    SVGElement.prototype.insertAdjacentElement = function(where, element) {
        switch (where){
            case 'beforeBegin':
                this.parentNode.insertBefore(element, this);
            break;

            case 'afterBegin':
                this.insertBefore(element, this.firstChild);
            break;
            
            case 'beforeEnd':
                this.appendChild(element);
            break;
      
            case 'afterEnd':
                if (this.nextSibling){
                    this.parentNode.insertBefore(element, this.nextSibling);
                } else {
                    this.parentNode.appendChild(element);
                }
            break;
        }
    }
}


if (typeof HTMLElement != "undefined" && !HTMLElement.prototype.insertAdjacentHTML){
    HTMLElement.prototype.insertAdjacentHTML = function(where, htmlStr) {
        var r = this.ownerDocument.createRange();
        r.setStartBefore(this);
        var parsedHTML = r.createContextualFragment(htmlStr);
        this.insertAdjacentElement(where, parsedHTML);
    }
}

if (typeof SVGElement != "undefined" && !SVGElement.prototype.insertAdjacentHTML){
    SVGElement.prototype.insertAdjacentHTML = function(where, htmlStr) {
        var r = this.ownerDocument.createRange();
        r.setStartBefore(this);
        var parsedHTML = r.createContextualFragment(htmlStr);
        this.insertAdjacentElement(where, parsedHTML);
    }
}

if (typeof HTMLElement != "undefined" && !HTMLElement.prototype.insertAdjacentText){
    HTMLElement.prototype.insertAdjacentText = function(where, txtStr) {
        var parsedText = document.createTextNode(txtStr);
        this.insertAdjacentElement(where, parsedText);
    }
}

if (typeof SVGElement != "undefined" && !SVGElement.prototype.insertAdjacentText){
    SVGElement.prototype.insertAdjacentText = function(where, txtStr) {
        var parsedText = document.createTextNode(txtStr);
        this.insertAdjacentElement(where, parsedText);
    }
}
