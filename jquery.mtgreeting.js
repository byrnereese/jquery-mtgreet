(function($){
    $.fn.onUserUnauthed = function( fn ) {
      return this.each(function() {
          $(this).bind("onUserUnauthed", fn);
	  $.fn.onUserUnauthed.listeners.push( $(this) );
	  if ($.fn.movabletype.user && !$.fn.movabletype.user.is_authenticated) {
	    $(this).trigger("onUserUnauthed");
	  }
      });
    };
    $.fn.onUserUnauthed.listeners = [];
    $.fn.onUserUnauthed.fire = function() {
      for (var i in $.fn.onUserUnauthed.listeners) {
	var lsnr = $.fn.onUserUnauthed.listeners[i];
	lsnr.trigger('onUserUnauthed');
      }
    };

    $.fn.onUserAuthed = function( fn ) {
      return this.each(function() {
          $(this).bind("onUserAuthed", fn);
	  $.fn.onUserAuthed.listeners.push( $(this) );
	  if ($.fn.movabletype.user && $.fn.movabletype.user.is_authenticated) {
	    $(this).trigger("onUserAuthed");
	  }
      });
    };
    $.fn.onUserAuthed.listeners = [];
    $.fn.onUserAuthed.fire = function() {
      for (var i in $.fn.onUserAuthed.listeners) {
	var lsnr = $.fn.onUserAuthed.listeners[i];
	lsnr.trigger('onUserAuthed');
      }
    };
    $.fn.movabletype = function(options) {
      var settings = $.extend( {}, $.fn.movabletype.defaults, options);

      var _escapeJS = function(s) { return s.replace(/\'/g, "&apos;"); }
      var _unescapeJS = function(s) {	return s.replace(/&apos;/g, "'"); }
      var _getCookie = function() {
	var prefix = settings.mtCookieName + '=';
	var c = document.cookie;
	var cookieStartIndex = c.indexOf(prefix);
	if (cookieStartIndex == -1)
	  return '';
	var cookieEndIndex = c.indexOf(";", cookieStartIndex + prefix.length);
	if (cookieEndIndex == -1)
	  cookieEndIndex = c.length;
	var cookiestr = unescape(c.substring(cookieStartIndex + prefix.length, cookieEndIndex));
	return cookiestr;
      };
      var _unbakeCookie = function(s) {
	if (!s) return;
	var u = {};
	var m;
	while (m = s.match(/^((name|url|email|is_authenticated|profile|userpic|sid|is_trusted|is_author|is_banned|can_post|can_comment):'([^\']+?)';?)/)) {
                s = s.substring(m[1].length);
		if (m[2].match(/^(is|can)_/)) // boolean fields
		  u[m[2]] = m[3] == '1' ? true : false;
		else
		  u[m[2]] = _unescapeJS(m[3]);
	}
	if (u.is_authenticated) {
	  u.is_anonymous = false;
	} else {
	  u.is_anonymous = true;
	  u.can_post = false;
	  u.is_author = false;
	  u.is_banned = false;
	  u.is_trusted = false;
	}
	return u;
      };
      var calledOnUserSignIn = false;
      var _getUser = function() {
	if (!$.fn.movabletype.user) {
	  var cookie = _getCookie();
	  if (!cookie) {
	    //alert("no cookie!");
	  } else {
            $.fn.movabletype.user = _unbakeCookie(cookie);
          }
	  if (!$.fn.movabletype.user) {
	    //alert('user is anonymous');
	    $.fn.movabletype.user = {};
	    $.fn.movabletype.user.is_anonymous = true;
	    $.fn.movabletype.user.can_post = false;
	    $.fn.movabletype.user.is_author = false;
	    $.fn.movabletype.user.is_banned = false;
	    $.fn.movabletype.user.is_trusted = false;
	  } else {
	    /*
	    alert('user is authenticated');
	    if (!calledOnUserSignIn)
	      settings.onUserSignIn();
	    */
	  }
	}
	return $.fn.movabletype.user;
      };
      $.fn.movabletype.fetchUser = function(cb) {
	if ( !cb && _getUser() ) {
	  var url = document.URL;
	  url = url.replace(/#.+$/, '');
	  url += '#comments-open';
	  location.href = url;
	} else {
	  // we aren't using AJAX for this, since we may have to request
	  // from a different domain. JSONP to the rescue.
	  mtFetchedUser = true;
	  var url = settings.mtScriptURL + '?__mode=session_js&blog_id=' + settings.blogID+'&jsonp=?';
	  $.getJSON(url,function(data) { cb(data) } );
	}	
      };
      $.fn.movabletype.setUser = function(u) {
	if (u) {
	  // persist this
	  $.fn.movabletype.user = u;
	  _saveUser();
	  // fire callback/event
	  //$.fn.movabletype.settings.onUserSignIn();
	  // sync up user greeting
	  //_insertText(self);
	}
      };
      var _saveUser = function(f) {
	//alert('Saving user...');
	// We can't reliably store the user cookie during a preview.
	// TODO - should isPreview be in the MT content of greeting context?
	if (settings.isPreview) return;
	var u = _getUser();
	if (f && (!u || u.is_anonymous)) {
	  if ( !u ) {
	    u = {};
	    u.is_authenticated = false;
	    u.can_comment = true;
	    u.is_author = false;
	    u.is_banned = false;
	    u.is_anonymous = true;
	    u.is_trusted = false;
	  }
	  if (f.author != undefined) u.name = f.author.value;
	  if (f.email != undefined) u.email = f.email.value;
	  if (f.url != undefined) u.url = f.url.value;
	}
	if (!u) return;
	
	var cache_period = settings.mtCookieTimeout * 1000;
	// cache anonymous user info for a long period if the
	// user has requested to be remembered
	if (u.is_anonymous && f && f.bakecookie && f.bakecookie.checked)
	  cache_period = 365 * 24 * 60 * 60 * 1000;
	
	var now = new Date();
	_fixDate(now);
	now.setTime(now.getTime() + cache_period);
	
	var cmtcookie = _bakeUserCookie(u);
	_setCookie(cmtcookie,now);
      };
      var _fixDate = function(date) {
	var skew = (new Date(0)).getTime();
	if (skew > 0) date.setTime(date.getTime() - skew);
      };
      var _bakeUserCookie = function(u) {
	var str = "";
	if (u.name) str += "name:'" + _escapeJS(u.name) + "';";
	if (u.url) str += "url:'" + _escapeJS(u.url) + "';";
	if (u.email) str += "email:'" + _escapeJS(u.email) + "';";
	if (u.is_authenticated) str += "is_authenticated:'1';";
	if (u.profile) str += "profile:'" + _escapeJS(u.profile) + "';";
	if (u.userpic) str += "userpic:'" + _escapeJS(u.userpic) + "';";
	if (u.sid) str += "sid:'" + _escapeJS(u.sid) + "';";
	str += "is_trusted:'" + (u.is_trusted ? "1" : "0") + "';";
	str += "is_author:'" + (u.is_author ? "1" : "0") + "';";
	str += "is_banned:'" + (u.is_banned ? "1" : "0") + "';";
	str += "can_post:'" + (u.can_post ? "1" : "0") + "';";
	str += "can_comment:'" + (u.can_comment ? "1" : "0") + "';";
	str = str.replace(/;$/, '');
	return str;
      };
      var _setCookie = function(value,expires) {
	var secure = location.protocol == 'https:';
	if (settings.mtCookieDomain && settings.mtCookieDomain.match(/^\.?localhost$/))
	  settings.mtCookieDomain = null;
	var curCookie = settings.mtCookieName + "=" + escape(value) +
	  (expires ? "; expires=" + expires.toGMTString() : "") +
	  (settings.mtCookiePath ? "; path=" + settings.mtCookiePath : "") +
	  (settings.mtCookieDomain ? "; domain=" + settings.mtCookieDomain : "") +
	  (secure ? "; secure" : "");
	//alert("setting cookie to: " + curCookie);
	document.cookie = curCookie;
      };
      var _deleteCookie = function() {
	var secure = location.protocol == 'https:';
	if (_getCookie()) {
	  if (settings.mtCookieDomain && settings.mtCookieDomain.match(/^\.?localhost$/))
	    settings.mtCookieDomain = null;
	  var curCookie = settings.mtCookieName + "=" +
	    (settings.mtCookiePath ? "; path=" + settings.mtCookiePath : "") +
	    (settings.mtCookieDomain ? "; domain=" + settings.mtCookieDomain : "") +
	    (secure ? "; secure" : "") +
	    "; expires=Thu, 01-Jan-70 00:00:01 GMT";
	  //alert('Expiring Cookie: ' + curCookie);
	  document.cookie = curCookie;
	}	
      };
      $.fn.movabletype.clearUser = function() {
	this.user = null;
	_deleteCookie();
      };
      this.initialize = function() {
	this.user = _getUser();
	if ($.meta){
	  settings = $.extend({}, settings, this.data());
	}
	if (this.user.is_authenticated) {
	  $.fn.onUserAuthed.fire.call();
	} else {
	  $.fn.onUserUnauthed.fire.call();
	}
	return this;
      };
      return this.initialize();
    };

    /* begin greet function */
    $.fn.greet = function(options) {
	/*
	 * %p - profile link, e.g. edit profile
	 * %u - user name
	 * %i - login link
	 * %o - logout link
	 * %r - register link
	 */
      var settings = $.extend( {}, $.fn.movabletype.defaults, options);
        var user;
	var self;
	return this.each(function() {
		obj = $(this);
		self = obj;
		_insertText(obj);
        });

	function _insertText(obj) {
	  var phrase = compileGreetingText();
	  obj.html(phrase);
	  obj.children('a.button.login').click( function(e) { _onSignInClick(e) } );
	  obj.children('a.button.logout').click( function(e) { _onSignOutClick(e) } );
	  // TODO registration link
	};
	function _onUserBanned(e) {
	    //alert("User is banned.");
	};
	function _onUserSignIn() {
	    //no-op
	    //alert("native: signed in");
	};
	function _signIn() {
	    var doc_url = document.URL;
	    doc_url = doc_url.replace(/#.+/, '');
	    var url = settings.mtSignInURL;
	    if (settings.isPreview) {
		if ( settings.entryID ) {
		    url += '&entry_id=' + settings.entryID;
		} else {
		    url += '&return_url=' + settings.returnToURL;
		}
	    } else {
		url += '&return_url=' + encodeURIComponent(doc_url);
	    }
	    mtClearUser();
	    settings.onUserSignIn();
	    location.href = url;
	};
	function _signOut() {
	    $.fn.movabletype.clearUser();
	    var doc_url = document.URL;
	    doc_url = doc_url.replace(/#.+/, '');
	    var url = settings.mtSignOutURL;
	    if (is_preview) {
		if ( settings.entryID ) {
		    url += '&entry_id=' + settings.entryID;
		} else {
		    url += '&return_url=' + settings.returnToURL;
		}
	    } else {
		url += '&return_url=' + encodeURIComponent(doc_url);
	    }
	    location.href = url;
	};
	function _onSignOutClick(e) {
	    _signOut();
	    return false;
	};
	function _onSignInClick(e) {
	  var phrase = 'Signing in... <img src="'+settings.mtStaticURL+'images/indicator.white.gif" height="16" width="16" alt="" />';
	  self.html(phrase);
	  $.fn.movabletype.clearUser(); // clear any 'anonymous' user cookie to allow sign in
	  $.fn.movabletype.fetchUser(function(u) {
	      if (u && u.is_authenticated) {
		//alert("setting user");
		$.fn.movabletype.setUser(u);
		$.fn.onUserAuthed.fire.call();
		_insertText(self);
	      } else {
		// user really isn't logged in; so let's do this!
		//alert("call signin");
		_signIn();
	      }
	    });
	  return false;
        };
	function compileGreetingText() {
	    var phrase;
	    var u = $.fn.movabletype.user;
	    var profile_link;
	    if ( u && u.is_authenticated ) {
		//alert("compiling text: user is authed");
		if ( u.is_banned ) {
		    settings.onUserBanned();
		    phrase = settings.noPermissionText;
		    //'You do not have permission to comment on this blog. (<a href="javascript:void(0);" onclick="return mtSignOutOnClick();">sign out</a>)';
		} else {
		    if ( u.is_author ) {
			profile_link = '<a href="'+settings.mtScriptURL+'?__mode=edit_profile&blog_id=3';
			if (settings.mtEntryId)
			    profile_link += '&entry_id=' + settings.mtEntryId;
			profile_link += '">' + settings.editProfileText + '</a>';
		    } else {
			// registered user, but not a user with posting rights
			if (u.url)
			    profile_link = '<a href="' + u.url + '">' + u.name + '</a>';
			else
			    profile_link = u.name;
		    }
		    phrase = settings.loggedInMessage;
		}
	    } else {
	      //alert('user is logged out');
		if (settings.registrationRequired) {
		    phrase = settings.loggedOutMessage;
		} else {
		    phrase = settings.loggedOutMessage;
		}
	    }
	    var login_link    = '<a class="login button" href="javascript:void(0)">' + settings.loginText + '</a>';
	    var logout_link   = '<a class="logout button" href="javascript:void(0)">' + settings.logoutText + '</a>';
	    var register_link = '<a class="register button" href="javascript:void(0)">' + settings.registerText + '</a>';
	    phrase = phrase.replace(/\%p/,profile_link);
	    phrase = phrase.replace(/\%i/,login_link);
	    phrase = phrase.replace(/\%o/,logout_link);
	    phrase = phrase.replace(/\%r/,register_link);
	    if ( u && u.is_authenticated ) {
		phrase = phrase.replace(/\%u/,u.name);
	    }
	    //alert('phrase: ' + phrase);
	    return phrase;
	};
    };
    $.fn.movabletype.defaults = {
        /* Messages */
        loggedInMessage: 'Welcome, %p! %o',
	loggedOutMessage: '%i or %r',
	noPermissionMessage: 'Welcome, %p! %o',
	loginText: 'Sign In',
	logoutText: 'Sign Out',
	registerText: 'Sign Up',
	editProfileText: '%u',

        /* Scripts and Cookies */
	mtScriptURL: '', /* required */
	mtStaticURL: '', /* required */
	mtCookieName: '', /* required */
	mtCookieDomain: "", /* required */
	mtCookiePath: "/",
	mtCookieTimeout: 14400,

	blogID: '', /* required */
	mtEntryId: 0,
	isPreview: false,
	registrationRequired: false,
	returnToURL: null, /* required */
	mtSignOutURL: null, /* required */

        /* Events and Callbacks */
	onUserBanned: function(){},   // $.fn.movabletype.settings.onUserBanned.call(this); },
	onSignInClick: function(){},  // settings.onSignInClick(this); },
	onSignOutClick: function(){}, // $.fn.movabletype.settings.onSignOutClick.call(this); },
	onUserSignIn: function(){}   // $.fn.movabletype.settings.onUserSignIn.call(this); }
	/*
	onUserAuthed: function(){},   // $.fn.movabletype.settings.onUserSignIn.call(this); }
	onUserUnauthed: function(){}  // $.fn.movabletype.settings.onUserSignIn.call(this); }
	*/
    };
})(jQuery);
