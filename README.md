# MKV Extract

Extract MKV subtitles and attachments directly from the browser: https://qgustavor.github.io/mkv-extract/

1. Open or drop a MKV file
2. Wait a while...
3. ???
4. Profit!

No downloads or uploads, no extensions, no plugins, no complicated things. Extract .ASS and .SRT subtitles and also any kind of attachment.

> **Note:** if you found any issue using this tool read [this issue](https://github.com/qgustavor/mkv-extract/issues/21) for more info.

*Built with:*

* [node-ebml](https://github.com/themasch/node-ebml), for MKV parsing;
* [filereader-stream](https://github.com/maxogden/filereader-stream), for streaming files;
* [progress-stream](https://github.com/freeall/progress-stream), for statistics;
* [jszip](https://github.com/Stuk/jszip), because it's simpler downloading one file than a lot of files;
* [filesaver.js](https://github.com/eligrey/FileSaver.js), because it's easy to use;
* [parcel](https://parceljs.org/), because it's simple;
* [typescript](https://www.typescriptlang.org/), to avoid bugs;
* [standard](https://github.com/feross/standard), why not?

Design based on [this pen](http://codepen.io/prasanjit/pen/NxjZMO) from [Prasanjit Singh](http://codepen.io/prasanjit/).
