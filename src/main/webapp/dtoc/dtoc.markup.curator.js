Ext.define('Voyant.panel.DToC.MarkupCurator', {
	extend: 'Ext.grid.Panel',
	requires: [],
	mixins: ['Voyant.panel.DToC.MarkupBase', 'Voyant.panel.Panel'],
	alias: 'widget.dtocMarkupCurator',
    config: {
    	corpus: undefined
    },
    statics: {
    	i18n: {
    		title: "Tags"
    	},
        api: {
        }
    },
    
	allTagsHashMap: {},
	
	disabledTags: {},
	
    
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	this.mixins['Voyant.panel.DToC.MarkupBase'].constructor.apply(this, arguments);

    },
    initComponent: function() {
    	var tagStore = Ext.create('Ext.data.JsonStore', {
			fields: [
				{name: 'tagName', allowBlank: false},
				{name: 'label', allowBlank: false},
				{name: 'type'}
			],
			sortInfo: {field: 'label', direction: 'ASC'},
			data: [],
			listeners: {
				datachanged: function(store) {
					for (var i = 0, len = store.getCount(); i < len; i++) {
						var r = store.getAt(i);
						if (r.get('type') === 't') {
							this.disabledTags[r.get('tagName')] = true;
						}
					}
				},
				scope: this
			}
		});
		
    	this.tagCombo = Ext.create('Ext.form.field.ComboBox', {
			xtype: 'combo',
			triggerAction: 'all',
			queryMode: 'local',
			editable: true,
			allowBlank: false,
			store: new Ext.data.ArrayStore({
			    idIndex: 0,
				fields: ['tag', 'disabled']
			}),
			tpl: '<tpl for=".">'+
					'<tpl if="disabled == false">'+
						'<li role="option" unselectable="on" class="x-boundlist-item">{tag}</li>'+
					'</tpl>'+
					'<tpl if="disabled == true">'+
					'<li role="option" unselectable="on" class="x-boundlist-item disabled">{tag}</li>'+
					'</tpl>'+
				'</tpl>',
			valueField: 'tag',
			displayField: 'tag',
			listeners: {
				beforeselect: function(combo, record, index) {
					return !record.get('disabled');
				},
				change: function(field, newVal, oldVal) {
				    var r = field.store.findRecord('tag', newVal);
				    if (r !== null) r.set('disabled', true);
				    r = field.store.findRecord('tag', oldVal);
				    if (r !== null) r.set('disabled', false);
				},
				scope: this
			}
    	});
    	
		Ext.apply(this, {
			plugins: {
				ptype: 'cellediting',
				pluginId: 'cellEditor'
			},
			store: tagStore,
			forceFit: true,
			bbar: [{
				xtype: 'button',
				text: 'Add',
				glyph: 'xf067@FontAwesome',
				handler: function(b) {
					this.store.loadData([{
						tagName: '',
						label: '',
						freq: 0,
						type: 't'
					}], true);
					var numRecords = this.store.getTotalCount();
					this.getPlugin('cellEditor').startEditByPosition({row: numRecords-1, column: 0});
				},
				scope: this
			},' ',{
				xtype: 'button',
				text: 'Remove Selected',
				glyph: 'xf068@FontAwesome',
				handler: function(b) {
					var sels = this.getSelection();
					
					var comboStore = this.tagCombo.getStore();
					for (var i = 0; i < sels.length; i++) {
					    var tagName = sels[i].get('tagName');
					    delete this.disabledTags[tagName];
					    var r = comboStore.findRecord('tag', tagName);
					    if (r !== null) {
					        r.set('disabled', false);
					    }
					}
					
					this.store.remove(sels);
				},
				scope: this
			},' ',{
				xtype: 'button',
				text: 'Show Selected',
				glyph: 'xf002@FontAwesome',
				handler: function(b) {
					var sels = this.getSelection();
					//console.debug(sels);
					this.handleSelections(sels);
				},
				scope: this
			}],
			viewConfig: {
				stripeRows: true
			},
			selModel: Ext.create('Ext.selection.RowModel', {
				mode: 'MULTI'
			}),
			columns:[{
				header: 'Tag/Path', dataIndex: 'tagName',
				editor: this.tagCombo
			},{
				header: 'Label', dataIndex: 'label',
				editor: {
					xtype: 'textfield',
				    allowBlank: false
				}
			}],
			listeners: {
				afteredit: function(e) {
					if (e.field == 'tagName') {
						if (e.value == 'title') {
							e.record.set('tagName', 'xmlTitle');
						} else if (e.value == 'head') {
                            e.record.set('tagName', 'xmlHead');
                        }
						// determine whether tag or xpath
						var type = e.value.match(/^\w+$/) == null ? 'x' : 't';
						e.record.set('type', type);
					}
				},
				scope: this
			}
		});
		
		this.getAllTags();
		
		this.callParent(arguments);
    },
    
    getAllTags: function() {
    	if (this.getCorpus() === undefined) {
    		this.setCorpus(this.getApplication().getCorpus());
    	}
    	
		var me = this;
		var currDocIndex = 0;
		
		function getDocument(index) {
			if (index < me.getCorpus().getDocumentsCount()) {
				currDocIndex++;
				var docId = me.getCorpus().getDocument(index).getId();
				var params = {
					tool: 'corpus.RawDocumentExporter',
					corpus: me.getCorpus().getId(),
					outputFormat: 'xml',
					docId: docId
				};
				Ext.Ajax.request({
		           url: me.getTromboneUrl(),
		           params: params,
		           success: function(response, options) {
		        	   if (response.responseXML == null) {
		        		   // xml parse error
		        	   } else {
			        	   var docBody = Ext.dom.Query.selectNode('div', response.responseXML);
			        	   var tags = Ext.dom.Query.select('*', docBody);
			        	   for (var i = 0; i < tags.length; i++) {
			        		   var tag = tags[i];
			        		   var nodeName = tag.nodeName;
			        		   this.allTagsHashMap[nodeName] = true;
			        	   }
		        	   }
		        	   getDocument(currDocIndex);
		           },
		           scope: me
		        });
			} else {
				var data = [];
				for (var tag in me.allTagsHashMap) {
					data.push([tag, me.disabledTags[tag] != null]);
				}
				data.sort();
				me.tagCombo.getStore().loadData(data, false);
			}
			
		}
		
		getDocument(currDocIndex);
		
	},
	
	handleSelections: function(selections) {
		var waitForHits = false;
		var waitTracker = 0;
		var newTags = {};
		var tags = [];
		
		function doDispatch(data) {
			for (var tagName in data) {
				var a = data[tagName];
				if (a != null) {
					tags = tags.concat([a]);
				}
			}
			waitTracker--;
			if (waitTracker == 0) {
				this.getApplication().dispatchEvent('tagsSelected', this, tags);
			}
		}
		
		for (var i = 0; i < selections.length; i++) {
			var sel = selections[i].data;
			for (var docId in this.savedTags) {
				var tagData = this.savedTags[docId][sel.tagName];
				if (tagData === undefined) {
					waitForHits = true;
					if (newTags[docId] == null) {
						newTags[docId] = [];
					}
					newTags[docId].push(sel);
				} else if (tagData !== null) {  // if it's null, then we've already checked this tag/xpath
					if (tagData[0] && tagData[0].label != sel.label) {
						// update label
						for (var j = 0; j < tagData.length; j++) {
							tagData[j].label = sel.label;
						}
					}
					tags.push(tagData);
				}
			}
		}
		if (!waitForHits) {
			this.getApplication().dispatchEvent('tagsSelected', this, tags);
		} else {
			for (var docId in newTags) {
				waitTracker++;
				this.getHitsForTags(newTags[docId], docId, doDispatch);
			}
		}
	},
	
	getHitsForTags: function(tagArray, docId, callback) {
		var customTagSet = {};
		for (var i = 0; i < tagArray.length; i++) {
			var t = tagArray[i];
			customTagSet[t.tagName] = t;
		}
		this._getDocumentXml(docId, function(xml) {
			var tagData = this._parseTags(xml, docId, customTagSet);
//			console.debug(tagData);
			for (var tagName in tagData) {
				var t = tagData[tagName];
				this.savedTags[docId][tagName] = t;
			}
			if (callback) callback.call(this, tagData);
		}.createDelegate(this));
	}
});