App.ToolbarView = SC.View.extend({
  classNames: ['toolbar'],
  contentBinding: 'App.Employees'
});

App.ToolbarButton = SC.Button.extend({
  tagName: 'li',
  type: null,
  targetBinding: 'contentView.content',
  classNameBindings: ['disabled'],
  click: function(evt) {
    evt.preventDefault();
  }
});

App.PreviousButton = App.ToolbarButton.extend({
  classNames: ['prev'],
  action: 'previousPage',
  disabledBinding: SC.Binding.not('target.hasPrevious')
});

App.NextButton = App.ToolbarButton.extend({
  classNames: ['next'],
  action: 'nextPage',
  disabledBinding: SC.Binding.not('target.hasNext')
});


