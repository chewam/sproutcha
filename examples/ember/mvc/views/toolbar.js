App.ToolbarButton = Ember.Button.extend({
  tagName: 'li',
  type: null,
  targetBinding: 'contentView.content',
  classNameBindings: ['disabled'],
  click: function(evt) {
    evt.preventDefault();
  }
});

App.ToolbarView = Ember.View.extend({
  classNames: ['toolbar'],
  contentBinding: 'App.Employees',
  previousButton: App.ToolbarButton.extend({
    classNames: ['prev'],
    action: 'previousPage',
    disabledBinding: Ember.Binding.not('target.hasPrevious')
  }),
  nextButton: App.ToolbarButton.extend({
    classNames: ['next'],
    action: 'nextPage',
    disabledBinding: Ember.Binding.not('target.hasNext')
  })
});
