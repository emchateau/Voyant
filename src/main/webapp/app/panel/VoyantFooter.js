Ext.define('Voyant.panel.VoyantFooter', {
	extend: 'Ext.container.Container',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.voyantfooter',
    statics: {
    	i18n: {
       		voyantLink: {en: '<a href="http://docs.voyant-tools.org/" target="_blank">Voyant Tools</a>'},
       		privacy: {en: 'Privacy'},
       		privacyMsg: {en: "The developers of Voyant Tools gather data from the site about what tools are invoked and with what parameters (IP addresses are also logged in order to be able to identify multiple requests during a same session). In addition, Voyant Tools uses Google Analytics (see &lt;a href=\"http://www.google.ca/intl/en/policies/privacy/\" target=\"_blank\"&gt;Google&apostrophe;s Privacy Policy&lt;/a&gt; and the &lt;em&gt;Log Information&lt;/em&gt; section in particular). Locally logged data and Google Analytics data will be used by the development team in order to debug and improve the tools, as well as to understand how researchers are using them. This data may also be used for research purposes in anonymous and aggregate forms. Please note that texts submitted to Voyant Tools are stored in order to allow persistent access during a work session and between work sessions. If you have questions about the data being collected and how it is being used, or to request that a corpus be removed, please contact &lt;a href=\"http://stefansinclair.name/contact/\"&gt;Stéfan Sinclair&lt;/a&gt;."}
    	}
    },
	height: 18,
	cls: 'x-tab-bar-default voyant-footer',
	listeners: {
		boxready: function(container, width, height) {
			var parts = [
				container.localize('voyantLink'),
				", <a href='http://stefansinclair.name/'>St&eacute;fan Sinclair</a> &amp; <a href='http://geoffreyrockwell.com'>Geoffrey Rockwell</a>",
				" (&copy;"+ new Date().getFullYear() +")",
				" <a href='http://docs.voyant-tools.org/privacy/' target='top' data-qtip='"+container.localize('privacyMsg')+"'>"+container.localize('privacy')+"</a>",
				" v. "+Voyant.application.getVersion() + " ("+Voyant.application.getBuild()+")"
			];
			var footer = '';
			var footerWidth = 0;
			var partWidth;
			var el = container.getEl();
			for (var i=0;i<parts.length;i++) {
				partWidth = el.getTextWidth(parts[i].replace(/<.+?>/g, ""));
				if (footerWidth+partWidth < width) {
					footer += parts[i];
					footerWidth += partWidth;
				}
			}
			container.update(footer);
		}
	}
});