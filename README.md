===
This is based on an existing extension in the web store called Chrome Web Server
===

Get it in the chrome web store:

https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb

==
General modifications made
==

* No static directory or configuration required because we server up IL's WebGL build from the IL folder directly
* The buffer sizes increased to server our pages up quicker
* We force the app to server the jsgz files to make it transfer less data
* Manifest modified to accomodate recordings

==
Build instructions
==

To make something that can go to the Chrome Web Store is pretty simple but here are the steps:

* Copy the WebGL build from Q:\Tablet\PotentialRelease\Sprint##\1.##.#####\bin into the IL folder
* Open the uniquely named folder and delete the release directory (files aren't used)
* Open the templatedata directory and rename Booster.png to booster.png
* In the compressed directory you can delete WebGL.jsgz since it isn't used (10 mb-ish)
* Open the manifest.json from the root and update the version number to match whatever you've just added
 
At that point you can send the package to the Chrome Web Store
