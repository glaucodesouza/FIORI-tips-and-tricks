    onValueHelpRequestEmpregado: function (oEvent) {
        //------------------------------------------------------------------
        // MATCHCODE P/ FILTRO DE EMPREGADO
        //----------------------------------------------------------------

        // LER Dados do Model local de Empregados
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

        // Montar o DIALOG popup
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

            // Itens a serem mostrados no popup
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

            // Montar o retorno do botão CONFIRMAR
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
