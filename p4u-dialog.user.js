// ==UserScript==
// @name         p4u-activity-dialog
// @description  Keyboard shortcuts for P4U Activity dialogs
// @version      1.0.0
// @namespace    https://plus4u.net/
// @author       bubblefoil
// @license      MIT
// @match        https://plus4u.net/*
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';
    var onFrameLoaded = function (iframe) {
        if (iframe.id !== 'modal-iframe1') {
            console.log('p4u-activity-dialog:',`No iframe with id "modal-iframe1"`);
            return;
        }
        var btnOk = iframe.contentDocument.getElementById('form-btn-ok');
        if (btnOk) {
            btnOk.parentElement.title = "Ctrl + Enter";
        }
        var btnCancel = iframe.contentDocument.getElementById('form-btn-cancel');
        if (btnCancel) {
            btnCancel.parentElement.title = "Escape";
        }
        iframe.contentDocument.onkeydown = function (e) {
            if (btnOk && e.key === 'Enter' && e.ctrlKey) {
                btnOk.parentElement.click();
            } else if (btnCancel && e.key === 'Escape') {
                btnCancel.parentElement.click();
            }
        };
        var optionsBlock = iframe.contentDocument.getElementById('listbox_FIRST_ListContentTag');
        if (optionsBlock) {
            setTimeout(function () {
                optionsBlock.focus();
            }, 10);
        }
    };

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            [].filter.call(mutation.addedNodes, function (node) {
                return node.nodeName === 'IFRAME' && node.id === 'modal-iframe1';
            }).forEach(function (node) {
                node.addEventListener('load', function (e) {
                    console.log('p4u-activity-dialog:', 'enhancing loaded iframe', node.id);
                    onFrameLoaded(node);
                });
            });
        });
    });
    observer.observe(document.body, {childList: true, subtree: true});
})();
