//When App ID is "id": "br.com.companyx.zfpsApp"

  onFPSClick: function (oEvent) {

      var oView = this.getView();
      if (!this._pFPS) {
        this._pFPS = Fragment.load({
          id: oView.getId(),
          name: "br.com.companyx.zfpsApp.view.Fps",
          controller: this
        }).then(function (oFPs) {
          oView.addDependent(oFPS);
          return oFPS
        });
      }
      this._pFPS.then(function (oFPS) {
        oFPS.open();
      });
  },
