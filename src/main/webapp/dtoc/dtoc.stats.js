Ext.define('Voyant.panel.DToC.Stats', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.dtocStats',
    statics: {
    	i18n: {
    		title: {en: "Stats"},
    		helpTip: {en: "<p>Corpus Terms is a table view of terms that appear in the entire corpus. Features include:</p><ul><li>reordering by <i>term</i> and <i>count</i> (click on the column headers)</li><li>a sparkline graph of the term frequency trends across the corpus (if the corpus has multiple documents) or across the document (if the corpus has only one document)</li><li>additional columns available (relative frequency, distribution peakedness and skew) by clicking on the arrow that appears when hovering over a header</li><li>a search box for queries (hover over the magnifying icon for help with the syntax)</li></ul>"},
    		matchingTerms: {en: 'Matching terms: {count}'},
    		termTip: {en: "The term in the corpus."},
    		rawFreqTip: {en: "The total count (raw frequency) of this term in the entire corpus."},
    		relativeFreqTip: {en: "The relative frequency (per million) of this term in the entire corpus"/*, also expressed as a percentage*/+"."},
    		relativePeakedness: {en: "Peakedness"},
    		relativePeakednessTip: {en: "This is a statistical measure of how much the relative frequencies of a term in a corpus are bunched up into peaks (regions with higher values where the rest are lower)."},
    		relativeSkewness: {en: "Skew"},
    		relativeSkewnessTip: {en: "This is a statistical measure of the symmetry of the relative frequencies of a term across the corpus."},
    		trendTip: {en: "This represents the trend of the relative frequencies for each term in each document in the corpus."}
    	},
    	api: {
    		stopList: 'auto',
    		query: undefined
    	}
    },
    config: {
    	options: {
    		xtype: 'stoplistoption'
    	}
    },
    constructor: function(config) {
    	
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    listeners: {
    	loadedCorpus: function(src, corpus) {
    		var store = this.getStore();
    		store.setCorpus(corpus);
    		store.getProxy().setExtraParam('corpus', corpus.getId());
    		this.fireEvent("apiChange", this);
    	},
    	apiChange: function() {
    		var api = this.getApiParams(['stopList','query']);
        	var proxy = this.getStore().getProxy();
        	for (var key in api) {
        		proxy.setExtraParam(key, api[key]);
        	}
        	this.getStore().loadPage(1);
    	},
    	query: function(src, query) {
    		this.setApiParam('query', query);
    		this.fireEvent("apiChange", this);
    		this.getStore().loadPage(1);
    	}
    },
    
    initComponent: function() {
        var me = this;

        var store = Ext.create("Voyant.data.store.CorpusTerms");
        store.getProxy().setExtraParam("withDistributions", "relative");
//        store.on("totalcountchange", function() {
//        	this.down('#status').update({count: this.getStore().getTotalCount()});;
//        }, me);
        
        Ext.apply(me, {
    		title: this.localize('title'),
            store : store,
    		selModel: Ext.create('Ext.selection.CheckboxModel', {
                pruneRemoved: false,
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		this.getApplication().dispatchEvent('corpusTermsClicked', this, selections);
                    	},
                    	scope: this
                    }
                },
                mode: 'SIMPLE'
            }),
//            dockedItems: [{
//                dock: 'bottom',
//                xtype: 'toolbar',
//                items: [{
//                    xtype: 'querysearchfield'
//                },{
//                    xtype: 'component',
//                    itemId: 'status',
//                    tpl: this.localize('matchingTerms'),
//                    style: 'margin-right:5px'
//                }]
//            }],

    		columns: [{
    			text: this.localize("term"),
            	tooltip: this.localize("termTip"),
        		dataIndex: 'term',
        		flex: 1,
                sortable: true
            },{
            	text: this.localize("rawFreq"),
            	tooltip: this.localize("rawFreqTip"),
            	dataIndex: 'rawFreq',
                flex: 1,
            	sortable: true
            }
            ,{
            	text: this.localize("relativeFreq"),
            	tooltip: this.localize("relativeFreqTip"),
            	dataIndex: 'relativeFreq',
            	renderer: function(val) {
            		var percent = val*100;
            		return Ext.util.Format.number(val*1000000, "0,000")/* + " (%"+
            			(val*100 <  .1 ? "<0.1" : Ext.util.Format.number(val*100, "0.0"))+")"*/
            	},
                flex: 1,
                hidden: true,
            	sortable: true
            },{
            	text: this.localize("relativePeakedness"),
            	tooltip: this.localize("relativePeakednessTip"),
            	dataIndex: 'relativePeakedness',
            	renderer: Ext.util.Format.numberRenderer("0,000.0"),
                flex: 1,
                hidden: true,
            	sortable: true
            },{
            	text: this.localize("relativeSkewness"),
            	tooltip: this.localize("relativeSkewnessTip"),
            	dataIndex: 'relativeSkewness',
            	renderer: Ext.util.Format.numberRenderer("0,000.0"),
                flex: 1,
                hidden: true,
            	sortable: true
            }
//            ,{
//                xtype: 'widgetcolumn',
//                text: this.localize("trend"),
//                tooltip: this.localize("trendTip"),
//                flex: 1,
//                dataIndex: 'distributions',
//                widget: {
//                    xtype: 'sparklineline',
//                    tipTpl: new Ext.XTemplate('{[this.getDocumentTitle(values.x,values.y)]}', {
//                    	getDocumentTitle: function(docIndex, relativeFreq) {
//                    		return this.panel.store.getCorpus().getDocument(docIndex).getTitle()+"<br>relative frequency: "+Ext.util.Format.number(relativeFreq*1000000, "0,000")
//                    	},
//                    	panel: me 
//                    })
//                }
//            }
            ]
        });

        me.callParent(arguments);
        
    },
    
    load: function() {
    	if (this.rendered) {
    		this.store.loadPage(1)
    	}
    	else {
			Ext.defer(this.load, 100, this);
    	}
    }
})