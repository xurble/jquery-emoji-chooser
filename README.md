# jQuery Emoji Chooser #


## Description ##

A simple jQuery plugin to allow users to enter emoji into any text input or textarea.

Try the [demo](http://xurble.github.io/jquery-emoji-chooser/demo.html).

## Installation ##

You can install the assets via bower:

```bash
$ bower install jquery-emoji-chooser
```

Make sure that jQuery is included in your `<head></head>` tag.  If you are not already including it, you can load it from jQuery's CDN:

```html
<script type="text/javascript" src="https://code.jquery.com/jquery-1.11.2.min.js"></script>
```

Add the following to your `<head></head>` tag:

```html
<link rel="stylesheet" type="text/css" href="css/jquery.emojipicker.css">
<script type="text/javascript" src="js/jquery.emojipicker.js"></script>

<!-- Emoji Data -->
<link rel="stylesheet" type="text/css" href="css/jquery.emojipicker.a.css">
<script type="text/javascript" src="js/jquery.emojis.js"></script>
```


Initialize the jQuery Emoji Chooser by calling `emojiChooser` on an input element with optional parameters, described below:

```javascript
$('.question').emojiChooser({
  height: '300px',
  width:  '450px'
});
```

## Parameters ##

### width (int) ###
The width of the picker in pixels. Must be between 280-600px. Defaults to 280px if no width is specified.

### height (int) ###
The height of the picker in pixels. Must be between 100-350px. Defaults to 250px if no height is specified.

### fadeTime (int) ###
The amount of time in ms that it will take for the picker to fade in and out. Defaults to 100ms if no fadeTime is specified.

### iconColor (string) ###
The color of the smiley image that appears on the picker button. Acceptable values are ['white', 'black', 'gray', 'yellow']. Defaults to 'black' if no iconColor is specified.

### iconBackgroundColor (string) ###
The background color of the picker button. Any hex value is acceptable. Defaults to '#eee' if no iconBackgroundColor is specified.

### recentCount (int) ###
The number of emojis that should show in the 'Recently Used' section. Defaults to 36 if no recentCount is specified.

Note: 'Recently Used' will only show for the user if their browser supports HTML5 Local Storage.

### button (boolean) ###
Whether to show the emoji button on the input or not. Defaults to true. If you hide the button, you will probably need to trigger the emoji entry manually (see below).

### onShow (function) ###
Triggered once the emoji picker appears. `picker` (Object), `settings` (Object), and `isActive` (boolean) are returned. Example usage:

```javascript
$('#question').emojiChooser({
  onShow: function(picker, settings, isActive) {
  	...
  }
});
```

### onHide (function) ###
Triggered once the emoji picker disappears. `picker` (Object), `settings` (Object), and `isActive` (boolean) are returned. Example usage:

```javascript
$('#question').emojiChooser({
  onHide: function(picker, settings, isActive) {
  	...
  }
});
```

## Triggering Emoji Chooser Manually ##

To trigger the button manually, you can call a jQuery function on the same element you bound it to.

```javascript
$('#question').emojiChooser('toggle');
```

You can see an example of this in the [demo](http://xurble.github.io/jquery-emoji-chooser/demo.html).

## Destroying the Emoji Chooser ##

To remove the the emoji picker html and event listeners, simply call the emoji picker function with the `destroy` option:

```javascript
$('#question').emojiChooser('destroy');
```

An example of this can be found in the [demo](http://xurble.github.io/jquery-emoji-chooser/demo.html).



## Notes ##

jQuery Emoji Chooser is disabled for mobile devices, which already support the emoji keyboard.

## Attribution ##

The jQuery Emoji Chooser is based on the original 
[jQuery Emjoi Picker](https://github.com/wedgies/jquery-emoji-picker)


## License ##

The jQuery Emoji Chooser is licensed under ISC.

## About ##

The [jQuery Emjoi Picker](https://github.com/wedgies/jquery-emoji-picker) was developed by the team at [Wedgies](http://www.wedgies.com).

This goal of this version is to bring in support for features like skin tones, while removing the dependency on large image downloads for the UI.

