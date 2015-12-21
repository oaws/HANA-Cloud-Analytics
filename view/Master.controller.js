sap.ui.core.mvc.Controller.extend("live3.view.Master", {

	onInit: function() {
		this.oInitialLoadFinishedDeferred = jQuery.Deferred();

		var oEventBus = this.getEventBus();

		this.getView().byId("master1List").attachEventOnce("updateFinished", function() {
			this.oInitialLoadFinishedDeferred.resolve();
			oEventBus.publish("Master", "InitialLoadFinished", {
				oListItem: this.getView().byId("master1List").getItems()[0]
			});
			this.getRouter().detachRoutePatternMatched(this.onRouteMatched, this);
		}, this);

		//On phone devices, there is nothing to select from the list. There is no need to attach events.
		if (sap.ui.Device.system.phone) {
			return;
		}

		this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);

		oEventBus.subscribe("Master2", "NotFound", this.onNotFound, this);
	},

	onRouteMatched: function(oEvent) {
		var sName = oEvent.getParameter("name");

		if (sName !== "main") {
			return;
		}

		//Load the master2 view in desktop
		this.getRouter().myNavToWithoutHash({
			currentView: this.getView(),
			targetViewName: "live3.view.Master2",
			targetViewType: "XML"
		});

		//Load the welcome view in desktop
		this.getRouter().myNavToWithoutHash({
			currentView: this.getView(),
			targetViewName: "live3.view.Welcome",
			targetViewType: "XML"
		});
	},

	waitForInitialListLoading: function(fnToExecute) {
		jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(fnToExecute, this));
	},

	onNotFound: function() {
		this.getView().byId("master1List").removeSelections();
	},

	onSearch: function() {
		// Add search filter
		var filters = [];
		var searchString = this.getView().byId("master1SearchField").getValue();
		if (searchString && searchString.length > 0) {
			filters = [new sap.ui.model.Filter("clusterNumber", sap.ui.model.FilterOperator.Contains, searchString)];
		}

		// Update list binding
		this.getView().byId("master1List").getBinding("items").filter(filters);
	},

	onSelect: function(oEvent) {
		// Get the list item either from the listItem parameter or from the event's
		// source itself (will depend on the device-dependent mode)
		var oList = this.getView().byId("master1List");
		this.showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
		oList.removeSelections();
	},

	showDetail: function(oItem) {
		// If we're on a phone device, include nav in history
		var bReplace = jQuery.device.is.phone ? false : true;
		this.getRouter().navTo("master2", {
			from: "main",
			entity: oItem.getBindingContext().getPath().substr(1)
		}, bReplace);
	},

	getEventBus: function() {
		return sap.ui.getCore().getEventBus();
	},

	getRouter: function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	},

	onExit: function(oEvent) {
		this.getEventBus().unsubscribe("Master2", "NotFound", this.onNotFound, this);
	}
});