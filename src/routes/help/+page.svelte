<script>
  import { Grid, Row, Column, Link } from 'carbon-components-svelte'
</script>

<Grid>
  <Row>
    <Column>
      <h1>Help</h1>
      
      <p>This web application uses <Link inline href="https://github.com/qgustavor/ffmpeg.js">a WASM port of FFmpeg</Link> to extract streams from video files.</p>
      
      <p>This project begun as an experiment to provide a way to render Matroska files in browsers by extracting their streams and remuxing into MP4 containers (formally ISO/IEC 14496-14:2003) since at that time most browsers did not supported rendering of videos using the Matroska container but allowed videos that used the MP4 container.</p>
      
      <p>The project was eventually abandoned, but since the extraction part seemed useful this version that uses FFmpeg as a basis was created. Now it supports extracting more kinds of streams, have more options and also supports extracting streams from MP4 files.</p>
      
      <h2>FAQ</h2>
      
      <dl>
        <dt>Why does it require JavaScript?</dt>
        <dd>Because no file is uploaded to any server, the application works entirely in the browser.</dd>

        <dt>Why no support for specifying an URL?</dt>
        <dd>Because it works in a browser and in most cases pages cannot access contents from another webpages (see <Link inline href="https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy">Same-origin policy</Link>).</dd>

        <dt>Why some file of mine is not working?</dt>
        <dd>This project is a work in progress. See the error log and, if you really think the issue is in the application and not your file which is corrupted, open an issue in GitHub.</dd>

        <dt>Why some streams are extracted to MP4 or MKV files?</dt>
        <dd>To reduce FFmpeg build sizes it does not include muxers to formats such as H264 and H265. If you think that's worth to a certain muxer to be included then open an issue in GitHub.</dd>

        <dt>Why this design looks so corporate?</dt>
        <dd>Because it's IBM's Carbon Design: I was looking for a Svelte component library with lots of components and dark mode, I was also tired from Material Design, so I chose this one.</dd>

        <dt>Why Svelte?</dt>
        <dd>I wanted to try it. I still don't like how it handles reactivity, it reminds me of Mithril, Vue is better in this regard. Also styles being scoped by default caused more headaches than I had expected.</dd>

        <dt>Why I can't extract to the Downloads folder?</dt>
        <dd>Because if you allow access to the Downloads folder to any website it might try to read your downloads and leak your data and sadly the current specification of the thing that handles it does not have any mechanism to avoid that other than blocking entirely access to that folder. Create a new folder and use it instead. By the way Firefox and many other browsers does not implement that thing because, as you may guess, despite it being quite useful for developers, it opens a security can of worms. Also Chromium blocks the "~" character from file names even if <Link inline href="https://en.wikipedia.org/wiki/Filename#Comparison_of_filename_limitations">it's not a reserved character in most file systems</Link>, which is really weird and accounted for in this application.</dd>

        <dt>Why FFmpeg?</dt>
        <dd>The original plan was to take the original mkvextract code and compile it to WASM, but using FFmpeg seemed easier since there are some WASM implementations of it already.</dd>
      </dl>
    </Column>
  </Row>
</Grid>

<style>
dt {
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.4em;
}
dl, dd {
  font-size: 1rem;
  padding-left: 1em;
}
p {
  margin-bottom: 1em;
}
</style>
