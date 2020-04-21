;
(function () {
    'use strict';
    chrome.storage.local.get(function (storage) {

        var opts = storage.options || {
            closeTabsOpt: 'no'
        };


        // from the array of Tab objects it makes an object with date and the array
        function makeTabGroup(tabsArr, topic) {
            var tabGroup = {
                dateG: Date.now(),
                id: Date.now() // clever wy to quickly get a unique ID
            };
            tabGroup.name = topic;
            tabGroup.tabs = tabsArr;

            return tabGroup;
        }

        function makeTab(tab, topic) {
            var tab;
            tab.name = topic;

        }


        // filters tabGroup for stuff like pinned tabs, chrome:// tabs, etc.
        /*function filterTabGroup(tabGroup) {
            return tabGroup;
        }*/

        // saves array (of Tab objects) to localStorage

        // Save All (모든 탭 저장)
        function saveTabGroup(tabGroup) {
            chrome.storage.local.get('tabGroups', function (storage) {
                var newArr;

                if (storage.tabGroups) {
                    newArr = storage.tabGroups;
                    newArr.push(tabGroup);

                    chrome.storage.local.set({
                        tabGroups: newArr
                    });
                } else {
                    chrome.storage.local.set({
                        tabGroups: [tabGroup]
                    });
                }
            });
        }

        // Save Tab (단일 탭 저장)
        function saveSingleTab(tab, topic, tags) {
            tab.tags = tags;
            chrome.storage.local.get('tabGroups', function (storage) {
                var flag = 0;
                if (storage.tabGroups) {
                    for (var i = 0; i < storage.tabGroups.length; i++) {
                        var tabGroup;
                        tabGroup = storage.tabGroups[i];
                        if (topic == storage.tabGroups[i].name) {
                            flag = 1;
                            storage.tabGroups[i].tabs.push(tab);
                            chrome.storage.local.set({
                                tabGroups: storage.tabGroups
                            });
                            break;
                        }
                    }
                    if (flag == 0) {
                        var tabGroup = makeTabGroup([tab], topic);
                        saveTabGroup(tabGroup);
                    }
                }
                /*
            if (storage.tabGroups) {
				var tabGroup = storage.tabGroups;
                for(var i=0;i<tabGroup.length; i++){
                    if (topic == tabGroup[i].name){
                        tabGroup[i].tabs.push(tab);
                        break;
					}
                }
                //var tabGroup = makeTabGroup(tab,topic);
                //saveTabGroup(tabGroup);

                chrome.storage.local.set({ tabGroups: tabGroup});
            }*/
                else {
                    var tabGroup = makeTabGroup([tab], topic);
                    saveTabGroup(tabGroup);
                }
            });
        }


        function makeID(input) {
            input.id = String(Date.now());
            return input;
        }

        function saveTabwithInfo(tabInfo) {
            chrome.storage.local.get('tablist', function (storage) {
                if (storage.tablist) {
                    var tabs = storage.tablist;
                    tabs[tabInfo.id] = tabInfo;
                    chrome.storage.local.set({
                        tablist: tabs
                    });
                } else {
                    var tabs = {};
                    tabs[tabInfo.id] = tabInfo;
                    chrome.storage.local.set({
                        tablist: tabs
                    });
                }
            });
        }

        // close all the tabs in the provided array of Tab objects
        function closeTabs(tabsArr) {
            var tabsToClose = [],
                i;

            for (i = 0; i < tabsArr.length; i += 1) {
                tabsToClose.push(tabsArr[i].id);
            }

            chrome.tabs.remove(tabsToClose, function () {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError)
                }
            });
        }

        // makes a tab group, filters it and saves it to localStorage
        function saveTabs(tabsArr, topic) {
            //alert(tabsArr.length);

            var tabGroup = makeTabGroup(tabsArr, topic);
            // cleanTabGroup = filterTabGroup(tabGroup);

            saveTabGroup(tabGroup); //cleanTabGroup
        }


        // sidebar
        // start

        chrome.windows.getAll({
            populate: true
        }, getAllOpenWindows);

        function getAllOpenWindows(winData) {
            var total = 0;
            var taburl = [];
            var tabtitle = [];
            for (var i in winData) {
                if (winData[i].focused === true) {
                    var winTabs = winData[i].tabs;
                    var totTabs = winTabs.length;
                    total = totTabs;
                    for (var j = 0; j < totTabs; j++) {
                        taburl[j] = winTabs[j].url; //title
                        tabtitle[j] = winTabs[j].title;
                    }
                }
            }

            for (var i = 1; i <= total; i++) {
                var bttn = "bttn" + i;
                var btn = document.getElementById('bttn' + i).addEventListener('click', function () {
                    //이 위치는 이 함수가 listener 에 추가되는 부분이고
                    //실제로 이 함수가 호출될 때에는 i 값이 존재하지 않기 때문에
                    //정상적인 작동을 하지 않는 상태
                    var htmltext = httpGet(taburl[i - 1].toString());
                    //chrome.runtime.sendMessage({
                    //    action: 'sidebar'
                    //}, function (res) {
                    //    if (res === 'ok') {
                    //       alert("success");
                    //    }
                    //});
                });
                var temp = document.getElementById(bttn);
                $(temp).show();
                document.getElementById(bttn).innerHTML = tabtitle[i - 1];
            }
        }

        function httpGet(theUrl) {
            var texts;
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (this.readyState == this.DONE && this.status == 200) {
                    texts = this.responseText;
                }
            }
            xmlhttp.open("GET", theUrl, false);
            xmlhttp.send();
            return texts;
        }

        //window.onload = onWindowLoad;


        //sidebar end


        // listen for messages from popup
        chrome.runtime.onMessage.addListener(function (req, sender, sendRes) {
            switch (req.action) {
                case 'save':
                    var Programming = ["Programming", "Java"];
                    var CS_Not_Programming = ["Internet & Telecom", "Computers & Electronics", "Computer Science"];
                    if (Programming.includes(req.category)) {
                        req.category = "P" + req.category;
                    } else if (CS_Not_Programming.includes(req.category)) {
                        req.category = "C" + req.category;
                    } else {
                        req.category = "O" + req.category;
                    }

                    saveTabs(req.tabsArr, req.category);
                    //openBackgroundPage(); // opening now so window doesn't close
                    if (opts.closeTabsOpt === 'yes')
                        closeTabs(req.tabsArr);
                    sendRes('ok'); // acknowledge
                    window.location.reload(true);
                    break;

                case 'saveone':
                    req = makeID(req);
                    saveTabwithInfo(req);
					var Programming = ["Programming","Java"];
                    var CS_Not_Programming = ["Internet & Telecom", "Computers & Electronics", "Computer Science", "Operating Systems","Software"];
                    if (Programming.includes(req.category)) {
                        saveSingleTab(req.tab, "P" + req.language, req.tags);
                    } else if (CS_Not_Programming.includes(req.category)) {
                        saveSingleTab(req.tab, "C" + req.tags[0], req.tags);
                    } else {
                        saveSingleTab(req.tab, "O" + req.category, req.tags);
                    }
                    if (opts.closeTabsOpt === 'yes')
                        closeTabs(req.tab);
                    window.location.reload(true);
                    sendRes('ok');
                    break;
                case 'sidebar':
                    sendRes('ok');
                default:
                    sendRes('nope'); // acknowledge
                    break;
            }
        });
    });
}());