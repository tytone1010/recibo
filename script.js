/* Shivving (IE8 is not supported, but at least it won't look as awful)
/* ========================================================================== */
(function (document) {
	var
	head = document.head = document.getElementsByTagName('head')[0] || document.documentElement,
	elements = 'article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output picture progress section summary time video x'.split(' '),
	elementsLength = elements.length,
	elementsIndex = 0,
	element;

	while (elementsIndex < elementsLength) {
		element = document.createElement(elements[++elementsIndex]);
	}

	element.innerHTML = 'x<style>' +
		'article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}' +
		'audio[controls],canvas,video{display:inline-block}' +
		'[hidden],audio{display:none}' +
		'mark{background:#FF0;color:#000}' +
	'</style>';

	return head.insertBefore(element.lastChild, head.firstChild);
})(document);

/* ========================================================================== */
/* Helper: detectar modo AppSheet (URL corta con id)
/* ========================================================================== */
function esModoAppSheet() {
	return new URLSearchParams(window.location.search).has("id");
}

/* Prototyping
/* ========================================================================== */
(function (window, ElementPrototype, ArrayPrototype, polyfill) {
	function NodeList() { [polyfill] }
	NodeList.prototype.length = ArrayPrototype.length;

	ElementPrototype.matchesSelector = ElementPrototype.matchesSelector ||
	ElementPrototype.mozMatchesSelector ||
	ElementPrototype.msMatchesSelector ||
	ElementPrototype.oMatchesSelector ||
	ElementPrototype.webkitMatchesSelector ||
	function matchesSelector(selector) {
		return ArrayPrototype.indexOf.call(this.parentNode.querySelectorAll(selector), this) > -1;
	};

	ElementPrototype.ancestorQuerySelectorAll = ElementPrototype.ancestorQuerySelectorAll ||
	ElementPrototype.mozAncestorQuerySelectorAll ||
	ElementPrototype.msAncestorQuerySelectorAll ||
	ElementPrototype.oAncestorQuerySelectorAll ||
	ElementPrototype.webkitAncestorQuerySelectorAll ||
	function ancestorQuerySelectorAll(selector) {
		for (var cite = this, newNodeList = new NodeList; cite = cite.parentElement;) {
			if (cite.matchesSelector(selector)) ArrayPrototype.push.call(newNodeList, cite);
		}
		return newNodeList;
	};

	ElementPrototype.ancestorQuerySelector = ElementPrototype.ancestorQuerySelector ||
	ElementPrototype.mozAncestorQuerySelector ||
	ElementPrototype.msAncestorQuerySelector ||
	ElementPrototype.oAncestorQuerySelector ||
	ElementPrototype.webkitAncestorQuerySelector ||
	function ancestorQuerySelector(selector) {
		return this.ancestorQuerySelectorAll(selector)[0] || null;
	};
})(this, Element.prototype, Array.prototype);

/* ========================================================================== */
/* Helper Functions
/* ========================================================================== */
function generateTableRow() {
	var emptyColumn = document.createElement('tr');

	emptyColumn.innerHTML =
		'<td><a class="cut">-</a><span contenteditable></span></td>' +
		'<td><span contenteditable></span></td>' +
		'<td><span contenteditable>0</span></td>' +
		'<td><span contenteditable>0.00</span></td>' +
		'<td><span>0.00</span></td>';

	return emptyColumn;
}

function parseFloatHTML(element) {
	return parseFloat(element.innerHTML.replace(/[^\d\.\-]+/g, '')) || 0;
}

function parsePrice(number) {
	return number.toFixed(2);
}

/* ========================================================================== */
/* Update Invoice (DESACTIVADO en modo AppSheet)
/* ========================================================================== */
function updateInvoice() {
	if (esModoAppSheet()) return;

	var total = 0;
	var cells, price, a, i;

	for (a = document.querySelectorAll('table.inventory tbody tr'), i = 0; a[i]; ++i) {
		cells = a[i].querySelectorAll('td span');

		price = parseFloatHTML(cells[2]) * parseFloatHTML(cells[3]);
		total += price;
		cells[4].innerHTML = parsePrice(price);
	}

	var totalSpan = document.querySelector('table.balance span');
	if (totalSpan) totalSpan.innerHTML = parsePrice(total);
}

/* ========================================================================== */
/* On Content Load
/* ========================================================================== */
function onContentLoad() {

	/* 🔒 MODO APP (solo lectura) */
	if (esModoAppSheet()) {
		document.querySelectorAll('[contenteditable]').forEach(el => {
			el.removeAttribute('contenteditable');
		});

		document.querySelectorAll('.cut,.add').forEach(el => {
			el.style.display = 'none';
		});

		return; // no activar eventos de edición
	}

	updateInvoice();

	if (window.addEventListener) {
		document.addEventListener('keydown', updateInvoice);
		document.addEventListener('keyup', updateInvoice);
	}
}

window.addEventListener && document.addEventListener('DOMContentLoaded', onContentLoad);
