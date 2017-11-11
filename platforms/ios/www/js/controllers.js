angular.module('starter.controllers',[])

.controller('MyController', function($scope, $timeout,$ionicModal, $http, $ionicLoading, $cordovaLocalNotification, $cordovaAppRate){

var contains = function(needle) {
  // Per spec, the way to identify NaN is that it is not equal to itself
  var findNaN = needle !== needle;
  var indexOf;

  if(!findNaN && typeof Array.prototype.indexOf === 'function') {
    indexOf = Array.prototype.indexOf;
  } else {
    indexOf = function(needle) {
      var i = -1, index = -1;

      for(i = 0; i < this.length; i++) {
        var item = this[i];

        if((findNaN && item !== item) || item === needle) {
          index = i;
          break;
        }
      }
      return index;
    };
  }
  return indexOf.call(this, needle) > -1;
};

//////////////////////////////////////////////////////////////  

document.addEventListener('deviceready', function () {

  if ($scope.currentPlatform == "ios")
  {
    ionic.Platform.fullScreen()
    $scope.checkInstallation()
    $scope.addLocalNotification()
  }

  if ($scope.currentPlatform == "android")
  {
    $scope.checkInstallation()
    $scope.addLocalNotification()
  }

  initAd();
  window.plugins.AdMob.createBannerView();

  cordova.getAppVersion.getVersionNumber().then(function (version) {
    // got version and build, choose
    console.log(version)
    if (version > "0.0.13")
    {
      console.log("higher version")
    }
    else
    {
      console.log("lower version")
    }

  });

  AppRate.preferences = {
    openStoreInApp: true,
    displayAppName: 'Fokus Sejarah',
    promptAgainForEachNewVersion: false,
    storeAppURL: {
      ios: '1190266622',
      android: 'market://details?id=com.spm.fokussejarah'
    },
    customLocale: {
      title: "Rate Fokus Sejarah",
      message: "If you find Fokus Sejarah useful, would you mind taking a moment to rate it? Thanks for your support!",
      rateButtonLabel: "Rate Now", // button 1
      cancelButtonLabel: "Never", // button 3
      laterButtonLabel: "Later" // button 2
    },
    callbacks: {
      onButtonClicked: function(buttonIndex){
        console.log("onButtonClicked -> " + buttonIndex);
        if (buttonIndex == 1 || buttonIndex == 3)
        {
          localStorage.setItem('askForRating','false')
        }
      }
    }
  };
})

window.addEventListener('native.keyboardshow', function(){
  document.body.classList.add('keyboard-open');
});

document.addEventListener("resume", onResume, false);

$scope.leftSwipes = 0
$scope.backgroundCount = localStorage.getItem('backgroundCount') || "1"
$scope.myBackground = "background_" + $scope.backgroundCount
$scope.loadingError = false
$scope.currentPlatform = ionic.Platform.platform();
getNotes()
$scope.answerPlaceholder="Type your answer here"
//https://jsonblob.com/1f61f57a-b1d6-11e6-871b-330772562403
$scope.noscreenshot = true;
// $scope.chapters = ["Bab 1 (T4)","Bab 2 (T4)","Bab 3 (T4)","Bab 4 (T4)","Bab 5 (T4)","Bab 6 (T4)","Bab 7 (T4)","Bab 8 (T4)","Bab 9 (T4)","Bab 10 (T4)","Bab 1 (T5)","Bab 2 (T5)","Bab 3 (T5)","Bab 4 (T5)","Bab 5 (T5)","Bab 6 (T5)","Bab 7 (T5)","Bab 8 (T5)","Bab 9 (T5)"]
$scope.swipeTutorial = localStorage.getItem('swipeTutorial') || 'false';

$scope.backgroundTutorial = localStorage.getItem('backgroundTutorial') || "true"
if ($scope.backgroundTutorial == "true")
{
  $timeout(function()
  {
    $ionicLoading.show({
      template: '<div class="bgTutorial">Press <i class="ion-easel" style="color:#00e461"></i> to change background</div>',
      duration: 5000
    })
  }, 7000)
}

if (localStorage.getItem('achievements') == undefined) 
{
  localStorage.setItem('achievements','[]');
}

$ionicModal.fromTemplateUrl('templates/search.html', {
   scope: $scope,
   animation: 'none'
 }).then(function(modal) {
   $scope.searchModal = modal;
   console.log("created")
 });

$ionicModal.fromTemplateUrl('templates/category.html', {
  scope: $scope,
  animation: 'none'
}).then(function(modal) {
  $scope.categoryModal = modal;
  console.log("created cat")
});

$scope.search = function() {
  $scope.searchModal.show();
}

$scope.closeSearch = function() {
  $scope.searchModal.hide();
}

$scope.category = function() {
  $scope.findUniqueCategory();
  $scope.categoryModal.show();
}

$scope.closeCategory = function() {
  $scope.categoryModal.hide();
}

$scope.showRatingDialog = function() {
  AppRate.promptForRating();
}

$scope.background = function() {
  localStorage.setItem('backgroundTutorial','false')
  $scope.backgroundCount = localStorage.getItem('backgroundCount') || 1
  $scope.backgroundCount = parseInt($scope.backgroundCount) + 1
  if ($scope.backgroundCount > 11) $scope.backgroundCount = 1
  localStorage.setItem('backgroundCount', $scope.backgroundCount)
  $scope.myBackground = "background_" + $scope.backgroundCount
}

$scope.findUniqueCategory = function() {
  var lookup = {};
  var items = $scope.things;
  var result = [];

  for (var item, i = 0; item = items[i++];) {
    var name = item.category;

    if (!(name in lookup)) {
      lookup[name] = 1;
      result.push(name);
    }
  }  
  $scope.chapters = result
  console.log($scope.chapters)
}

$scope.change = function(direction){
	$scope.answerPlaceholder="Type your answer" 
  // console.log($scope.indexToShow)
	if (direction == "left" && $scope.loadingError == false)
	{
		// $scope.indexToShow = ($scope.indexToShow + 1) % $scope.things.length;
    $scope.leftSwipes = $scope.leftSwipes + 1
    $scope.askForRating = localStorage.getItem('askForRating') || "true";
    if ($scope.askForRating == "true" && $scope.leftSwipes % 35 == false)
    {
      $scope.showRatingDialog()
    }
    $scope.indexToShow = parseInt($scope.indexToShow) + 1;
		if ($scope.indexToShow == $scope.things.length)
		{
			$scope.indexToShow = 0
		}
    $scope.thing = $scope.things[$scope.indexToShow]
    $scope.pageNumber = parseInt($scope.indexToShow) + 1
	}
	if (direction == "right" && $scope.loadingError == false)
	{
    $scope.indexToShow = parseInt($scope.indexToShow) - 1;
		if ($scope.indexToShow < 0)
		{
			$scope.indexToShow = $scope.things.length - 1
		}
    $scope.thing = $scope.things[$scope.indexToShow]
    $scope.pageNumber = parseInt($scope.indexToShow) + 1
	}
  if ($scope.swipeTutorial !== "true" && $scope.loadingError == false)
  {
    localStorage.setItem('swipeTutorial','true')
    $scope.swipeTutorial = "true"
  }
  // console.log($scope.indexToShow)
  if ($scope.indexToShow >= 0)
  {
    localStorage.setItem('lastId',$scope.things[$scope.indexToShow].id) 
    answerModule(); 
  }
};

function answerModule() {
  $scope.showInputBox = "false"
  var achievements = JSON.parse(localStorage.getItem('achievements','[]'));
  var achievementsCount = achievements.length
  var achievementExisted = false;
  // console.log(achievementsCount)
  // console.log($scope.things[$scope.indexToShow])
  if ($scope.things[$scope.indexToShow].answer || ($scope.things[$scope.indexToShow].structured && $scope.things[$scope.indexToShow].structured.length>0) || ($scope.things[$scope.indexToShow].moreexample && $scope.things[$scope.indexToShow].moreexample.length>0))
  {
    console.log(achievements, $scope.things[$scope.indexToShow].id)
    if (achievementsCount>0)
    {
      achievementExisted = contains.call(achievements, $scope.things[$scope.indexToShow].id);
    }
    if (achievementExisted == false)
    {
      $scope.showInputBox = "true"
    }
    else
    {
      $scope.showInputBox = "false"
    }   
  }
}

$scope.submitAnswer = function(userAnswer) {
  if (userAnswer == undefined) userAnswer = "";
  console.log($scope.things[$scope.indexToShow].answer.toLowerCase().trim(), userAnswer.toLowerCase().trim())
  if ($scope.things[$scope.indexToShow].answer.toLowerCase().trim() == userAnswer.toLowerCase().trim())
  {
   var achievements = []
   achievements = JSON.parse(localStorage.getItem('achievements'));
   console.log(achievements)
   achievementExisted = contains.call(achievements, $scope.things[$scope.indexToShow].id);
   if (achievementExisted == false)
    {
      achievements.push($scope.things[$scope.indexToShow].id)
      localStorage.setItem('achievements',JSON.stringify(achievements))
    }
    $scope.showInputBox = "false"
  }
  else
  {
    $scope.answerPlaceholder="Try again. Or Get Answer"
  }
}

$scope.fillAnswer = function(thingId) {
  $http.get('http://www.google.com', { timeout: 6000 })
  .success(function () 
  {
    window.plugins.AdMob.createInterstitialView();
    window.plugins.AdMob.showInterstitialAd(true, 
      function()
      {
        $scope.showInputBox = "false";
        $scope.$apply();
      },
      function(e)
      {
        $scope.showInputBox = "false";
        $scope.$apply();
        console.log(e);
      }
    );  
    var achievements = []
    achievements = JSON.parse(localStorage.getItem('achievements'));  
    achievements.push($scope.things[$scope.indexToShow].id)
    localStorage.setItem('achievements',JSON.stringify(achievements))
  })
  .catch(function(error) {
    // Catch and handle exceptions from success/error/finally functions
    console.log(error);
    window.plugins.toast.showWithOptions(
      {message: "Make sure internet is on",duration: 2500,position: "bottom",addPixelsY: -40,styling: {backgroundColor: '#FF0000',textColor: '#FFFFFF'} }
    )
  });
}

$scope.fillStructured = function(thingId) {
  $scope.structuredShowAd = true
  var structuredCount = JSON.parse(localStorage.getItem('structuredCount') || 0);
  if (structuredCount % 10 || structuredCount == 0) $scope.structuredShowAd = false //triggers when have remainder
  var newstructuredCount = structuredCount + 1

  if ($scope.currentPlatform == "android" || $scope.currentPlatform == "ios") 
  {
    testUrl = "http://www.google.com"
  }
  else
  {
    testUrl = "https://jsonblob.com/api/jsonblob/1f61f57a-b1d6-11e6-871b-330772562403"
  }

  $http.get(testUrl, { timeout: 6000 })
  .success(function () 
  {
    localStorage.setItem('structuredCount',newstructuredCount)
    if ($scope.structuredShowAd == true)
    {
      window.plugins.AdMob.createInterstitialView();
      window.plugins.AdMob.showInterstitialAd(true, 
        function()
        {
          $scope.showInputBox = "false";
          $scope.$apply();
        },
        function(e)
        {
          $scope.showInputBox = "false";
          $scope.$apply();
          console.log(e);
        }
      );
    }
    else
    {
      $scope.showInputBox = "false";
    }
    var achievements = []
    achievements = JSON.parse(localStorage.getItem('achievements'));  
    achievements.push($scope.things[$scope.indexToShow].id)
    localStorage.setItem('achievements',JSON.stringify(achievements))
  })
  .catch(function(error) {
    // Catch and handle exceptions from success/error/finally functions
    // console.log(error);
    if ($scope.currentPlatform == "android" || $scope.currentPlatform == "ios") 
    {
      window.plugins.toast.showWithOptions(
        {message: "Make sure internet is on",duration: 2500,position: "bottom",addPixelsY: -40,styling: {backgroundColor: '#FF0000',textColor: '#FFFFFF'} }
      )
    }
  });
}


$scope.jumpToId = function(Id) {
  for(var i=0;i<$scope.things.length;i++) 
  {
    if ($scope.things[i].id == Id) $scope.indexToShow = i;
  }  
  console.log($scope.indexToShow)
  $scope.thing = $scope.things[$scope.indexToShow]
  $scope.pageNumber = parseInt($scope.indexToShow) + 1
  localStorage.setItem('lastId',$scope.things[$scope.indexToShow].id)
  answerModule()
  $scope.searchModal.hide();
}

$scope.jumpToCategory = function(category) {
  console.log(category)
  var categoryFound = false
  for(var i=0;i<$scope.things.length;i++) 
  {
   // console.log($scope.things[i].category)
   if ($scope.things[i].category == category) 
    {
      $scope.indexToShow = i;
      categoryFound = true
      break
    }
  }  
  if (categoryFound == false) console.log("Not found")
  console.log($scope.indexToShow)
  $scope.thing = $scope.things[$scope.indexToShow]
  $scope.pageNumber = parseInt($scope.indexToShow) + 1
  localStorage.setItem('lastId',$scope.things[$scope.indexToShow].id)
  answerModule()
  $scope.categoryModal.hide();
}

$scope.checkInstallation = function() {
  if ($scope.currentPlatform == "ios")
  {
    appAvailability.check(
        'whatsapp://', // URI Scheme
        function() {  // Success callback
            $scope.hasWhatsApp = "true"
        },
        function() {  // Error callback
            console.log('WhatsApp is not available');
        }
    );
    appAvailability.check(
        'twitter://', // URI Scheme
        function() {  // Success callback
            $scope.hasTwitter = "true"
        },
        function() {  // Error callback
            console.log('Twitter is not available');
        }
    );        
    appAvailability.check(
        'fb://', // URI Scheme
        function() {  // Success callback
            $scope.hasFacebook = "true"
        },
        function() {  // Error callback
            console.log('Facebook is not available');
        }
    );
    appAvailability.check(
        'instagram://', // URI Scheme
        function() {  // Success callback
            $scope.hasInstagram = "true"
        },
        function() {  // Error callback
            console.log('Instagram is not available');
        }
    );     
  }
  if ($scope.currentPlatform == "android")
  {
    appAvailability.check(
        'com.whatsapp', // URI Scheme
        function() {  // Success callback
            $scope.hasWhatsApp = "true"
        },
        function() {  // Error callback
            console.log('WhatsApp is not available');
        }
    );
    appAvailability.check(
        'com.twitter.android', // URI Scheme
        function() {  // Success callback
            $scope.hasTwitter = "true"
        },
        function() {  // Error callback
            console.log('Twitter is not available');
        }
    );        
    appAvailability.check(
        'com.facebook.katana', // URI Scheme
        function() {  // Success callback
            $scope.hasFacebook = "true"
        },
        function() {  // Error callback
            console.log('Facebook is not available');
        }
    );
    appAvailability.check(
        'com.instagram.android', // URI Scheme
        function() {  // Success callback
            $scope.hasInstagram = "true"
        },
        function() {  // Error callback
            console.log('Instagram is not available');
        }
    );    
  }  
}

$scope.screenshot = function(socialMedia,myTitle,myUrl) {
  $scope.noscreenshot = false
  $scope.nowSharing = true
  // ionic.Platform.fullScreen()
  $scope.hideBanner()
  $timeout(function()
  {
    navigator.screenshot.URI(function(error,res){
      if(error){
        console.error(error);
      }
      else
      {
        // iOS link – "/private/var/mobile/Containers/Data/Application/08C1C25C-9EB1-4A03-B266-9FF5BAFEAA84/tmp/myScreenShot.jpg"
        if (socialMedia == "WhatsApp") 
        {
          $scope.shareWhatsApp(res.URI,myTitle,myUrl)
        }
        if (socialMedia == "Twitter") 
        {
          myTitle = "#spm17 #spm2017 #spm2k17 #spmcandidate #spmcandidate2k17 #spmcandidate2017 #roadtospm2017 #roadtospm2k17 #spmsejarah #spmstraighta #batch00"
          $scope.shareTwitter(res.URI,myTitle,myUrl)
        }
        if (socialMedia == "Facebook") 
        {
          myTitle = "#spm #spm17 #spm2017 #spm2k17 #spmcandidate #spmcandidates #spmcandidate2017 #spmcandidate2k17 #spmcandidates2017 #spmcandidates2k17 #spmstraighta #spmsejarah #roadtospm2017 #roadtospm2k17 #tingkatan4 #tingkatan5 #batch00 #batch2000 #batch2k #kbat"
          $scope.shareFacebook(res.URI,myTitle,myUrl)
        }
        if (socialMedia == "Instagram") 
        {
          myTitle = "#spm #spm17 #spm2017 #spm2k17 #spmcandidate #spmcandidates #spmcandidate2017 #spmcandidate2k17 #spmcandidates2017 #spmcandidates2k17 #spmstraighta #spmsejarah #roadtospm2017 #roadtospm2k17 #tingkatan4 #tingkatan5 #batch00 #batch2000 #batch2k #kbat"
          $scope.shareInstagram(res.URI,myTitle,myUrl)
        }        
      }
    },'png',20); // 'myScreenShot' parameter added if use .save method
  },800);
}

$scope.shareWhatsApp = function(image,myTitle,myUrl) {
  window.plugins.socialsharing
  .shareViaWhatsApp(myTitle.trim(), image, myUrl, 
  function() { if ($scope.currentPlatform == "ios") refreshScreen(); }, 
  function(errormsg) { if ($scope.currentPlatform == "ios") refreshScreen(); })
}

$scope.shareTwitter = function(image,myTitle,myUrl) {
  window.plugins.socialsharing
  .shareViaTwitter(myTitle.trim(), image, myUrl, 
  function() { if ($scope.currentPlatform == "ios") refreshScreen(); }, 
  function(errormsg) { if ($scope.currentPlatform == "ios") refreshScreen(); })
}

$scope.shareFacebook = function(image,myTitle,myUrl) {
  window.plugins.socialsharing
  .shareViaFacebookWithPasteMessageHint(myTitle.trim(), image, null, 'If you like, you can paste the title',
  function() { if ($scope.currentPlatform == "ios") refreshScreen(); }, 
  function(errormsg) { if ($scope.currentPlatform == "ios") refreshScreen(); })
}

$scope.shareInstagram = function(image,myTitle,myUrl) {
  window.plugins.socialsharing
  .shareViaInstagram(myTitle.trim(), image, 
  function() { if ($scope.currentPlatform == "ios") refreshScreen(); }, 
  function(errormsg) { if ($scope.currentPlatform == "ios") refreshScreen(); })
}

$scope.addLocalNotification = function() {
    var taskId = 'FokusSejarah001'
    var projectTitle = 'Fokus Sejarah'
    var taskTitle = 'Gred A menanti anda'
    var addTime = 86400000 * 14
    var currentDate = (new Date)
    var alarmTime = new Date(currentDate.getTime() + addTime)    
    if (alarmTime)
    {
      $cordovaLocalNotification.add({
          id: taskId,
          at: alarmTime,
          text: taskTitle,
          title: projectTitle,
          icon: "file://img/icon.png",
          sound: "res://platform_default",
          led: "00FF00",
          data: ""
      }).then(function () {
          console.log(alarmTime)
      });
    }
};

$scope.hideBanner = function() {
  window.plugins.AdMob.destroyBannerView();
}

$scope.showBannerAgain = function() {
  if ($scope.nowSharing == true)
  {
    $scope.nowSharing = false
    initAd();
    window.plugins.AdMob.createBannerView();  
  }

}


/////////////////////////////////////////////

function initAd(){
  if ( window.plugins && window.plugins.AdMob ) 
  {
    var ad_units = {
      ios : {
        banner: 'ca-app-pub-1139669262221691/2271667768',
        interstitial: 'ca-app-pub-1139669262221691/6701867367'
      },
      android : {
        banner: 'ca-app-pub-1139669262221691/9934535360',
        interstitial: 'ca-app-pub-1139669262221691/6841468169'
      },
      wp8 : {
        banner: 'ca-app-pub-6869992474017983/8878394753',
        interstitial: 'ca-app-pub-6869992474017983/1355127956'
      }
    };
    var admobid = "";
    if( /(android)/i.test(navigator.userAgent) ) {
      admobid = ad_units.android;
    } else if(/(iphone|ipad)/i.test(navigator.userAgent)) {
      admobid = ad_units.ios;
    } else {
      admobid = ad_units.wp8;
    }
    window.plugins.AdMob.setOptions( {
      publisherId: admobid.banner,
      interstitialAdId: admobid.interstitial,
            bannerAtTop: false, // set to true, to put banner at top
            overlap: true, // set to true, to allow banner overlap webview
            offsetTopBar: true, // set to true to avoid ios7 status bar overlap
            isTesting: false, // receiving test ad
            autoShow: true // auto show interstitial ad when loaded
          });
      registerAdEvents();
  } else {
    console.log('admob plugin not ready');
  }
}

// optional, in case respond to events
function registerAdEvents() {
  document.addEventListener('onReceiveAd', function(){});
  document.addEventListener('onFailedToReceiveAd', function(data){});
  document.addEventListener('onPresentAd', function(){});
  document.addEventListener('onDismissAd', function(){ });
  document.addEventListener('onLeaveToAd', function(){ });
  document.addEventListener('onReceiveInterstitialAd', function(){ });
  document.addEventListener('onPresentInterstitialAd', function(){ });
  document.addEventListener('onDismissInterstitialAd', function(){ });
}

function getNotes() {
  $scope.things = JSON.parse(localStorage.getItem('things')) || [];
  $scope.lastId = localStorage.getItem('lastId') || '';
  // var osLocalJsonPath = ""
  if($scope.currentPlatform == "android") osLocalJsonPath = "/android_asset/www/js/spmsejarah.txt"
  if($scope.currentPlatform == "ios") osLocalJsonPath = "js/spmsejarah.txt"

  if(($scope.currentPlatform == "android" || $scope.currentPlatform == "ios") && ($scope.things == "" || $scope.things.length < 1400)){
      $http
      .get(osLocalJsonPath)
      .then(function(response)
        { 
          console.log(response.data); 
          localStorage.setItem('things',JSON.stringify(response.data)); 
          loadThingsLocalStorage();
          $timeout(function()
          {
            setThingMobileDeviceLocalStorage();
          }, 15000);
        });
  }
  else if (($scope.currentPlatform == "android" || $scope.currentPlatform == "ios") && $scope.things != "")
  {
    loadThingsLocalStorage();
    $timeout(function()
    {
      setThingMobileDeviceLocalStorage();
    }, 15000);    
  }
  else
  {
    setThingDesktopDeviceLocalStorage();
  }
}

function loadThingsLocalStorage() {
  $scope.indexToShow = "0";
  $scope.things = JSON.parse(localStorage.getItem('things')) || [];
  $scope.slideDirection = "bounceInUp"
  for(var i=0;i<$scope.things.length;i++) 
  {
    if ($scope.things[i].id == $scope.lastId) 
      {
        $scope.indexToShow = i;
      }
  } 
  console.log($scope.indexToShow)
  $scope.thing = $scope.things[$scope.indexToShow]
  $scope.pageNumber = parseInt($scope.indexToShow) + 1
  answerModule() 
}

function setThingMobileDeviceLocalStorage() {
  var myRandomNumber = Math.floor(Math.random() * 60000) + 1  
  var notesAwsLink = "https://s3-us-west-2.amazonaws.com/fokussejarah/spmsejarah.txt?r=" + myRandomNumber
  $http.get(notesAwsLink, { timeout: 30000 })
  .success(function (fullnotes) 
  {
    localStorage.setItem('things',JSON.stringify(fullnotes));
    console.log("got notes")
    //reset things according to cloud
    $scope.things = JSON.parse(localStorage.getItem('things')) || [];
  })
  .catch(function(error) {
    // Catch and handle exceptions from success/error/finally functions
    console.log(error);
  });
}

function setThingDesktopDeviceLocalStorage() {
  // var notesLink = "https://jsonblob.com/api/jsonblob/cb9ae5b0-b3d9-11e6-871b-8f073a81e66e" // adelene
  var notesLink = "https://jsonblob.com/api/jsonBlob/2322b1a5-c6d1-11e7-b06a-2f278541c731" // benny
  $http.get(notesLink, { timeout: 30000 })
  .success(function (fullnotes) 
  {
    localStorage.setItem('things',JSON.stringify(fullnotes));
    loadThingsLocalStorage()
  });
}

function onResume() {
  // if ($scope.currentPlatform == "android" || $scope.currentPlatform == "ios")
  // {
  //   if ($scope.showInputBox == "false") $scope.$apply()
  //   console.log("resumed")
  // }
  if ($scope.currentPlatform == "android")
  {
    refreshScreen()
  }
}  

function refreshScreen() {
  $scope.noscreenshot = true; 
  $scope.showBannerAgain(); 
  $scope.$apply();  
}

})