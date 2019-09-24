// ==UserScript==
// @name         p4u-activity-dialog
// @description  Keyboard shortcuts for P4U Activity dialogs
// @version      1.2.0
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

     /**
      * Activates various Task list enhancments.
      */
    function enhanceTable() {
        //Table header sorting pop-up menu originally displays only on right click, which is counter-intuitive in a browser.
        leftClickContextMenu();
        //Activate keyboard shorcuts for the highlighted table row.
        registerShortcuts();
        //Artifact state dialog opens when double-clicking a table row.
        registerDoubleClickStateChange();
    }

    function leftClickContextMenu() {
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

    function registerShortcuts() {
        window.addEventListener("keydown", ev => {
            if (ev.code === 'KeyS') {
                console.debug('Trigger Artifact state change');
                const row = getHighlightedTableRow();
                if (row) {
                    changeArticactState(row);
                } else {
                    console.debug('No Artifact is highlighted.')
                }
            }
        });
    }

    function registerDoubleClickStateChange() {
        const dbl = (ev) => {
            console.log(ev);
            changeArticactState(ev.currentTarget);
        }
        Array.from(document.getElementById('listID').querySelectorAll('tbody > tr'))
            .forEach(tr => { tr.addEventListener("dblclick", dbl); })
    }

    /**
     * @returns (HTMLTableRowElement) row
     */
    function getHighlightedTableRow() {
        return document.getElementById('listID').querySelector('tbody > tr.Actual');
    }

    /**
     * @param row (HTMLTableRowElement) - Table row
     */
    function changeArticactState(row) {
        if (row && !!(row.cells)) {
            const a = row.cells[5].querySelector('a');
            if (a) {
                a.click();
            } else {
                console.error('Cannot trigger Artifact state change. Wrong element: ', row);
            }
        }
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

    observer.observe(document.body, { childList: true, subtree: true });
    enhanceTable();
})();
