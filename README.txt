# Overview

This plugin provides a jQuery interface for published blogs
on the Movable Type Publishing Platform. 

This library is meant to service partly as a replacement for 
the bulk of the standard javascript file that is typically
found in every Movable Type template set or theme.

Currently this library is limited to:
* displaying a greeting to logged in or logged out users
* rendering login/logout/edit profile links

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

    $(document).ready(function() {
      $('#greeting').greet({
        blogID: 3,
        mtScriptURL: '<$mt:CGIPath$><$mt:CommentScript$>',
        mtStaticURL: '<$mt:StaticWebPath$>',
        mtScriptURL: '<$mt:CGIPath$><$mt:CommentScript$>',
        mtStaticURL: '<$mt:StaticWebPath$>',
        mtCookieName: '<$mt:UserSessionCookieName$>',
        mtCookieDomain: '<$mt:UserSessionCookieDomain$>',
        mtSignOutURL: '<$mt:SignOutLink$>',
        mtSignInURL: '<$mt:SignInLink$>',
        onUserSignIn: function() {
          $('#create-post').html('<a href="http://localhost/~breese/blogs/gotime/community#create">Create a post</a>');
        },
        registrationRequired: true
      });
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


