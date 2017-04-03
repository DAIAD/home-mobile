# DAIAD@home-mobile

### DAIAD@home-mobile is a cross-platform mobile application developed in iOS and Android platforms. We use the open source Apache Cordova development framework that allows us to use standard web technologies (JavaScript, HTML, CCS, etc.). 

### This repo contains important files ( www/ and config.xml) for the build process enabling the developer to create her own mobile application ignoring information about platforms based folders and plugins. 
All the necessary information(app preferences and plugins list) is in the config.xml file.

### Installing the Cordova
    npm install -g cordova

### Create the App 
    cordova create hello com.example.hello HelloWorld```

### Add platforms
    cd hello
    cordova platform add ios --save
    cordova platform add android --save

### Install pre-requisites for building
    cordova requirements

    Requirements check results for android:
    Java JDK: installed .
    Android SDK: installed
    Android target: installed android-19,android-21,android-22,android-23,Google Inc.:Google APIs:19,Google Inc.:Google APIs (x86 System Image):19,Google Inc.:Google APIs:23
    Gradle: installed

    Requirements check results for ios:
    Apple OS X: not installed
    Cordova tooling for iOS requires Apple OS X
    Error: Some of requirements check failed

### Build the App
    cordova build ios
    cordova build android

### Test the App
    cordova emulate android
    * In iOS platform for building in real devices a development account is necessary. ( Apple Developer Account )
    
### Install Plugins
    //check whether the plugins in the config.xml has been installed
    cordova plugin ls 
    cordova-plugin-camera 2.1.0 "Camera"
