window.onload = function(){
    content();
}

function content(){
    var cont = document.getElementById("cont");

    cont.innerHTML = '';

    var bubble = new Bubble(cont);

    
    var div = bubble.create("test test test test test test test test test test test test test test test test test test", 120, 120, 500, 50);
    // var div = bubble.create("test test test test", 0, 0);


    // var div = bubble.create("down right", 100, 10, 240, 200, settings);
    // var div = bubble.create("down down" , 195, 10, 240, 200, settings);
    // var div = bubble.create("down left" , 300, 10, 240, 200, settings);
    
    // var div = bubble.create("right down" , 0, 130, 240, 200, settings);
    // var div = bubble.create("right right", 0, 175, 240, 200, settings);
    // var div = bubble.create("right up "  , 0, 230, 240, 200, {textAura: 50, svgAddWidth: 50, p3: [0.5,1]});

    // var div = bubble.create("up__ right" , 100, 400, 240, 200, settings);
    // var div = bubble.create("up up up up", 195, 400, 240, 200, settings);
    // var div = bubble.create("up__ left"  , 300, 400, 240, 200, settings);

    // var div = bubble.create("left_ down" , 450, 130, 240, 200, settings);
    // var div = bubble.create("left_ left_", 450, 175, 240, 200, settings);
    // var div = bubble.create("left_ up "  , 450, 230, 240, 200, {textAura: 50, svgAddWidth: 50, p3: [0.5,1]});


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