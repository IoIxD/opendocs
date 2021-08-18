console.log("does this load");
var page = document.querySelector(".page"); var sel = window.getSelection();
function getSelectedTextInfo() {
	sel_text = new DOMParser().parseFromString(sel.toString(), 'text/html').body.textContent;
	parent = sel.getRangeAt(sel.rangeCount-1).commonAncestorContainer.parentNode;
	all_text = new DOMParser().parseFromString(parent.innerHTML, 'text/html').body.textContent;
	offset = sel.focusOffset - sel_text.length;
	tagname = parent.tagName;
	return {sel, sel_text, all_text, offset, tagname, parent};
}
function select(el) {
	var range = document.createRange();
	range.setStart(el.childNodes[2], 5);
	range.collapse(true);
	sel.removeAllRanges();
	sel.addRange(range);
}
function bolden() {
	s = getSelectedTextInfo();
	output = [" ", s.all_text.slice(0, s.offset), "</n><b>"+s.sel_text+"</b><n> ", s.all_text.slice(s.offset+s.sel_text.length)].join('');
	s.parent.innerHTML = output;
}
function italicize() {
	s = getSelectedTextInfo();
	output = [" ", s.all_text.slice(0, s.offset), "</n><i>"+s.sel_text+"</i><n> ", s.all_text.slice(s.offset+s.sel_text.length)].join('');
	s.parent.innerHTML = output;
}
function underline() {
	s = getSelectedTextInfo();
	output = [" ", s.all_text.slice(0, s.offset), "</n><u>"+s.sel_text+"</u><n> ", s.all_text.slice(s.offset+s.sel_text.length)].join('');
	s.parent.innerHTML = output;
}
page.addEventListener("click", function() {
	sel = window.getSelection();
})
