(function(){jPaq={toString:function(){return"jPaq"}};RegExp.fromWildExp=function(c,a){for(var d=a&&a.indexOf("o")>-1,f,b,e="",g=a&&a.indexOf("l")>-1?"":"?",h=RegExp("~.|\\[!|"+(d?"{\\d+,?\\d*\\}|[":"[")+(a&&a.indexOf("p")>-1?"":"\\(\\)")+"\\{\\}\\\\\\.\\*\\+\\?\\:\\|\\^\\$%_#<>]");(f=c.search(h))>-1&&f<c.length;)e+=c.substring(0,f),e+=(b=c.match(h)[0])=="[!"?"[^":b.charAt(0)=="~"?"\\"+b.charAt(1):b=="*"||b=="%"?".*"+g:
b=="?"||b=="_"?".":b=="#"?"\\d":d&&b.charAt(0)=="{"?b+g:b=="<"?"\\b(?=\\w)":b==">"?"(?:\\b$|(?=\\W)\\b)":"\\"+b,c=c.substring(f+b.length);e+=c;a&&(/[ab]/.test(a)&&(e="^"+e),/[ae]/.test(a)&&(e+="$"));return RegExp(e,a?a.replace(/[^gim]/g,""):"")};String.prototype.findPattern=function(c,a){var d=this.match(RegExp.fromWildExp(c,a));return d!=null&&(a||"").indexOf("g")<0?d[0]:d};String.prototype.indexOfPattern=function(c,a){var d=[];this.replace(RegExp.fromWildExp(c,a),function(){d.push(arguments[arguments.length-
2])});return(a||"").indexOf("g")<0||!d.length?d[0]||null:d};String.prototype.replacePattern=function(c,a,d){return this.replace.apply(this,[RegExp.fromWildExp(c,a),d])}})();
