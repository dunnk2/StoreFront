
/* 
	Project requirements for storefront
		1. Store products on a firebase instance
		2. You must be able to add new products to that list using a form that sends to firebase
            -form that pulls data from form fields, places into object, and pushes into array which then makes an ajax call to firebase
		3. You must be able to show products from that list, along with all the info that goes with them.
			-image, name, description, rating
		4. Must be able to log in, keeping data in session or local storage
			-when user logs on, store their info in session storage
            -when user is created, send their info to firebase
		5. Create shopping cart
            -when user clicks an "add to Cart" button, the item gets added to a user list
		Optional
			send user registrations and shopping cart to firebase as well.
			try using jquery to take shortcuts
			try using 



Data I'll need
    -Users - an array of objects. Start with a few standard, push more to array on creation. 
        User objects: 
            Username
            password
            e-mail
    -Items - an array of objects. Start with a few objects, push more to array on creation
        Item objects:
            item name
            item price
            image url
    -CartItems - an array of objects. Objects are pushed to the array when the user clicks add to cart

  Ajax strategy for storefront
		all items - server - at log-in we need to get all Items from the server and display them in the browse section
        new items - session storage
        Cart items - local storage

		
			every 7 seconds send session storage to server
		

Functions I'll need
    
    Ajax
        Users
            -postUserInfo (on create user)
            -getUserInfo (on load)
        allItems
            -getItemInfo (on load) 
            -postItemInfo (on add item)
        Cart
            -postCartInfo (on load)
            -getCartInfo (on load)
    User functions
        -logOn()
            -grab info from form fields
            -check if username equals the username of a user
            -if no, inform user they need to create an account
            -if yes, bring user to homepage
        -createUser()
            -grab info from form fields
            -call a constructor function and pass form field data to it
            -saves the result of that constructor function in a variable
            -pushes that variable to users array
            -bring user to homepage
        -UserConstructor()
            -creates the user with paramaters passed from createUser
        -createHomepage()
            -dynamically remove the html of the container and create the homepage
        -logOut()
            -dynamically remove the html of the homepage and create the log in page
    Homepage functions
        -search for item
            -searches for item in Items array and drop down results. If the user sees what they want, they can click the drop down and it displays the modal for the item
        -addItem()
            -grab info from form fields
            -call a ItemConstructor function, save it in a variable
            -pushes variable to allItems array
            -create an object of the itme
        -ItemConstructor()
            -creates item with parameters passed from addItem
        -displayAllItems()
            -sorts data from firebase
            -places objets in browse list
            -uses media headings from bootsrap to  display left hand side image
        -displayItemModal
            -called on itemclick,
            -displays a modal with all the users info appropriately rendered
        -moreInfo()
            -on click, display a module
        -addToCart()
            -gets object on click
            -pushes it to a cart array
            -pushes cart array to localstorage where it eventually gets passed to server
            -pulls data from local storage to display cart
            

Babysteps:
    1. Create list of objects and get them to display in the items list 
    2. Implement create Item functionality - done
    3. Add to cart functionality - done
    4. Implement ajax calls - done
    5. Implement user log in
    6. Implement search functionality
    8. Add total price functionality
    7. Redo the css

Table of Contents: 
    globals
    Ajax
        postItems()
        getItems() - calls displayAllItems
        ScheduleNextUpdate() - calls post and get functions
    Adding new Items
        AddItemButton() - calls addItem
        ItemConstructor()
        addItem() - calls ItemConstructor and displayAllItems
    Cart functions
        removeFromCart() - calls displayCart
        displayCart()
    Display all items function
        displayAllItems()
    On load expressions
*/

/* 


*/


//Globals
var users = [];
var allItems = [];
var cartItems = [];
var currentUser;

//==================================================AJAX Calls===================================================================//
var postItems = function () {
    for (var i = 0; i < sessionStorage.length; i++) {
        var request = new XMLHttpRequest();
        request.open("POST", "https://popping-fire-4795.firebaseio.com/.json", true);
        request.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                //successful
                var data = JSON.parse(this.response);
                console.log(data);
                sessionStorage.clear();
            } else {
                //request failed
                console.log(this.response)
            }
        //getItems();
        };
        request.onerror = function () {
            alert("Oh no! Connection failed.")
        };
        request.send(sessionStorage[i]);
    }
};

var getItems = function () {
    var request = new XMLHttpRequest();
    request.open("GET", "https://popping-fire-4795.firebaseio.com/.json", true);
    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            //successful
            var data = JSON.parse(this.response);
            localStorage.clear();
            for (var propName in data) {
                localStorage.setItem(propName, JSON.stringify(data[propName]));
            }
        } else {

            //request failed
            console.log(this.response);
        }
        displayAllItems();
    };

    request.onerror = function () {
        //Connection fails
        console.log("Whoops, connection failed!");
    };
    request.send()
};


var scheduleNextUpdate = function () {
    postItems();
    getItems();
    setTimeout(scheduleNextUpdate, 6000)
};
scheduleNextUpdate();
//====================================================Users====================================================================//

/*
Users
1. I'll need to set the homepage html to display: none in order to only reveal the user info
2. Create html for user log in and sign up
    Functionality it will require
        -userconstructor function
        -logUserIn function
3. Add newly created users to firebase
    a. This means I'll have to refactor my functions to sort through firebase's data. I can do this by adding a "type" property to all my data objects.
    b. Ideally I'll refactor the ajax calls to take the parameters they need instead of writing more ajax calls.
4. Store current user on session storage. This means I'll have to filter through any data I'm grabbing from session storage.
*/

var logUserIn = function () {
    var userNameAttempt = document.getElementById("userNameLogInInput").value;
    var passWordAttempt = document.getElementById("userPasswordLogInInput").value;
    for (var propName in localStorage) {
        propName = JSON.parse(localStorage[propName])
        if (propName["type"] === "user") {
            if (propName["name"] === userNameAttempt && propName["password"] === passWordAttempt) {
                currentUser = propName;
                sessionStorage[sessionStorage.length] = propName;
            }
        }
    }
    $("#homePage").removeClass("hide");
    $("#logInPage").addClass("hide");
};

var signUserUp = function () {
    var newUserName = document.getElementById("userNameSignUpInput").value;
    var newUserPassword = document.getElementById("userPasswordSignUpInput").value;
    var newUserToSignUp = new UserConstructor(newUserName, newUserPassword);
    sessionStorage[0] = JSON.stringify(newUserToSignUp);
    //postItems();
};

var UserConstructor = function (name, password) {
    this.name = name;
    this.password = password;
    this.type = "user"
};

$("#logInButton").on("click", function (e) {
    e.preventDefault();
    //addItem();
});

//====================================================Adding Items==============================================================//
$("#addItemButton").on("click", function (e) {
    e.preventDefault();
    addItem();
});

var ItemConstructor = function (name, price, description, image, rating) {
    this.name = name;
    this.price = price;
    this.image = image;
    this.type = "item"
};


var addItem = function () {
    var newItemName = document.getElementById("newItemName").value;
    var newItemPrice = document.getElementById("newItemPrice").value;
    var newItemImage = document.getElementById("newItemPic").value;
    var itemToAdd = new ItemConstructor(newItemName, newItemPrice, newItemImage);
    //allItems.push(itemToAdd);
    sessionStorage[sessionStorage.length] = JSON.stringify(itemToAdd);
    postItems();
    displayAllItems();
    newItemName.value = "";
    newItemPrice.value = "";
    
    
    //newItemPic.value = "";
};

//==================================================Display Items function=====================================================//
var displayAllItems = function () {

    document.getElementById("itemList").innerHTML = "";
    for (var dataObject in localStorage) {
        dataObject = JSON.parse(localStorage[dataObject]);
        if (dataObject["type"] === "item") {
            document.getElementById("itemList").innerHTML +=
                " <li> <strong>name</strong>: " +
                dataObject["name"] +
                " <strong>price</strong>: " +
                dataObject["price"] +
                "  <button class='btn btn-default btn-sm' onclick='displayCart(" + dataObject + ");'>add to cart</button>" + "</li>";
        }
    }
};

//var displayAllItems = function () {

//    document.getElementById("itemList").innerHTML = "";
//    for (var i = 0; i < localStorage.length; i++) {
//        document.getElementById("itemList").innerHTML += "<li> <strong>name</strong>: " + JSON.parse(localStorage[i])["name"] + " \n <strong>price</strong>: " + JSON.parse(localStorage[i])["price"] + "   <button class='btn btn-default btn-sm' onclick='displayCart(" + localStorage[i] + ");'>add to cart</button> </li>";
//    }
//};

//==========================================================Cart Functions=======================================================//

var removeFromCart = function(itemToRemove) {
    for (var i = 0; i < cartItems.length; i++) {
        if (cartItems[i]["name"] === itemToRemove["name"]) {
            cartItems.splice(i, 1);
        }
    }
    displayCart();
}

var displayCart = function (newCartItem) {
    //for (var prop in localStorage) {
    //        cartItems.push(JSON.parse(localStorage[prop]));
    //}
    if (newCartItem !== undefined) {
        cartItems.push(newCartItem);
    }
    document.getElementById("cartList").innerHTML = "";
    for (var i = 0; i < cartItems.length; i++) {
        document.getElementById("cartList").innerHTML += "<li> <strong>name</strong>: " + cartItems[i]["name"] + " \n <strong>price</strong>: " + cartItems[i]["price"] + "    <button class='btn btn-default btn-sm' onclick='removeFromCart(" + JSON.stringify(cartItems[i]) + ");'>Remove from cart</button></li>";
    }
    

    //postItems();
};


//===================================================onLoad expressions==========================================================//


$("#homePage").addClass(" hide");
localStorage.clear();
//postItems();
//localStorage.setItem("item1", JSON.stringify(new ItemConstructor("laptop", 1000)));
//localStorage.setItem("item2", JSON.stringify(new ItemConstructor("car", 12000)));
//localStorage.setItem("item3", JSON.stringify(new ItemConstructor("toaster", 30)));
displayAllItems();



// 




































/* background color stuff with jquery 
var origBackColor;
var origColor;

$("li").on("mouseenter", function () {
    origBackColor = $(this).css("background-color");
    origColor = $(this).css("color");
    $(this).css("background-color", "#252b30");
    $(this).css("color", "white");
});
$("li").on("mouseleave", function () {
    $(this).css("background-color", origBackColor);
    $(this).css("color", origColor)
});
*/


