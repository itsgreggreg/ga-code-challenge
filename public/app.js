// We wrap our entire application in a function to isolate it
// from the rest of the browser
(function(){
  // we put our browser into strict-mode
  "use strict";

  // First we need to grab references to our app's components
  let searchInput = document.getElementById("searchInput");
  let searchButton = document.getElementById("searchButton");

  // Now we attach handlers to events our components may fire
  searchButton.onclick = function(){
    let movieTitle = searchInput.value;
    let successFunction = function(movies){
      console.log(movies);
    };
    let errorFunction = function(){
      console.log('error');
    };
    searchOMDB(movieTitle, successFunction, errorFunction);
  }


  // HELPER FUNCTIONS

  /*
    A function to search the omdbapi for a specific movie title
    Parameters:
     - movieTitle : string - the movie title to search for
     - success : function - a function to call if the request was successful
                          receives an array of movie objects as it's only parameter
     - error : function - a function to call if the request failed
                          receives no parameters
  */
  function searchOMDB(movieTitle, success, error){
    let baseUrl = "http://omdbapi.com/?s=";
    let request = new XMLHttpRequest();

    request.open('GET', baseUrl + movieTitle, true);

    request.onload = function() {
      let data = JSON.parse(request.responseText);
      // if the status code is in the success region and there's no error
      if (request.status >= 200 && request.status < 400 && !data.Error) {
        // then call the success function if it exists
        if(typeof success === "function"){
          success(data);
        }
      // otherwise
      } else {
        // let's call the error function if it exists
        if(typeof error === "function"){
          error();
        }
      }
    };

    request.onerror = function() {
      // if there is an error in the connection we call the error function
      // if it exists
      if(typeof error === "function"){
        error();
      }
    };

    request.send();
  }
})()
