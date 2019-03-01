// ==UserScript==
// @name         p4u-activity-dialog
// @description  Keyboard shortcuts for P4U Activity dialogs
// @version      1.1.0
// @namespace    https://plus4u.net/
// @author       bubblefoil
// @license      MIT
// @match        https://plus4u.net/*
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    GM_addStyle(`
    .p4u-ext-clickable:hover{
        cursor: pointer;    
    }
     `);

    function enhanceTable() {
        const th1 = document.getElementById('listID_headcell_0');
        if (!th1) return;

        Array
            .from(th1.parentElement.cells)
            .slice(1, 5)//drop first and last cols
            .forEach(c => {
                c.classList.add('p4u-ext-clickable');
                c.onclick = function (e) {
                    c.oncontextmenu(e);
                };
            });
    }

    const onFrameLoaded = function (iframe) {
        if (iframe.id !== 'modal-iframe1') {
            console.debug('p4u-activity-dialog:', `No iframe with id "modal-iframe1"`);
            return;
        }
        const btnOk = iframe.contentDocument.getElementById('form-btn-ok');
        if (btnOk) {
            btnOk.parentElement.title = "Ctrl + Enter";
        }
        const btnCancel = iframe.contentDocument.getElementById('form-btn-cancel');
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
        const optionsBlock = iframe.contentDocument.getElementById('listbox_FIRST_ListContentTag');
        if (optionsBlock) {
            setTimeout(function () {
                optionsBlock.focus();
            }, 10);
        }
    };

    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            [].filter.call(mutation.addedNodes, function (node) {
                return node.nodeName === 'IFRAME' && node.id === 'modal-iframe1';
            }).forEach(function (node) {
                node.addEventListener('load', function (e) {
                    console.debug('p4u-activity-dialog:', 'enhancing loaded iframe', node.id);
                    onFrameLoaded(node);
                });
            });
        });
    });

    observer.observe(document.body, {childList: true, subtree: true});
    enhanceTable();
})();
