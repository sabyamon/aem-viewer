var currentUrl;
var activatedNodes = new Array();

chrome.tabs.getSelected(null, function(tab) {

    // Sabya : Get the selected Tab .
    var rePattern = new RegExp('^(http[s]?[:]//[^/]+[^\.]+)\.(.+)');
    var webgrp = rePattern.exec(tab.url); // Get the URL of the TAB , extension was opened for .
    if (webgrp.length > 0) {
        //var pageURL = webgrp[1] + '.infinity.json'; // Get the inifinity json of that page if its exposed .
        var pageURL = webgrp[1] + '.tidy.-1.json'; // Changing it to tidy.json as some pages are creating issues with inifinity.
        // Specifically for AEM 5.6
        console.log(pageURL);

        $.ajax({
            url : pageURL,
            async : true,
            type : 'GET',
            timeout : 5500,
            dataType : "json",
            statusCode: {
                200: function(data, status, request) {
                    getPageInformation(tab, data);
                    getSkimmedPageInformation(tab, data);
                }
            },
            success : function(data, status, request) {
                console.log('Inside success !!') ;
            },
            error : function (xhr, ajaxOptions, thrownError) {
                console.log('Sabya is screwed ! Something wrong happened!!') ;
                $('#error_fadfish').text('Sorry ! No Data is available for this page');
            }
        });
    }

});



<!-- Full Dynatree starts here -->

<!-- Create the RAW Data here starts here -->

var getPageInformation = function(tab, data) {
    $(function() {
        $("#tree").dynatree(
            {
                onDblClick : function(node, event) {
                    if (isProp(node)) {
                        var cmpUrl = currentUrl
                            + createURL(node.getParent()
                                                .getParent(), '');
                        return false;
                    }
                },
                
                onClick : function(node, event) {
                    if (event.altKey && isComp(node)) {
                        var cmpUrl = currentUrl
                            + createURL(node, '') + '.html';
                        chrome.tabs.create({
                            'url' : cmpUrl,
                            'selected' : true
                        });
                    }
                }

            });
    });

    var obj = [];
    createDynatree(obj, data);
    $("#tree").dynatree("getRoot").addChild(obj);

    $("#tree").dynatree("getRoot").visit(function(node) {

        if (isActivatedNode(node)) {
            node.expand(true);
        }
    });

};

<!-- Create the RAW Data ends here -->


<!-- Create the Skimmed Data starts here -->

var getSkimmedPageInformation = function(tab, data) {
    $(function() {
        $("#treeskimmed").dynatree(
            {
                onDblClick : function(node, event) {
                    if (isProp(node)) {
                        var cmpUrl = currentUrl
                            + createURL(node.getParent()
                                                .getParent(), '');
                        return false;
                    }
                },
                
                onClick : function(node, event) {
                    if (event.altKey && isComp(node)) {
                        var cmpUrl = currentUrl
                            + createURL(node, '') + '.html';
                        chrome.tabs.create({
                            'url' : cmpUrl,
                            'selected' : true
                        });
                    }
                }

            });
    });

    var obj = [];
    createSkimmedDynatree(obj, data);
    $("#treeskimmed").dynatree("getRoot").addChild(obj);

    $("#treeskimmed").dynatree("getRoot").visit(function(node) {

        if (isActivatedNode(node)) {
            node.expand(true);
        }
    });

};


<!-- Full Dyna tree -->

var createURL = function(node, s) {

    if (node.data.title != null)
        s = '/' + node.data.title + s;

    if (node.getParent() == null)
        return s;
    else
        return createURL(node.getParent(), s);

};




var createDynatree = function(object, allData) {

    var counter = 0;
    for ( var k in allData) {
        var title = k;
        title = '<div>' + title + '</div>';

        if (typeof (allData[k]) != 'object') {
            object[counter] = {
                title : title,
                isFolder : true,
                classNames: { }
            };
            object[counter].children = [];
            object[counter].children[0] = {
                title : allData[k],
                isFolder : false
            };
        } else {
            object[counter] = {
                title : title,
                isFolder : true,
            };
            object[counter].children = [];
            createDynatree(object[counter].children, allData[k]);
        }
        counter++;
    }
};




var createSkimmedDynatree = function(object, allData) {

    var counter = 0;
    for ( var k in allData) {
            var title = k;

                if(title === 'jcr:content'){
                    title = "Properties" ;
                }else if(title === 'jcr:mixinTypes'){
                    continue ;
                }else if(title === 'jcr:createdBy'){
                    continue ;
                }else if(title === 'jcr:created'){
                    continue ;
                }else if(title === 'jcr:primaryType'){
                    continue ;
                }else if(title === 'jcr:description'){
                    title = 'Meta Description' ;
                }else if(title === 'sling:resourceType'){
                    title = 'Resource Type' ;
                }else if(title === 'pageTitle'){
                    title = 'Browser Title' ;
                }else if (title === 'metakeywords'){
                    title = 'Meta Keywords';
                }else if(title === 'cq:template'){
                    title = 'Template' ;
                }else if(title === 'cq:lastReplicatedBy'){
                    title = 'Last Activator' ;
                }else if(title === 'jcr:mixinTypes'){
                    continue ;
                }else if(title === 'cq:lastReplicationAction'){
                    continue ;
                }else if(title === 'cq:lastModifiedBy'){
                    title = 'Last Modifier' ;
                }else if(title === 'cq:lastModified'){
                    title = 'Last Modified Date' ;
                }else if(title === 'cq:lastReplicated'){
                    title = 'Last Activated Date' ;
                }else if(title === 'jcr:created'){
                    continue;
                }else if(title === 'jcr:uuid'){
                    continue;
                }else if(title === 'jcr:baseVersion'){
                    continue;
                }else if(title === 'jcr:primaryType'){
                    continue;
                }else if(title === 'jcr:isCheckedOut'){
                    continue;
                }else if(title === 'jcr:predecessors'){
                    continue;
                }else if(title === 'jcr:versionHistory'){
                    continue;
                }else if(title === 'jcr:title'){
                    title = 'Title in Siteadmin' ;
                }else{
                    console.log('inside else block');
                    continue ;
                }

                title = '<div>' + title + '</div>';

                if (typeof (allData[k]) != 'object') {
                    object[counter] = {
                        title : title,
                        isFolder : true,
                        classNames: { }
                    };
                    object[counter].children = [];
                    object[counter].children[0] = {
                        title : allData[k],
                        isFolder : false
                    };
                } else {
                    object[counter] = {
                        title : title,
                        isFolder : true,
                    };
                    object[counter].children = [];
                    createSkimmedDynatree(object[counter].children, allData[k]);
                }
                counter++;
        
    }
};




var isActivatedNode = function(node) {
    return activatedNodes.indexOf(getPath(node)) > -1;
};


function isProp(node) {
    return node.getChildren() == null;
};

function isComp(node) {
    return node.getChildren() != null
        && node.getChildren()[0].getChildren() != null;
};



var getPath = function(node) {
    return createURL(node, '');
};






