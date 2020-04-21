;(function ($) {
    'use strict'

    var opts = {};

    document.addEventListener('DOMContentLoaded', function () {
        chrome.storage.local.get('options', function (storage) {
            var opts = storage.options || {};

			 if (opts.closeTabsOpt === undefined) {
                $('input[name="closeTabsOpt"][value="no"]').prop('checked', 'checked');
            } else {
                $('input[name="closeTabsOpt"][value="' + opts.closeTabsOpt + '"]').prop('checked', 'checked');
            }
			
            if (opts.deleteTabOnOpen === undefined) {
                $('input[name="deleteTabOnOpen"][value="no"]').prop('checked', 'checked');
            } else {
                $('input[name="deleteTabOnOpen"][value="' + opts.deleteTabOnOpen + '"]').prop('checked', 'checked');
            }
			
			if (opts.displayUrls === undefined) {
                $('input[name="displayUrls"][value="no"]').prop('checked', 'checked');
            } else {
                $('input[name="displayUrls"][value="' + opts.displayUrls + '"]').prop('checked', 'checked');
            }
			
			if (opts.orderUrls === undefined) {
                $('input[name="orderUrls"][value="no"]').prop('checked', 'checked');
            } else {
                $('input[name="orderUrls"][value="' + opts.orderUrls + '"]').prop('checked', 'checked');
            }
        });
    });

    document.getElementsByName('save')[0].addEventListener('click', function () {
        var closeTabsOpt = document.querySelector('input[name="closeTabsOpt"]:checked').value;
		var deleteTabOnOpen = document.querySelector('input[name="deleteTabOnOpen"]:checked').value;
		var displayUrls = document.querySelector('input[name="displayUrls"]:checked').value;
		var orderUrls = document.querySelector('input[name="orderUrls"]:checked').value;
        chrome.storage.local.set({
            options: {
				closeTabsOpt: closeTabsOpt,
                deleteTabOnOpen: deleteTabOnOpen,
				displayUrls: displayUrls,
				orderUrls: orderUrls
				
            }
        }, function () { // show "settings saved" notice thing
            document.getElementById('saved').style.display = 'block';
            window.setTimeout(function () {
                document.getElementById('saved').style.display = 'none';
            }, 1000);
        });
    });

}(jQuery));
