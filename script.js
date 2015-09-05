window.onload = function(){

    var cont = document.getElementById("cont");
    var bubble = new Bubble(cont);

    bubble.textMaxWidth = 150;
    //test

    //right
    var div = bubble.create("test test test test ", 0, 0, 240, 200);
    var div = bubble.create("test test ", 0, 171, 240, 200);
    var div = bubble.create("test test test test test test test ", 0, 300, 240, 200);
 //    //up
	var div = bubble.create("test test test test test test test test", 0, 420, 240, 200, 1, 0.5);
	var div = bubble.create("test test test test test test", 160, 420, 240, 200, 0, 0, 'up');
    var div = bubble.create("test test test", 350, 420, 240, 200);

	//left
	var div = bubble.create("test test test", 400, 345, 240, 200);
    var div = bubble.create("test test test", 400, 200, 240, 200);
    var div = bubble.create("test test test test test test", 350, 100, 240, 200);
	//down
	var div = bubble.create("test test test test test test", 350, 0, 240, 200, 0, 0.2, 'left');
    var div = bubble.create("test test test", 120, 0, 240, 200, 0, 0);



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