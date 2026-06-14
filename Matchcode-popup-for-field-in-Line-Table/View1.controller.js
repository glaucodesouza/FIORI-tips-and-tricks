    onValueHelpRequestCodigoFrequencia: function (oEvent) {

        let oInput = oEvent.getSource();

        let oContextOcorrencia = oInput.getBindingContext("mdlOcorrenciasFiltradas");
        if (!oContextOcorrencia) {
            sap.m.MessageToast.show("Não foi possível identificar a linha selecionada.");
            return;
        }

        let sPathOcorrenciasFiltradas = oContextOcorrencia.getPath();
        let oModelOcorrenciasFiltradas = this.getView().getModel("mdlOcorrenciasFiltradas");

        let oModelCodigosFrequencia = this.getView().getModel("mdlCodigosFrequencia");
        if (!oModelCodigosFrequencia) {
            sap.m.MessageToast.show("Modelo de códigos de frequência ainda não carregado.");
            return;
        }

        let aDadosCodigosFrequencia = oModelCodigosFrequencia.getData() || [];

        let aItemsCodigosFrequencia = [];
        aDadosCodigosFrequencia.forEach(function (oItem) {
            if (!aItemsCodigosFrequencia.find(function (oExistente) {
                return oExistente.Codigo === oItem.Codigo;
            })) {
                aItemsCodigosFrequencia.push({
                    Codigo: oItem.Codigo,
                    Descricao: oItem.Descricao
                });
            }
        });

        let oModelValueHelp = new sap.ui.model.json.JSONModel(aItemsCodigosFrequencia);

        let oDialog = new sap.m.TableSelectDialog({
            title: "Selecionar Justificativa",
            noDataText: "Nenhum código encontrado",
            contentWidth: "600px",

            columns: [
                new sap.m.Column({
                    width: "120px",
                    header: new sap.m.Label({
                        text: "Código"
                    })
                }),
                new sap.m.Column({
                    header: new sap.m.Label({
                        text: "Descrição"
                    })
                })
            ],

            items: {
                path: "vh>/",
                template: new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Text({
                            text: "{vh>Codigo}"
                        }),
                        new sap.m.Text({
                            text: "{vh>Descricao}"
                        })
                    ]
                })
            },

            confirm: function (oEvent) {
                let oSelectedItem = oEvent.getParameter("selectedItem");

                if (!oSelectedItem) {
                    return;
                }

                let oCtx = oSelectedItem.getBindingContext("vh");

                let sCodigoSelecionado = oCtx.getProperty("Codigo");
                let sDescricaoSelecionada = oCtx.getProperty("Descricao");
                let sTextoJustificativa = `${sCodigoSelecionado} - ${sDescricaoSelecionada}`;

                oModelOcorrenciasFiltradas.setProperty(
                    sPathOcorrenciasFiltradas + "/Justificativa",
                    sCodigoSelecionado
                );

                oModelOcorrenciasFiltradas.setProperty(
                    sPathOcorrenciasFiltradas + "/JustificativaTexto",
                    sTextoJustificativa
                );

                oModelOcorrenciasFiltradas.refresh(true);
            }.bind(this)

        });

        oDialog.setModel(oModelValueHelp, "vh");

        this.getView().addDependent(oDialog);
        oDialog.open();

    },
