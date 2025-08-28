  METHOD download_excel_to_it.

    DATA:
          ls_capacity       TYPE ty_capacidade_ct,
          it_capacidade_ct  TYPE ty_capacidade_ct.
         
    DATA: ls_capacidade_return TYPE ty_capacidade_ct.
    DATA: lv_campo_vazio TYPE string.
    io_data_provider->read_entry_data( IMPORTING es_data = ls_capacity ).

    it_capacidade_ct = ls_capacity.

    DATA: lo_excel   TYPE REF TO cl_fdt_xl_spreadsheet,
          lt_data    TYPE REF TO data,
          lv_xstring TYPE xstring.

    " Passo 2: Decodificar o conteúdo base64
    CALL FUNCTION 'SCMS_BASE64_DECODE_STR'
      EXPORTING
        input  = it_capacidade_ct-arquivo
      IMPORTING
        output = lv_xstring.

    TRY.
        CREATE OBJECT lo_excel
          EXPORTING
            document_name = 'TemplateCapacidade'
            xdocument     = lv_xstring.

        CALL METHOD lo_excel->if_fdt_doc_spreadsheet~get_itab_from_worksheet
          EXPORTING
            worksheet_name = 'template-planilha-ajuste-capaci'
          RECEIVING
            itab           = lt_data.

      CATCH cx_root INTO erro.

        is_returnct-message = TEXT-063.
        is_returnct-type = 'E'.
        APPEND is_returnct TO ls_capacidade_return-messages.

        is_returnct-message = TEXT-064.
        is_returnct-type = 'E'.
        APPEND is_returnct TO ls_capacidade_return-messages.

        er_result = ls_capacidade_return.
        EXIT.
    ENDTRY.



    FIELD-SYMBOLS: <gt_data> TYPE table,
                   <row>     TYPE any,
                   <fs_1>    TYPE any,
                   <fs_2>    TYPE any,
                   <fs_3>    TYPE any,
                   <fs_4>    TYPE any,
                   <fs_5>    TYPE any,
                   <fs_6>    TYPE any,
                   <fs_7>    TYPE any,
                   <fs_8>    TYPE any,
                   <fs_9>    TYPE any,
                   <fs_10>   TYPE any,
                   <fs_11>   TYPE any.


    ASSIGN lt_data->* TO <gt_data>.
    DATA: ls_capac_ct TYPE zovspm_capac_ct_programacao.
    DATA: lt_ct_aux TYPE TABLE OF zovspm_capac_ct_programacao.

    DELETE <gt_data> INDEX 1. "remove cabeçalho

    DESCRIBE TABLE <gt_data> LINES lv_total.

    CLEAR: erro_ct   ,   erro_cent .
    IF  lv_total = 0.
      is_returnct-message = TEXT-060.
      is_returnct-type = 'E'.
      APPEND is_returnct TO  ls_capacidade_return-messages.
    ELSE.
      LOOP AT <gt_data> ASSIGNING <row>.

        ASSIGN COMPONENT 1 OF STRUCTURE <row> TO <fs_1>.
        ASSIGN COMPONENT 2 OF STRUCTURE <row> TO <fs_2>.
        ASSIGN COMPONENT 3 OF STRUCTURE <row> TO <fs_3>.
        ASSIGN COMPONENT 4 OF STRUCTURE <row> TO <fs_4>.
        ASSIGN COMPONENT 5 OF STRUCTURE <row> TO <fs_5>.
        ASSIGN COMPONENT 6 OF STRUCTURE <row> TO <fs_6>.
        ASSIGN COMPONENT 7 OF STRUCTURE <row> TO <fs_7>.
        ASSIGN COMPONENT 8 OF STRUCTURE <row> TO <fs_8>.
        ASSIGN COMPONENT 9 OF STRUCTURE <row> TO <fs_9>.
        ASSIGN COMPONENT 10 OF STRUCTURE <row> TO <fs_10>.
        ASSIGN COMPONENT 11 OF STRUCTURE <row> TO <fs_11>.

        CONDENSE <fs_7> NO-GAPS.
        CONDENSE <fs_8> NO-GAPS.
        CONDENSE <fs_9> NO-GAPS.


        MOVE <fs_1>  TO ls_capac_ct-centro.
        MOVE <fs_2>  TO ls_capac_ct-cent_trb.
        MOVE <fs_3>  TO ls_capac_ct-valido_desde.
        MOVE <fs_4>  TO ls_capac_ct-valido_ate.
        MOVE <fs_5>  TO ls_capac_ct-dia.
        MOVE <fs_6>  TO ls_capac_ct-def_turno.
        MOVE <fs_7>  TO ls_capac_ct-hora_inicio.
        MOVE <fs_8>  TO ls_capac_ct-hora_fim.
        MOVE <fs_9>  TO ls_capac_ct-dur_intervalo.
        MOVE <fs_10> TO ls_capac_ct-grau_utilizacao.
        MOVE <fs_11> TO ls_capac_ct-nm_cap_indiv.

*        IF erro_ct   = ls_capac_ct-cent_trb AND
*         erro_cent = ls_capac_ct-centro.
*          CONTINUE.
*        ENDIF.

        "Verificação se algum campo do XLs está vazio.
        IF ls_capac_ct-centro IS INITIAL AND
       ls_capac_ct-cent_trb      IS INITIAL AND
       ls_capac_ct-valido_desde  IS INITIAL AND
       ls_capac_ct-valido_ate    IS INITIAL AND
       ls_capac_ct-dia           IS INITIAL AND
       ls_capac_ct-def_turno     IS INITIAL AND
       ls_capac_ct-hora_inicio   IS INITIAL AND
       ls_capac_ct-hora_fim      IS INITIAL AND
       ls_capac_ct-dur_intervalo IS INITIAL AND
       ls_capac_ct-grau_utilizacao IS INITIAL AND
       ls_capac_ct-nm_cap_indiv = ''.

          lv_total = lv_total - 1.
          DELETE <gt_data> INDEX sy-tabix.
          CONTINUE.
        ELSEIF ls_capac_ct-centro IS INITIAL.
          lv_campo_vazio = TEXT-046.
        ELSEIF ls_capac_ct-cent_trb IS INITIAL.
          lv_campo_vazio = TEXT-038.
        ELSEIF ls_capac_ct-valido_desde IS INITIAL.
          lv_campo_vazio = TEXT-047.
        ELSEIF ls_capac_ct-valido_ate IS INITIAL.
          lv_campo_vazio = TEXT-048.
        ELSEIF ls_capac_ct-dia IS INITIAL.
          lv_campo_vazio = TEXT-049.
        ELSEIF ls_capac_ct-def_turno IS INITIAL.
          lv_campo_vazio = TEXT-050.
        ELSEIF ls_capac_ct-hora_inicio IS INITIAL.
          lv_campo_vazio = TEXT-051.
        ELSEIF ls_capac_ct-hora_fim IS INITIAL.
          lv_campo_vazio = TEXT-052.
        ELSEIF ls_capac_ct-dur_intervalo IS INITIAL.
          lv_campo_vazio = TEXT-053.
        ELSEIF ls_capac_ct-grau_utilizacao IS INITIAL.
          lv_campo_vazio = TEXT-054.
        ELSEIF ls_capac_ct-nm_cap_indiv = ''.
          lv_campo_vazio = TEXT-055.

        ELSE.
          lv_campo_vazio = ''.

        ENDIF.
        CLEAR erro_ct.
        IF lv_campo_vazio IS NOT INITIAL.
          erro_ct    = abap_true.
          CONCATENATE TEXT-056 ls_capac_ct-cent_trb TEXT-057  ls_capac_ct-cent_trb ',' TEXT-034 lv_campo_vazio TEXT-035 INTO is_returnct-message SEPARATED BY space.
          is_returnct-type = 'E'.

          APPEND is_returnct TO ls_capacidade_return-messages.

          CONTINUE.
        ELSE.

          APPEND ls_capac_ct TO lt_ct_aux.
        ENDIF.
        CLEAR ls_capac_ct.
      ENDLOOP.
    ENDIF.


    IF lv_total = 0.
      is_returnct-message = TEXT-060.
      is_returnct-type = 'E'.
      APPEND is_returnct TO  ls_capacidade_return-messages.
    ELSE.
      IF erro_ct IS INITIAL.

        LOOP AT <gt_data> ASSIGNING <row>.

          ASSIGN COMPONENT 1 OF STRUCTURE <row> TO <fs_1>.
          ASSIGN COMPONENT 2 OF STRUCTURE <row> TO <fs_2>.
          ASSIGN COMPONENT 3 OF STRUCTURE <row> TO <fs_3>.
          ASSIGN COMPONENT 4 OF STRUCTURE <row> TO <fs_4>.
          ASSIGN COMPONENT 5 OF STRUCTURE <row> TO <fs_5>.
          ASSIGN COMPONENT 6 OF STRUCTURE <row> TO <fs_6>.
          ASSIGN COMPONENT 7 OF STRUCTURE <row> TO <fs_7>.
          ASSIGN COMPONENT 8 OF STRUCTURE <row> TO <fs_8>.
          ASSIGN COMPONENT 9 OF STRUCTURE <row> TO <fs_9>.
          ASSIGN COMPONENT 10 OF STRUCTURE <row> TO <fs_10>.
          ASSIGN COMPONENT 11 OF STRUCTURE <row> TO <fs_11>.

          CONDENSE <fs_7> NO-GAPS.
          CONDENSE <fs_8> NO-GAPS.
          CONDENSE <fs_9> NO-GAPS.


          MOVE <fs_1>  TO ls_capac_ct-centro.
          MOVE <fs_2>  TO ls_capac_ct-cent_trb.
          MOVE <fs_3>  TO ls_capac_ct-valido_desde.
          MOVE <fs_4>  TO ls_capac_ct-valido_ate.
          MOVE <fs_5>  TO ls_capac_ct-dia.
          MOVE <fs_6>  TO ls_capac_ct-def_turno.
          MOVE <fs_7>  TO ls_capac_ct-hora_inicio.
          MOVE <fs_8>  TO ls_capac_ct-hora_fim.
          MOVE <fs_9>  TO ls_capac_ct-dur_intervalo.
          MOVE <fs_10> TO ls_capac_ct-grau_utilizacao.
          MOVE <fs_11> TO ls_capac_ct-nm_cap_indiv.



          " Verificação se o centro de trabalho está sendo alterado
          CALL FUNCTION 'ENQUEUE_ECARPL'
            EXPORTING
              arbpl        = ls_capac_ct-cent_trb
              werks        = ls_capac_ct-centro
            EXCEPTIONS
              foreign_lock = 01.
          CASE sy-subrc.
            WHEN 0.

            WHEN 1.
              e_user   = sy-msgv1.
              e_enq_id = '4'.

              MESSAGE ID sy-msgid TYPE sy-msgty NUMBER sy-msgno
               WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4
               INTO is_returnct-message.
              CONCATENATE TEXT-059 ls_capac_ct-cent_trb TEXT-058 ls_capac_ct-centro ':' is_returnct-message INTO is_returnct-message SEPARATED BY space..
              is_returnct-type = 'E'.

              APPEND is_returnct TO ls_capacidade_return-messages.
              CONTINUE.
          ENDCASE.

          " Se centro de trabalho é válido
          CALL FUNCTION 'CR_WORKSTATION_CHECK'
            EXPORTING
              arbpl     = ls_capac_ct-cent_trb
              werks     = ls_capac_ct-centro
            IMPORTING
              arbid     = lv_arbid
              ktext     = lv_arktx
            EXCEPTIONS
              not_found = 01.
          IF sy-subrc <> 0.
            lv_subrc = 4.

            MESSAGE ID sy-msgid TYPE sy-msgty NUMBER sy-msgno
               WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4
               INTO is_returnct-message.
            is_returnct-type = 'E'.


            APPEND is_returnct TO ls_capacidade_return-messages.
            CONTINUE.
          ENDIF.
          " Busca dados de capacidade
          IF lv_arbid IS NOT INITIAL .
            CALL FUNCTION 'CR_WORKCENTER_READ_CAPACITIES'
              EXPORTING
                arbid     = lv_arbid
              TABLES
                tcrca     = tcrca
              EXCEPTIONS
                not_found = 01.
            IF sy-subrc <> 0.
              lv_subrc = 2.

              EXIT.
            ENDIF.
          ENDIF.

          READ TABLE tcrca INTO DATA(ls_crca) INDEX 1.

          SELECT SINGLE versa FROM kako INTO @DATA(lv_versn)
          WHERE kapid = @ls_crca-kapid .

          "-------Tratando datas
          REPLACE ALL   OCCURRENCES OF '-' IN ls_capac_ct-valido_ate WITH ''.
          REPLACE ALL   OCCURRENCES OF '-' IN ls_capac_ct-valido_desde WITH ''.

          lv_valido_inicial = ls_capac_ct-valido_desde.
          CALL FUNCTION 'RP_CALC_DATE_IN_INTERVAL'
            EXPORTING
              date      = lv_valido_inicial
              days      = 1
              months    = 0
              years     = 0
              signum    = '-'
            IMPORTING
              calc_date = lv_valido_desde.

          "--------------------- Preenchimento Kapa ---------"   Inicio
          ls_kapa-kapid  = ls_crca-kapid.
          ls_kapa-schnr  = ls_capac_ct-def_turno. "  Turno
          ls_kapa-ngrad  = ls_capac_ct-grau_utilizacao ." capac %
          ls_kapa-anzhl  = ls_capac_ct-nm_cap_indiv ."cap de pessoas
          lv_anzhl = ls_capac_ct-nm_cap_indiv.
**** Falta calculo da data fim de acordo com a primeira data do loop, pro arbpl.
          ls_kapa-datub  = ls_capac_ct-valido_ate.  "data fim


          ls_kapa-versn  = lv_versn.
          ls_kapa-tagnr  = ls_capac_ct-dia(1).

          """ Conversão em segundos - Criar método pra diminuir o cod.
          SPLIT ls_capac_ct-hora_inicio AT ':' INTO DATA(lv_hh) DATA(lv_mm) DATA(lv_ss).
          ls_kapa-begzt  = ( lv_hh * 3600 ) + ( lv_mm * 60 ) + lv_ss." hora inicio
          SPLIT ls_capac_ct-hora_fim AT ':' INTO DATA(lv_hh2) DATA(lv_mm2) DATA(lv_ss2).
          ls_kapa-endzt = ( lv_hh2 * 3600 ) + ( lv_mm2 * 60 ) + lv_ss2. "hora fim
          SPLIT ls_capac_ct-dur_intervalo AT ':' INTO DATA(lv_hh3) DATA(lv_mm3) DATA(lv_ss3).
          ls_kapa-pause = ( lv_hh3 * 3600 ) + ( lv_mm3 * 60 ) + lv_ss3. " interv

          CALL METHOD me->calculo_capacidade
            EXPORTING
              iv_begzt = ls_kapa-begzt
              iv_endzt = ls_kapa-endzt
              iv_pause = ls_kapa-pause
              iv_anzhl = lv_anzhl
              iv_ngrad = ls_capac_ct-grau_utilizacao
            CHANGING
              cv_einzt = ls_kapa-einzt
              cv_kapaz = ls_kapa-kapaz.

          APPEND ls_kapa TO it_kapa.
          MOVE-CORRESPONDING ls_kapa TO ls_kazy.
          MODIFY kapa FROM TABLE it_kapa.

          IF sy-subrc IS  INITIAL.
            CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
              EXPORTING
                wait   = 'X'
              IMPORTING
                return = is_returnkapa.
            APPEND is_returnkapa TO it_returnct.
          ENDIF.
          "--------------------- Preenchimento Kapa ---------"   Fim

          "--------------------- Preenchimento Kazy, com o intervalo único e o Intermediário ---------"   Inicio

          IF sy-tabix = 1 OR ls_capac_ct-cent_trb <> prev_centrotrab OR
             ( ls_capac_ct-cent_trb = prev_centrotrab  AND ls_capac_ct-valido_ate <> prev_datub ) .

* ini c0700007 - S 2200018901: BF INC03882653 - Ajuste cockpit OM (Cap)
            " select last week to have its values
            FREE lt_kapa_last_wk.
            SELECT * INTO TABLE @lt_kapa_last_wk
              FROM kapa
             WHERE kapid = @ls_crca-kapid
               AND versn = @lv_versn
               AND datub = @lv_valido_desde.
              IF sy-subrc <> 0.
              ENDIF.
* fim c0700007 - S 2200018901: BF INC03882653 - Ajuste cockpit OM (Cap)

            SELECT * INTO TABLE lt_kapa_aux
             FROM kapa
             WHERE datub = '99991231'
                AND   kapid = ls_crca-kapid.

            IF sy-subrc IS INITIAL AND lt_kapa_aux IS NOT INITIAL.
              LOOP AT lt_kapa_aux  ASSIGNING FIELD-SYMBOL(<fs_kapa_aux>).
                <fs_kapa_aux>-datub =  lv_valido_desde.
* ini c0700007 - S 2200018901: BF INC03882653 - Ajuste cockpit OM (Cap)
                " fill up more needed fields
                CLEAR ls_kapa_last_wk.
                READ TABLE lt_kapa_last_wk INTO ls_kapa_last_wk WITH TABLE KEY kapid = <fs_kapa_aux>-kapid
                                                                               versn = <fs_kapa_aux>-versn
                                                                               datub = <fs_kapa_aux>-datub
                                                                               tagnr = <fs_kapa_aux>-tagnr
                                                                               schnr = <fs_kapa_aux>-schnr.
                IF sy-subrc = 0.
                  <fs_kapa_aux>-anzhl = ls_kapa_last_wk-anzhl.
                  <fs_kapa_aux>-einzt = ls_kapa_last_wk-einzt.
                  <fs_kapa_aux>-kapaz = ls_kapa_last_wk-kapaz.
                  <fs_kapa_aux>-ngrad = ls_kapa_last_wk-ngrad.
                ENDIF.
* fim c0700007 - S 2200018901: BF INC03882653 - Ajuste cockpit OM (Cap)
              ENDLOOP.


              MODIFY kapa FROM TABLE lt_kapa_aux.
              IF sy-subrc IS  INITIAL.
                CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
                  EXPORTING
                    wait   = 'X'
                  IMPORTING
                    return = is_returnkapa.
                APPEND is_returnkapa TO it_returnct.
              ENDIF.
              READ TABLE lt_kapa_aux INTO ls_kapa_aux  INDEX  1.
              MOVE-CORRESPONDING ls_kapa_aux TO ls_kazy_aux.

              ls_kazy_aux-datub =  lv_valido_desde.
              ls_kazy_aux-anztg = '7'.
              ls_kazy_aux-anzsh = ls_kapa_aux-schnr.
              ls_kazy_aux-versn = lv_versn.
* ini c0700007 - S 2200018901: BF INC03882653 - Ajuste cockpit OM (Cap)
              "INSERT INTO kazy VALUES ls_kazy_aux.
              MODIFY kazy FROM ls_kazy_aux.
* fim c0700007 - S 2200018901: BF INC03882653 - Ajuste cockpit OM (Cap)
              IF sy-subrc IS INITIAL.
                CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
                  EXPORTING
                    wait   = 'X'
                  IMPORTING
                    return = is_returnkazy.

                APPEND is_returnkazy TO it_returnct.
              ENDIF.
            ELSE.


              ls_kazy_aux = ls_kazy.

              ls_kazy_aux-datub =  lv_valido_desde.
              ls_kazy_aux-versn = lv_versn. "version
              ls_kazy_aux-kkopf = 'X'. "marcação de intervalo padrão standard
              APPEND ls_kazy_aux TO it_kazy.
* ini c0700007 - S 2200018901: BF INC03882653 - Ajuste cockpit OM (Cap)
              "INSERT INTO kazy VALUES ls_kazy_aux.
              MODIFY kazy FROM ls_kazy_aux.
* fim c0700007 - S 2200018901: BF INC03882653 - Ajuste cockpit OM (Cap)
              IF sy-subrc IS INITIAL.
                CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
                  EXPORTING
                    wait   = 'X'
                  IMPORTING
                    return = is_returnkazy.

                APPEND is_returnkazy TO it_returnct.
              ENDIF.
              CLEAR it_kazy.

            ENDIF.
          ENDIF.
          " Variáveis em tempo de execução"
          prev_datub      = ls_capac_ct-valido_ate.
          prev_centro     = ls_capac_ct-centro.
          prev_centrotrab = ls_capac_ct-cent_trb.


          ls_kazy-anztg = '7'.
          ls_kazy-anzsh = ls_capac_ct-def_turno.
          ls_kazy-versn = lv_versn.
          ls_kazy-ngrad = ls_capac_ct-grau_utilizacao.
          APPEND ls_kazy TO it_kazy.
*         MODIFY kazy FROM TABLE it_kazy.
* ini c0700007 - S 2200018901: BF INC03882653 - Ajuste cockpit OM (Cap)
          "INSERT INTO kazy VALUES ls_kazy.
          MODIFY kazy FROM ls_kazy.
* fim c0700007 - S 2200018901: BF INC03882653 - Ajuste cockpit OM (Cap)
          IF sy-subrc IS INITIAL.
            CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
              EXPORTING
                wait   = 'X'
              IMPORTING
                return = is_returnkazy.

            APPEND is_returnkazy TO it_returnct.
          ENDIF.
          "--------------------- Preenchimento Kazy, com o intervalo único e o Intermediário ---------"   Fim

          IF it_returnct IS NOT INITIAL.

*    Retorna msg de erro pro cenario executado
            READ TABLE it_returnct WITH KEY type = 'E' INTO  is_returnct. "ct_update_revision-messages.
            IF sy-subrc = 0.
              is_returnct-number = '000'.


              CONCATENATE TEXT-057 ls_capac_ct-cent_trb ',' ls_capac_ct-centro is_returnct-message INTO is_returnct-message SEPARATED BY space.
              APPEND is_returnct TO ls_capacidade_return-messages.
            ELSE.
              lv_cont_ok = lv_cont_ok + 1.
            ENDIF.
          ENDIF.

        ENDLOOP.
      ENDIF.
    ENDIF.


    IF lv_cont_ok <> lv_total AND lv_cont_ok <> ''.

      CONCATENATE lv_cont_ok TEXT-028 lv_total TEXT-029 INTO is_returnct-message SEPARATED BY space.
      is_returnct-type = 'I'.
      is_returnct-number = '000'.

      APPEND is_returnct TO ls_capacidade_return-messages.


    ELSEIF it_returnct IS NOT INITIAL.

      CONCATENATE  lv_total TEXT-029 INTO is_returnct-message SEPARATED BY space.
      is_returnct-type = 'S'.
      is_returnct-number = '000'.

      APPEND is_returnct TO ls_capacidade_return-messages.

    ENDIF.
    SORT ls_capacidade_return-messages BY type DESCENDING.
    DELETE ADJACENT DUPLICATES FROM ls_capacidade_return-messages COMPARING message.

    er_result = ls_capacidade_return.



    CLEAR: ls_capacidade_return ,is_returnct, ls_capac_ct.



  ENDMETHOD.
