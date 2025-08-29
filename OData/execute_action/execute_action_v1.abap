  METHOD /iwbep/if_mgw_appl_srv_runtime~execute_action.

    DATA: ls_entity  TYPE ycl_ytst_sales_mpc=>ts_cliente,
          ls_cliente TYPE ztab_clientes,
          lv_status  TYPE i.

*DATA: LS_HEADER TYPE TIHTTPNVP.

    DATA(ls_header) = io_tech_request_context->get_request_headers( ).

    CASE iv_action_name.
      WHEN 'AlterarStatus'.

        io_tech_request_context->get_converted_parameters(
        IMPORTING
          es_parameter_values = ls_entity ).

        SELECT SINGLE * FROM ztab_clientes INTO ls_cliente WHERE id EQ ls_entity-id.

        CALL FUNCTION 'GENERAL_GET_RANDOM_INT'
          EXPORTING
            range  = 9
          IMPORTING
            random = lv_status.

        ls_cliente-status = lv_status.
        UPDATE ztab_clientes FROM ls_cliente.

        "devolve dados atualizados para front end
        MOVE-CORRESPONDING ls_cliente TO ls_entity.

        copy_data_to_ref(
        EXPORTING
        is_data = ls_entity
        CHANGING
        cr_data = er_data ).

    ENDCASE.

  ENDMETHOD.
