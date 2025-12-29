# How to call CDS RAP Service, from Freestyle app controller
            //----------------------------------------------
            // Read data
            //----------------------------------------------
            
            let oODataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZALOC_TRAB_O2/");
            this.getView().setModel(oODataModel);

            oODataModel.read(`/capacidadeAlocada(p_visaobox='${tipoCalend}')/Set`, {
                filters: aFilters,
                success: function (oData) {
                    let aPeople = this.transformAppointments(oData.results, this);
                    let oJSONModel = new sap.ui.model.json.JSONModel({
                        startDate: new Date(),
                        people: aPeople
                    });
                    this.getView().setModel(oJSONModel, "calendar");
                }.bind(this),
                error: function (err) {
                    // let oRet = JSON.parse(err.message);
                    sap.m.MessageToast.show(err.message, {
                        duration: 4000
                    });
                }.bind(this)
            });
