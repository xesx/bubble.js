'use strict'

window.onload = function(){
    content();
}

function content(){
    var cont = document.getElementById("cont");
    var cont1 = document.getElementById("cont1");

    // Делаем сетку
    cont1.innerHTML = '';

    var cell = 10;
    var div;
    for (var i = 0; i < 500; i += cell) {
        div = document.createElement("div");
        div.style.borderBottom = "1px solid rgba(200, 200, 200, 0.5)";
        div.style.height = (cell - 1) + "px";
        div.style.width = 500 + 12 + "px";
        div.style.position = "absolute";
        div.style.left = -12 + "px";
        div.style.top = i + "px";
        div.style.fontSize = 6 + "px";
        div.innerHTML = i+10;
        cont.insertAdjacentElement("beforeEnd", div);
    };

    for (var i = 0; i < 500; i += cell) {
        div = document.createElement("div");
        div.style.borderRight = "1px solid rgba(200, 200, 200, 0.5)";
        div.style.height = 500 + 12 + "px";
        div.style.width = (cell - 1) + "px";
        div.style.position = "absolute";
        div.style.left = i + "px";
        div.style.top = -12 + "px";
        div.style.fontSize = 6 + "px";
        div.innerHTML = i+10;
        cont.insertAdjacentElement("beforeEnd", div);
    };

    // Создаем пузыри
    // Определяем контейнер
    var bubble = new Bubble(cont1);
    
    //Задаем кастомные свойства по умолчанию для все пузырей в данном контейнере
    bubble.optionsDefault.textMaxWidth     = 200             // максимальная ширина текстового блока в пикселях (number)
    bubble.optionsDefault.textPadding      = 20              // отступ от края пузыря до текста в пикселях (number)
    bubble.optionsDefault.textAlign        = "center"        // выравнивание текста (string)
    bubble.optionsDefault.fontFamily       = "Comic Sans MS" // семейство шрифтов для текста (string)
    bubble.optionsDefault.fontSize         = 16              // размер шрифта в пикселях (number)
    bubble.optionsDefault.fontColor        = "#000000"       // цвет шрифта (color)
    bubble.optionsDefault.borderWidth      = 0.5             // ширина границ (number)
    bubble.optionsDefault.borderColor      = "#000000"       // цвет границ (color)
    bubble.optionsDefault.borderRadius     = 9000            // радиус скругления углов границ
    bubble.optionsDefault.fill             = "#FFFFFF"       // цвет заливки (color)
    bubble.optionsDefault.shadowColor      = "#000000"       // цвет тени (color)
    bubble.optionsDefault.shadowH          = 1               // смещение тени по горизонтали (number)
    bubble.optionsDefault.shadowV          = -1               // смещение тени по вертикали (number)
    bubble.optionsDefault.shadowBlurRadius = 2               // радиус размытия тени (number)
    bubble.optionsDefault.tailWidth        = 20              // ширина основания хвоста в пикселях (number)
    bubble.optionsDefault.tailBaseAngle    = undefined       // параметр задает угол исходя из которого будет рассчитана точка основания хвоста на периметре тела (number)
    bubble.optionsDefault.tailCurveP1      = {x: undefined, y: undefined}    // координаты первой опорной точки кривой Безье для отрисовки хвоста (object{x: (number), y: (number)})
    bubble.optionsDefault.tailCurveP2      = {x: undefined, y: undefined}    // координаты второй опорной точки кривой Безье для отрисовки хвоста (object{x: (number), y: (number)})
	                                                                         // координаты задаются как коэффициенты длины от начала кривой до ее конца по каждой из координат

    // Создаем пузыри
    // Объект контейнера пузыря.create("текст внутри пузыря"
    //                               , коодината пузыря по оси x в контейнере
    //                               , коодината пузыря по оси y в контейнере
    //                               , коодината хвоста пузыря по оси y в контейнере
    //                               , коодината хвоста пузыря по оси y в контейнере
    //                               , {свойства для данного пузыря}
    //                                )
    bubble.create("down right" , 100,  10, 240, 200, {tailCurveP1: {x: 0, y: 0}});
    bubble.create("down down"  , 195,  10, 240, 200, {tailWidth: 20, tailCurveP1: {x: 0, y: 0}, tailCurveP2: {x: -10, y: 120}});
    bubble.create("down left"  , 300,  10, 240, 200, {});    
    bubble.create("right down" ,   0, 130, 240, 200, {});
    bubble.create("right right",   0, 175, 240, 200, {shadow: false});
    bubble.create("right up "  ,   0, 230, 240, 200, {});
    bubble.create("up__ right" , 100, 400, 240, 200, {});
    bubble.create("up up up up", 195, 400, 240, 200, {});
    bubble.create("up__ left"  , 300, 400, 240, 200, {});
    bubble.create("left_ down" , 550, 90 , 240, 200, {tailBaseAngle: -90, tailCurveP1: {x: -100, y: -50}, tailCurveP2: {x: -200, y: -50}});
    bubble.create("left_ left_", 550, 175, 240, 200, {tailCurveP1: {x: -100, y: -150}, tailCurveP2: {x: -200, y: 150}});
    bubble.create("left_ up "  , 550, 280, 240, 200, {tailWidth: 20, tailBaseAngle: -110, tailCurveP1: {x: 0, y: 0}, tailCurveP2: {x: -150, y: 120}});

    var output = document.getElementById("output");

    output.insertAdjacentText("afterBegin", cont1.innerHTML);
}