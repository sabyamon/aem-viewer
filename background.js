var rePattern = new RegExp('^(http[s]?[:]//[^/]+[^\.]+)\.(.+)');

function isUrlExisting(url)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url);
	http.setRequestHeader('Cookie', '');
	http.withCredentials = false;
    http.onreadystatechange = function() {
        if (this.readyState == this.DONE) {
            if(this.status == 400) {
                return true;
            }
        }
        return false;
    };
    http.send();
}




