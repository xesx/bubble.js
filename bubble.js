;(function(){
'use strict'
window.Bubble = function (areaId){ 
	this.areaId     = this.getNotStaticElement(areaId); // Контейнер. Это должен быть элемент с position != static, поскольку относительно него будут задаваться координаты

	//Свойства по умолчанию
	this.optionsDefault = {
		textMaxWidth         : 200             // максимальная ширина текстового блока в пикселях (number)
	,	textPadding          : 20              // отступ от края пузыря до текста в пикселях (number)
	,	textAlign            : 'center'        // выравнивание текста (string)
	,	fontFamily           : 'Comic Sans MS' // семейство шрифтов для текста (string)
	,	fontSize             : '16px'          // размер шрифта (string)
	,	fontColor            : undefined       // цвет шрифта (color)
	, lineHeight           : 1.5             // межстрочный интервал
	
	, bubbleWidth          : 0               // ширина тела пузыря (number) по умолчанию не задана и опрежеляется автоматически в зависимости от содержимого
	, bubbleHeight         : 0               // высота тела пузыря (number) ---
	,	borderWidth          : 0.5             // ширина границ (number)
	,	borderColor          : '#000000'       // цвет границ (color)
	,	borderRadius         : 9000            // радиус скругления углов границ
	,	fill                 : '#FFFFFF'       // цвет заливки (color)

	,	shadow               : true            // добавлять ли тень (boolean)
	,	shadowColor          : '#000000'       // цвет тени (color)
	,	shadowH              : 1               // смещение тени по горизонтали (number)
	,	shadowV              : -1               // смещение тени по вертикали (number)
	,	shadowBlurRadius     : 2               // радиус размытия тени (number)
	
	,	tailWidth            : 20              // ширина основания хвоста в пикселях (number)
	,	tailBaseAngle        : undefined       // параметр задает угол исходя из которого будет рассчитана точка основания хвоста на периметре тела (number)
	,	tailCurveP1          : {x: undefined, y: undefined}    // координаты первой опорной точки кривой Безье для отрисовки хвоста (object{x: (number), y: (number)})
	,	tailCurveP2          : {x: undefined, y: undefined}    // координаты второй опорной точки кривой Безье для отрисовки хвоста (object{x: (number), y: (number)})
	                                                           // координаты задаются в системе, где центр основания хвоста это точка [0, 0]
	,	className            : 'bubble'        // имя класса контейнера пузыря (string)

	}

	//Объект для свойств создаваемого пузыря, получаемый слиянием свойств по умолчанию + свойства заданные при вызове функции create в параметре optionsCustom
	this.options = {};
}

Bubble.prototype.count = 0;

Bubble.prototype.create = function(text, xBody, yBody, xTail, yTail, optionsCustom){
	/*
	text           - текст (string)
	xBody, yBody   - координаты для верхнего левого края текстового блока в пикселах, относительно areaId (number)
	xTail, yTail   - координаты конца хвоста в пикселах, относительно areaId (number)
	optionsCustom  - объект со свойствами пузыря, если не задано свойство или вообще объект, то берется из this.optionsDefault (object)
	*/

	//Обнуляем при создании нового пузыря
	this.options = {};
	if (!optionsCustom){
		var optionsCustom = {};
	}
	for(var option in this.optionsDefault){
		this.options[option] = (optionsCustom[option] === undefined) ? this.optionsDefault[option] : optionsCustom[option];
	}
	//Записываем аргументы в options
	this.optionAdd('id', ++Bubble.prototype.count);
	this.optionAdd('text', text);
	this.optionAdd('xBody', xBody);
	this.optionAdd('yBody', yBody);
	this.optionAdd('xTail', xTail);
	this.optionAdd('yTail', yTail);
	var html = this.createHTML(text, xBody, yBody);
	var svg  = this.createSVG();
	html.insertAdjacentElement('afterBegin', svg);
	return html;
}

Bubble.prototype.createSVG = function(html){
	/**
	* Создаем SVG
	*		
	*/
	var xBody = this.options.xBody;
	var yBody = this.options.yBody;
	var xTail = this.options.xTail;
	var yTail = this.options.yTail;
	var svg = this.optionAdd('SVGElement', document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
	var bodyWidth  = (this.options.bubbleWidth  === 0) ? 
									 this.optionAdd('bodyWidth', this.options.textWidth + this.options.textPadding * 2) : 
									 this.optionAdd('bodyWidth', this.options.bubbleWidth);
	var bodyHeight = (this.options.bubbleHeight === 0) ? 
	                 this.optionAdd('bodyHeight', this.options.textHeight + this.options.textPadding * 2) : 
	                 this.optionAdd('bodyHeight', this.options.bubbleHeight); 
	//отступ
	var indent = this.optionAdd('indent', this.options.borderWidth + this.getErValue('bigger', [this.options.shadowH, this.options.shadowV]) + this.options.shadowBlurRadius * 3);
	//смещение
	var offsetX = this.optionAdd('offsetX', ((xBody < xTail) ? 0 : Math.abs(xBody - xTail)) + indent); 
	var offsetY = this.optionAdd('offsetY', ((yBody < yTail) ? 0 : Math.abs(yBody - yTail)) + indent);
	// Устанавливаем элементу svg атрибуты
	svg.style.position = 'absolute';
	svg.style.left     = this.optionAdd('xSVG', -offsetX) + 'px';
	svg.style.top      = this.optionAdd('ySVG', -offsetY) + 'px';
	
	svg.style.width    = this.optionAdd('SVGWidth', this.getSVGSize(xBody, xTail, bodyWidth) + indent * 2) + 'px';
	svg.style.height   = this.optionAdd('SVGHeight', this.getSVGSize(yBody, yTail, bodyHeight) + indent * 2) + 'px';
	//Вычисляем реальный радиус скругления границ
	var realRadius = this.optionAdd('realRadius', this.getBorderRadius());
	//Рассчитываем координаты пузыря
	this.calcBubbleCoordinatesInSVG();
	//Нужно ли увеличивать элемент SVG справа и/или снизу
	svg.style.width  = this.optionAdd('SVGWidth',  this.getErValue('b', [this.options.SVGWidth, this.options.tailCurveP1Abs.x, this.options.tailCurveP2Abs.x]))  + 'px';
	svg.style.height = this.optionAdd('SVGHeight', this.getErValue('b', [this.options.SVGHeight, this.options.tailCurveP1Abs.y, this.options.tailCurveP2Abs.y])) + 'px';
	//Нужно ли увеличивать элемент SVG слева и/или сверху
	var addSVGWidth  = this.getErValue('s', [this.options.SVGWidth, this.options.tailCurveP1Abs.x, this.options.tailCurveP2Abs.x]);
	var addSVGHeight = this.getErValue('s', [this.options.SVGHeight, this.options.tailCurveP1Abs.y, this.options.tailCurveP2Abs.y]);
	if(addSVGWidth < 0 || addSVGHeight < 0){ // если нужно
		addSVGWidth  = (addSVGWidth  < 0) ? Math.abs(addSVGWidth)  : 0; 
		addSVGHeight = (addSVGHeight < 0) ? Math.abs(addSVGHeight) : 0;
		// то пересчитываем размеры SVG
		this.options.offsetX += addSVGWidth;
		this.options.offsetY += addSVGHeight;
		svg.style.width = this.optionAdd('SVGWidth', this.options.SVGWidth + addSVGHeight) + 'px';
		svg.style.left  = this.optionAdd('xSVG', -this.options.offsetX) + 'px';
		svg.style.height = this.optionAdd('SVGHeight', this.options.SVGHeight + addSVGHeight) + 'px';
		svg.style.top    = this.optionAdd('ySVG', -this.options.offsetY) + 'px';
		//и координаты пузыря внутри элемента SVG
		this.calcBubbleCoordinatesInSVG();
	}
	//сегменты в которых находятся точки основания
	var tailBaseP1Seg = this.options.pathBody.getPathSegAtLength(this.options.tailBaseP1Distance);
	var tailBaseP2Seg = this.options.pathBody.getPathSegAtLength(this.options.tailBaseP2Distance);
	//Формируем окончательный path для полного рисунка пузыря с хвостом
	var pathBodyMain   = this.getPathForBodyWithTail();
	pathBodyMain.style.fill        = this.options.fill;
	pathBodyMain.style.stroke      = this.options.borderColor;
	pathBodyMain.style.strokeWidth = this.options.borderWidth;
	pathBodyMain.setAttribute('class', 'bubbleBodyMain');
	// фильтр для тени
	var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
	
	var filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
	filter.setAttribute('id', 'shadow' + this.options.id);
	var feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
	feGaussianBlur.setAttribute('stdDeviation', this.options.shadowBlurRadius);
	filter.insertAdjacentElement('beforeEnd', feGaussianBlur);
	defs.insertAdjacentElement('beforeEnd', filter);
	// Тень
	if (this.options.shadow){
		var pathBodyShadow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		
		var dPathBodyShadow = pathBodyMain.getAttribute('d');
		//Проходимся по все углам элемента чтобы при отрисовке path рисунок не обрезался
		//Особенно заметно отсутствие этой строки при большом значении shadowBlurRadius
		dPathBodyShadow += ' M0,0 M' + this.options.SVGWidth + ',0 M' + this.options.SVGWidth + ',' + this.options.SVGHeight + ' M0,' + this.options.SVGHeight + ' ';

		pathBodyShadow.setAttribute('d', dPathBodyShadow);
		pathBodyShadow.setAttribute('filter', 'url(#shadow' + this.options.id + ')');
		pathBodyShadow.setAttribute('transform', 'translate(' + this.options.shadowH + ',' + this.options.shadowV + ')');
		
		pathBodyShadow.setAttribute('class', 'bubbleBodyShadow');

		// shadowV
		pathBodyShadow.style.fill = this.options.shadowColor;

		// вставляем в элемент svg
		svg.insertAdjacentElement('afterBegin', defs);
		svg.insertAdjacentElement('beforeEnd', pathBodyShadow);
	}
	svg.insertAdjacentElement('beforeEnd', pathBodyMain);
	return svg;
}

Bubble.prototype.calcBubbleCoordinatesInSVG = function(){
/**
* Рассчитываем координаты всех элементов пузыря
*/
	//Координаты верхнего левого угла тела пузыря в svg-элементе
	var xBodySVG = this.optionAdd('xBodySVG', this.options.offsetX);
	var yBodySVG = this.optionAdd('yBodySVG', this.options.offsetY);
	//Координаты конца хвоста в svg-элементе
	var temp = this.coordinatesToSVG(this.options.xTail, this.options.yTail);
	var xTailSVG = this.optionAdd('xTailSVG', temp.x);
	var yTailSVG = this.optionAdd('yTailSVG', temp.y);
	
	// временный элемент path который описывает тело пузыря
	var pathBody = this.optionAdd('pathBody', this.getPathForBody(this.options.xBodySVG, this.options.yBodySVG));
	
	//Расчитываем координаты основания хвоста
	this.calcTailBasePoints();
	//Расчитываем координаты опорных точек
	this.calcTailCurvePoints();
}

Bubble.prototype.coordinatesToSVG = function(x, y){
/**
* Конвертирование точки из системы координат Container в SVG
*/
	var p = {};
	p.x = x - this.options.xBody - this.options.xSVG;
	p.y = y - this.options.yBody - this.options.ySVG;
	return p;
}

Bubble.prototype.calcTailBasePoints = function(){
/**
* Определение точек основания хвоста
*/
	// временный элемент path который описывает тело пузыря
	var pathBody = this.options.pathBody;
	//длина периметра тела пузыря
	var bodyPrimeterLength = this.optionAdd('bodyPrimeterLength', pathBody.getTotalLength());
	//угол
	var angle = this.options.tailBaseAngle;
	if (angle === undefined){ // если не задан, то определяем по умолчанию
		angle = this.getTailAngle();
	} else{
		angle = this.options.tailBaseAngle % 360;
		angle = (angle > 0) ? angle : angle + 360;
	}
	//расстояние от начала path до центра основания хвоста
	var centerTailBaseDistance = this.optionAdd('centerTailBaseDistance', angle/360 * bodyPrimeterLength);
	//точка - центр основания хвоста
	var centerTailBase = this.optionAdd('centerTailBase', pathBody.getPointAtLength(centerTailBaseDistance));
	// this.setPoint(this.options.SVGElement, centerTailBase.x, centerTailBase.y);
	//ширина основания хвоста (не должна быть больше половины длины периметра)
	var tailWidth = (this.options.tailWidth > bodyPrimeterLength/2) ? bodyPrimeterLength/2 : this.options.tailWidth;
	//расстояние о начала path до точек основания хвоста
	var tailBaseP1Distance = centerTailBaseDistance - tailWidth/2;
	var tailBaseP2Distance = centerTailBaseDistance + tailWidth/2;
	tailBaseP1Distance = (tailBaseP1Distance > 0) ? tailBaseP1Distance : tailBaseP1Distance + bodyPrimeterLength;
	tailBaseP2Distance = (tailBaseP2Distance < bodyPrimeterLength) ? tailBaseP2Distance : tailBaseP2Distance - bodyPrimeterLength;
	this.optionAdd('tailBaseP1Distance', tailBaseP1Distance);
	this.optionAdd('tailBaseP2Distance', tailBaseP2Distance);
	//точки основания хвоста
	var tailBaseP1 = this.optionAdd('tailBaseP1', pathBody.getPointAtLength(tailBaseP1Distance));
	var tailBaseP2 = this.optionAdd('tailBaseP2', pathBody.getPointAtLength(tailBaseP2Distance));
}

Bubble.prototype.getTailAngle = function(){
/**
* Метод получения угла между центральной осью ординат и прямой проведенной из центра тела пузыря к точке окончания хвоста
*/
	//координаты центра тела пузыря
	var x1 = this.options.xBodySVG + this.options.bodyWidth/2;
	var y1 = this.options.yBodySVG + this.options.bodyHeight/2;
	//координаты окончания хвоста
	var x2 = this.options.xTailSVG;
	var y2 = this.options.yTailSVG;
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

Bubble.prototype.getSVGSize = function(cBody, cTail, bodyLong){
/**
* Получение размеров svg-элемента
* cBody    - координата верхнего левого угла тела (x или y)
* cTail    - координата конца хвоста (x или y)
* bodyLong - длина тела (высота или ширина)
* если надо получить ширину передаем координаты хвоста и тела по оси x и ширину
* если надо получить высоту передаем координаты хвоста и тела по оси y и высоту
*/
	if(cTail < cBody){
		return cBody + bodyLong - cTail;
	} else if(cTail <= (cBody + bodyLong)){
		return bodyLong;
	} else {
		return cTail - cBody;
	}
}

Bubble.prototype.calcTailCurvePoints = function(){
/**
* Расчитаем опорные точки кривой Безье для построения хвоста в SVG-элементе
*/
	var p1 = {}; // первая контрольная точка кривой Безье
	var p2 = {}; // вторая контрольная точка кривой Безье
	if(this.options.tailCurveP1.x == undefined || this.options.tailCurveP1.y == undefined){ // если координаты опорных точек не определены
		// p1.x = this.options.xTailSVG;
		// p1.y = this.options.yTailSVG;
		p1.x = this.options.centerTailBase.x;
		p1.y = this.options.centerTailBase.y;
		p1.defined = false;
	} else{
		// p1.x = this.options.centerTailBase.x + Math.abs(this.options.xTailSVG - this.options.centerTailBase.x) * this.options.tailCurveP1.x;
		// p1.y = this.options.centerTailBase.y + Math.abs(this.options.yTailSVG - this.options.centerTailBase.y) * this.options.tailCurveP1.y;
		p1.x = this.options.centerTailBase.x + this.options.tailCurveP1.x;
		p1.y = this.options.centerTailBase.y + this.options.tailCurveP1.y;
		p1.defined = true;
	}
	if(this.options.tailCurveP2.x == undefined || this.options.tailCurveP2.y == undefined){ // если координаты опорных точек не определены
		// p2 = p1;
		p2.x = this.options.xTailSVG;
		p2.y = this.options.yTailSVG;
		p2.defined = false;
	} else{
		// p2.x = this.options.centerTailBase.x + Math.abs(this.options.xTailSVG - this.options.centerTailBase.x) * this.options.tailCurveP2.x;
		// p2.y = this.options.centerTailBase.y + Math.abs(this.options.yTailSVG - this.options.centerTailBase.y) * this.options.tailCurveP2.y;
		p2.x = this.options.centerTailBase.x + this.options.tailCurveP2.x;
		p2.y = this.options.centerTailBase.y + this.options.tailCurveP2.y;
		// if (!p1.defined) p1 = p2; // на случай ели p2 определена, а p1 нет
	}
	this.options.tailCurveP1Abs = p1;
	this.options.tailCurveP2Abs = p2;
}

Bubble.prototype.getPathForBodyWithTail = function(){
/**
* Формирование path пузыря с хвостом
*/
	var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	var d = '';
	var bodyPath = this.options.bodyPath;
	var lengths  = this.options.segBodyLenghts;
	var radius   = this.options.realRadius;
	//номера сегментов
	var tailBaseP1SegNumber = bodyPath.getPathSegAtLength(this.options.tailBaseP1Distance);
	var tailBaseP2SegNumber = bodyPath.getPathSegAtLength(this.options.tailBaseP2Distance);
	d = 'M' + this.options.tailBaseP2.x + ',' + this.options.tailBaseP2.y
	
	//Тело
	var segment = tailBaseP2SegNumber
	var targetPoint = {};
	for (var i = 0; i <= 9; i++) {
		//целевая точка
		targetPoint = bodyPath.getPointAtLength(lengths[segment]);
		//проверяем - является ли текущий сегмент последним
		if(i > 1 && segment == tailBaseP1SegNumber){
			targetPoint = bodyPath.getPointAtLength(this.options.tailBaseP1Distance);
			i = 9;	// заканчиваем цикл после текущей итерации
		}
		
		if(segment % 2 == 0){ // дуга
			d += 'A' + ' ' + radius + ' ' + radius + ' ' + 90 + ' ' + 0 + ' ' + 1 + targetPoint.x + ' ' + targetPoint.y;
		} else{ // прямая
			d += 'L' + targetPoint.x + ' ' + targetPoint.y;
		}
		// 1 <= segment <= 9
		segment = (++segment) % 10;
		segment = (segment != 0) ? segment : 1;
	};
	//Хвост
	var p1 = this.options.tailCurveP1Abs; // первая контрольная точка кривой Безье
	var p2 = this.options.tailCurveP2Abs; // вторая контрольная точка кривой Безье
	// this.setPoint(this.options.SVGElement, p1.x, p1.y, 'white');
	// this.setPoint(this.options.SVGElement, p2.x, p2.y, 'black');
	d += 'C' + p1.x + ' ' + p1.y + ' ' + p2.x + ' ' + p2.y + ' ' + this.options.xTailSVG + ' ' + this.options.yTailSVG;
	d += 'C' + p2.x + ' ' + p2.y + ' ' + p1.x + ' ' + p1.y + ' ' + this.options.tailBaseP2.x + ' ' + this.options.tailBaseP2.y;
	path.setAttribute('d', d);
	return path;
}

Bubble.prototype.getPathForBody = function(xStart, yStart){
/**
* Формирование path тела пузыря
* xStart, yStart - координаты левого верхнего угла (без учета borderRadius) в рамках svg-элемента
*/
	var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	var bodyWidth  = this.options.bodyWidth;
		var bodyHeight = this.options.bodyHeight;
		var radius     = this.options.realRadius;
		var svgWidth   = this.options.SVGWidth
		var svgHeight  = this.options.SVGHeight
	//длина прямых частей границ
	var horisontalStreight = this.optionAdd('horisontalStreight', (bodyWidth - radius * 2));
	var verticalStreight   = this.optionAdd('verticalStreight', (bodyHeight - radius * 2));
	var d = '';
	var segBodyLenghts = [];
	d += 'M' + (xStart + bodyWidth/2) + ',' + yStart;
	path.setAttribute('d', d);
	segBodyLenghts.push(path.getTotalLength());
	d += 'h' + horisontalStreight/2;
	path.setAttribute('d', d);
	segBodyLenghts.push(path.getTotalLength());
	d += 'a' + radius + ' ' + radius + ' ' + 90 + ' ' + 0 + ' ' + 1 + ' ' + radius + ' ' + radius;
	path.setAttribute('d', d);
	segBodyLenghts.push(path.getTotalLength());
	d += 'v' + verticalStreight;
	path.setAttribute('d', d);
	segBodyLenghts.push(path.getTotalLength());
	d += 'a' + ' ' +  radius + ' ' +  radius + ' ' +  90 + ' ' +  0 + ' ' +  1 + (-radius) + ' ' +  radius;
	path.setAttribute('d', d);
	segBodyLenghts.push(path.getTotalLength());
	d += 'h ' + (-horisontalStreight);
	path.setAttribute('d', d);
	segBodyLenghts.push(path.getTotalLength());
	d += 'a' + ' ' + radius + ' ' + radius + ' ' + 90 + ' ' + 0 + ' ' + 1 + (-radius) + ' ' + (-radius);
	path.setAttribute('d', d);
	segBodyLenghts.push(path.getTotalLength());
	d += 'v' + (-verticalStreight)
	path.setAttribute('d', d);
	segBodyLenghts.push(path.getTotalLength());
	d += 'a' + ' ' + radius + ' ' + radius + ' ' + 90 + ' ' + 0 + ' ' + 1 + radius + ' ' + (-radius);
	path.setAttribute('d', d);
	segBodyLenghts.push(path.getTotalLength());
	d += 'h' + (horisontalStreight/2)
	path.setAttribute('d', d);
	segBodyLenghts.push(path.getTotalLength());
	this.optionAdd('segBodyLenghts', segBodyLenghts);
	return this.optionAdd('bodyPath', path);
}

Bubble.prototype.getBorderRadius = function(){
/**
* Радиус скругления углов границ
*/
	var width  = this.options.bodyWidth;
	var height = this.options.bodyHeight;
	var radius = this.options.borderRadius;
	// Определяем длину меньшей из границ
	var smallerBorder = this.getErValue('smaller', [width, height]);
	// Вычисляем реальный радиус скругления углов
	var realBorderRadius = Math.floor(((smallerBorder - radius * 2) > 0) ? radius : smallerBorder / 2);
	return realBorderRadius;
}

Bubble.prototype.createHTML = function(text, xBody, yBody){
/**
* Создаем html
* text           - текст (string)
* xBody
* yBody        - координаты для верхнего левого края текстового блока в пикселах, относительно areaId (number)
*/

	//создаем общий контейнер для всего пузыря
	var bubbleContainer = document.createElement('div');
	bubbleContainer.style.position = 'absolute';
	bubbleContainer.style.display  = 'inline-block';
	bubbleContainer.style.width    = this.options.textMaxWidth + 'px';
	bubbleContainer.style.left     = xBody + 'px';
	bubbleContainer.style.top      = yBody + 'px';
	
	if(this.options.className) bubbleContainer.className      = this.options.className;
	//создаем элемент для текста
	var textContainer = document.createElement('span');
	textContainer.style.position   = 'relative';
	textContainer.style.left       = this.options.textPadding + 'px';
	textContainer.style.top        = this.options.textPadding + 'px';
	textContainer.classList.add('bubbleText');
	
	//стилизуем
	textContainer.style.fontFamily = this.options.fontFamily;
	textContainer.style.fontSize   = this.options.fontSize;
	textContainer.style.color      = this.options.fontColor;
	textContainer.style.textAlign  = this.options.textAlign;
	textContainer.style.lineHeight  = this.options.lineHeight;
	textContainer.style.display    = 'inline-block';
	// вставляем текст
	textContainer.innerHTML = text;
	//вставляем текстовый контейнер в общий
	bubbleContainer.insertAdjacentElement('beforeEnd',textContainer);
	//вставляем готовый пузырь в переданный родительский элемент
	this.areaId.insertAdjacentElement('beforeEnd',bubbleContainer);
	//После вставки текстового блока в DOM определяем его фактические ширину и высоту
	var textWidth  = this.optionAdd('textWidth', parseInt(textContainer.offsetWidth));
	var textHeight = this.optionAdd('textHeight', parseInt(textContainer.offsetHeight));
	// Фиксируем ширину и высоту текстового контейнера
	textContainer.style.width    = textWidth + 2 + 'px'; // добавляем пару пикселей на случай если ширина больше на десятые или сотые доли единицы
	textContainer.style.height   = textHeight + 'px';
	textContainer.style.position = 'absolute';
	//удаляем лишний атрибут у общего контейнера
	bubbleContainer.style.width = '';
	//возвращаем созданный элемент-контейнер нашего пузыря
	return bubbleContainer;
}

Bubble.prototype.getErValue = function(type, array){
/**
* Получить большее или меньшее значение
* type   - какое значение вернуть - меньшее ('s[maller]') или большее ('b[igger]') (string)
* array  - массив значений для сравнения (array)
*/
	type = type.substr(0, 1).toLowerCase();

	if (!Array.isArray(array)) return false;

	array.sort(function(a, b){
							  if (a > b) return 1;
							  if (a < b) return -1;
							  });

	if(type == 's'){
		return array[0];
	} else if(type == 'b'){
		return array[array.length - 1];
	} else{
		return false;
	}
}

Bubble.prototype.optionAdd = function(name, value){
/**
* Добавляем свойство в объект options
*/
	this.options[name] = value;
	return value;
}

Bubble.prototype.setPoint = function(svg, x, y, color){
/**
* Отладочный метод для добавления точки в svg-элемент
*/
	var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	circle.setAttribute('cx', x);
	circle.setAttribute('cy', y);
	circle.setAttribute('r', 2);
	color = (color === undefined) ? 'green' : color;
	circle.style.fill = color;
	svg.insertAdjacentElement('beforeEnd', circle);
}

Bubble.prototype.getNotStaticElement = function(elem){
/**
* Проверка свойства position элемента
* Если position у переданного элемента равно 'static', то возвращается первый родительский элемент с position != 'static'
*/
	var position = getComputedStyle(elem).position;

	while(position == 'static' && elem.tagName != 'BODY'){
		elem = elem.parentNode;
		position = getComputedStyle(elem).position;
	}
	return elem;
}

// Полифиллы insertAdjacent* для FireFox 
if (typeof HTMLElement != 'undefined' && !HTMLElement.prototype.insertAdjacentElement){
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

if (typeof SVGElement != 'undefined' && !SVGElement.prototype.insertAdjacentElement){
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


if (typeof HTMLElement != 'undefined' && !HTMLElement.prototype.insertAdjacentHTML){
  HTMLElement.prototype.insertAdjacentHTML = function(where, htmlStr) {
    var r = this.ownerDocument.createRange();
    r.setStartBefore(this);
    var parsedHTML = r.createContextualFragment(htmlStr);
    this.insertAdjacentElement(where, parsedHTML);
  }
}

if (typeof SVGElement != 'undefined' && !SVGElement.prototype.insertAdjacentHTML){
  SVGElement.prototype.insertAdjacentHTML = function(where, htmlStr) {
    var r = this.ownerDocument.createRange();
    r.setStartBefore(this);
    var parsedHTML = r.createContextualFragment(htmlStr);
    this.insertAdjacentElement(where, parsedHTML);
  }
}

if (typeof HTMLElement != 'undefined' && !HTMLElement.prototype.insertAdjacentText){
  HTMLElement.prototype.insertAdjacentText = function(where, txtStr) {
    var parsedText = document.createTextNode(txtStr);
    this.insertAdjacentElement(where, parsedText);
  }
}

if (typeof SVGElement != 'undefined' && !SVGElement.prototype.insertAdjacentText){
  SVGElement.prototype.insertAdjacentText = function(where, txtStr) {
    var parsedText = document.createTextNode(txtStr);
    this.insertAdjacentElement(where, parsedText);
  }
}
})();