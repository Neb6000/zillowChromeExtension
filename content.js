// content.js

//store the different details
var link = [];
var cost = [];
var beds = [];
var baths = [];
var sqrft = [];
var address = [];
var stat = [];
var nextPageButton;
var houses;
var url;
var search;
var page;
var doc;
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if( request.message === "clicked_browser_action" ) {
        doc = document;
                
        page = 1;
        link = [];
        cost = [];
        beds = [];
        baths = [];
        sqrft = [];
        address = [];
        stat = [];
        nextPageButton = null;
        houses = null;
        url = null;
        search = null;
        document.getElementsByClassName("Button-wpcbcc-0 map__StyledMapButton-sc-5ynl5k-0 map__StyledMapIconButton-sc-5ynl5k-1 map__StyledMapZoomButtonBottom-sc-5ynl5k-4 bkSjwZ zoom-out")[0].click();
        document.getElementsByClassName("Button-wpcbcc-0 map__StyledMapButton-sc-5ynl5k-0 map__StyledMapIconButton-sc-5ynl5k-1 map__StyledMapZoomButtonTop-sc-5ynl5k-3 kRSxAG zoom-in")[0].click(start());

      }
    }
  );

var start = function(){
    var URL = window.location.href.substring(8);
    //search = URL.substring(URL.search('/')+1).substring(URL.substring(URL.search('/')+1).search('/')+1);
    search = URL.substring(URL.indexOf('?'));
    //get all the house listings on this page
    houses = doc.getElementsByClassName("list-card-info");
    getDetails();
}


var getDetails = function(){
     //iterate through each house
     for(var i = 0; i < houses.length; i ++){

        link.push(houses[i].getElementsByClassName("list-card-link")[0].getAttribute("href"));
        cost.push(houses[i].getElementsByClassName("list-card-price")[0].textContent);
        try{
            beds.push(houses[i].getElementsByClassName("list-card-details")[0].childNodes[0].textContent.split(" ")[0]);
        }  
        catch {
            //beds not listed
            beds.push(null);
        }
        try{
            baths.push(houses[i].getElementsByClassName("list-card-details")[0].childNodes[1].textContent.split(" ")[0]);
        }   
        catch {
            //baths not listed
            baths.push(null);
        }
        try{
            sqrft.push(houses[i].getElementsByClassName("list-card-details")[0].childNodes[2].textContent.split(" ")[0]);
        }   
        catch {
            //sqrft not listed
            sqrft.push(null);
        }
        address.push(houses[i].getElementsByClassName("list-card-addr")[0].textContent);
        stat.push(houses[i].getElementsByClassName("list-card-type")[0].textContent);
    }
    nextPage();    

}

var nextPage = function(){
    try{
        nextPageButton = doc.getElementsByClassName("Button-wpcbcc-0 sc-AxjAm ipjHPf")[0];

        page ++;
        var Http = new XMLHttpRequest();
        if (url != nextPageButton.getAttribute("href")){

            url = nextPageButton.getAttribute("href");
            var request = url + search;
            request = request.slice(0, request.indexOf("7B")-1+22) + "%7B%22currentPage%22%3A" + page + request.slice(request.indexOf("7D")-1);
            Http.open("GET", request);
            Http.send();
            Http.onreadystatechange = (e) => {
                if(Http.readyState == 4){
    
                    let parser = new DOMParser();
                    doc = parser.parseFromString(Http.responseText, 'text/html');
                    houses = doc.getElementsByClassName("list-card-info");

                    getDetails();
                }
            }
        } else{
            download();
        }
        
    }
    catch {
        download();
    }
}


var download = function(){
    var csv = ["Link,Cost,Beds,Bathrooms,Square Feet,Address,Status"];

    for(var i = 0; i < link.length; i ++){
        var placeHolder = [];
        placeHolder.push('"' + link[i] + '"');
        placeHolder.push('"' + cost[i] + '"');
        placeHolder.push('"' + beds[i] + '"');
        placeHolder.push('"' + baths[i] + '"');
        placeHolder.push('"' + sqrft[i] + '"');
        placeHolder.push('"' + address[i] + '"');
        placeHolder.push('"' + stat[i] + '"');
        csv.push(placeHolder.join(','));
    }

    let downloadLink = document.createElement("a");			
    downloadLink.download = "sheet.csv";
    downloadLink.href = window.URL.createObjectURL(new Blob([csv.join("\r\n")], {type: "text/csv"}));
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}
