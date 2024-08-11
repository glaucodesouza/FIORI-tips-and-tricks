// If Try does not work
// Go to Catch solution
onLinePress: function (oEvent) {
    
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                try {
                    let oItem, oCtx;
                    oItem = oEvent.getSource();
                    oCtx = oItem.getBindingContext();
                    

                    //aqui é quando já há lotes no picking
                    oRouter.navTo("RouteMainDetail",{
                        Transporte : oCtx.getProperty("Transporte"),
                        Status : oCtx.getProperty("Status") ? oCtx.getProperty("Status") : '1'
                    });
                
                } catch (error) {
                    //se nao conseguir pegar o transporte no oEvent,
                    //procurar na linha que o usuário clicou
                    let aIndexClicado = oEvent.mParameters.id.match(/\d+$/g);
                    let nIndexClicado = aIndexClicado[0];
    
                    let loopIndex = 0;
                    this.getView().byId("idTable").getItems().forEach(function(element) {
                        if (parseInt(loopIndex) == parseInt(nIndexClicado)) {
                            let aTransporte = element.getBindingContext().sPath.match(/'\d+'/g);
                            let sTransporte = aTransporte[0];
                            oRouter.navTo("RouteMainDetail",{
                                Transporte : sTransporte,
                                Status : '1'
                            });
                        }
                        loopIndex++;
                    });
                }
            }
