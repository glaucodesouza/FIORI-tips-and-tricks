# Matchcode for filter field

View (Filter input field)

      <f:header>
          <f:DynamicPageHeader id="_IDGenDynamicPageHeader">
              <f:content>

                  <fb:FilterBar id="filterBar" header="Filtros" search=".onPesquisar" showRestoreButton="true" visible="{mdlFiltrosVisiveis>/visibleMode}" useToolbar="true">
                      <fb:filterGroupItems>
                          <fb:FilterGroupItem id="_IDGenFilterGroupItem" name="filterEmpregado" label="Empregado" groupName="Group1" visibleInFilterBar="true">
                              <fb:control>
                                  <Input id="inputEmpregado" 
                                      placeholder="" 
                                      maxLength="10"
                                      showValueHelp="true"
                                      valueHelpRequest="onValueHelpRequestEmpregado"/>
                              </fb:control>
                          </fb:FilterGroupItem>

                          <fb:FilterGroupItem id="_IDGenFilterGroupItem1" name="filterTipoOcorrencia" label="Tipo de Ocorrência" groupName="Group1" visibleInFilterBar="true">
                              <fb:control>
                                  <Input id="inputTipoOcorrencia" 
                                      placeholder=""
                                      showValueHelp="true"
                                      valueHelpRequest="onValueHelpRequestTipoOcorrencia"/>
                              </fb:control>
                          </fb:FilterGroupItem>

                      </fb:filterGroupItems>
                  </fb:FilterBar>

              </f:content>
          </f:DynamicPageHeader>
      </f:header>


Controller (matchcode function)

      onValueHelpRequestEmpregado: function (oEvent) {
          //------------------------------------------------------------------
          // MATCHCODE P/ FILTRO DE EMPREGADO
          //----------------------------------------------------------------

          let oModelOcorrenciasFiltradas = this.getView().getModel("mdlOcorrenciasFiltradas");
          if (!oModelOcorrenciasFiltradas) {
              oModelOcorrenciasFiltradas = this.getView().getModel("mdlOcorrencias");
          }

          let aDadosOcorrenciasFiltradas = oModelOcorrenciasFiltradas.getData() || [];

          let aItemsOcorrenciasFiltradas = [];
          aDadosOcorrenciasFiltradas.forEach(function (oItem) {
              if (!aItemsOcorrenciasFiltradas.find(function (oExistente) {
                  return oExistente.Empregado === oItem.Empregado;
              })) {
                  aItemsOcorrenciasFiltradas.push({
                      Empregado: oItem.Empregado,
                      NomeEmpregado: oItem.NomeEmpregado
                  });
              }
          });

          let oModelValueHelp = new sap.ui.model.json.JSONModel(aItemsOcorrenciasFiltradas);

          let oDialog = new sap.m.TableSelectDialog({
              title: "Selecionar Empregado",
              noDataText: "Nenhum empregado encontrado",
              contentWidth: "600px",

              columns: [
                  new sap.m.Column({
                      width: "120px",
                      header: new sap.m.Label({
                          text: "Empregado"
                      })
                  }),
                  new sap.m.Column({
                      header: new sap.m.Label({
                          text: "Nome"
                      })
                  })
              ],

              items: {
                  path: "vhEmpregados>/",
                  template: new sap.m.ColumnListItem({
                      cells: [
                          new sap.m.Text({
                              text: "{vhEmpregados>Empregado}"
                          }),
                          new sap.m.Text({
                              text: "{vhEmpregados>NomeEmpregado}"
                          })
                      ]
                  })
              },

              confirm: function (oEvent) {
                  let oSelectedItem = oEvent.getParameter("selectedItem");

                  if (!oSelectedItem) {
                      return;
                  }

                  let oCtx = oSelectedItem.getBindingContext("vhEmpregados");

                  let sCodigoSelecionado = oCtx.getProperty("Empregado");

                  this.byId("inputEmpregado").setValue(sCodigoSelecionado);

              }.bind(this)

          });

          oDialog.setModel(oModelValueHelp, "vhEmpregados");

          this.getView().addDependent(oDialog);
          oDialog.open();

      },
