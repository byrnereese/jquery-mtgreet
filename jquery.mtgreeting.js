(function($){
    $.fn.onAuthEvent = function( fn ) {
      return this.each(function() {
          $(this).bind("onAuthEvent", fn);
	  $.fn.onAuthEvent.listeners.push( $(this) );
	  if ($.fn.onAuthEvent.happened) {
	    $(this).trigger("onUserUnauthed");
	  }
      });
    };
    $.fn.onAuthEvent.listeners = [];
    $.fn.onAuthEvent.fire = function() {
      //alert("firing onAuthEvent");
      $.fn.onAuthEvent.happened = true;
      for (var i in $.fn.onAuthEvent.listeners) {
	var lsnr = $.fn.onAuthEvent.listeners[i];
	lsnr.trigger('onAuthEvent');
      }
      //alert("needsauth = false");
      $.fn.movabletype.needsAuth = false;
    };

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
      //alert("firing onUserUnauthed");
      $.fn.onAuthEvent.happened = true;
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
      //alert("firing onUserAuthed");
      $.fn.onAuthEvent.happened = true;
      for (var i in $.fn.onUserAuthed.listeners) {
	var lsnr = $.fn.onUserAuthed.listeners[i];
	lsnr.trigger('onUserAuthed');
      }
    };

    $.fn.movabletype = function(options) {
      $.fn.movabletype.settings = $.extend( {}, $.fn.movabletype.defaults, options);
      var settings = $.fn.movabletype.settings;
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
          u.is_authenticated = false;
	  u.can_post = false;
	  u.is_author = false;
	  u.is_banned = false;
	  u.is_trusted = false;
	}
	return u;
      };
      var calledOnUserSignIn = false;
      $.fn.movabletype.getUser = function() {
	if (!$.fn.movabletype.user) {
	  var cookie = _getCookie();
	  if (cookie) {
            $.fn.movabletype.user = _unbakeCookie(cookie);
          }
	  if (!$.fn.movabletype.user) {
	    //alert('user is not logged in, construct anonymous user');
	    $.fn.movabletype.user = {};
	    $.fn.movabletype.user.is_anonymous = true;
	    $.fn.movabletype.user.is_authenticated = false;
	    $.fn.movabletype.user.can_post = false;
	    $.fn.movabletype.user.is_author = false;
	    $.fn.movabletype.user.is_banned = false;
	    $.fn.movabletype.user.is_trusted = false;
	  } else {
	    //alert('return user object');
	  }
	}
	return $.fn.movabletype.user;
      };
      $.fn.movabletype.fetchUser = function(cb) {
	//alert('fetching user');
	/* if no callback set, then set the default */
	if (!cb) { 
          cb = function(u) { 
            //alert("fetchUser was not given a callback. setting default cb.");
            return $.fn.movabletype.setUser(u); 
          } 
        }; 
	//	if ( cb.call() && $.fn.movabletype.getUser() ) {
	if ( $.fn.movabletype.getUser() && $.fn.movabletype.getUser().is_authenticated ) {
	  // user is logged into current domain...
	  //alert('User is logged into the current domain...' + dump($.fn.movabletype.getUser()));
	  var url = document.URL;
	  url = url.replace(/#.+$/, '');
	  url += '#comments-open';
	  location.href = url;
	  // TODO fire - on authevent
	  cb.call($.fn.movabletype.getUser());
	} else {
	  //alert('User does not appear to be logged in locally. Fetching user via jsonp...');
	  // we aren't using AJAX for this, since we may have to request
	  // from a different domain. JSONP to the rescue.
	  mtFetchedUser = true;
	  var url = settings.mtCGIPath + settings.mtCommentScriptURL + '?__mode=session_js&blog_id=' + settings.blogID + '&jsonp=?';
          //alert("Fetching user from: " + url);
	  // this is asynchronous, so it will return prior to the user being saved
	  $.getJSON(url,function(data) { 
	      //alert("Callback returned with this data: " + dump(data)); 
	      cb(data) 
          });
	}
      };
      $.fn.movabletype.setUser = function(u) {
	if (u) {
	  // persist this
	  //alert("setUser()...");
	  $.fn.movabletype.user = u;
	  $.fn.onUserAuthed.fire.call();
	  $.fn.onAuthEvent.fire.call();
	  _saveUser();
	}
	return $.fn.movabletype.user;
      };
      var _saveUser = function(f) {
	//alert('Saving user...');
	// We can't reliably store the user cookie during a preview.
	// TODO - should isPreview be in the MT content of greeting context?
	if (settings.isPreview) return;
	var u = $.fn.movabletype.getUser();
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
	//alert('initilizing $.fn.movabletype');
	this.user = $.fn.movabletype.getUser();
	if ($.meta){
	  settings = $.extend({}, settings, this.data());
	}

	$(document).ready( function() {
	    if (settings.blogID && settings.registrationRequired) {
	      /***
	       * If request contains a '#_login' or '#_logout' hash, use this to
	       * also delete the blog-side user cookie, since we're coming back from
	       * a login, logout or edit profile operation.
	       */
	      if ($.fn.movabletype.needsAuth) {
		// clear any logged in state
		$.fn.movabletype.clearUser();
		window.location.hash.match( /^#_log(in|out)/ );
		if (RegExp.$1 == 'in') {
		  $.fn.movabletype.fetchUser(function(u) { 
		      //alert("Calling fetchUser from #log(in|out) initialization.");
		      $.fn.movabletype.setUser(u); 
		      var url = document.URL;
		      url = url.replace(/#.+$/, '');
		      url += '#loggedin';
		      location.href = url;
		    });
		  // TODO - should I fire an auth event here?
		} else if (RegExp.$1 == "out") {
		  //alert("firing onUserUnauthed");
		  $.fn.onUserUnauthed.fire.call();
		  $.fn.onAuthEvent.fire.call();
		  var url = document.URL;
		  url = url.replace(/#.+$/, '');
		  url += '#loggedout';
		  location.href = url;
		}
	      } else {
		/***
		 * Uncondition this call to fetch the current user state (if available)
		 * from MT upon page load if no user cookie is already present.
		 * This is okay if you have a private install, such as an Intranet;
		 * not recommended for public web sites!
		 */
		if ( settings.isPreview && !$.fn.movabletype.user )
		  $.fn.movabletype.fetchUser(function(u) { return $.fn.movabletype.setUser(u); });
	      }
	    }
	});
	return this;
      };
      return this.initialize();
    };
    $.fn.movabletype.needsAuth = ( window.location.hash && window.location.hash.match( /^#_log(in|out)/ ) ) ? true : false;
    //    if ($.fn.movabletype.needsAuth) { alert("auth action is needed in order to proceed"); }

    /* begin greet function */
    $.fn.greet = function(options) {
	/*
	 * %p - profile link, e.g. edit profile
	 * %u - user name
	 * %i - login link
	 * %o - logout link
	 * %r - register link
	 */
	var defaults = {
	    /* Messages */
	    loggedInMessage: 'Welcome, %p! %o',
	    loggedOutMessage: '%i or %r',
	    noPermissionMessage: 'Welcome, %p! %o',
	    loginText: 'Sign In',
	    logoutText: 'Sign Out',
	    registerText: 'Sign Up',
	    editProfileText: '%u',

	    entryId: 0,
	    isPreview: false,
	    returnToURL: null, /* required */

	    /* Events and Callbacks */
	    onUserBanned:   function(e){ _onUserBanned(e); },
	    onSignInClick:  function(e){ _onSignInClick(e); },
	    onSignOutClick: function(e){ _onSignOutClick(e); },
	    onSignUpClick:  function(e){ _onSignUpClick(e); }
	};
	var self;
        var settings = $.extend( $.fn.movabletype.settings, defaults, options);
	return this.each(function() {
	    obj = $(this);
	    self = obj;
	    //alert("initializing greet for " + obj);
	    if ($.fn.movabletype.needsAuth) {
	      //alert("auth is needed!!! binding onAuthEvent to el");
	      $(this).onAuthEvent( function() { _insertText( obj ); } );
	    } else {
	      //alert("go ahead and get the text");
	      _insertText( obj );
	    }
	});	

	function _insertText(obj) {
	  var phrase = compileGreetingText();
	  obj.empty().append( jQuery("<div>" + phrase + "</div>") );
	  obj.children().children('a.button.login').click( function(e) { settings.onSignInClick.call(e); });
	  obj.children().children('a.button.logout').click( function(e) { settings.onSignOutClick.call(e); });
	  obj.children().children('a.button.register').click( function(e) { settings.onSignUpClick.call(e); });
	  //obj.append( node );
	};
	function _onUserBanned(e) {
	    //alert("User is banned.");
	};
	function _signIn() {
	    var url = settings.mtSignInURL;
	    if (settings.isPreview) {
		if ( settings.entryID ) {
		    url += '&entry_id=' + settings.entryID;
		} else {
		    url += '&return_url=' + settings.returnToURL;
		}
	    } else {
	      var doc_url = document.URL;
	      doc_url = doc_url.replace(/#.+/, '');
	      url += '&return_url=' + encodeURIComponent(doc_url);
	    }
	    $.fn.movabletype.clearUser();
	    location.href = url;
	};
	function _onSignOutClick(e) {
	    $.fn.movabletype.clearUser();
	    var doc_url = document.URL;
	    doc_url = doc_url.replace(/#.+/, '');
	    // TODO - error check: signouturl not set?
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
	    return false;
	};
	function _onSignUpClick(e) {
	    $.fn.movabletype.clearUser();
	    var doc_url = document.URL;
	    doc_url = doc_url.replace(/#.+/, '');
	    // TODO - error check: signupurl not set?
	    var url = settings.mtSignUpURL;
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
	    return false;
	};
	function _onSignInClick(e) {
	  var phrase = 'Signing in... <img src="'+settings.mtStaticURL+'images/indicator.white.gif" height="16" width="16" alt="" />';
	  self.html(phrase);
	  $.fn.movabletype.clearUser(); // clear any 'anonymous' user cookie to allow sign in
	  $.fn.movabletype.fetchUser(function(u) {
              //alert("Calling fetchUser from _onSignInClick");
	      //var u = $.fn.movabletype.getUser();
	      //alert("user object is: " + u);
	      if (u && u.is_authenticated) {
		//alert("User is authenticated. Setting user from onSignInClick callback...");
		$.fn.movabletype.setUser(u);
		_insertText(self);
	      } else {
		// user really isn't logged in; so let's do this!
		//alert("User is not logged in. Redirect to sign in page.");
		_signIn();
	      }
	  });
	  return false;
        };
	function compileGreetingText() {
	    var phrase;
	    var u = $.fn.movabletype.getUser();
	    var profile_link;
	    if ( u && u.is_authenticated ) {
	        //alert("compiling text: user is authed");
		if ( u.is_banned ) {
		    settings.onUserBanned();
		    phrase = settings.noPermissionText;
		    //'You do not have permission to comment on this blog. (<a href="javascript:void(0);" onclick="return mtSignOutOnClick();">sign out</a>)';
		} else {
		    if ( u.is_author ) {
		      if (settings.mode == "mtpro") {
			profile_link = '<a href="'+settings.mtCGIPath + settings.mtCommunityScriptURL+'?__mode=edit&blog_id=' + settings.blogID;
		      } else {
			profile_link = '<a href="'+settings.mtCGIPath + settings.mtCommentScriptURL+'?__mode=edit_profile&blog_id=' + settings.blogID;
		      }
			if (settings.entryId)
			    profile_link += '&entry_id=' + settings.entryId;
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
		// TODO - this obviously does that same thing. 
	        //alert("compiling text: user is anonymous");
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
	    return phrase;
	};
    };
    $.fn.movabletype.defaults = {
        /* Scripts and Cookies */
	mtCGIPath: '', /* required */
        mode: 'mtos',
	mtCommentScriptURL: 'mt-comments.cgi',
	mtCommunityScriptURL: 'mt-cp.cgi',
	mtStaticURL: '', /* required */
	mtCookieName: '', /* required */
	mtCookieDomain: "", /* required */
	mtCookiePath: "/",
	mtCookieTimeout: 14400,

	mtSignInURL: null, /* required */
	mtSignOutURL: null, /* required */
	mtSignUpURL: null, /* required */

	blogID: '', /* required */
	registrationRequired: false

	/*
	onUserAuthed: function(){},   // $.fn.movabletype.settings.onUserSignIn.call(this); }
	onUserUnauthed: function(){}  // $.fn.movabletype.settings.onUserSignIn.call(this); }
	*/
    };
})(jQuery);
