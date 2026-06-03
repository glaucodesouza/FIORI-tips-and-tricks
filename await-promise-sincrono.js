//Como chamar await com promise (síncrono)
//Como chamar Await Promise no Node.js
 
oninit()
	let oModelCab = await this.lerSomaPickingAtual(oModelCab);
	let myvariavle = await this.outraFunction();
},

lerSomaPickingAtual: async function(oModelCab){
 
	return new Promise((resolve, reject)=> {
 
      let oModel = this.getView().getModel();
      let sUrl = '';
      sUrl = `/SomaCargasJaUsadasMesmoPicking?$filter=Transporte eq '` + oModelCab.oData.transporte + `' and Ticket eq '` + oModelCab.oData.ticket + `'`;	

      oModel.read(sUrl, {
          async: true,
          success: function (oData) {
            
            resolve(oModelCab);

          }.bind(this),
          error: function (Error) {

              reject(oModelCab); //retornar promise com erro técnico

          }.bind(this),
      });
 
  });
},
