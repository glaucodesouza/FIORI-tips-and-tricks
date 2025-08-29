  METHOD /iwbep/if_mgw_appl_srv_runtime~get_expanded_entity.

      "IMPORTANTE:
      "Ler mais abaixo a seção de FECHAMENTO.

    "COLETAR CAMPOS CHAVE
    DATA: ls_venda TYPE zcl_zmonitorvendas_mpc=>ts_venda.

    "DEFINIR ESTRUTURA ANINHADA
    DATA: BEGIN OF ls_cliente.
            INCLUDE TYPE zcl_zmonitorvendas_mpc=>ts_venda.
    DATA:   tocliente TYPE zcl_zmonitorvendas_mpc=>ts_cliente,
          END OF ls_cliente.

    "COLETAR NOME DA ENTIDADE - MÉTODO DINAMICO
    DATA(lv_entityset) = io_tech_request_context->get_entity_set_name( ).

    "VALIDAÇÃO EXPAND
    DATA(lv_compare) = io_expand->compare_to_tech_names('TOCLIENTE').

    IF lv_entityset = 'VendaSet'
      AND lv_compare EQ io_expand->gcs_compare_result-match_subset OR
      lv_compare EQ io_expand->gcs_compare_result-match_equals .


      "IMPLEMENTAÇÃO CONJUNTA
      "SELECIONA CHAVES DA ENTIDADE
      io_tech_request_context->get_converted_keys(
      IMPORTING
        es_key_values = ls_venda ).

      "SELECIONA DADOS DE VENDA
      SELECT SINGLE * FROM ztab_vendas_cab
        INTO CORRESPONDING FIELDS OF ls_cliente
        WHERE id EQ ls_venda-id.

      "SELECIONA DADOS DE CLIENTE
      SELECT SINGLE * FROM ztab_clientes
        INTO CORRESPONDING FIELDS OF ls_cliente-tocliente
        WHERE id EQ ls_cliente-cliente_id.

      copy_data_to_ref(
      EXPORTING
        is_data = ls_cliente
        CHANGING
          cr_data = er_entity ).

      "IMPORTANTE:
      " Sem isso, será chamado muitas vezes em loop.
      " Então, deve colocar este APPEND abaixo, para que não chame mais repetido (para outras entidades)
      "FECHAMENTO
      DATA(ls_clause) = 'TOCLIENTE'.
      APPEND ls_clause TO et_expanded_tech_clauses.

    ELSE.

      CALL METHOD super->/iwbep/if_mgw_appl_srv_runtime~get_expanded_entity
        EXPORTING
          iv_entity_name           = iv_entity_name
          iv_entity_set_name       = iv_entity_set_name
          iv_source_name           = iv_source_name
          it_key_tab               = it_key_tab
          it_navigation_path       = it_navigation_path
          io_expand                = io_expand
          io_tech_request_context  = io_tech_request_context
        IMPORTING
          er_entity                = er_entity
          es_response_context      = es_response_context
          et_expanded_clauses      = et_expanded_clauses
          et_expanded_tech_clauses = et_expanded_clauses.

    ENDIF.

  ENDMETHOD.
