function Bubble(areaId){
	var _self = this;
	
	this.areaId     = areaId; // Контейнер. Это должен быть элемент с position != static, поскольку относительно него будут задаваться координаты

	//Свойства по умолчанию
	this.optionsDefault = {
		textMaxWidth      : 200         // максимальная ширина текстового блока в пикселях (number)
	,	textPadding       : 20          // отступ от края пузыря до текста в пикселях (number)
	,	textAlign         : "center"    // выравнивание текста (string)
	,	borderWidth       : 1           // ширина границ (number)
	,	borderColor       : "#000000"   // цвет границ (color)
	,	borderRadius      : 40          // радиус скругления углов границ
	,	fill              : "#FFFFFF"   // цвет заливки (color)
	,	shadowColor       : "#000000"   // цвет тени (color)
	,	shadowBlurRadius  : 5           // радиус размытия тени (number)
	}

	this.create = function(text, bubbleX, bubbleY, optionsCustom){
		/*
		text           - текст (string)
		bubbleX
		bubbleY        - координаты для верхнего левого края текстового блока в пикселах, относительно areaId (number)
		optionsCustom  - объект со свойствами пузыря, если не задано свойство или вообще объект, то берется из _self.optionsDefault (object)
		*/

		_self.options = {};

		if (!optionsCustom){
			var optionsCustom = {};
		}

		for(option in _self.optionsDefault){
			_self.options[option] = (optionsCustom[option] === undefined) ? _self.optionsDefault[option] : optionsCustom[option];
		}

		var html = _self.createHTML(text, bubbleX, bubbleY);
		var svg  = _self.createSVG(html);

	}

	//
	//Создаем SVG
	//
	this.createSVG = function(html){
		var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');

		var textWidth  = parseInt(html.textContainer.style.width);
		var textHeight = parseInt(html.textContainer.style.height);

		var bodyWidth  = textWidth + _self.options.textPadding * 2;
		var bodyHeight = textHeight + _self.options.textPadding * 2;

		//отступ
		var indent = _self.options.borderWidth + _self.options.shadowBlurRadius * 3;

		// Устанавливаем элементу svg атрибуты
		svg.style.position = "absolute";
		svg.style.left     = -(indent) + "px";
		svg.style.top      = -(indent) + "px";
		svg.style.width    = bodyWidth + indent * 2 + "px";
		svg.style.height   = bodyHeight + indent * 2 +"px";

		//Вычисляем реальный радиус скругления границ
		var radius = _self.getBorderRadius(bodyWidth, bodyHeight, _self.options.borderRadius);

		// атрибут d для Body
		var dBody = _self.getDForBody(svg, indent, indent, bodyWidth, bodyHeight, radius);

		// фильтр для тени
		var filter ="<defs><filter id=\"shadow\"><feGaussianBlur stdDeviation=\"" + _self.options.shadowBlurRadius + "\"/></filter></defs>";

		// стиль для тени
		var styleShadow = "\"stroke:" + "none" + ";stroke-width:" + "0" + "px;fill:" + _self.options.borderColor + "\"";
		// стиль для контура
		var styleBorder = "\"stroke:" + _self.options.borderColor + ";stroke-width:" + _self.options.borderWidth + "px;fill:" + "none" + "\"";
		// стиль для фона
		var styleFill = "\"stroke:" + "none" + ";stroke-width:" + "0" + "px;fill:" + _self.options.fill + "\"";

		// путь для тени Body
		var pathBodyShadow = "<path d = \"" + dBody + "\" style = " + styleShadow + " filter=\"url(#shadow)\"" + "/>";
		// путь для контура Body
		var pathBodyBorder = "<path d = \"" + dBody + "\" style = " + styleBorder + "/>";
		// путь для фона Body
		var pathBodyFill = "<path d = \"" + dBody + "\" style = " + styleFill + "/>";

		// вставляем в элемент svg
		svg.insertAdjacentHTML("beforeEnd", filter);
		svg.insertAdjacentHTML("beforeEnd", pathBodyShadow);
		svg.insertAdjacentHTML("beforeEnd", pathBodyBorder);
		svg.insertAdjacentHTML("beforeEnd", pathBodyFill);

		html.bubbleContainer.insertAdjacentElement("afterBegin", svg);
	}

	//
	//Формирование атрибута d для тела пузыря
	//
	this.getDForBody = function(svg, xStart, yStart, bodyWidth, bodyHeight, radius){
		/*
		svg            - svg-элемент для которого создается path
		xStart, yStart - координаты левого верхнего угла (без учета borderRadius) в рамках svg-элемента
		bodyWidth      - ширина пузыря
		bodyHeight     - высота пузыря
		radius         - радиус скругления углов границ пузыря
		*/

		// Ширина и высота svg-элемента
		var svgWidth  = parseInt(svg.style.width);
		var svgHeight = parseInt(svg.style.height);

		//длина прямых частей границ
		var horisontalStreight = (bodyWidth - radius * 2);
		var verticalStreight   = (bodyHeight - radius * 2);
		
		var d   = "";
		//Проходимся по все углам элемента чтобы при отрисовке path рисунок не обрезался
		//Особенно заметно отсутствие этой строки при большом значении shadowBlurRadius
		d += "M0,0 M" + svgWidth + ",0 M" + svgWidth + "," + svgHeight + " M0," + svgHeight + " ";

		d += "M" + (xStart + radius) + "," + yStart + " a" + radius + "," + radius + " 0 0 0 " + (-radius) + "," + radius + " ";
		d += "v" + "0," + verticalStreight + " ";
		d += "a" + radius + "," + radius + " 0 0 0 " + radius + "," + radius + " ";
		d += "h" + horisontalStreight + ",0" + " ";
		d += "a" + radius + "," + radius + " 0 0 0 " + radius + "," + (-radius) + " ";
		d += "v" + "0," + (-verticalStreight) + " ";
		d += "a" + radius + "," + radius + " 0 0 0 " + (-radius) + "," + (-radius) + " ";
		d += "z";

		return d;
	}

	//
	//Радиус скругления углов границ
	//
	this.getBorderRadius = function(width, height, radius){
		/*
		width  - ширина тела пузыря (int)
		height - высота тела пузыря (int)
		radius - заданный радиус скругления границ
		*/

		// Определяем длину меньшей из границ
		var smallerBorder = (width < height) ? width : height;

		// Вычисляем реальный радиус скругления углов
		var realBorderRadius = Math.floor(((smallerBorder - radius * 2) > 0) ? radius : smallerBorder / 2);

		return realBorderRadius;

	}

	//
	//Создаем html
	//
	this.createHTML = function(text, bubbleX, bubbleY){
		/*
		text           - текст (string)
		bubbleX
		bubbleY        - координаты для верхнего левого края текстового блока в пикселах, относительно areaId (number)
		*/

		//создаем общий контейнер для всего пузыря
		var bubbleContainer = document.createElement("div");

		bubbleContainer.style.position = "absolute";
		bubbleContainer.style.display  = "inline-block";
		bubbleContainer.style.maxWidth = _self.options.textMaxWidth + "px";
		bubbleContainer.style.left     = bubbleX + "px";
		bubbleContainer.style.top      = bubbleY + "px";

		//создаем элемент для текста
		var textContainer = document.createElement("span");
		textContainer.style.position   = "relative";
		textContainer.style.left       = _self.options.textPadding + "px";
		textContainer.style.top        = _self.options.textPadding + "px";
		
		// вставляем текст
		textContainer.innerHTML = text;

		//вставляем текстовый контейнер в общий
		bubbleContainer.insertAdjacentElement("beforeEnd",textContainer);

		//вставляем готовый пузырь в переданный родительский элемент
		_self.areaId.insertAdjacentElement("beforeEnd",bubbleContainer);

		//После вставки текстового блока в DOM определяем его фактические ширину и высоту
		var textWidth  = parseInt(textContainer.offsetWidth);
		var textHeight = parseInt(textContainer.offsetHeight);

		// Фиксируем ширину и высоту текстового контейнера
		textContainer.style.width    = textWidth + "px";
		textContainer.style.height   = textHeight + "px";
		textContainer.style.display  = "inline-block";
		textContainer.style.position = "absolute";

		//выравниваем текст
		textContainer.style.textAlign = _self.options.textAlign;

		//удаляем лишний атрибут у общего контейнера
		bubbleContainer.style.maxWidth = "";

		//возвращаем созданный элемент-контейнер нашего пузыря
		return {
				bubbleContainer: bubbleContainer
			,	textContainer: textContainer
			}
	}
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

if (typeof HTMLElement != "undefined" && !HTMLElement.prototype.insertAdjacentHTML){
    HTMLElement.prototype.insertAdjacentHTML = function(where, htmlStr) {
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
