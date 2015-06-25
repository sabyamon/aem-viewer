var currentUrl;
var activatedNodes = new Array();
var relativePagePath;
var scrollableInterval;
var actualDomain ; // Will be used to hold the domain name and port.

chrome.tabs.getSelected(null, function (tab) {

    // Global Variables . will be set when the extension loads.
    // Will be used across functionality

    var host = "";
    var port = "";
    var scheme = "";
    var actualAEMPageURL = "";
    var actualPageURLWithoutQueryParam = "";
    var firstPart = "";
    var schemeAndDomain = "" ;

    var imagePath = chrome.extension.getURL('icon.png');
    console.log('image path is :' + imagePath);

    $('#fadfishImage').attr('src', imagePath);

    console.log('Extension clicked');

    $('#myTab a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    /**
     * Clicking on any other tab will clear the periodic update to the server log.
     */
    $('#quickLinks, #nodeView, #skimmedView').click(function(){
        $('.scrollable-logs').hide();
        window.clearInterval(scrollableInterval);
    });

    /**
       Fetch Server Logs only when this tab is clicked . Reducing the extension load time.
     */

    // Handle quick link clicks.
    $('.quick_button').click(function () {
        url = $(this).data('url');
        console.log('quick links clicked .. ' + url);

        window.open(url, '_blank');
    });

    // Opening in CRXDE .
    $('#open-in-crxde').click(function () {
        url = $(this).data('url');
        console.log('quick links clicked .. ' + url);
        window.open(url, '_blank');
    })


    // Handle Rebuild Client Libs
    $('#rebuild-client-libs').click(function () {
        url = $(this).data('url');
        console.log('rebuilding client libraries.. ' + url);
        window.open(url, '_blank');
    })

    // Handle WCM Mode Switcher.

    $('.wcm_mode_switcher').click(function () {
        // actualPageURLWithoutQueryParam will not have any query string present.
        // Relax and append wcmmode to it.

        currentPageURL = actualPageURLWithoutQueryParam + '.html';
        console.log('current page url is : ' + currentPageURL);
        var desiredMode = $(this).attr('id');
        console.log('desired mode is ' + desiredMode);
        if ((desiredMode === 'edit' || desiredMode === 'design') && currentPageURL.indexOf('/cf#') === -1) {
            currentPageURL = currentPageURL.replace(firstPart, firstPart + '/cf#');
        } else if (desiredMode === 'disabled') {
            currentPageURL = currentPageURL.replace('/cf#', "");
        }


        if(desiredMode === 'debugClientLibs'){
            if(currentPageURL.indexOf('debugClientLibs=true')){
                currentPageURL = currentPageURL.replace('?debugClientLibs=true', "");
            }else{
                currentPageURL = currentPageURL.concat('?debugClientLibs=true');
            }
        }else{
            currentPageURL = currentPageURL.concat('?wcmmode=' + desiredMode);
        }

        console.log('calculated current page url is : ' + currentPageURL);

        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.update(tab.id, {url: currentPageURL});
        });

    });


    // Sabya : Get the selected Tab .
    var rePattern = new RegExp('^(http[s]?[:]//[^/]+[^\.]+)\.(.+)');
    var webgrp = rePattern.exec(tab.url); // Get the URL of the TAB , extension was opened for .
    console.log('url value is : ' + webgrp);
    // url value is : http://localhost:4502/content/fadfish/home.html,http://localhost:4502/content/fadfish/home,html

    actualAEMPageURL = webgrp; // Setting value of global var. Will be used by other functionalities.

    if (webgrp.length > 0) {
        //var pageURL = webgrp[1] + '.infinity.json'; // Get the inifinity json of that page if its exposed .
        var pageURL = webgrp[1] + '.tidy.-1.json'; // Changing it to tidy.json.

        console.log('page url : ' + pageURL);

        actualPageURLWithoutQueryParam = webgrp[1];
        // Extract Host and Port .


        var tempURL = pageURL;
        var disectedURL = tempURL.split('/');

        scheme = disectedURL[0];
        host = disectedURL[2];

        firstPart = scheme + "//" + host;
        schemeAndDomain = scheme + "//" + host;

        console.log('first part of the url is : ' + firstPart);

        if (pageURL.indexOf('cf#') > 0) {
            console.log('User has opened the page with content finder');
            pageURL = pageURL.replace("/cf#", "");
            console.log('page url after chopping off the cf# from url : ' + pageURL);
        } else if (pageURL.indexOf('/editor.html') > 0) {
            pageURL = pageURL.replace("/editor.html", "");
        } else {
            console.log('User has opened the page in publish mode');
        }
        relativePagePath = pageURL;
        relativePagePath = relativePagePath.replace(firstPart, "");
        relativePagePath = relativePagePath.substring(0, relativePagePath.indexOf("."));
        console.log('relative page path :: ' + relativePagePath);


        // pageURL == http://localhost:4502/content/fadfish/home.tidy.-1.json

        $.ajax({
            url: pageURL,
            async: true,
            type: 'GET',
            dataType: "json",
            timeout: 5500,
            statusCode: {
                200: function (data, status, request) {

                    console.log('status is : ' + status);
                    console.log('data from AEM is : ' + data);

                    createQuickLinks(tab, firstPart, relativePagePath);
                    getPageInformation(tab, data);
                    getSkimmedPageInformation(tab, data);
                }
            },
            success: function (data, status, request) {
                console.log('Inside success !!');
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log('Its screwed ! Something wrong happened!!');
                $('.error_fadfish').text('Sorry ! No Data is available for this page');
            }
        });


        // Fetch Log


        $('.server-log-tab').click(function() {
            $('.bar').animate({ width: "100%" },3000);
            scrollableInterval = setInterval(function() {
                // Do something after 5 seconds
                urlForServerLogs = schemeAndDomain + '/bin/crxde/logs?tail=200';
                console.log('fetching log or host :: ' + urlForServerLogs );

                $.ajax({
                    url: urlForServerLogs,
                    async: true,
                    type: 'GET',
                    timeout: 5500,
                    statusCode: {
                        200: function (data, status, request) {

                            console.log('status is : ' + status);
                            console.log('data from AEM is : ' + data);
                            $('.scrollable-logs').html(data);
                            $('.scrollable-logs').show();
                            $('html, body').scrollTop( $(document).height() );
                            //$('.scrollable-logs').scrollTop($('.scrollable-logs')[0].scrollHeight);

                            /*var d = $('.scrollable-logs');
                            d.scrollTop(d.prop("scrollHeight"));*/
                        }
                    },
                    success: function (data, status, request) {
                        console.log('Inside success !!');
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log('Its screwed ! Something wrong happened!!');
                        $('.error_fadfish').text('Sorry ! No Data is available for this page');
                    }
                });

            }, 5000);
        });
    }

});


<!-- Create Quick Links starts here -->

function createQuickLinks(tab, dynamicPart, relativePagePath) {

    console.log('creating quick links for AEM Viewer');
    var welcomePageURL = dynamicPart + '/welcome';
    var siteAdmin = dynamicPart + '/siteadmin';
    var crxde = dynamicPart + '/crx/de';
    var sysconsole = dynamicPart + '/system/console';
    var crxexplorer = dynamicPart + '/crx/explorer';
    var configMgr = dynamicPart + '/system/console/configMgr';
    var resourceResolverConfig = dynamicPart + '/system/console/configMgr/org.apache.sling.jcr.resource.internal.JcrResourceResolverFactoryImpl';
    var resourceResolverTest = dynamicPart + '/system/console/jcrresolver';
    var packagemanager = dynamicPart + '/crx/packmgr';
    var workflowconsole = dynamicPart + '/libs/cq/workflow/content/console.html';
    var slinglogs = dynamicPart + '/system/console/status-slinglogs';
    var openInCRXDEURL = dynamicPart + '/crx/de/index.jsp#' + relativePagePath;
    var rebuildClientLibsPath = dynamicPart + '/libs/granite/ui/content/dumplibs.rebuild.html?invalidate=true';

    console.log('Open In CRX De URL :: ' + openInCRXDEURL);

    $('#aemwelcome').attr('data-url', welcomePageURL);
    $('#siteAdmin').attr('data-url', siteAdmin);
    $('#crxde').attr('data-url', crxde);
    $('#sysconsole').attr('data-url', sysconsole);
    $('#crxexplorer').attr('data-url', crxexplorer);
    $('#configMgr').attr('data-url', configMgr);
    $('#resourceResolverConfig').attr('data-url', resourceResolverConfig);
    $('#resourceResolverTest').attr('data-url', resourceResolverTest);
    $('#packagemanager').attr('data-url', packagemanager);
    $('#workflowconsole').attr('data-url', workflowconsole);
    $('#slinglogs').attr('data-url', slinglogs);
    $('#open-in-crxde').attr('data-url', openInCRXDEURL);
    $('#rebuild-client-libs').attr('data-url', rebuildClientLibsPath);

}

<!-- Create Quick Links ends here -->



<!-- Full Dynatree starts here -->

<!-- Create the RAW Data here starts here -->

var getPageInformation = function (tab, data) {
    $(function () {
        $("#tree").dynatree(
            {
                onDblClick: function (node, event) {
                    if (isProp(node)) {
                        var cmpUrl = currentUrl
                            + createURL(node.getParent()
                                .getParent(), '');
                        return false;
                    }
                },

                onClick: function (node, event) {
                    if (event.altKey && isComp(node)) {
                        var cmpUrl = currentUrl
                            + createURL(node, '') + '.html';
                        chrome.tabs.create({
                            'url': cmpUrl,
                            'selected': true
                        });
                    }
                }

            });
    });

    var obj = [];
    createDynatree(obj, data);
    $("#tree").dynatree("getRoot").addChild(obj);

    $("#tree").dynatree("getRoot").visit(function (node) {

        if (isActivatedNode(node)) {
            node.expand(true);
        }
    });

};

<!-- Create the RAW Data ends here -->


<!-- Create the Skimmed Data starts here -->

var getSkimmedPageInformation = function (tab, data) {
    $(function () {
        $("#treeskimmed").dynatree(
            {
                onDblClick: function (node, event) {
                    if (isProp(node)) {
                        var cmpUrl = currentUrl
                            + createURL(node.getParent()
                                .getParent(), '');
                        return false;
                    }
                },

                onClick: function (node, event) {
                    if (event.altKey && isComp(node)) {
                        var cmpUrl = currentUrl
                            + createURL(node, '') + '.html';
                        chrome.tabs.create({
                            'url': cmpUrl,
                            'selected': true
                        });
                    }
                }

            });
    });

    var obj = [];
    createSkimmedDynatree(obj, data);
    $("#treeskimmed").dynatree("getRoot").addChild(obj);

    $("#treeskimmed").dynatree("getRoot").visit(function (node) {

        if (isActivatedNode(node)) {
            node.expand(true);
        }
    });

};


<!-- Full Dyna tree -->

var createURL = function (node, s) {

    if (node.data.title != null)
        s = '/' + node.data.title + s;

    if (node.getParent() == null)
        return s;
    else
        return createURL(node.getParent(), s);

};


var createDynatree = function (object, allData) {

    var counter = 0;
    for (var k in allData) {
        var title = k;
        title = '<div>' + title + '</div>';

        if (typeof (allData[k]) != 'object') {
            object[counter] = {
                title: title,
                isFolder: true,
                classNames: { }
            };
            object[counter].children = [];
            object[counter].children[0] = {
                title: allData[k],
                isFolder: false
            };
        } else {
            object[counter] = {
                title: title,
                isFolder: true
            };
            object[counter].children = [];
            createDynatree(object[counter].children, allData[k]);
        }
        counter++;
    }
};


var createSkimmedDynatree = function (object, allData) {

    var counter = 0;
    for (var k in allData) {
        var title = k;

        if (title === 'jcr:content') {
            title = "Properties";
        } else if (title === 'jcr:mixinTypes') {
            continue;
        } else if (title === 'jcr:createdBy') {
            continue;
        } else if (title === 'jcr:created') {
            continue;
        } else if (title === 'jcr:primaryType') {
            continue;
        } else if (title === 'jcr:description') {
            title = 'Meta Description';
        } else if (title === 'sling:resourceType') {
            title = 'Resource Type';
        } else if (title === 'pageTitle') {
            title = 'Browser Title';
        } else if (title === 'metakeywords') {
            title = 'Meta Keywords';
        } else if (title === 'cq:template') {
            title = 'Template';
        } else if (title === 'cq:lastReplicatedBy') {
            title = 'Last Activator';
        } else if (title === 'jcr:mixinTypes') {
            continue;
        } else if (title === 'cq:lastReplicationAction') {
            continue;
        } else if (title === 'cq:lastModifiedBy') {
            title = 'Last Modifier';
        } else if (title === 'cq:lastModified') {
            title = 'Last Modified Date';
        } else if (title === 'cq:lastReplicated') {
            title = 'Last Activated Date';
        } else if (title === 'jcr:created') {
            continue;
        } else if (title === 'jcr:uuid') {
            continue;
        } else if (title === 'jcr:baseVersion') {
            continue;
        } else if (title === 'jcr:primaryType') {
            continue;
        } else if (title === 'jcr:isCheckedOut') {
            continue;
        } else if (title === 'jcr:predecessors') {
            continue;
        } else if (title === 'jcr:versionHistory') {
            continue;
        } else if (title === 'jcr:title') {
            title = 'Title in Siteadmin';
        } else if (title == 'brand') {
            title = 'Brand';
        } else if (title == 'region') {
            title = 'Region';
        } else if (title == 'role') {
            title = 'Role';
        } else if (title == 'status') {
            title = 'Status';
        }
        else {
            console.log('inside else block');
            continue;
        }

        title = '<div>' + title + '</div>';

        if (typeof (allData[k]) != 'object') {
            object[counter] = {
                title: title,
                isFolder: true,
                classNames: { }
            };
            object[counter].children = [];
            object[counter].children[0] = {
                title: allData[k],
                isFolder: false
            };
        } else {
            object[counter] = {
                title: title,
                isFolder: true
            };
            object[counter].children = [];
            createSkimmedDynatree(object[counter].children, allData[k]);
        }
        counter++;

    }
};


var isActivatedNode = function (node) {
    return activatedNodes.indexOf(getPath(node)) > -1;
};


function isProp(node) {
    return node.getChildren() == null;
};

function isComp(node) {
    return node.getChildren() != null
        && node.getChildren()[0].getChildren() != null;
};


var getPath = function (node) {
    return createURL(node, '');
};

$('#myTab a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
})
 
 
 
 
 
 