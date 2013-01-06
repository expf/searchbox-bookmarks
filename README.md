SearchBox Bookmarks
==========

"SearchBox Bookmarks" is a Google Chrome Extension [published in Chrome Web Store](https://chrome.google.com/webstore/detail/searchbox-bookmarks/hplmgcbileifdjfahjdmpjclbkmgdhic).

How to build
----------

1. Get following softwares.

   * JDK
   * [Apache Ant](http://ant.apache.org/)
   * [Closure Compiler](https://developers.google.com/closure/compiler/)
   * `chrome_extensions.js` and `json.js` in the [Closure Compiler source](http://code.google.com/p/closure-compiler/source/browse/trunk/contrib/externs/)
   * Google Chrome

2. Build.

   `ant -Dversion=0 -Dclosure=../build -Dexterns=../contrib/externs`

3. Create image files.

   Open `resources.html`.
   Then drag each image into the folder and move/rename to shown path.

