  METHOD /iwbep/if_mgw_appl_srv_runtime~create_deep_entity.

    "DEFINIÇÃO DE ESTRUTURA ANINHADA
    DATA: BEGIN OF ls_venda_entity.
            INCLUDE TYPE zcl_zmonitorvendas_mpc=>ts_venda.
    DATA:    toitens TYPE STANDARD TABLE OF zcl_zmonitorvendas_mpc=>ts_itemvenda WITH DEFAULT KEY.
    DATA: END OF ls_venda_entity.

    DATA: ls_vendas_cab TYPE ztab_vendas_cab.
    DATA: lt_itens TYPE TABLE OF ztab_vendas_item.

    DATA(lv_entityset_name) = io_tech_request_context->get_entity_set_name( ).


    CASE lv_entityset_name.

      WHEN 'VendaSet'.

        io_data_provider->read_entry_data(
        IMPORTING
          es_data = ls_venda_entity ).

        "TRATAMENTO DADOS CABEÇALHO
        SELECT MAX( id ) FROM ztab_vendas_cab INTO @DATA(lv_max).

        MOVE-CORRESPONDING ls_venda_entity TO ls_vendas_cab.
        ls_vendas_cab-id = lv_max + 1.

        CALL FUNCTION 'CONVERSION_EXIT_ALPHA_INPUT'
          EXPORTING
            input  = ls_vendas_cab-id
          IMPORTING
            output = ls_vendas_cab-id.

        ls_vendas_cab-data_criacao = sy-datum.
        ls_vendas_cab-criado_por = sy-uname.

        INSERT ztab_vendas_cab FROM ls_vendas_cab.

        "TRATAMENTO DADOS ITENS

        "INLINE DECLARATION DE FIELD SYMBOL

        LOOP AT ls_venda_entity-toitens ASSIGNING FIELD-SYMBOL(<fs_item_entity>).
          <fs_item_entity>-id = ls_vendas_cab-id.
          <fs_item_entity>-item = <fs_item_entity>-item + 1.

          APPEND INITIAL LINE TO lt_itens ASSIGNING FIELD-SYMBOL(<fs_item>).
          MOVE-CORRESPONDING <fs_item_entity> TO <fs_item>.

        ENDLOOP.

        INSERT ztab_vendas_item FROM TABLE lt_itens.

        copy_data_to_ref(
        EXPORTING
          is_data = ls_venda_entity
        CHANGING
          cr_data = er_deep_entity ).


    ENDCASE.

  ENDMETHOD.
