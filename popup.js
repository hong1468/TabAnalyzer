;(function () {
    'use strict';
	var results;
    // all tabs
    document.getElementById('save-all').addEventListener('click', function () {
        chrome.tabs.query({ currentWindow: true }, function (tabsArr) {
            chrome.runtime.sendMessage({ action: 'save', tabsArr: tabsArr, category: results["category"], tags: results["keyword"], language: results["language"]}, function (res) {
                if (res === 'ok') {
                    window.close();
                }
            });
        });
    });

    document.getElementById('save-tab').addEventListener('click', function () {
        chrome.tabs.query({ active: true,currentWindow: true }, function (tab) {
			tab[0].title = $("#tabTitle").val();
            chrome.runtime.sendMessage({ action: 'saveone', tab: tab[0], category: results["category"], tags: results["keyword"], language: results["language"]}, function (res) {
                if (res === 'ok') {
                    window.close();

                }
            });
        });
    });
    
	function preprocessing(html){
        //본문에 필요하지않은 태그들을 지우는 정규표현식
        var result;

        result = html;
        
        result = result.replace(/(->)/gi," ");
        //alert(result);
        result = result.replace(/<style((.|\s)*?)>((.|\s)*?)<(\/)style>/gi," ");
        
        result = result.replace(/<script((.|\s)*?)>((.|\s)*?)<(\/)script>/gi," ");
        
        result = result.replace(/<header((.|\s)*?)>((.|\s)*?)<(\/)header>/gi," ");
        
        result = result.replace(/<footer((.|\s)*?)>((.|\s)*?)<(\/)footer>/gi," ");
        
        result = result.replace(/<pre((.|\s)*?)>((.|\s)*?)<(\/)pre>/gi," "); //코드 형태의 result
        
        result = result.replace(/<nav((.|\s)*?)>((.|\s)*?)<(\/)nav>/gi," ");
        
        result = result.replace(/<form((.|\s)*?)>((.|\s)*?)<(\/)form>/gi," ");
        

//        html = html.replace(/<div([^><]*?)sidebar([^><]*?)>((.|\s)*?)<(\/)div>/gi," ");
//        html = html.replace(/<div([^><]*?)header([^><]*?)>((.|\s)*?)<(\/)div>/gi," ");
//        html = html.replace(/<div([^><]*?)footer([^><]*?)>((.|\s)*?)<(\/)div>/gi," ");

    
        result = result.replace(/(<([^>^<]*?)>)/gi," ");
        result = result.replace(/(<([^><]*?)>)/gi," ");
        result = result.replace(/(<([^><]*?)>)/gi," ");
        
        result = result.replace(/(&nbsp;)/gi," ");
        result = result.replace(/(&quot;)/gi," ");
        result = result.replace(/(&amp;)/gi," ");
        result = result.replace(/(&gt)/gi," ");
        result = result.replace(/(&lt)/gi," ");

        result = result.replace(/\W/gi," ");
        result = result.replace(/\s[0-9]+\s/gi," ");
        result = result.replace(/\s[0-9]+\s/gi," ");
        result = result.replace(/\s[0-9]+\s/gi," ");
 
        result = result.replace(/\s+/gi," ");


        return result;
    }
	function stopwords_remove(file,text){
        var result = text;
        var empty = " ";
        result = empty.concat(result);
        result = result.concat(empty);
        result = result.toLowerCase();
        var stopwordslist = readTextFile(file).split(/\r\n|\r|\n/);
        var reg;
        for(var i=0; i<stopwordslist.length; i++){
            var temp = " "+ stopwordslist[i] + " ";
            reg = new RegExp(temp,'gi')          
            result = result.replace(reg,' ');
        }
        //result = result.replace(/is /,"");
        result = result.replace(/\s+/gi," ");

        if(result.substring(0,1) == ' '){
            result = result.substring(1,result.length);
        }
        return result;
    }

    chrome.extension.onMessage.addListener(function(request, sender){
    	if(request.action == "getSource"){
			var tabFolder = document.getElementById('folderName');
            //alert(request.source);
			var txt = preprocessing(request.source);
            //alert(txt);
			var sw = stopwords_remove("stopwords.txt",txt);
			results = getGoogleNLP(sw,tabFolder);
    	}
    });

    function onWindowLoad() {
    	chrome.tabs.getSelected(null,function(tab){
    		// var title = document.getElementById('title');
    		// title.value = tab.title;

        var tabTitle =document.getElementById('tabTitle');
        tabTitle.value = tab.title;

    	var link = document.getElementById('input');
    	link.value = tab.url;
			
		chrome.tabs.executeScript(null, {
			file: "getSource.js"});
    	});
    }



    window.onload = onWindowLoad;


/*
    // open background page
    document.getElementById('open-background-page').addEventListener('click', function () {
        chrome.runtime.sendMessage({ action: 'openbackgroundpage' }, function (res) {
            if (res === 'ok') {
                window.close();
            }
        });
    });*/

}());