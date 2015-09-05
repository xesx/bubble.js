window.onload = function(){

    var cont = document.getElementById("cont");
    var bubble = new Bubble(cont);


    //test

    //up
    // var div = bubble.create("qws", 200, 200, 100, 50);
    // var div = bubble.create("test qweqwe qweqwe qweqwe ", 200, 200, 250, 50);
    // var div = bubble.create(" tetetsttdtsdsdfdsfsdfsdf fdsfsdf fsdfsdf ываываыва sffs dtd ddfdfd", 200, 200, 300, 50);
    //down
	// var div = bubble.create("test qweqwe qweqwe qweqwe ", 200, 200, 100, 450);
	// var div = bubble.create("tetetsttdtsdsdfdsfsdfsdf fdsfsdf fsdfsdf ываываыва sffs dtd ddfdfd", 200, 200, 250, 450);
	// var div = bubble.create("test qweqwe qweqwe qweqwe ", 200, 200, 300, 450);
	//left
	// var div = bubble.create("tetetst tdtsd sdfdsfs  tdtsd sdfd tdtsd sdfd tdtsd sdfddfsdf fd", 200, 200, 50, 200);
	// var div = bubble.create("tetetsttdtsdsdfdsfsdfsdf fdsfsdf fsdfsdf ываываыва sffs dtd ddfdfd", 200, 200, 50, 230);
	// var div = bubble.create("tetetsttdtsdsdfdsfdddddddddddddddddddddddddddыыыыыыыыыыыыыыdsdfsdf fdsfsdf fsdfsdf ываываыва sffs dtd ddfdfd", 200, 200, 50, 250);
	//right
	// var div = bubble.create("tetetst tdtsd sdfdsfs  tdtsd sdfd tdtsd sdfd tdtsd sdfd", 200, 200, 450, 200);
	// var div = bubble.create("test qweqwe qwetetetsttdtsdsdfdsfdddddddddddddddddddddddddddыыыыыыыыыыыыыыdsdfsdfqwe qweqwe ", 200, 200, 450, 240);
	var div = bubble.create("test word", 200, 200, 450, 450);

	var divt = div.getElementsByClassName('bubbleText')[0];

    divt.addEventListener("mouseenter", 
    	function(){
    		// alert("test" + this.style.backGroundColor);
    		// this.style.backgroundColor = 'blue';
    		var bubbleText = this;
    		var bubbleTail = this.parentNode.getElementsByClassName('bubbleTail')[0];

    		bubbleText.style.backgroundColor = "#ff9";
    		bubbleText.classList.add("bubbleTextShine");

    		bubble.drawTail(bubbleTail, "#ff9", "#FFF");

    	})

    divt.addEventListener("mouseleave", 
    	function(){
    		// alert("test" + this.style.backGroundColor);
    		// this.style.backgroundColor = 'blue';
    		var bubbleText = this;
    		var bubbleTail = this.parentNode.getElementsByClassName('bubbleTail')[0];

    		bubbleText.style.backgroundColor = "#fff";
    		bubbleText.classList.remove("bubbleTextShine");

    		bubble.drawTail(bubbleTail, "#fff");

    	})
}