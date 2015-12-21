sap.ui.core.mvc.Controller.extend("live3.view.Master2", {

	onInit: function() {
		this.getRouter().attachRouteMatched(this.onRouteMatched, this);

		//On phone devices, there is nothing to select from the list. There is no need to attach events.
		if (!sap.ui.Device.system.phone) {
			this.getRouter().attachRoutePatternMatched(this.onRoutePatternMatched, this);
		}
	},

	onRoutePatternMatched: function(oEvent) {
		var sName = oEvent.getParameter("name");

		if (sName !== "master2") {
			return;
		}

		//		Load the detail view in desktop
		this.getRouter().myNavToWithoutHash({
			currentView: this.getView(),
			targetViewName: "live3.view.Detail",
			targetViewType: "XML",
			transition: "slide"
		});
	},

	onRouteMatched: function(oEvent) {
		var oParameters = oEvent.getParameters();

		if (oParameters.name === "master2") {
			var sEntityPath = "/" + oParameters.arguments.entity;
			this.bindView(sEntityPath);

			var oEventBus = this.getEventBus();
			var that = this;
			this.byId("master2List").attachUpdateFinished(function() {
				that.selectFirstItem();
				oEventBus.publish("Master2", "LoadFinished", {
					oListItem: that.getView().byId("master2List").getItems()[0]
				});
			});
		}

		if (oParameters.name === "master02" && jQuery.device.is.phone) {
			this.getRouter().myNavToWithoutHash({
				currentView: this.getView(),
				targetViewName: "live3.view.Detail",
				targetViewType: "XML",
				transition: "slide"
			});
		}
	},

	bindView: function(sEntityPath) {
		var oView = this.getView();
		oView.bindElement(sEntityPath);

		//Check if the data is already on the client
		if (!oView.getModel().getData(sEntityPath)) {

			// Check that the entity specified was found
			oView.getElementBinding().attachEventOnce("dataReceived", jQuery.proxy(function() {
				var oData = oView.getModel().getData(sEntityPath);
				if (!oData) {
					this.showEmptyView();
					this.fireDetailNotFound();
				}
			}, this));
		}
	},

	selectFirstItem: function() {
		var oList = this.getView().byId("master2List");
		var aItems = oList.getItems();
		if (aItems.length) {
			oList.setSelectedItem(aItems[0], true);
		}
	},

	showEmptyView: function() {
		this.getRouter().myNavToWithoutHash({
			currentView: this.getView(),
			targetViewName: "live3.view.NotFound",
			targetViewType: "XML"
		});
	},

	fireDetailNotFound: function() {
		this.getEventBus().publish("Master2", "NotFound");
	},

	onNavBack: function() {
		// This is only relevant when running on phone devices
		this.getRouter().myNavBack("main");
	},

	onSearch: function() {
		// Add search filter
		var filters = [];
		var searchString = this.getView().byId("master2SearchField").getValue();
		if (searchString && searchString.length > 0) {
			filters = [new sap.ui.model.Filter("user", sap.ui.model.FilterOperator.Contains, searchString)];
		}

		// Update list binding
		this.getView().byId("master2List").getBinding("items").filter(filters);
	},

	onSelect: function(oEvent) {
		// Get the list item either from the listItem parameter or from the event's
		// source itself (will depend on the device-dependent mode)
		this.showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
	},

	showDetail: function(oItem) {
		// If we're on a phone device, include nav in history
		var bReplace = jQuery.device.is.phone ? false : true;
		this.getRouter().navTo("detail", {
			from: "master",
			entity: oItem.getBindingContext().getPath().substr(1)
		}, bReplace);
	},

	getEventBus: function() {
		return sap.ui.getCore().getEventBus();
	},

	getRouter: function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	}

});