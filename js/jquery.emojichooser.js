;(function($) {

  var pluginName = "emojiChooser",
      defaults = {
        width: '200',
        height: '350',
        position: 'right',
        fadeTime: 100,
        iconColor: 'black',
        iconBackgroundColor: '#eee',
        recentCount: 36,
        container: 'body',
        button: true
      };

  var MIN_WIDTH = 280,
      MAX_WIDTH = 600,
      MIN_HEIGHT = 100,
      MAX_HEIGHT = 350,
      MAX_ICON_HEIGHT = 50;

  var categories = [
    { name: 'people', label: 'People', icon: '😀' },
    { name: 'nature', label: 'Nature', icon: '🐥' },
    { name: 'food', label: 'Food', icon: '🍔' },
    { name: 'activity', label: 'Activities', icon: '🏀' },
    { name: 'travel', label: 'Travel & Places', icon: '🗺' },
    { name: 'object', label: 'Objects', icon: '💡' },
    { name: 'symbol', label: 'Symbols', icon: '⚛️' },
    { name: 'flag', label: 'Flags', icon: '🏳️' }
  ];
  
  var skintones = [
    "1F3FB",
    "1F3FC",
    "1F3FD",
    "1F3FE",
    "1F3FF"
  ]

  function EmojiChooser( element, options ) {

    this.element = element;
    this.$el = $(element);

    this.settings = $.extend( {}, defaults, options );

    this.$container = $(this.settings.container);

    // (type) Safety first
    this.settings.width = parseInt(this.settings.width);
    this.settings.height = parseInt(this.settings.height);

    // Check for valid width/height
    if(this.settings.width >= MAX_WIDTH) {
      this.settings.width = MAX_WIDTH;
    } else if (this.settings.width < MIN_WIDTH) {
      this.settings.width = MIN_WIDTH;
    }
    if (this.settings.height >= MAX_HEIGHT) {
      this.settings.height = MAX_HEIGHT;
    } else if (this.settings.height < MIN_HEIGHT) {
      this.settings.height = MIN_HEIGHT;
    }

    var possiblePositions = [ 'left',
                              'right'
                              /*,'top',
                              'bottom'*/];
    if($.inArray(this.settings.position,possiblePositions) == -1) {
      this.settings.position = defaults.position; //current default
    }

    // Do not enable if on mobile device (emojis already present)
    if(!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      this.init();
    } else {
      this.isMobile = true;
    }

  }

  $.extend(EmojiChooser.prototype, {

    init: function() {
      this.active = false;
      this.addChooserIcon();
      this.loadPrefs();
      this.createChooser();
      this.listen();
    },

    addChooserIcon: function() {
      // The wrapper is not needed if they have chosen to not use a button
      if (this.settings.button) {
        var elementHeight = this.$el.outerHeight();
        var iconHeight = elementHeight > MAX_ICON_HEIGHT ?
          MAX_ICON_HEIGHT :
          elementHeight;

        // This can cause issues if the element is not visible when it is initiated
        var objectWidth = this.$el.width();

        this.$el.width(objectWidth);

        this.$wrapper = this.$el
          .wrap("<div class='emojiChooserIconWrap'></div>")
          .parent();

        this.$icon = $('<div class="emojiChooserIcon"></div>')
          .height(iconHeight)
          .width(iconHeight)
          .addClass(this.settings.iconColor)
          .css('backgroundColor', this.settings.iconBackgroundColor);
          this.$wrapper.append( this.$icon );
      }

    },
    
    loadPrefs: function() {

        if($.fn.emojiChooser.prefsLoaded) {
            return;
        }
        
        $.fn.emojiChooser.prefsLoaded = true;
    

        $.fn.emojiChooser.emojiPrefs = {

        };        

        var localStorageSupport = (typeof(Storage) !== 'undefined') ? true : false;


        if (localStorageSupport) {
            if(localStorage.emojiPrefs) {
                $.fn.emojiChooser.emojiPrefs = JSON.parse(localStorage.emojiPrefs);
            }    
        } 

        $.each($.fn.emojiChooser.emojis, function(i, emoji) {


            if (emoji.skintones) {
                emoji.baseUnicode = emoji.unicode;

                if($.fn.emojiChooser.emojiPrefs.hasOwnProperty(emoji.shortcode) && $.fn.emojiChooser.emojiPrefs[emoji.shortcode] != "") {
                    emoji.unicode = emoji.unicode + '-' + $.fn.emojiChooser.emojiPrefs[emoji.shortcode];
                    emoji.prefchosen = true;
                }
            }


        });


    },

    createChooser: function() {

      // Show template
      this.$chooser = $( getChooserHTML() )
        .appendTo( this.$container )
        .width(this.settings.width)
        .height(this.settings.height)
        .css('z-index',10000);

      // Chooser height
      this.$chooser.find('.sections')
        .height(parseInt(this.settings.height) - 40); // 40 is height of the tabs

      // Tab size based on width
      if (this.settings.width < 240) {
        this.$chooser.find('.emoji').css({'width':'1em', 'height':'1em'});
      }

    },

    destroyChooser: function() {
      if (this.isMobile) return this;

      this.$chooser.unbind('mouseover');
      this.$chooser.unbind('mouseout');
      this.$chooser.unbind('click');
      this.$chooser.remove();

      $.removeData(this.$el.get(0), 'emojiChooser');

      return this;
    },


    hidePrefPane: function () {
        $("#skinprefs").fadeOut();
    },

    showPrefPane: function (emoji, emojiSpan) {
    
        var os = $(emojiSpan).position();    

        $("#pref-base").data("shortcode",emoji.shortcode).html(getHtmlEntities(emoji.baseUnicode));

        for(var i = 0; i < skintones.length; i++) {
            $("#pref-" + i).data("shortcode", emoji.shortcode).html(getHtmlEntities(emoji.baseUnicode + '-' + skintones[i]));
        }

        setTimeout(function(){  // we do this in a set timeout to stop the regular click handler hiding it as soon as it is shown
            $("#skinprefs").css({
                top: os.top-20,
                left: os.left-100
              }).fadeIn();
        
        },200);


        

    },


    listen: function() {
      // If the button is being used, wrapper has not been set,
      //    and will not need a listener
      if (this.settings.button){
        // Clicking on the chooser icon
        this.$wrapper.find('.emojiChooserIcon')
          .click( $.proxy(this.iconClicked, this) );
      }

      // Click event for emoji
      this.$chooser.on('mousedown', 'em', $.proxy(this.emojiClickedStarted, this));
      this.$chooser.on('click', 'em', $.proxy(this.emojiClicked, this));

      // Hover event for emoji
      this.$chooser.on('mouseover', 'em', $.proxy(this.emojiMouseover, this) );
      this.$chooser.on('mouseout',  'em', $.proxy(this.emojiMouseout, this) );

      // Click event for active tab
      this.$chooser.find('nav .tab')
        .click( $.proxy(this.emojiCategoryClicked, this) )
        .mouseover( $.proxy(this.emojiTabMouseover, this) )
        .mouseout( $.proxy(this.emojiMouseout, this) );

      // Scroll event for active tab
      this.$chooser.find('.sections')
        .scroll( $.proxy(this.emojiScroll, this) );

      this.$chooser.click( $.proxy(this.chooserClicked, this) );

      // Key events for search
      this.$chooser.find('section.search input')
        .on('keyup search', $.proxy(this.searchCharEntered, this) );

      // Shortcode hover
      this.$chooser.find('.shortcode').mouseover(function(e) { e.stopPropagation(); });

      $(document.body).click( $.proxy(this.clickOutside, this) );

      // Resize events forces a reposition, which may or may not actually be required
      $(window).resize( $.proxy(this.updatePosition, this) );
    },

    updatePosition: function() {

      /*  Process:
          1. Find the nearest positioned element by crawling up the ancestors, record it's offset
          2. Find the bottom left or right of the input element, record this (Account for position setting of left or right)
          3. Find the difference between the two, as this will become our new position
          4. Magic.

          N.B. The removed code had a reference to top/bottom positioning, but I don't see the use case for this..
      */

      // Step 1
      // Luckily jquery already does this...
      var positionedParent = this.$chooser.offsetParent();
      var parentOffset = positionedParent.offset(); // now have a top/left object

      // Step 2
      var elOffset = this.$el.offset();
      if(this.settings.position == 'right'){
        elOffset.left += this.$el.outerWidth() - this.settings.width;
      }
      elOffset.top += this.$el.outerHeight();

      // Step 3
      var diffOffset = {
        top: (elOffset.top - parentOffset.top),
        left: (elOffset.left - parentOffset.top)
      };

      this.$chooser.css({
        top: diffOffset.top,
        left: diffOffset.left
      });

      return this;
    },

    hide: function() {
      this.$chooser.hide(this.settings.fadeTime, 'linear', function() {
        this.active = false;
        if (this.settings.onHide) {
          this.settings.onHide( this.$chooser, this.settings, this.active );
        }
      }.bind(this));
    },

    show: function() {
      this.$el.focus();
      this.updatePosition();
      this.$chooser.show(this.settings.fadeTime, 'linear', function() {
        this.active = true;
        if (this.settings.onShow) {
          this.settings.onShow( this.$chooser, this.settings, this.active );
        }
      }.bind(this));
    },

    /************
     *  EVENTS  *
     ************/

    iconClicked : function() {
      if ( this.$chooser.is(':hidden') ) {
        this.show();
        if( this.$chooser.find('.search input').length > 0 ) {
          this.$chooser.find('.search input').focus();
        }
      } else {
        this.hide();
      }
    },

    emojiClickedStarted: function(e) {
       this.clickStarted = Date.now();
        
    },
    
    
    emojiClicked: function(e) { var clickTarget = $(e.target);
    
    
      var clickLen = Date.now() - this.clickStarted;
    
      var emojiSpan;
      if (clickTarget.is('em')) {
        emojiSpan = clickTarget.find('span');
      } else {
        emojiSpan = clickTarget.parent().find('.emoji');
      }
      
      
      var emojiShortcode = emojiSpan.data("shortcode");

      var emoji = findEmoji(emojiShortcode);
      
      if (emojiSpan.hasClass("skinchooser")) {
            emoji.prefchosen = true;
            var pref = emojiSpan.data("pref");
            if (pref=="") {
                emoji.unicode = emoji.baseUnicode;
            }
            else {
                emoji.unicode = emoji.baseUnicode + '-' +pref;
            }
            $(".emoji-" + emojiShortcode).html(getHtmlEntities(emoji.unicode));
            
            $("#skinprefs").fadeOut();


            var localStorageSupport = (typeof(Storage) !== 'undefined') ? true : false;
            if(localStorage) {

                $.fn.emojiChooser.emojiPrefs[emojiShortcode] = pref;


                localStorage.emojiPrefs = JSON.stringify($.fn.emojiChooser.emojiPrefs);
            }

      }
      
      if(emoji.skintones && (!emoji.prefchosen || clickLen > 500)) {
            this.showPrefPane(emoji, emojiSpan);
            return;
      } else {
        this.hidePrefPane();
      }

      var emojiUnicode = toUnicode(emoji.unicode);

      insertAtCaret(this.element, emojiUnicode);
      addToLocalStorage(emojiShortcode);
      updateRecentlyUsed(emojiShortcode);

      // For anyone who is relying on the keyup event
      $(this.element).trigger("keyup");

      // trigger change event on input
      var event = document.createEvent("HTMLEvents");
      event.initEvent("input", true, true);
      this.element.dispatchEvent(event);
    },

    emojiMouseover: function(e) {
     
      var emojiShortcode = $(e.target).parent().find('.emoji').data("shortcode");

      var $shortcode = $(e.target).parents('.emojiChooser').find('.shortcode');
      $shortcode.find('.random').hide();

      var emoji = findEmoji(emojiShortcode);

      $shortcode.find('.info').show().html('<div class="emoji emoji-' + emojiShortcode + '" data-shortcode="' + emojiShortcode + '">'+getHtmlEntities(emoji.unicode)+'</div><em>' + emojiShortcode + '</em>');
    },

    emojiMouseout: function(e) {
      $(e.target).parents('.emojiChooser').find('.shortcode .info').empty().hide();
      $(e.target).parents('.emojiChooser').find('.shortcode .random').show();
    },

    emojiCategoryClicked: function(e) {
      var section = '';

      // Update tab
      this.$chooser.find('nav .tab').removeClass('active');
      if ($(e.target).parent().hasClass('tab')) {
        section = $(e.target).parent().attr('data-tab');
        $(e.target).parent('.tab').addClass('active');
      }
      else {
        section = $(e.target).attr('data-tab');
        $(e.target).addClass('active');
      }

      var $section = this.$chooser.find('section.' + section);

      var heightOfSectionsHidden = $section.parent().scrollTop();
      var heightOfSectionToPageTop = $section.offset().top;
      var heightOfSectionsToPageTop = $section.parent().offset().top;

      var scrollDistance = heightOfSectionsHidden
                           + heightOfSectionToPageTop
                           - heightOfSectionsToPageTop;

      $('.sections').off('scroll'); // Disable scroll event until animation finishes

      var that = this;
      $('.sections').animate({
        scrollTop: scrollDistance
      }, 250, function() {
        that.$chooser.find('.sections').on('scroll', $.proxy(that.emojiScroll, that) ); // Enable scroll event
      });
    },

    emojiTabMouseover: function(e) {
      var section = '';
      if ($(e.target).parent().hasClass('tab')) {
        section = $(e.target).parent().attr('data-tab');
      }
      else {
        section = $(e.target).attr('data-tab');
      }

      var categoryTitle = '';
      for (var i = 0; i < categories.length; i++) {
        if (categories[i].name == section) { categoryTitle = categories[i].label; }
      }
      if (categoryTitle == '') { categoryTitle = 'Recently Used'; }

      var categoryCount = $('section.' + section).attr('data-count');
      var categoryHtml = '<em class="tabTitle">' + categoryTitle + ' <span class="count">(' + categoryCount + ' emojis)</span></em>';

      var $shortcode = $(e.target).parents('.emojiChooser').find('.shortcode');
      $shortcode.find('.random').hide();
      $shortcode.find('.info').show().html(categoryHtml);
    },

    emojiScroll: function(e) {
      var sections = $('section');
      $.each(sections, function(key, value) {
      
        
      
        var section = sections[key];
        
        if (section.hasClass("tab")) {
        
            var offsetFromTop = $(section).position().top;

            if (section.className == 'search' || (section.className == 'people' && offsetFromTop > 0)) {
              $(section).parents('.emojiChooser').find('nav tab.recent').addClass('active');
              return;
            }

            if (offsetFromTop <= 0) {
              $(section).parents('.emojiChooser').find('nav .tab').removeClass('active');
              $(section).parents('.emojiChooser').find('nav .tab[data-tab=' + section.className + ']').addClass('active');
            }
        }
      });
      this.hidePrefPane();
    },

    chooserClicked: function(e) {
      e.stopPropagation();
    
      if ($("#skinprefs").is(":visible")) {
        this.hidePrefPane();
      }

    },

    clickOutside: function(e) {
      if ( this.active ) {
        this.hidePrefPane();
        this.hide();
      }
    },

    searchCharEntered: function(e) {
      var searchTerm = $(e.target).val();
      var searchEmojis = $(e.target).parents('.sections').find('section.search');
      var searchEmojiWrap = searchEmojis.find('.wrap');
      var sections = $(e.target).parents('.sections').find('section');

      // Clear if X is clicked within input
      if (searchTerm == '') {
        sections.show();
        searchEmojiWrap.hide();
      }

      if (searchTerm.length > 0) {
        sections.hide();
        searchEmojis.show();
        searchEmojiWrap.show();

        var results = [];
        searchEmojiWrap.find('em').remove();

        $.each($.fn.emojiChooser.emojis, function(i, emoji) {
          var shortcode = emoji.shortcode;

          if ( shortcode.indexOf(searchTerm) > -1 ) {
            results.push('<em><span class="emoji emoji-' + shortcode + '" data-shortcode="' + shortcode + '">'+getHtmlEntities(emoji.unicode)+'</span></em>');
          }
        });
        searchEmojiWrap.append(results.join(''));
      } else {
        sections.show();
        searchEmojiWrap.hide();
      }
    }
  });

  $.fn[ pluginName ] = function ( options ) {

    // Calling a function
    if (typeof options === 'string') {
      this.each(function() {
        var plugin = $.data( this, pluginName );
        switch(options) {
          case 'toggle':
            plugin.iconClicked();
            break;
          case 'destroy':
            plugin.destroyChooser();
            break;
        }
      });
      return this;
    }

    this.each(function() {
      // Don't attach to the same element twice
      if ( !$.data( this, pluginName ) ) {
        $.data( this, pluginName, new EmojiChooser( this, options ) );
      }
    });
    return this;
  };

  /* ---------------------------------------------------------------------- */

  function getChooserHTML() {
    var nodes = [];
    var aliases = {
      'undefined': 'object'
    }
    var items = {};
    var localStorageSupport = (typeof(Storage) !== 'undefined') ? true : false;

    // Re-Sort Emoji table
    $.each($.fn.emojiChooser.emojis, function(i, emoji) {
      var category = aliases[ emoji.category ] || emoji.category;
      items[ category ] = items[ category ] || [];
      items[ category ].push( emoji );
    });

    nodes.push('<div class="emojiChooser">');
    nodes.push('<nav>');

    // Recent Tab, if localstorage support
    if (localStorageSupport) {
      nodes.push('<div class="tab active" data-tab="recent"><div class="emoji emoji-tab-recent">🕝</div></div>');
    }
    
    // Emoji category tabs
    var categories_length = categories.length;
    for (var i = 0; i < categories_length; i++) {
      nodes.push('<div class="tab' +
      ( !localStorageSupport && i == 0 ? ' active' : '' ) +
      '" data-tab="' +
      categories[i].name +
      '"><div class="emoji emoji-tab-' +
      categories[i].name +
      '">' + categories[i].icon + '</div></div>');
    }
    nodes.push('</nav>');
    nodes.push('<div class="sections">');

    // Search
    nodes.push('<section class="search">');
    nodes.push('<input type="search" placeholder="Search...">');
    nodes.push('<div class="wrap" style="display:none;"><h1>Search Results</h1></div>');
    nodes.push('</section>');

    // Recent Section, if localstorage support
    if (localStorageSupport) {
      var recentlyUsedEmojis = [];
      var recentlyUsedCount = 0;
      var displayRecentlyUsed = ' style="display:none;"';

      if (localStorage.emojis) {
        try{
            recentlyUsedEmojis = JSON.parse(localStorage.emojis);
        }
        catch(e) {
        }
        recentlyUsedCount = recentlyUsedEmojis.length;
        displayRecentlyUsed = ' style="display:block;"';
      }

      nodes.push('<section class="recent" data-count="' + recentlyUsedEmojis.length + '"' + displayRecentlyUsed + '>');
      nodes.push('<h1>Recently Used</h1><div class="wrap">');

      for (var i = recentlyUsedEmojis.length-1; i > -1 ; i--) {

        var emoji = findEmoji(recentlyUsedEmojis[i]);
        
        if (emoji != null) {
            nodes.push('<em><span class="emoji emoji-' + recentlyUsedEmojis[i] + '" data-shortcode="' + recentlyUsedEmojis[i] + '">'+getHtmlEntities(emoji.unicode)+'</span></em>');
        }
      }
      nodes.push('</div></section>');
    }
    
    // Emoji sections
    for (var i = 0; i < categories_length; i++) {
    
      var category_length = items[ categories[i].name ].length;
      nodes.push('<section class="' + categories[i].name + '" data-count="' + category_length + '">');
      nodes.push('<h1>' + categories[i].label + '</h1><div class="wrap">');
      for (var j = 0; j < category_length; j++) {
        var emoji = items[ categories[i].name ][ j ];
        nodes.push('<em><span class="emoji emoji-' + emoji.shortcode + '" data-shortcode="' + emoji.shortcode + '">'+getHtmlEntities(emoji.unicode)+'</span></em>');
      }
      nodes.push('</div></section>');
    }


    nodes.push('</div>');

    // Shortcode section
    nodes.push('<div class="shortcode"><span class="random">');
    nodes.push('<em class="tabTitle">' + generateEmojiOfDay() + '</em>');
    nodes.push('</span><span class="info"></span></div>');


    // skin tone chooser
    nodes.push('<section id="skinprefs" class="skinprefs"><div class="skinprefbox">');
    nodes.push('<em><span class="emoji skinchooser" id="pref-base" data-pref=""></span></em><span class="prefseparator"></span>');
    for(var i =0; i < skintones.length ; i++) {
        nodes.push('<em><span class="emoji skinchooser" id="pref-'+i+'" data-pref="'+skintones[i]+'"></span></em>');
    }
    nodes.push('<div class="prefarrow"></div></div></section>');



    nodes.push('</div>');
    
    
    
    return nodes.join("\n");
  }

  function getHtmlEntities(code) {
    var codes = code.split('-').map(function(value, index) {
              return '&#x' + value + ';';
        });
    return codes.join("");  
  }

  function generateEmojiOfDay() {
    var emojis = $.fn.emojiChooser.emojis;
    var i = Math.floor(Math.random() * (364 - 0) + 0);
    var emoji = emojis[i];
    return 'Daily Emoji: <span class="eod"><span class="emoji emoji-' + emoji.shortcode + '" data-shortcode="' + emoji.name + '">'+getHtmlEntities(emoji.unicode)+'</span> <span class="emojiName">' + emoji.name + '</span></span>';
  }

  function findEmoji(emojiShortcode) {
    var emojis = $.fn.emojiChooser.emojis;
    for (var i = 0; i < emojis.length; i++) {
      if (emojis[i].shortcode == emojiShortcode) {
        return emojis[i];
      }
    }
    return null;
  }

  function insertAtCaret(inputField, myValue) {
    if (document.selection) {
      //For browsers like Internet Explorer
      inputField.focus();
      var sel = document.selection.createRange();
      sel.text = myValue;
      inputField.focus();
    }
    else if (inputField.selectionStart || inputField.selectionStart == '0') {
      //For browsers like Firefox and Webkit based
      var startPos = inputField.selectionStart;
      var endPos = inputField.selectionEnd;
      var scrollTop = inputField.scrollTop;
      inputField.value = inputField.value.substring(0, startPos)+myValue+inputField.value.substring(endPos,inputField.value.length);
      inputField.focus();
      inputField.selectionStart = startPos + myValue.length;
      inputField.selectionEnd = startPos + myValue.length;
      inputField.scrollTop = scrollTop;
    } else {
      inputField.focus();
      inputField.value += myValue;
    }
  }

  function toUnicode(code) {
    var codes = code.split('-').map(function(value, index) {
        if (value != "") {
          return parseInt(value, 16);
        }
        else {
          return null;
        }
    });
    
    codes = codes.filter(function(v){
        return v != null;
    });
    
    return String.fromCodePoint.apply(null, codes);
  }
  


  function addToLocalStorage(emoji) {
    if(emoji==null) {
        return;
    }
  
    var recentlyUsedEmojis = [];
    if (localStorage.emojis) {
      recentlyUsedEmojis = JSON.parse(localStorage.emojis);
    }

    // If already in recently used, leave
    var index = recentlyUsedEmojis.indexOf(emoji);
    if (index > -1) {
      return;
    }
    recentlyUsedEmojis.push(emoji);

    if (recentlyUsedEmojis.length > defaults.recentCount) {
      recentlyUsedEmojis.shift();
    }

    localStorage.emojis = JSON.stringify(recentlyUsedEmojis);
  }

  function updateRecentlyUsed(emoji) {
    var recentlyUsedEmojis = JSON.parse(localStorage.emojis);
    var emojis = [];
    var recent = $('section.recent');

    for (var i = recentlyUsedEmojis.length-1; i >= 0; i--) {
      var emoji = findEmoji(recentlyUsedEmojis[i]);
      
      emojis.push('<em><span class="emoji emoji-' + recentlyUsedEmojis[i] + '" data-shortcode="' + recentlyUsedEmojis[i] + '">'+getHtmlEntities(emoji.unicode)+'</span></em>');
    }

    // Fix height as emojis are added
    var prevHeight = recent.outerHeight();
    $('section.recent .wrap').html(emojis.join(''));
    var currentScrollTop = $('.sections').scrollTop();
    var newHeight = recent.outerHeight();
    var newScrollToHeight = 0;

    if (!$('section.recent').is(':visible')) {
      recent.show();
      newScrollToHeight = newHeight;
    } else if (prevHeight != newHeight) {
      newScrollToHeight = newHeight - prevHeight;
    }

    $('.sections').animate({
      scrollTop: currentScrollTop + newScrollToHeight
    }, 0);
  }

  if (!String.fromCodePoint) {
    // ES6 Unicode Shims 0.1 , © 2012 Steven Levithan http://slevithan.com/ , MIT License
    String.fromCodePoint = function fromCodePoint () {
        var chars = [], point, offset, units, i;
        for (i = 0; i < arguments.length; ++i) {
            point = arguments[i];
            offset = point - 0x10000;
            units = point > 0xFFFF ? [0xD800 + (offset >> 10), 0xDC00 + (offset & 0x3FF)] : [point];
            chars.push(String.fromCharCode.apply(null, units));
        }
        return chars.join("");
    }
  }

})(jQuery);
