sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "zhr/apontarocorrencias/model/formatter",
    "sap/ui/core/Fragment",
    "sap/ui/unified/CalendarLegendItem",
    "sap/ui/unified/DateTypeRange",
], (Controller,JSONModel,MessageToast,formatter,Fragment,CalendarLegendItem,DateTypeRange) => {
    "use strict";

    var oModelPeriodos;
    var oModelOcorrencias;
    var oModelPerfis;
    var oModelCodigosFrequenciaDoSAP;
    var oFiltrosVisiveis = {
        "visibleMode": false
    };

    return Controller.extend("zhr.apontarocorrencias.controller.Ocorrencias", {

        formatter: formatter,

        onInit: function () {
            this.lerDadosDoSAP();
        },
        
        lerDadosDoSAP: function () {

            //--------------------------------------------------------------------------------------------------------------------
            // Atenção
            // -Pode ocorrer o chamado Callback Hell,
            // onde cada leitura depende dos dados da leitura anterior.
            // -Futuramente, para evitar isso, é possível utilizar Promises ou async/await 
            // para tornar o código mais legível e fácil de manter.
            //--------------------------------------------------------------------------------------------------------------------
            
            let oModel = this.getOwnerComponent().getModel(); //this.getView().getModel();

            //Ini Ocorrencias----------------------------------------------------------------------------
            oModel.read("/OcorrenciasSet", {
                success: (oData) => {
                    oModelOcorrencias = new JSONModel(oData.results);
                    this.getView().setModel(new JSONModel(oModelOcorrencias.oData), "mdlOcorrencias");

                    //Ini Periodos----------------------------------------------------------------------------
                    oModel.read("/PeriodosSet", {
                        success: (oData) => {

                            let aPeriodos = new JSONModel(oData.results);

                            // ✅ Insere item vazio no topo
                            aPeriodos.oData.unshift({
                                Periodo: "",
                                Ocorrencias: "",
                                isPlaceholder: true
                            });

                            oModelPeriodos = aPeriodos;
                            this.montarComboboxPeriodos();

                            //Ini Perfis----------------------------------------------------------------------------
                            oModel.read("/PerfisSet", {
                                success: (oData) => {

                                    oModelPerfis = new JSONModel(oData.results);

                                    //DEFINIR se perfil Apontador está em modo de edição ou não (editMode: true/false).
                                    this.validarSeCamposFiltrosSaoVisiveis();

                                    //Ini Códigos Frequência----------------------------------------------------------------------------
                                    oModel.read("/CodigosFrequenciaSet", {
                                        success: (oData) => {

                                            oModelCodigosFrequenciaDoSAP = new JSONModel(oData.results);
                                            this.getView().setModel(new JSONModel(oModelCodigosFrequenciaDoSAP.oData), "mdlCodigosFrequencia");

                                            // NÃO PRECISA COMBOBOX MAIS
                                            // POIS USAREMOS MATCH CODE DIRETO NO CAMPO.
                                            // Montar COMBOBOX de Códigos de Frequência
                                            // this.montarComboboxCodigosFrequencia();
                                        },
                                        error: (oError) => {
                                            MessageToast.show("Erro ao ler os Códigos de Frequência");
                                            //console.log("Erro ao ler os Perfis do SAP: ", oError);
                                        }
                                    });
                                    //Fim Códigos Frequência----------------------------------------------------------------------------

                                },
                                error: (oError) => {
                                    MessageToast.show("Erro ao ler os Perfis");
                                    //console.log("Erro ao ler os Perfis do SAP: ", oError);
                                }
                            });
                            //Fim Perfis----------------------------------------------------------------------------

                        },
                        error: (oError) => {
                            MessageToast.show("Erro ao ler os Periodos");
                            //console.log("Erro ao ler os Periodos do SAP: ", oError);
                        }
                    });
                    //Fim Periodos----------------------------------------------------------------------------
                },
                error: (oError) => {
                    MessageToast.show("Erro ao ler as Ocorrencias");
                    //console.log("Erro ao ler os Ocorrencias do SAP: ", oError);
                }
            });
            //Fim Ocorrencias----------------------------------------------------------------------------
        
        },

        montarComboboxPeriodos: function () {
            //Montar COMBOBOX de Períodos
            var oComboBox = this.getView().byId("cmbPeriodos");
            var aPeriodosDoSAP = oModelPeriodos.oData;

            aPeriodosDoSAP.forEach(function(oPeriodo) {
                oComboBox.addItem(new sap.ui.core.Item({
                    text: oPeriodo.Ocorrencias ? `${oPeriodo.Periodo} (${oPeriodo.Ocorrencias} ocorrências)` : '',
                    key: oPeriodo.Periodo
                }));
            });
        },

        onComboBoxPeriodosChange: function (oEvent) {

            let sPeriodoSelecionado = oEvent.getSource().getSelectedKey();

            if (!sPeriodoSelecionado) {
                this.getView().setModel( new JSONModel([]), "mdlOcorrenciasFiltradas" );
                return;
            }

            let aOcorrenciasFiltradas = oModelOcorrencias.oData
                .filter(function(oOcorrencia) {
                    return oOcorrencia.Periodo === sPeriodoSelecionado;
                })
                .map(function(oOcorrencia) {
                    return {
                        ...oOcorrencia, // mantém dados originais
                        Data: new Date(oOcorrencia.Data.getTime() + (3 * 60 * 60 * 1000)),//new Date(oOcorrencia.Data.getDateValue() + oOcorrencia.Data.getTimezoneOffset() * 60000), //formatter.formatDateBR(oOcorrencia.Data), // formata data para exibição
                        editMode: oOcorrencia.status === "01" ? true : false // boolean para editable
                    };
                });

            this.getView().setModel( new JSONModel(aOcorrenciasFiltradas), "mdlOcorrenciasFiltradas" );

            // pegar modelo atual
            let oView = this.getView();
            let oModel = oView.getModel("mdlOcorrenciasFiltradas");
            let aData = oModel.getData();
            oModel.setData(aData);
            oModel.refresh(true);            
            this.onPesquisar(); // dispara pesquisa para aplicar filtros de SearchField no período selecionado

            // var sPeriodoSelecionado = oEvent.getSource().getSelectedKey();

            // //Filtrar as ocorrências com base no período selecionado
            // var aOcorrenciasFiltradas = oModelOcorrencias.oData.filter(function(oOcorrencia) {
            //     return oOcorrencia.Periodo === sPeriodoSelecionado;
            // });

            // //Atualizar o modelo de ocorrências filtradas
            // this.getView().setModel(new JSONModel(aOcorrenciasFiltradas), "mdlOcorrenciasFiltradas");
        },

        // montarComboboxCodigosFrequencia: function () {
        //     //Montar COMBOBOX de Códigos de Frequência
        //     let oComboBoxCodigoFrequenciaDaTela = this.getView().byId("cmbCodigoFrequencia");
        //     let aCodigoFrequenciaDoSAP = oModelCodigosFrequenciaDoSAP.oData;

        //     aCodigoFrequenciaDoSAP.forEach(function(oCodigo) {
        //         oComboBoxCodigoFrequenciaDaTela.addItem(new sap.ui.core.Item({
        //             text: `${oCodigo.Codigo}-${oCodigo.Descricao}`,
        //             key: oCodigo.Codigo
        //         }));
        //     });
        //     // let oComboBoxCodigoFrequenciaDaTela = this.getView().byId("cmbCodigoFrequencia");
        //     // let oModelComboBoxCodigoFrequenciaDoServico = this.getView().getModel("mdlCodigoFrequencia");
        //     // let aCodigoFrequenciaDoServico = oModelComboBoxCodigoFrequenciaDoServico.getProperty("");

        //     // aCodigoFrequenciaDoServico.forEach(function(oCodigo) {
        //     //     oComboBoxCodigoFrequenciaDaTela.addItem(new sap.ui.core.Item({
        //     //         text: `${oCodigo.Codigo}-${oCodigo.Descricao}`,
        //     //         key: oCodigo.Codigo
        //     //     }));
        //     // });
        // },

        validarSeCamposFiltrosSaoVisiveis: function() {
            // DEFINIR se perfil Apontador está em modo de edição ou não (editMode: true/false).
            // APENAS o Apontador poderá ter os campos filtros visíveis.
            let aModelPerfis = oModelPerfis.getData();
            for (let index = 0; index < aModelPerfis.length; index++) {
                const element = aModelPerfis[index];
                if (element.Perfil === "Apontador") {
                    oFiltrosVisiveis.visibleMode = true;
                    this.getView().setModel(new JSONModel(oFiltrosVisiveis), "mdlFiltrosVisiveis");
                    break;
                }
            }
        },

        onTableLinePress: function(oEvent) {

            // Preencher o modelo de timeline com base na linha clicada
            this.preencherTimeLineTela(oEvent);

        },

        //TIMELINE INI ----------------------------------------------------------
        preencherTimeLineTela: function(oEvent) {

            // Lógica para preencher o modelo da timeline com base na linha clicada.
            let oContextLinhaClicada = oEvent.getSource().getBindingContext("mdlOcorrenciasFiltradas");
            let oDataLinhaClicada = oContextLinhaClicada.getObject();

            sap.m.MessageToast.show(`Linha selecionada: ${oDataLinhaClicada.Empregado} - ${oDataLinhaClicada.TipoOcorrencia}`);

            let aTimelineHours = [];
            let EmpregadoEncontrado = '';
            
            let aPeriodos = oModelPeriodos.getData();
            for (let index = 0; index < aPeriodos.length; index++) {
                const oPeriodo = aPeriodos[index];

                if (oPeriodo.Periodo !== '') {
                    if (oPeriodo.Periodo === oDataLinhaClicada.Periodo) {

                        EmpregadoEncontrado = oDataLinhaClicada.Empregado;
                        let aOcorrenciasDoPeriodo = oModelOcorrencias.getData();
                        for (let i = 0; i < aOcorrenciasDoPeriodo.length; i++) {
                            let oOcorrencia = aOcorrenciasDoPeriodo[i];
                            if (oOcorrencia.Periodo === oPeriodo.Periodo && oOcorrencia.Empregado === EmpregadoEncontrado) {
                                aTimelineHours.push(oOcorrencia.HoraInicio);
                                aTimelineHours.push(oOcorrencia.HoraFim);
                            }
                        }
                    }

                    //TIMELINE INI
                    const html = this._buildTimeline(aTimelineHours);

                    let sTimeLineData = `${oDataLinhaClicada.Data.getDate()}/${oDataLinhaClicada.Data.getMonth() + 1}/${oDataLinhaClicada.Data.getFullYear()}`;
                
                    this.getView().setModel(new JSONModel({ "timelineHtml": html, "timelineData": sTimeLineData }), "mdlTimeline");
                    
                    break; // Sai do loop após encontrar o período correspondente
                    //TIMELINE FIM
                }
            }

            this.byId("timelineHtml").setVisible(true);

        },

        _buildTimeline: function (times) {
            const toMinutes = (t) => {
                const [h, m] = t.split(":").map(Number);
                return h * 60 + m;
            };
        
            const start = 0;        // 00:00
            const end = 24 * 60;    // 24h
        
            let ticksHtml = "";
        
            times.forEach(t => {
                let horaAtual = this.transformarMsParaHora(t.ms);
                const pos = (toMinutes(horaAtual) - start) / (end - start) * 100;
        
                ticksHtml += `
                <div class="tick" style="left:${pos}%">
                    <div class="tick-line"></div>
                    <div class="tick-label">${horaAtual}</div>
                </div>
                `;
            });
        
            return `
                <div class="timeline">
                <div class="timeline-base"></div>
                ${ticksHtml}
                </div>
            `;
        },
        
        transformarMsParaHora: function (ms) {

            ms = Number(ms);

            if (isNaN(ms)) {
                return "00:00";
            }

            const horas = Math.floor(ms / 3600000);
            const minutos = Math.floor((ms % 3600000) / 60000);

            return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
        },
        //TIMELINE FIM ----------------------------------------------------------

        onEditarLinha: function(oEvent) {
            let oContext = oEvent.getSource().getBindingContext("mdlOcorrenciasFiltradas");
            let oModel = this.getView().getModel("mdlOcorrenciasFiltradas");

            let sPath = oContext.getPath();
            let oData = oModel.getProperty(sPath);

            switch (oData.Status) {
                case "02": // Em aprovação
                    sap.m.MessageToast.show("Não é possível editar.");
                    return;
                    break;
                case "03": // Aprovado
                    sap.m.MessageToast.show("Não é possível editar.");
                    return;
                    break;
                case "04": // Reprovado
                    sap.m.MessageToast.show("Não é possível editar.");
                    return;
                    break;
                default:
                    // alterna modo edição
                    oData.editMode = true; //!oData.editMode;
                    oData.Status = "01"; // Exemplo: ao entrar em modo de edição, o status muda para "Novo"
            }

            oModel.setProperty(sPath, oData);
        },

        onSalvarLinha: function(oEvent) {
            let oContext = oEvent.getSource().getBindingContext("mdlOcorrenciasFiltradas");
            let oModel = this.getView().getModel("mdlOcorrenciasFiltradas");

            let sPath = oContext.getPath();
            let oData = oModel.getProperty(sPath);

            if (!oData.editMode) {
                sap.m.MessageToast.show("Ative o modo de edição antes de salvar.");
                return;
            }

            if (!oData.Observacao) {
                sap.m.MessageToast.show("Observação é obrigatória para salvar.");
                return;
            }

            // if (oData.Status !== "01" || !oData.Observacao) {
            //     sap.m.MessageToast.show("Ative o modo de edição antes de salvar.");
            //     return;
            // }

            // Após salvar, alterna modo edição para false
            oData.editMode = false;
            oData.Status = "02"; // Exemplo: ao salvar, o status muda para "Em aprovação"

            oModel.setProperty(sPath, oData);

            //TODO: Aqui você pode implementar a lógica para salvar os dados editados, por exemplo, chamando um serviço OData ou atualizando um modelo local.

            //TODO: Implementar chamada do WF.START
        },

        onCancelarLinha: function(oEvent) {
            let oContext = oEvent.getSource().getBindingContext("mdlOcorrenciasFiltradas");
            let oModel = this.getView().getModel("mdlOcorrenciasFiltradas");

            let sPath = oContext.getPath();
            let oData = oModel.getProperty(sPath);  

            if (oData.Status === "01") {
                sap.m.MessageToast.show("Não é possível cancelar ocorrência.");
                return;
            }

            // Após cancelar, alterna modo edição para false
            // oData.editMode = false;
            oData.Status = "01"; // Exemplo: ao cancelar, o status volta para "Novo"
            oModel.setProperty(sPath, oData);

            //TODO: Aqui você pode implementar a lógica para reverter as alterações feitas, por exemplo, recarregando os dados originais do modelo ou chamando um serviço OData para obter os dados atualizados.

            let oModelSAP = this.getOwnerComponent().getModel()

            //Formatar horas para OData
            let horaInicioOdata = this.formatTimeToOData(oData.HoraInicio);
            let horaFimOdata = this.formatTimeToOData(oData.HoraFim);

            //Criar chave p/ update
            let sPathOData = oModelSAP.createKey("/OcorrenciasSet", {
                Empregado: oData.Empregado,
                Data: oData.Data,//"2026-06-11T00:00:00",
                HoraInicio: horaInicioOdata,//"PT08H00M00S",
                HoraFim: horaFimOdata //"PT10H00M00S"
            });

            //payload
            let oPayload = {
                Diferenca: `'${oData.Diferenca}'`,
                TipoOcorrencia: oData.TipoOcorrencia,
                CodigoFrequencia: oData.CodigoFrequencia,
                Observacao: oData.Observacao,
                Status: '01' //Renovar status para "Novo"
            };


            // let oPayload = {
            //     Empregado   : oNovoRegistroTable.Empregado,
            //     Data        : oNovoRegistroTable.Data,
            //     HoraInicio  : horaInicioOdata,
            //     HoraFim     : horaFimOdata,
            //     Diferenca   : '0.00',
            //     TipoOcorrencia : oNovoRegistroTable.TipoOcorrencia,
            //     CodigoFrequencia : oNovoRegistroTable.CodigoFrequencia,
            //     Observacao : oNovoRegistroTable.ObservacaoSolicitacao,
            //     Status : oNovoRegistroTable.Status
            // };

            
            //oModelSAP.setUseBatch(false); // Desabilita batch para garantir que a requisição seja enviada imediatamente
            oModelSAP.create("/OcorrenciasSet", oPayload, {
                success: (oData, response) => {
                    MessageToast.show("Ocorrência criada com sucesso no SAP!");
                },
                    error: (oError) => {
                        MessageToast.show("Erro ao criar ocorrência no SAP");
                }
            });
        },

        onPesquisar: function(oEvent) {

            //TODO: Faltará implementar onPesquisar de acordo com o período Selecionado.
            // Porém, já funciona assim !
            // Pois o Table já está mostrando somente o período selecionado, então o SearchField só irá filtrar dentro desse período.

            // pega a tabela interna da SmartTable
            let oSmartTable = this.byId("smartTable");
            let oTable = oSmartTable.getTable();

            // pega binding das linhas (depende do tipo de tabela)
            let oBinding = oTable.getBinding("items"); // ResponsiveTable

            // array de filtros            
            let aFilters = [];

            //Empregado
            let sValueFilterEmpregado = this.byId("inputEmpregado").getValue(); // pega valor do SearchField

            if (sValueFilterEmpregado) {
                let oFilterEmpregado = new sap.ui.model.Filter(
                    "Empregado", // nome do campo no JSON
                    sap.ui.model.FilterOperator.Contains,
                    sValueFilterEmpregado
                );
                aFilters.push(oFilterEmpregado);
            }

            //Tipo Ocorrência
            let sValueFilterTipoOcorrencia = this.byId("inputTipoOcorrencia").getValue(); // pega valor do SearchField

            if (sValueFilterTipoOcorrencia) {
                let oFilterTipoOcorrencia = new sap.ui.model.Filter(
                    "TipoOcorrencia", // nome do campo no JSON
                    sap.ui.model.FilterOperator.Contains,
                    sValueFilterTipoOcorrencia
                );
                aFilters.push(oFilterTipoOcorrencia);
            }

            // aplica filtro
            oBinding.filter(aFilters);

        },

        onSalvarEmMassa: function () {

            let oSmartTable = this.byId("smartTable");
            let oTable = oSmartTable.getTable();
            let aSelectedData = [];

            oTable.getSelectedItems().forEach(function (oItem) {
                let oCtx = oItem.getBindingContext("mdlOcorrenciasFiltradas"); // OU getBindingContext("nomeDoModel")

                if (oCtx) {
                    aSelectedData.push(oCtx.getObject());
                    console.log("Dados selecionados: ", oCtx.getObject());
                }
            });

            //console.log(aSelectedData);

            // TODO: Aqui você chama seu serviço OData / lógica de persistência
        },

        // CRIAR OCORRÊNCIA INI ----------------------------------------------------------
        onAbrirFragmentCriarOcorrencia: function () {
            var oView = this.getView();

            // pegar modelo atual
            let oModel = oView.getModel("mdlOcorrenciasFiltradas");

            if (!oModel) {
                MessageToast.show("Selecione um período primeiro!");
                return;
            }

            // ler período selecionado para associar ao novo registro
            let sPeriodoSelecionado = oView.byId("cmbPeriodos").getSelectedKey();

            if (!sPeriodoSelecionado) {
                MessageToast.show("Selecione um período primeiro!");
                return;
            }

            if (!this._oFragmentCriarOcorrencia) {
                Fragment.load({
                    id: oView.getId(),
                    name: "zhr.apontarocorrencias.view.CriarOcorrencia",
                    controller: this
                }).then(function (oDialog) {
                    this._oFragmentCriarOcorrencia = oDialog;
                    oView.addDependent(oDialog);
                    oDialog.open();
                    // TESTE: Preencher campos do fragment para teste
                    oView.byId("inpFragmentEmpregado").setValue("1234");
                    oView.byId("dpFragmentData").setValue('11/06/2026'); 
                    oView.byId("inpFragmentHoraInicio").setValue('05:00');
                    oView.byId("inpFragmentHoraFim").setValue('17:00');
                    // TESTE: Preencher campos do fragment para teste
                }.bind(this));
            } else {
                this._oFragmentCriarOcorrencia.open();
                // TESTE: Preencher campos do fragment para teste
                oView.byId("inpFragmentEmpregado").setValue("1234");
                oView.byId("dpFragmentData").setValue('11/06/2026'); 
                oView.byId("inpFragmentHoraInicio").setValue('05:00');
                oView.byId("inpFragmentHoraFim").setValue('17:00');
                // TESTE: Preencher campos do fragment para teste
            }
        },

        onCancelarFragmentCriarOcorrencia: function () {
            this._oFragmentCriarOcorrencia.close();
        },
        
        onConfirmarFragmentCriarOcorrencia: function () {

            let oView = this.getView();

            let sPernr = oView.byId("inpFragmentEmpregado").getValue();
            let sData = oView.byId("dpFragmentData").getDateValue(); 
            //let sData = oView.byId("dpFragmentData").getValue();
            //sData = new Date(sData.getTime() + sData.getTimezoneOffset() * 60000 + 180000); // Ajuste para compensar o fuso horário e garantir que a data seja correta ao converter para UTC
            let sHoraInicio = oView.byId("inpFragmentHoraInicio").getValue() === "" ? null : oView.byId("inpFragmentHoraInicio").getValue();
            let sHoraFim = oView.byId("inpFragmentHoraFim").getValue() === "" ? null : oView.byId("inpFragmentHoraFim").getValue();

            let sPeriodo = this.byId("cmbPeriodos").getSelectedKey();
            // oNovo.Periodo = sPeriodo;

            // validação simples
            if (!sPernr) {
                MessageToast.show("Preencha Empregado");
                return;
            }

            // validação simples
            if (!sData) {
                MessageToast.show("Preencha Data");
                return;
            }

            // pegar modelo atual
            let oModel = oView.getModel("mdlOcorrenciasFiltradas");

            if (!oModel) {
                MessageToast.show("Selecione um período primeiro!");
                return;
            }

            // ler período selecionado para associar ao novo registro
            let sPeriodoSelecionado = oView.byId("cmbPeriodos").getSelectedKey();

            if (!sPeriodoSelecionado) {
                MessageToast.show("Selecione um período primeiro!");
                return;
            }

            let aData = oModel.getData();
            // Buscar posição para inserir novo registro
            let positionNew = this.calcularNovaPosicaoNovoRegistro(sPernr, sData, aData);

            // montar novo registro (mesma estrutura do teu JSON)
            let oNovoRegistroTable = {
                Periodo: sPeriodo, // opcional se quiser preencher depois
                Empregado: sPernr,
                Data: sData, // formata para "YYYY-MM-DD"
                HoraInicio: sHoraInicio,
                HoraFim: sHoraFim,
                Diferenca: parseFloat("0.00"),
                TipoOcorrencia: "",
                CodigoFrequencia: "",
                ObservacaoSolicitacao: "",
                Status: "01", // Novo
                editMode: true
            };

            // se encontrou empregado, insere na próxima posição
            if (positionNew >= 0 && positionNew <= aData.length) {
                aData.splice(positionNew, 0, oNovoRegistroTable);
            } else {
                // se não encontrou, adiciona no fim
                aData.push(oNovoRegistroTable);
            }

            // atualiza modelo
            oModel.setData(aData);
            oModel.refresh(true);

            this._oFragmentCriarOcorrencia.close();

            //Formatar horas para OData
            let horaInicioOdata = this.formatTimeToOData(oNovoRegistroTable.HoraInicio);
            let horaFimOdata = this.formatTimeToOData(oNovoRegistroTable.HoraFim);

            let oPayload = {
                Empregado   : oNovoRegistroTable.Empregado,
                Data        : oNovoRegistroTable.Data,
                HoraInicio  : horaInicioOdata,
                HoraFim     : horaFimOdata,
                Diferenca   : '0.00',
                TipoOcorrencia : oNovoRegistroTable.TipoOcorrencia,
                CodigoFrequencia : oNovoRegistroTable.CodigoFrequencia,
                Observacao : oNovoRegistroTable.ObservacaoSolicitacao,
                Status : oNovoRegistroTable.Status
            };

            let oModelSAP = this.getOwnerComponent().getModel(); //this.getView().getModel();
            //oModelSAP.setUseBatch(false); // Desabilita batch para garantir que a requisição seja enviada imediatamente
            oModelSAP.create("/OcorrenciasSet", oPayload, {
                success: (oData, response) => {
                    MessageToast.show("Ocorrência criada com sucesso no SAP!");
                },
                    error: (oError) => {
                        MessageToast.show("Erro ao criar ocorrência no SAP");
                }
            });
        },

        calcularNovaPosicaoNovoRegistro: function (sPernr, sData, aData) {
            // Buscar o último registro do mesmo empregado e mesma data, para inserir o novo registro logo após ele. 
            // Caso não encontre nenhum, inserir no início do período.

            let iPosicaoInsercao = aData.length;

            for (let i = 0; i < aData.length; i++) {

                let oAtual = aData[i];

                let sEmpregadoAtual = oAtual.Empregado;
                let iDataAtual = oAtual.Data.getTime();
                let iNovaData = sData.getTime();

                // =========================================
                // 1. Mesmo empregado e mesma data
                // -> encontrar último da sequência
                // =========================================
                if (
                    sEmpregadoAtual === sPernr &&
                    iDataAtual === iNovaData
                ) {

                    let j = i;

                    while (
                        j < aData.length &&
                        aData[j].Empregado === sPernr &&
                        aData[j].Data.getTime() === iNovaData
                    ) {
                        j++;
                    }

                    return j; // inserir após o último da sequência
                }

                // =========================================
                // 2. Encontrou empregado maior
                // =========================================
                if (sEmpregadoAtual > sPernr) {
                    return i;
                }

                // =========================================
                // 3. Mesmo empregado mas data maior
                // =========================================
                if (
                    sEmpregadoAtual === sPernr &&
                    iDataAtual > iNovaData
                ) {
                    return i;
                }
            }

            // =========================================
            // 4. Inserir no final
            // =========================================
            return iPosicaoInsercao;

        },
        
        formatTimeToOData: function (sTime) {
            let parts = sTime.split(":");

            let hours = parts[0];
            let minutes = parts[1];

            return "PT" + hours + "H" + minutes + "M00S";
        },

        // CRIAR OCORRÊNCIA FIM ----------------------------------------------------------

        // MATCHCODES INI ---------------------------------------------------------- 
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

        onValueHelpRequestTipoOcorrencia: function (oEvent) {
            //------------------------------------------------------------------
            // MATCHCODE P/ FILTRO DE TIPO DE OCORRÊNCIA
            //----------------------------------------------------------------

            // dados da tabela
            let aDados = this.getView()
                .getModel("mdlOcorrencias")
                .getData();

            // remove duplicados
            let aTipos = [...new Set(
                aDados.map(o => o.TipoOcorrencia)
            )];

            // transforma em objeto
            let aItems = aTipos.map(function (sTipo) {
                return {
                    TipoOcorrencia: sTipo
                };
            });

            let oModel = new JSONModel(aItems);

            let oDialog = new sap.m.SelectDialog({
                title: "Selecionar Tipo",

                items: {
                    path: "/",
                    template: new sap.m.StandardListItem({
                        title: "{TipoOcorrencia}"
                    })
                },

                confirm: function (oEvent) {

                    let sSelected = oEvent
                        .getParameter("selectedItem")
                        .getTitle();

                    this.byId("inputTipoOcorrencia").setValue(sSelected);

                }.bind(this)
            });

            oDialog.setModel(oModel);

            this.getView().addDependent(oDialog);

            oDialog.open();

        },

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
        // MATCHCODES FIM ----------------------------------------------------------

        // CALENDÁRIO DE STATUS INI ----------------------------------------------------------
        onAbrirFragmentCalendarioStatus: async function () {

            //Abrir Fragmento (popup Calendário de Status) INI
            let oView = this.getView();

            let bFragmentoJaFoiCarregadoAntes = false;

            if (!this._oFragmentCalendarioStatus) {
                
                this._oFragmentCalendarioStatus = await sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "zhr.apontarocorrencias.view.CalendarioStatus",
                    controller: this
                });
            } else {
                bFragmentoJaFoiCarregadoAntes = true;
                this._oFragmentCalendarioStatus.open();
            }

            this.getView().addDependent(this._oFragmentCalendarioStatus);

            this._oFragmentCalendarioStatus.open();
            //Abrir Fragmento (popup Calendário de Status) FIM

            this.preencherModeloCalendarioStatus(bFragmentoJaFoiCarregadoAntes);

        },

        onFecharFragmentCalendarioStatus: function () {
            this._oFragmentCalendarioStatus.close();
        },

        preencherModeloCalendarioStatus: function(bFragmentoJaFoiCarregadoAntes) {

            let oView = this.getView();
            let oCal = oView.byId("calendar");
            let oLeg = oView.byId("legend");
            
            // Data de hoje
            const oHoje = new Date();

            // Criar uma nova data exatamente 11 meses atrás
            const oDataInicial = new Date(oHoje);

            // Subtrai 11 meses
            oDataInicial.setMonth(oDataInicial.getMonth() - 11);

            oLeg.addItem(new CalendarLegendItem({
                type: "Type02", //Vermelho
				text : "Rejeitado"
            }));
            oLeg.addItem(new CalendarLegendItem({
                type: "Type09", //Cinza
				text : "Não Enviado"
            }));
            oLeg.addItem(new CalendarLegendItem({
                type: "Type05", //Roxo claro
				text : "Aguardando"
            }));
            oLeg.addItem(new CalendarLegendItem({
                type: "Type08", //Verde
				text : "Aprovado"
            }));

            // Começa pela data inicial
            let oDataLoop = new Date(oDataInicial);

            let sType = "None";

            // Loop até hoje
            while (oDataLoop <= oHoje) {

                switch (oDataLoop.getDate()) {
                    case 1:
                        sType = "Type02"; // Vermelho
                        break;
                    case 2:
                        sType = "Type05"; // Roxo claro
                        break;
                    case 3:
                        sType = "Type08"; // Verde
                        break;
                    case 4:
                        sType = "Type09"; // Cinza
                        break;
                    default:
                        sType = "None"; // Sem cor
                }
                
                if (sType !== "None") {
                    oCal.addSpecialDate(new DateTypeRange({
                        startDate : new Date(oDataLoop.getTime()),
                        type : sType
                    }));
                }

                // Avança 1 dia
                oDataLoop.setDate(oDataLoop.getDate() + 1);
            }

        }
        // CALENDÁRIO DE STATUS FIM ----------------------------------------------------------

    });
});
