/* JavaScript Boilerplate configuration file *
 * @version 1.2
 * GIT URL - https://github.com/mdarif/JavaScript-Boilerplate
 * Author - Mohammed Arif
 */

 /* Why do we need config?
  * All URLs needed by the JavaScript
  * Any strings that are displayed to the user
  * Any HTML that needs to be created from JavaScript
  * Settings (i.e., items per page)
  * Repeated unique values
  * Any value that may change in the future
  */

(function (app, $, undefined) {

	app.config = {
		language: 'english',
        debug: true,
		urls : {
			"404" : "404.html",
			"500" : "500.html",
			homepage : 'index.html'
		},
		theme: {
			skin: 'a',
			toolbars: {
				index: 'ui-navigation-toolbar',
				pages: 'ui-custom-toolbar'
			},
			messages: {
				loading : "Loading...",
				ajaxRequestFail : "Server not responding. Please try again or try after sometime.",
				serviceErrorHTML: "<p class='errorText'>Something went wrong</p>"
			},
		},
		siteBlocks: {
			mainContent: $('.l-site__main'),
			sideBar: $('.l-site__sidebar')
		}
	};
}(window.app = window.app || {}, jQuery));