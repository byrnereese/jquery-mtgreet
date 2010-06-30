# Overview

This plugin provides a jQuery interface for published blogs on the 
Movable Type Publishing Platform. The interface is responsible for 
rendering sign in/out/up links on a page based upon the state of a 
user's session. It exposes event handlers for authentication 
events so that developers can bind to the DOM handers that respond 
to a user logging in or out.

This library is meant to service partly as a replacement for the 
bulk of the standard javascript file that is typically found in 
every Movable Type template set or theme.

Currently this library is limited to:

* displaying a greeting to logged in or logged out users
* rendering login/logout/edit profile links

# Getting Started

Before you begin, make sure you have a copy of jQuery 1.3 or 
greater installed on your system/website. You will need to include 
this in your web page or Movable Type templates:

   <script type="text/javascript" src="jquery-1.3.1.js"></script>

## Install Javascript Index Template

Found in this package is a file containing template code that is
meant to be published as an index template for any blog that 
utilizes this jQuery library. You can find this template code in 
the file called: `javascript_mt.mtml`.

1. Navigate to your blog's Design > Templates area.

2. Click "Create index template."

3. Cut and paste the contents of `javascript_mt.mtml` into the 
   newly created template.

4. Set the output file name to `mt.js`.

5. Click "Save and Publish."

## Add Your Script Tags

Once your `mt.js` file has been published you have all that you need
to get started. The next step is to add the javascript libraries to
your web site. Add this code to the header of your web site.

    <script type="text/javascript" src="mt.js"></script>
    <script type="text/javascript" src="jquery.mtauth.js"></script>
    <script type="text/javascript" src="jquery.mtgreeting.js"></script>

Note: you may need to adjust the paths to each of the scripts above
depending upon where they are located on your web server.

## Edit Your Web Page

Now let's look at some actual HTML and javascript that you can use on 
your web site and blog:

    <html>
      <head>
        <script type="text/javascript" src="mt.js"></script>
        <script type="text/javascript" src="jquery.js"></script>
        <script type="text/javascript" src="jquery.mtauth.js"></script>
        <script type="text/javascript" src="jquery.mtgreeting.js"></script>
        <script type="text/javascript">
        $(document).ready(function() {
          $('#greeting').greet();
        });
        </script>
      </head>
      <body>
        <div id="greeting"></div>
      </body>
    </html>

# Usage

## Configuration Options

* `mode` - Controls whether links for signing in, registering
  will be constructed using the open source version, or will
  link to the Movable Type Pro equivalents. Possible values
  are: "mtos" and "mtpro". (default: mtos)

* `loggedInMessage` - The message to display in the target 
  element when the user is logged in. (default: 'Welcome, %p! %o')

* `loggedOutMessage` - The message to display in the target
  element when the user is NOT logged in. (default: '%i or %r')

* `noPermissionMessage` - The message to display in the target 
  element when the user does NOT have permission to leave a
  comment. (default: 'Welcome, %p! %o')

* `indicator` - A reference to a 16x16 indicator/spinner graphic

* `loginText` - The text to use in the login link. 
  (default: 'Sign In')

* `logoutText` - The text to use in the logout link. 
  (default: 'Sign Out')

* `registerText` - The text to use in the register link.
  (default: 'Sign Up')

* `editProfileText` - The text to use in the edit profile link.
  (default: '%u')

* `ajaxLogin` - A boolean value indicating whether the framework
  should first attempt to log the user into the CMS via an AJAX
  call. Set to false if you want to forcibly send users to the
  login screen, which can be useful if a page refresh is required
  upon successfully signing in. (default: true)

* `isPreview` - A boolean value indicating whether a user is
  currently previewing an entry or comment. (default: false)

* `returnToURL` - An optional return to URL that will override 
  typical defaults. This controls the page a user will return
  after logging in, out or registering.

The following settings are set via the mt.js file (inside the
index template you published previously).

* `mt.entry.id` - The ID of the current entry in context. This is used
  when constructing return to URLs for commenting forms.
  (default: 0)

* `mt.blog.community.script` - The name of the community script. This
  is only valid for Movable Type Pro users. (default: mt-cp.cgi)

* `mt.blog.comments.script` - The name of the comment script.
  (default: mt-comment.cgi)

* `mt.links.signIn` - The sign in URL for this blog.

* `mt.links.signOut` - The logout URL for this blog.

* `mt.links.signUp` - The register URL for this blog.

* `mt.links.editProfile` - The URL for editing the current user's profile.

* `mt.blog.id` - The ID of the blog currently in context.

* `mt.blog.registration.required` - Whether registration is required for 
  the current blog or not. (default: false)

* `mt.blog.staticWebPath` - The URL to the Movable Type static web path.

* `mt.cookie.name` - The name of the cookie storing session data.

* `mt.cookie.domain` - The domain of the cookie storing session 
  data.

* `mt.cookie.path` - The path of the cookie storing session data.

* `mt.cookie.timeout` - The length of time the cookie being set
  to store session data will last. Time is expressed in
  seconds. (default: 14400)

## Customizing Messaging

To customize the messages that are rendered out to your greeting
element, the following options can be used when initializing the
greet function:

* loggedInMessage: 'Welcome, %p! %o'
* loggedOutMessage: '%i or %r'
* noPermissionMessage: 'Welcome, %p! %o'

The following are the tokens currently supported:

* %p - profile link, e.g. edit profile
* %u - user's display name
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

**Example**

    $('#greeting').greet({
      editProfileText: 'edit profile',
      logoutText: 'logout',
      loggedInMessage: 'Hello, %u. (%p | %o)',
      loggedOutMessage: '%i or %r'
    });

## Events and Callbacks

There are a number of events that this plugin will fire when specific 
conditions occur or are met. They are:

* onauthchange - fired when a user is determined to be logged in or out.
  Receives as input a reference to the MT User object containing the 
  user's info.

User object contains these elements:

* `is_anonymous` - true if the user is NOT logged in
* `is_authenticated` - true if the user is logged in
* `can_post` - true if the user has permission to post entries on the
  current blog.
* `is_author` - true if the user has the role of "Author" on the 
  current blog.
* `is_banned` - true if the user has been banned from making comments
  or entries on the current blog.
* `is_trusted` - true if the user has been granted the status of 
  "trusted" on the current blog.
* `userpic` - the URL to the user's userpic.
* `name` - the user's display name.

**Example**

    $('#userpic').onauthchange( function( e, u ) {
      if (u.is_authenticted) {
        $(this).html('<img src="'+u.userpic+'" />');
      } else {
        $(this).html('Not logged in');
      }
    });

# License and Copyright

Copyright 2009, Byrne Reese. All rights reserved.

This plugin is licensed under the same terms as jQuery itself. 
