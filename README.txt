# Overview

This plugin provides a jQuery interface for published blogs
on the Movable Type Publishing Platform. 

This library is meant to service partly as a replacement for 
the bulk of the standard javascript file that is typically
found in every Movable Type template set or theme.

Currently this library is limited to:
* displaying a greeting to logged in or logged out users
* rendering login/logout/edit profile links

# Configuration Options

* mtCGIPath - The URL to the CGI directory. 
  e.g. "http://foo.com/cgi-bin/mt/")

* mode - Controls whether links for signing in, registering
  will be constructed using the open source version, or will
  link to the Movable Type Pro equivalents. Possible values
  are: "mtos" and "mtpro". (default: mtos)

* mtCommunityScriptURL - The name of the community script. This
  is only valid for Movable Type Pro users. (default: mt-cp.cgi)

* mtCommentScriptURL - The name of the comment script.
  (default: mt-comment.cgi)

* mtStaticURL - The URL to the Movable Type static web path.

* mtCookieName - The name of the cookie storing session data.

* mtCookieDomain - The domain of the cookie storing session 
  data.

* mtCookiePath - The path of the cookie storing session data.

* mtCookieTimeout - The length of time the cookie being set
  to store session data will last. Time is expressed in
  seconds. (default: 14400)

* mtSignInURL - The sign in URL for this blog.

* mtSignOutURL - The logout URL for this blog.

* mtSignUpURL - The register URL for this blog.

* blogID - The ID of the blog currently in context.

* registrationRequired - Whether registration is required for 
  the current blog or not. (default: false)

* loggedInMessage - The message to display in the target 
  element when the user is logged in. (default: 'Welcome, %p! %o')

* loggedOutMessage - The message to display in the target
  element when the user is NOT logged in. (default: '%i or %r')

* noPermissionMessage - The message to display in the target 
  element when the user does NOT have permission to leave a
  comment. (default: 'Welcome, %p! %o')

* loginText - The text to use in the login link. 
  (default: 'Sign In')

* logoutText - The text to use in the logout link. 
  (default: 'Sign Out')

* registerText - The text to use in the register link.
  (default: 'Sign Up')

* editProfileText - The text to use in the edit profile link.
  (default: '%u')

* entryId - The ID of the current entry in context. This is used
  when constructing return to URLs for commenting forms.
  (default: 0)

* isPreview - A boolean value indicating whether a user is
  currently previewing an entry or comment. (default: false)

* returnToURL - An optional return to URL that will override 
  typical defaults. This controls the page a user will return
  after logging in, out or registering.

# Usage

First you will need to add this library to the HTML <head>
of your website like so:

    <script type="text/javascript" src="jquery.mtgreeting.js"></script>

In the HTML of your page you would need an element to bind to:

    <div id="greeting"></div>

Then in another script block you can invoke the 'greet' 
function on any DOM element. This following code sample shows
the Movable Type template tags you would also need to use
in conjunction with this library so that the plugin can 
properly detect the current users sessions and logged in
status:

    $.fn.movabletype({
      blogID:         <mt:CNRootBlogID>,
      mode:           'mtpro',
      mtCGIPath:      '<$MTCGIPath$>',
      mtCommentScriptURL:   '<$mt:CommentScript$>',
      mtCommunityScriptURL: '<$mt:CommunityScript$>',
      mtStaticURL:    '<$mt:StaticWebPath$>',
      mtCookieName:   '<$mt:UserSessionCookieName$>',
      mtCookieDomain: '<$mt:UserSessionCookieDomain$>',
      mtSignOutURL:   '<$mt:SignOutLink$>',
      mtSignInURL:    '<$mt:SignInLink$>',
      mtSignUpURL:    '<$mt:CGIPath$><$mt:CommunityScript$>?__mode=register&blog_id=<mt:BlogID>',
      registrationRequired: <mt:IfRegistrationRequired>true<mt:else>false</mt:IfRegistrationRequired>
    });

    $(document).ready(function() {
      $('#greeting').greet();
    });

If the current user is logged out, then the greeting element
will say:

   Sign In or Sign Up

If the current user is logged out, then the greeting element
will say: 

   Welcome, USERNAME! Sign Out

## Customizing Messaging

To customize the messages that are rendered out to your greeting
element, the following options can be used when initializing the
greet function:

* loggedInMessage: 'Welcome, %p! %o'
* loggedOutMessage: '%i or %r'
* noPermissionMessage: 'Welcome, %p! %o'

The following are the tokens currently supported:

* %p - profile link, e.g. edit profile
* %u - user name
* %i - login link
* %o - logout link
* %r - register link

## Customizing Link Text

The messages above contain tokens that will be replaced with 
full links tags. To customize the labels for those links, these
options can be provided:

* loginText: 'Sign In'
* logoutText: 'Sign Out'
* registerText: 'Sign Up'
* editProfileText: '%u'

## Events and Callbacks

There are a number of events that this plugin will fire when specific 
conditions occur or are met. They are:

* onAuthedUser - fired when a user is determined to be authenticated

* onUnauthedUser - fired when a user is determined to be logged out

* onAuthEvent - fired whenever a user is determined to be logged in or
  logged out.
