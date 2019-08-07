SearchBox Bookmarks
==========

"SearchBox Bookmarks" is a Google Chrome Extension [published in Chrome Web Store](https://chrome.google.com/webstore/detail/searchbox-bookmarks/hplmgcbileifdjfahjdmpjclbkmgdhic).

How to build
----------

1. Get following softwares.
   * JDK
   * [Apache Ant](http://ant.apache.org/)
   * [Closure Compiler](https://developers.google.com/closure/compiler/)
   * `chrome.js` and `chrome_extensions.js` in the [Closure Compiler source](https://github.com/google/closure-compiler)
   * Google Chrome

2. Build.
   ```
   ant -Dversion=0 -Dclosure=../build -Dexterns=../contrib/externs
   ```

3. Create image files.

   Open `resources.html`.
   Then drag each image into the folder and move/rename to shown path.

