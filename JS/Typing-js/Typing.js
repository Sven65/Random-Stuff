var type = function(speed, textToWrite, content) {
    var text = "";
    $content = $(content);
    speed = typeof speed !== 'undefined' ? speed : 50;
    var tmpfunc = function (){
        var tmp = textToWrite.slice(0, 1);
        if (tmp == "<") {
            var tag = textToWrite.match(/<(.*?)>/)[0];
            textToWrite = textToWrite.replace(tag,"");
            text += tag;
            $content.html(text.replace(/\n/g, "<br />"));
        } else if (tmp != '') {
            textToWrite = textToWrite.slice(1);
            text += tmp;

            // Redraw
            $content.html(text.replace(/\n/g, "<br />"));
        } else {
            clearInterval(curInterval);
        }
    };
    curInterval = setInterval(tmpfunc, speed);
};
$(window).keydown(function(e){
    clearInterval(curInterval);
    text += textToWrite;
    textToWrite = "";
    $content.html(text.replace(/\n/g, "<br />"));
});
