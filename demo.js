window.onload = function(){
    content();
}

function content(){
    var cont = document.getElementById("cont");

    cont.innerHTML = '';

    var bubble = new Bubble(cont);

    
    // bubble.create("I'm Lisa"
    //                       , 120, 120, 450, 450
    //                       , {tailBaseAngle: 180
    //                        , tailWidth: 20
    //                        , tailCurveP1: {x: 0, y: 0.3}
    //                        , tailCurveP2: {x: 0.7, y: 0.3}
    //                         });


    // var div = bubble.create("test test test test", 0, 0);

    bubble.optionsDefault = {
		textMaxWidth         : 200             // максимальная ширина текстового блока в пикселях (number)
	,	textPadding          : 20              // отступ от края пузыря до текста в пикселях (number)
	,	textAlign            : "center"        // выравнивание текста (string)
	,	fontFamily           : "Comic Sans MS" // семейство шрифтов для текста (string)
	,	fontSize             : 16              // размер шрифта в пикселях (number)
	,	fontColor            : "#000000"       // цвет шрифта (color)
	,	borderWidth          : 0.5             // ширина границ (number)
	,	borderColor          : "#000000"       // цвет границ (color)
	,	borderRadius         : 9000            // радиус скругления углов границ
	,	fill                 : "#FFFFFF"       // цвет заливки (color)
	,	shadowColor          : "#000000"       // цвет тени (color)
	,	shadowH              : 1               // смещение тени по горизонтали (number)
	,	shadowV              : -1               // смещение тени по вертикали (number)
	,	shadowBlurRadius     : 2               // радиус размытия тени (number)
	
	,	tailWidth            : 20              // ширина основания хвоста в пикселях (number)
	,	tailBaseAngle        : undefined       // параметр задает угол исходя из которого будет рассчитана точка основания хвоста на периметре тела (number)
	,	tailCurveP1          : {x: undefined, y: undefined}    // координаты первой опорной точки кривой Безье для отрисовки хвоста (object{x: (number), y: (number)})
	,	tailCurveP2          : {x: undefined, y: undefined}    // координаты второй опорной точки кривой Безье для отрисовки хвоста (object{x: (number), y: (number)})
	                                           // координаты задаются как коэффициенты длины от начала кривой до ее конца по каждой из координат

	}


    // bubble.create("down right" , 100,  10, 240, 200, {tailCurveP1: {x: 0, y: 0}});
    // bubble.create("down down"  , 195,  10, 240, 200, {tailCurveP1: {x: 0, y: 0}});
    // bubble.create("down left"  , 300,  10, 240, 200, {tailCurveP1: {x: 0, y: 0}});    
    // bubble.create("right down" ,   0, 130, 240, 200, {tailCurveP1: {x: 0, y: 0}});
    // bubble.create("right right",   0, 175, 240, 200, {tailCurveP1: {x: 0, y: 0}});
    // bubble.create("right up "  ,   0, 230, 240, 200, {tailCurveP1: {x: 0, y: 0}});
    // bubble.create("up__ right" , 100, 400, 240, 200, {tailCurveP1: {x: 0, y: 0}});
    // bubble.create("up up up up", 195, 400, 240, 200, {tailCurveP1: {x: 0, y: 0}});
    // bubble.create("up__ left"  , 300, 400, 240, 200, {tailCurveP1: {x: 0, y: 0}});
    // bubble.create("left_ down" , 550, 90 , 240, 200, {tailCurveP1: {x: 0, y: 0}});
    bubble.create("left_ left_", 550, 175, 240, 200, {tailCurveP1: {x: -0.5, y: 12}});
    // bubble.create("left_ up "  , 550, 280, 240, 200, {tailCurveP1: {x: 0, y: 0}, tailCurveP2: {x: -0.5, y: 0.5}});


 //    var div = bubble.create("test test test test test test testww ", 0, 300, 240, 200, {baseTail: 0.6, p3: [0, 0.2]});
 //    var div = bubble.create("right down" , 0, 165, 240, 200, {direct: 'right', borderWidth: 1, svgAddWidth: 100});
 //    var div = bubble.create("test test test test", 0, 420, 240, 200, {p3 : [1, 0.7], baseTail : 1
 //        , baseTailWidth: 30, svgOffset: 5, textMaxWidth: 200, zIndex: 9000});
 //    var div = bubble.create("test test test test test test3", 160, 420, 240, 200, {baseTail: 0, p3 : [0.9, 0.7], svgOffset: 5});
 //    var div = bubble.create("test", 240, 200, 240, 200, {p3: [1, 0], borderRadius: 0});
 //    var div = bubble.create("test test test", 400, 345, 240, 200);
 //    var div = bubble.create("test test test test test test test test test", 400, 200, 240, 200, {p3 : [0.5, 0], baseTail: 1});
 //    var div = bubble.create("I<b>'m</b> 22", 350, 100, 240, 200, {direct: 'left', backgroundColor: '#FFF', borderColor: '#FFF'});
 //    var div = bubble.create("test test test test test testdd", 300, 5, 240, 200, {baseTail: 0.5, textMaxWidth: 120});
 //    var div = bubble.create("test test testddd", 120, 0, 250, 23, {baseTail : 1, baseTailWidth: 330, svgOffset: 5});
}