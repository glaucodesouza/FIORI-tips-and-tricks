  METHOD vendaset_get_entityset.

    "Definir estrutura para coletar campos chaves da entidade de ORIGEM
    DATA ls_cliente TYPE zcl_zalb_monitor_venda_mpc=>ts_cliente.

    DATA(lv_entityset) = io_tech_request_context->get_source_entity_set_name( ).

    " Seleção de campos (Select)
    DATA(lt_select) = io_tech_request_context->get_select_with_mandtry_fields( ).

    "Implementação via Navegação: Cliente x Vendas
    IF lv_entityset EQ 'ClienteSet'.

      "Busca chave da entidade de origem
      io_tech_request_context->get_converted_source_keys(
        IMPORTING
          es_key_values = ls_cliente
      ).

      SELECT (lt_select) FROM ztab_vendas_cab
        INTO CORRESPONDING FIELDS OF TABLE et_entityset
       WHERE cliente_id EQ ls_cliente-id
       ORDER BY id.

    ELSE. "Implementação tradicional

      "Filtro de campos (Filter)
      DATA(ls_where) = io_tech_request_context->get_osql_where_clause_convert( ).

      SELECT (lt_select) FROM ztab_vendas_cab
        INTO CORRESPONDING FIELDS OF TABLE et_entityset
       WHERE (ls_where)
       ORDER BY id.

    ENDIF.

  ENDMETHOD.
