/*!
 * jQuery Plugin for Movable Type @VERSION
 *
 * Copyright (c) 2009 Byrne Reese
 * Copyright (c) 2008 Six Apart, Ltd.
 * Licensed under the GPL license.
 * 
 * http://github.com/byrnereese/jquery-mtgreet/tree/master
 */
(function($){
    $.fn.greet = function(options) {
        // The following tokens can be used in your messages
	//   strings and will be substituted accordingly:
	// %p - profile link, e.g. edit profile
	// %u - user name
	// %i - login link
	// %o - logout link
	// %r - register link
	var defaults = {
            loggedInMessage: 'Welcome, %p! %o',
            loggedOutMessage: '%i or %r',
            noPermissionMessage: 'Welcome, %p! %o',
	    loginText: 'Sign In',
	    logoutText: 'Sign Out',
	    registerText: 'Sign Up',
	    editProfileText: '%u',
	    blogID: '', // required
	    mtScriptURL: '', // required
	    mtStaticURL: '', // required
	    mtCookieName: '', // required
	    mtCookieDomain: "", // required
	    mtCookiePath: "/",
	    mtCookieTimeout: 14400,
	    mtEntryId: 0,
	    isPreview: false,
	    returnToURL: null, // required
	    mtSignOutURL: null, // required 
	    onUserBanned: function(){ _onUserBanned(this); },
	    onSignInClick: function(){ _onSignInClick(this); },
	    onSignOutClick: function(){ _onSignOutClick(this); },
	    onUserSignIn: function(){ _onUserSignIn(); },
            registrationRequired: false
	};
	var options = $.extend(defaults, options);
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
	    obj.children('a.button.login').click( function(e) { options.onSignInClick(e); } );
	    obj.children('a.button.logout').click( function(e) { options.onSignOutClick(e); } );
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
	    var url = options.mtSignInURL;
	    if (options.isPreview) {
		if ( options.entryID ) {
		    url += '&entry_id=' + options.entryID;
		} else {
		    url += '&return_url=' + options.returnToURL;
		}
	    } else {
		url += '&return_url=' + encodeURIComponent(doc_url);
	    }
	    mtClearUser();
	    options.onUserSignIn();
	    location.href = url;
	};
	function _signOut() {
	    _clearUser();
	    var doc_url = document.URL;
	    doc_url = doc_url.replace(/#.+/, '');
	    var url = options.mtSignOutURL;
	    if (is_preview) {
		if ( options.entryID ) {
		    url += '&entry_id=' + options.entryID;
		} else {
		    url += '&return_url=' + options.returnToURL;
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
	    var phrase = 'Signing in... <img src="'+options.mtStaticURL+'images/indicator.white.gif" height="16" width="16" alt="" />';
	    self.html(phrase);
	    
	    _clearUser(); // clear any 'anonymous' user cookie to allow sign in
	    _fetchUser(function(u) {
		    if (u && u.is_authenticated) {
			//alert("setting user");
			_setUser(u);
		    } else {
			// user really isn't logged in; so let's do this!
			_signIn();
		    }
	    });
	    return false;
        };
	function compileGreetingText() {
	    var phrase;
	    var u = _getUser();
	    var profile_link;
	    if ( u && u.is_authenticated ) {
		//alert("compiling text: user is authed");
		if ( u.is_banned ) {
		    options.onUserBanned();
		    phrase = options.noPermissionText;
		    //'You do not have permission to comment on this blog. (<a href="javascript:void(0);" onclick="return mtSignOutOnClick();">sign out</a>)';
		} else {
		    if ( u.is_author ) {
			profile_link = '<a href="'+options.mtScriptURL+'?__mode=edit_profile&blog_id=3';
			if (options.mtEntryId)
			    profile_link += '&entry_id=' + options.mtEntryId;
			profile_link += '">' + options.editProfileText + '</a>';
		    } else {
			// registered user, but not a user with posting rights
			if (u.url)
			    profile_link = '<a href="' + u.url + '">' + u.name + '</a>';
			else
			    profile_link = u.name;
		    }
		    phrase = options.loggedInMessage;
		}
	    } else {
		//alert('user is logged out');
		if (options.registrationRequired) {
		    phrase = options.loggedOutMessage;
		} else {
		    phrase = options.loggedOutMessage;
		}
	    }
	    var login_link    = '<a class="login button" href="javascript:void(0)">' + options.loginText + '</a>';
	    var logout_link   = '<a class="logout button" href="javascript:void(0)">' + options.logoutText + '</a>';
	    var register_link = '<a class="register button" href="javascript:void(0)">' + options.registerText + '</a>';
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
	function _fetchUser(cb) {
	    if ( !cb && _getUser() ) {
		var url = document.URL;
		url = url.replace(/#.+$/, '');
		url += '#comments-open';
		location.href = url;
	    } else {
		// we aren't using AJAX for this, since we may have to request
		// from a different domain. JSONP to the rescue.
		mtFetchedUser = true;
		$.getJSON(options.mtScriptURL + '?__mode=session_js&blog_id='+options.blogID+'&jsonp=?',
			  function(data) { cb(data) } );
	    }	
	};
	function _setUser(u) {
	    if (u) {
		// persist this
		user = u;
		_saveUser();
		// fire callback/event
		options.onUserSignIn();
		// sync up user greeting
		_insertText(self);
	    }
	};
	function _saveUser(f) {
	    //alert('Saving user...');
	    // We can't reliably store the user cookie during a preview.
	    if (options.isPreview) return;
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
	    
	    var cache_period = options.mtCookieTimeout * 1000;
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
	function _fixDate(date) {
	    var skew = (new Date(0)).getTime();
	    if (skew > 0)
		date.setTime(date.getTime() - skew);
	};
	function _bakeUserCookie(u) {
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
	function _clearUser() {
	    user = null;
	    _deleteCookie();
	};
	function _setCookie(value,expires) {
	    var secure = location.protocol == 'https:';
	    if (options.mtCookieDomain && options.mtCookieDomain.match(/^\.?localhost$/))
		options.mtCookieDomain = null;
	    var curCookie = options.mtCookieName + "=" + escape(value) +
		(expires ? "; expires=" + expires.toGMTString() : "") +
		(options.mtCookiePath ? "; path=" + options.mtCookiePath : "") +
		(options.mtCookieDomain ? "; domain=" + options.mtCookieDomain : "") +
		(secure ? "; secure" : "");
	    //alert("setting cookie to: " + curCookie);
	    document.cookie = curCookie;
	};
	function _deleteCookie() {
	    var secure = location.protocol == 'https:';
	    if (_getCookie()) {
		if (options.mtCookieDomain && options.mtCookieDomain.match(/^\.?localhost$/))
		    options.mtCookieDomain = null;
		var curCookie = options.mtCookieName + "=" +
		    (options.mtCookiePath ? "; path=" + options.mtCookiePath : "") +
		    (options.mtCookieDomain ? "; domain=" + options.mtCookieDomain : "") +
		    (secure ? "; secure" : "") +
		    "; expires=Thu, 01-Jan-70 00:00:01 GMT";
		//alert('Expiring Cookie: ' + curCookie);
		document.cookie = curCookie;
	    }	
	};
	function _escapeJS(s) {
	    return s.replace(/\'/g, "&apos;");
	}
	function _unescapeJS(s) {
	    return s.replace(/&apos;/g, "'");
	}
	function _getCookie() {
	    var prefix = options.mtCookieName + '=';
	    var c = document.cookie;
	    var cookieStartIndex = c.indexOf(prefix);
	    if (cookieStartIndex == -1)
		return '';
	    var cookieEndIndex = c.indexOf(";", cookieStartIndex + prefix.length);
	    if (cookieEndIndex == -1)
		cookieEndIndex = c.length;
	    var cookiestr = unescape(c.substring(cookieStartIndex + prefix.length, cookieEndIndex));
	    //alert('cookiestr: ' + cookiestr);
	    return cookiestr;
        };
        function _unbakeCookie(s) {
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
        function _getUser() {
	    if (!user) {
		var cookie = _getCookie();
		if (!cookie) {
		    //alert("no cookie!");
		    return;
		}
		user = _unbakeCookie(cookie);
		if (!user) {
		    //alert('user is anonymous');
		    user = {};
		    user.is_anonymous = true;
		    user.can_post = false;
		    user.is_author = false;
		    user.is_banned = false;
		    user.is_trusted = false;
		} else {
		    //alert('user is authenticated');
		    if (!calledOnUserSignIn)
			options.onUserSignIn();
		}
	    }
	    return user;
        };
    };
})(jQuery);
