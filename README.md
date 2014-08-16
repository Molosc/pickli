Pickli
======

jQuery Plug-in

# Features
- Lorem ipsum 
- Other feature

For complete documentation and examples, visit: 

http://molosc.github.io/pickli

Written by: R. Romain - http://molosc.com


# License

Released under the MIT license - http://opensource.org/licenses/MIT

Let's get on with it!


# Installation

## Step 1: Link required files

First and most important, the jQuery library needs to be included. Next, download the package from this site and link the Pickli Javascript file.

```
<!-- jQuery library (served from Google) -->
<script src="http://code.jquery.com/jquery.min.js"></script>
<!-- Pickli Javascript file -->
<script src="jquery.pickli.min.js"></script>
```

## Step 2: Create HTML markup

Create a <ul> element, with a <li> for each item. An item can contain any HTML content and need a value attribute.

```
<ul>
  <li value="1">Item 1></li>
  <li value="2">Item 2</li>
  <li value="3">Item 3</li>
  <li value="4">Item 4</li>
</ul>
```

## Step 3: Call the Pickli

Call .pickli() on target <ul>. Note that the call must be made inside of a $(document).ready() call, or the plugin will not work!

```
$(document).ready(function(){
  $('ul').pickli();
});
```


# Configuration options

## Data

**default** The default selected value
```
default: null
options: string
```

**index** The selected index
```
default: null
options: integer
```














