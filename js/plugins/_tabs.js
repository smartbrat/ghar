var SETTINGS = {
    navBarTravelling: false,
    navBarTravelDirection: "",
    navBarTravelDistance: 150
};

var colours = {
    0: "#6a2c79"
/*
Add Numbers And Colors if you want to make each tab's indicator in different color for eg:
1: "#FF0000",
2: "#00FF00", and so on...
*/
};

document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

// Out advancer buttons
var pnAdvancerLeft = document.getElementById("pnAdvancerLeft");
var pnAdvancerRight = document.getElementById("pnAdvancerRight");

var pnAdvancerLeft2 = document.getElementById("pnAdvancerLeft2");
var pnAdvancerRight2 = document.getElementById("pnAdvancerRight2");

// the indicator
var pnIndicator = document.getElementById("pnIndicator");
var pnProductNav = document.getElementById("pnProductNav");
var pnProductNavContents = document.getElementById("pnProductNavContents");

var pnIndicator2 = document.getElementById("pnIndicator2");
var pnProductNav2 = document.getElementById("pnProductNav2");
var pnProductNavContents2 = document.getElementById("pnProductNavContents2");

pnProductNav.setAttribute("data-overflowing", determineOverflow(pnProductNavContents, pnProductNav));

pnProductNav2.setAttribute("data-overflowing", determineOverflow(pnProductNavContents2, pnProductNav2));

// Set the indicator
moveIndicator(pnProductNav.querySelector("[aria-selected=\"true\"]"), colours[0]);

moveIndicator2(pnProductNav2.querySelector("[aria-selected=\"true\"]"), colours[0]);

// Handle the scroll of the horizontal container
var last_known_scroll_position = 0;
var ticking = false;

function doSomething(scroll_pos) {
    pnProductNav.setAttribute("data-overflowing", determineOverflow(pnProductNavContents, pnProductNav));
    pnProductNav2.setAttribute("data-overflowing", determineOverflow(pnProductNavContents2, pnProductNav2));
}

pnProductNav.addEventListener("scroll", function() {
    last_known_scroll_position = window.scrollY;
    if (!ticking) {
        window.requestAnimationFrame(function() {
            doSomething(last_known_scroll_position);
            ticking = false;
        });
    }
    ticking = true;
});

pnProductNav2.addEventListener("scroll", function() {
    last_known_scroll_position = window.scrollY;
    if (!ticking) {
        window.requestAnimationFrame(function() {
            doSomething(last_known_scroll_position);
            ticking = false;
        });
    }
    ticking = true;
});


pnAdvancerLeft.addEventListener("click", function() {
// If in the middle of a move return
    if (SETTINGS.navBarTravelling === true) {
        return;
    }
    // If we have content overflowing both sides or on the left
    if (determineOverflow(pnProductNavContents, pnProductNav) === "left" || determineOverflow(pnProductNavContents, pnProductNav) === "both") {
        // Find how far this panel has been scrolled
        var availableScrollLeft = pnProductNav.scrollLeft;
        // If the space available is less than two lots of our desired distance, just move the whole amount
        // otherwise, move by the amount in the settings
        if (availableScrollLeft < SETTINGS.navBarTravelDistance * 2) {
            pnProductNavContents.style.transform = "translateX(" + availableScrollLeft + "px)";
        } else {
            pnProductNavContents.style.transform = "translateX(" + SETTINGS.navBarTravelDistance + "px)";
        }
        // We do want a transition (this is set in CSS) when moving so remove the class that would prevent that
        pnProductNavContents.classList.remove("pn-ProductNav_Contents-no-transition");
        // Update our settings
        SETTINGS.navBarTravelDirection = "left";
        SETTINGS.navBarTravelling = true;
    }
    // Now update the attribute in the DOM
    pnProductNav.setAttribute("data-overflowing", determineOverflow(pnProductNavContents, pnProductNav));
});
pnAdvancerLeft2.addEventListener("click", function() {
// If in the middle of a move return
    if (SETTINGS.navBarTravelling === true) {
        return;
    }
    // If we have content overflowing both sides or on the left
    if (determineOverflow(pnProductNavContents2, pnProductNav2) === "left" || determineOverflow(pnProductNavContents2, pnProductNav2) === "both") {
        // Find how far this panel has been scrolled
        var availableScrollLeft = pnProductNav2.scrollLeft;
        // If the space available is less than two lots of our desired distance, just move the whole amount
        // otherwise, move by the amount in the settings
        if (availableScrollLeft < SETTINGS.navBarTravelDistance * 2) {
            pnProductNavContents2.style.transform = "translateX(" + availableScrollLeft + "px)";
        } else {
            pnProductNavContents2.style.transform = "translateX(" + SETTINGS.navBarTravelDistance + "px)";
        }
        // We do want a transition (this is set in CSS) when moving so remove the class that would prevent that
        pnProductNavContents2.classList.remove("pn-ProductNav_Contents-no-transition");
        // Update our settings
        SETTINGS.navBarTravelDirection = "left";
        SETTINGS.navBarTravelling = true;
    }
    // Now update the attribute in the DOM
    pnProductNav2.setAttribute("data-overflowing", determineOverflow(pnProductNavContents2, pnProductNav2));
});

pnAdvancerRight.addEventListener("click", function() {
    // If in the middle of a move return
    if (SETTINGS.navBarTravelling === true) {
        return;
    }
    // If we have content overflowing both sides or on the right
    if (determineOverflow(pnProductNavContents, pnProductNav) === "right" || determineOverflow(pnProductNavContents, pnProductNav) === "both") {
        // Get the right edge of the container and content
        var navBarRightEdge = pnProductNavContents.getBoundingClientRect().right;
        var navBarScrollerRightEdge = pnProductNav.getBoundingClientRect().right;
        // Now we know how much space we have available to scroll
        var availableScrollRight = Math.floor(navBarRightEdge - navBarScrollerRightEdge);
        // If the space available is less than two lots of our desired distance, just move the whole amount
        // otherwise, move by the amount in the settings
        if (availableScrollRight < SETTINGS.navBarTravelDistance * 2) {
            pnProductNavContents.style.transform = "translateX(-" + availableScrollRight + "px)";
        } else {
            pnProductNavContents.style.transform = "translateX(-" + SETTINGS.navBarTravelDistance + "px)";
        }
        // We do want a transition (this is set in CSS) when moving so remove the class that would prevent that
        pnProductNavContents.classList.remove("pn-ProductNav_Contents-no-transition");
        // Update our settings
        SETTINGS.navBarTravelDirection = "right";
        SETTINGS.navBarTravelling = true;
    }
    // Now update the attribute in the DOM
    pnProductNav.setAttribute("data-overflowing", determineOverflow(pnProductNavContents, pnProductNav));
});
pnAdvancerRight2.addEventListener("click", function() {
    // If in the middle of a move return
    if (SETTINGS.navBarTravelling === true) {
        return;
    }
    // If we have content overflowing both sides or on the right
    if (determineOverflow(pnProductNavContents2, pnProductNav2) === "right" || determineOverflow(pnProductNavContents2, pnProductNav2) === "both") {
        // Get the right edge of the container and content
        var navBarRightEdge = pnProductNavContents2.getBoundingClientRect().right;
        var navBarScrollerRightEdge = pnProductNav2.getBoundingClientRect().right;
        // Now we know how much space we have available to scroll
        var availableScrollRight = Math.floor(navBarRightEdge - navBarScrollerRightEdge);
        // If the space available is less than two lots of our desired distance, just move the whole amount
        // otherwise, move by the amount in the settings
        if (availableScrollRight < SETTINGS.navBarTravelDistance * 2) {
            pnProductNavContents2.style.transform = "translateX(-" + availableScrollRight + "px)";
        } else {
            pnProductNavContents2.style.transform = "translateX(-" + SETTINGS.navBarTravelDistance + "px)";
        }
        // We do want a transition (this is set in CSS) when moving so remove the class that would prevent that
        pnProductNavContents2.classList.remove("pn-ProductNav_Contents-no-transition");
        // Update our settings
        SETTINGS.navBarTravelDirection = "right";
        SETTINGS.navBarTravelling = true;
    }
    // Now update the attribute in the DOM
    pnProductNav2.setAttribute("data-overflowing", determineOverflow(pnProductNavContents2, pnProductNav2));
});

pnProductNavContents.addEventListener(
    "transitionend",
    function() {
        // get the value of the transform, apply that to the current scroll position (so get the scroll pos first) and then remove the transform
        var styleOfTransform = window.getComputedStyle(pnProductNavContents, null);
        var tr = styleOfTransform.getPropertyValue("-webkit-transform") || styleOfTransform.getPropertyValue("transform");
        // If there is no transition we want to default to 0 and not null
        var amount = Math.abs(parseInt(tr.split(",")[4]) || 0);
        pnProductNavContents.style.transform = "none";
        pnProductNavContents.classList.add("pn-ProductNav_Contents-no-transition");
        // Now lets set the scroll position
        if (SETTINGS.navBarTravelDirection === "left") {
            pnProductNav.scrollLeft = pnProductNav.scrollLeft - amount;
        } else {
            pnProductNav.scrollLeft = pnProductNav.scrollLeft + amount;
        }
        SETTINGS.navBarTravelling = false;
    },
    false
);
pnProductNavContents2.addEventListener(
    "transitionend",
    function() {
        // get the value of the transform, apply that to the current scroll position (so get the scroll pos first) and then remove the transform
        var styleOfTransform = window.getComputedStyle(pnProductNavContents2, null);
        var tr = styleOfTransform.getPropertyValue("-webkit-transform") || styleOfTransform.getPropertyValue("transform");
        // If there is no transition we want to default to 0 and not null
        var amount = Math.abs(parseInt(tr.split(",")[4]) || 0);
        pnProductNavContents2.style.transform = "none";
        pnProductNavContents2.classList.add("pn-ProductNav_Contents-no-transition");
        // Now lets set the scroll position
        if (SETTINGS.navBarTravelDirection === "left") {
            pnProductNav2.scrollLeft = pnProductNav2.scrollLeft - amount;
        } else {
            pnProductNav2.scrollLeft = pnProductNav2.scrollLeft + amount;
        }
        SETTINGS.navBarTravelling = false;
    },
    false
);

// Handle setting the currently active link
pnProductNavContents.addEventListener("click", function(e) {
var links = [].slice.call(document.querySelectorAll("#pnProductNavContents .pn-ProductNav_Link"));
links.forEach(function(item) {
item.setAttribute("aria-selected", "false");
});
e.target.setAttribute("aria-selected", "true");
// Pass the clicked item and it's colour to the move indicator function
moveIndicator(e.target, colours[links.indexOf(e.target)]);
});
pnProductNavContents2.addEventListener("click", function(e) {
var links = [].slice.call(document.querySelectorAll("#pnProductNavContents2 .pn-ProductNav_Link"));
links.forEach(function(item) {
item.setAttribute("aria-selected", "false");
});
e.target.setAttribute("aria-selected", "true");
// Pass the clicked item and it's colour to the move indicator function
moveIndicator2(e.target, colours[links.indexOf(e.target)]);
});

// var count = 0;
function moveIndicator(item, color) {
    var textPosition = item.getBoundingClientRect();
    var container = pnProductNavContents.getBoundingClientRect().left;
    var distance = textPosition.left - container;
 var scroll = pnProductNavContents.scrollLeft;
    pnIndicator.style.transform = "translateX(" + (distance + scroll) + "px) scaleX(" + textPosition.width * 0.01 + ")";
// count = count += 100;
// pnIndicator.style.transform = "translateX(" + count + "px)";

    if (color) {
        pnIndicator.style.backgroundColor = color;
    }
}

// var count = 0;
function moveIndicator2(item, color) {
    var textPosition = item.getBoundingClientRect();
    var container = pnProductNavContents2.getBoundingClientRect().left;
    var distance = textPosition.left - container;
 var scroll = pnProductNavContents2.scrollLeft;
    pnIndicator2.style.transform = "translateX(" + (distance + scroll) + "px) scaleX(" + textPosition.width * 0.01 + ")";
// count = count += 100;
// pnIndicator.style.transform = "translateX(" + count + "px)";

    if (color) {
        pnIndicator2.style.backgroundColor = color;
    }
}

function determineOverflow(content, container) {
    var containerMetrics = container.getBoundingClientRect();
    var containerMetricsRight = Math.floor(containerMetrics.right);
    var containerMetricsLeft = Math.floor(containerMetrics.left);
    var contentMetrics = content.getBoundingClientRect();
    var contentMetricsRight = Math.floor(contentMetrics.right);
    var contentMetricsLeft = Math.floor(contentMetrics.left);
 if (containerMetricsLeft > contentMetricsLeft && containerMetricsRight < contentMetricsRight) {
        return "both";
    } else if (contentMetricsLeft < containerMetricsLeft) {
        return "left";
    } else if (contentMetricsRight > containerMetricsRight) {
        return "right";
    } else {
        return "none";
    }
}

/*------------------- ACTIVE LINK POSITION ------------------------*/
$("#pnProductNav .pn-ProductNav_Link").click(function() {
   
   centerLI2(this, '#pnProductNav');

 });

$("#pnProductNav2 .pn-ProductNav_Link").click(function() {
   
   centerLI2(this, '#pnProductNav2');

 });

 //http://stackoverflow.com/a/33296765/350421
 function centerLI2(target, outer) {
   var out = $(outer);
   var tar = $(target);
   var x = out.width() - 50;
   var y = tar.outerWidth(true);
   var z = tar.index();
   var q = 0;
   var m = out.find('.pn-ProductNav_Link');
   for (var i = 0; i < z; i++) {
     q += $(m[i]).outerWidth(true);
   }
   
 //out.scrollLeft(Math.max(0, q - (x - y)/2));
 var xy = x - y;
 if(q > xy){
out.animate({
  scrollLeft: Math.max(0, q - (x - y) + 100)
}, 500);
 } else {
 out.animate({
  scrollLeft: Math.max(0, q/2 - 50)
}, 500);	  
 }

 }


$(document).ready(function() {
$('.mouse-scroll').mousewheel(function(e, delta) {
this.scrollLeft -= (delta * 50);
e.preventDefault();
});
});