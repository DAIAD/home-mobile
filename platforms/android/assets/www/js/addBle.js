function Event(sender) {
    this._sender = sender;
    this._listeners = [];
}

Event.prototype = {
attach: function (listener) {
    this._listeners.push(listener);
},
notify: function (args) {
    var index;
    
    for (index = 0; index < this._listeners.length; index += 1) {
        this._listeners[index](this._sender, args);
    }
}
};

/**
 * The Model. Model stores items and notifies
 * observers about changes.
 */
function ListModel(items) {
    this._items = items;
    this.itemAdded = new Event(this);
    
}

ListModel.prototype = {
    getItems: function () {
        return [].concat(this._items);
    },
    
    addItem: function (item) {
        this._items.push(item);
        this.itemAdded.notify({
                          item: item
                          });
    }
};

/**
 * The View. View presents the model and provides
 * the UI events. The controller is attached to these
 * events to handle the user interraction.
 */
function ListView(model, elements) {
    this._model = model;
    this._elements = elements;
    this.addButtonClicked = new Event(this);
    
    var _this = this;
    
    // attach model listeners
    this._model.itemAdded.attach(function () {
                                 _this.rebuildList();
                                 });
    
    // attach listeners to HTML controls
    this._elements.addButton.click(function () {
                                   _this.addButtonClicked.notify();
                                   });
}

ListView.prototype = {
    show: function () {
        this.rebuildList();
    },
    
    rebuildList: function () {
        var list, items, key;
    
        list = this._elements.list;
        list.html('');
    
        items = this._model.getItems();
        for (key in items) {
            if (items.hasOwnProperty(key)) {
                list.append($('<option>' + items[key] + '</option>'));
            }
        }
    }
};

/**
 * The Controller. Controller responds to user actions and
 * invokes changes on the model.
 */
function ListController(model, view) {
    this._model = model;
    this._view = view;
    
    var _this = this;
    this._view.addButtonClicked.attach(function () {
                                       _this.addItem();
                                       });
    
}

ListController.prototype = {
    addItem: function () {
        var item = window.prompt('Add item:', '');
        if (item) {
            this._model.addItem(item);
        }
    }
    
};

$(function () {
  var model = new ListModel([]),
  view = new ListView(model, {
                      'list': $('#list'),
                      'addButton': $('#plusBtn')
                      }),
  controller = new ListController(model, view);
  
  view.show();
  });