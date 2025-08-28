  METHOD centrocustosolic_get_entityset.

*  IMPORTANT:
*  This select has paging implemented.
*  This is important to implelemt when SELECT gives thousands of records.
*  So, caller app can implement TOP and SKIP in a loop when calling this method here.

    DATA: lt_page     TYPE STANDARD TABLE OF zcl_my_segw_service_mpc=>ts_centrocustosolic,
          ls_page     TYPE zcl_my_segw_service_mpc=>ts_centrocustosolic,
          ls_entity   TYPE zcl_my_segw_service_mpc=>ts_centrocustosolic,
          lv_top      TYPE i,
          lv_skip     TYPE i,
          lv_total    TYPE i,
          lv_need_cnt TYPE abap_bool.

    CONSTANTS:
      c_kokrs_acbr TYPE kokrs VALUE 'ACBR',
      c_spras_pt   TYPE spras VALUE 'P',   " Portuguese
      c_spras_en   TYPE spras VALUE 'E'.   " English

    " Cost center category (KOSAR) constants
    CONSTANTS:
      c_kosar_a TYPE kosar VALUE 'A',
      c_kosar_b TYPE kosar VALUE 'B',
      c_kosar_c TYPE kosar VALUE 'C',
      c_kosar_d TYPE kosar VALUE 'D',
      c_kosar_e TYPE kosar VALUE 'E',
      c_kosar_g TYPE kosar VALUE 'G',
      c_kosar_m TYPE kosar VALUE 'M',
      c_kosar_o TYPE kosar VALUE 'O',
      c_kosar_p TYPE kosar VALUE 'P',
      c_kosar_t TYPE kosar VALUE 'T'.

    " 1) Read client paging directly from request context (old GW API)
    lv_top  = io_tech_request_context->get_top( ).
    lv_skip = io_tech_request_context->get_skip( ).

    IF lv_top IS INITIAL.
      lv_top = 200.  " default page size (tune as you wish)
    ENDIF.
    IF lv_skip IS INITIAL.
      lv_skip = 0.
    ENDIF.

    " 2) Count requested? (covers $count=true or $inlinecount=allpages)
    IF io_tech_request_context->has_count( ) = abap_true.
      lv_need_cnt = abap_true.
    ENDIF.

    " 3) Only compute total when asked (COUNT on the join)
    IF lv_need_cnt = abap_true.
      SELECT COUNT( * ) INTO @lv_total
       FROM csks INNER JOIN cskt ON cskt~kostl = csks~kostl AND
                                    cskt~kokrs = csks~kokrs AND
                                    cskt~datbi = csks~datbi "AND
                                    "CSKT~SPRAS = CSKS~SPRAS
      WHERE csks~kokrs = @c_kokrs_acbr
        AND csks~kosar IN ( @c_kosar_a, @c_kosar_b, @c_kosar_c, @c_kosar_d,
                            @c_kosar_e, @c_kosar_g, @c_kosar_m,
                            @c_kosar_o, @c_kosar_p, @c_kosar_t )
        AND cskt~spras IN ( @c_spras_pt, @c_spras_en ).
    ENDIF.

    " 4) Page the result set with deterministic ORDER BY
    SELECT
      csks~kostl,
      csks~kokrs,
      CAST( csks~datbi AS CHAR( 8 ) ) AS datbi,
      CAST( csks~datab AS CHAR( 8 ) ) AS datab,
      csks~bukrs,
      csks~kosar,
      csks~prctr,
      cskt~mctxt,
      cskt~spras,
      cskt~ktext,
      cskt~ltext
    FROM csks INNER JOIN cskt ON cskt~kostl = csks~kostl AND
                                 cskt~kokrs = csks~kokrs AND
                                 cskt~datbi = csks~datbi "AND
                                 "cskt~spras = csks~spras
   WHERE csks~kokrs = @c_kokrs_acbr
     AND csks~kosar IN ( @c_kosar_a, @c_kosar_b, @c_kosar_c, @c_kosar_d,
                         @c_kosar_e, @c_kosar_g, @c_kosar_m,
                         @c_kosar_o, @c_kosar_p, @c_kosar_t )
    AND cskt~spras IN ( @c_spras_pt, @c_spras_en )
   ORDER BY csks~kokrs, csks~kostl, csks~datbi, cskt~spras
    INTO TABLE @lt_page
   UP TO @lv_top ROWS
  OFFSET @lv_skip.                                "#EC "#EC CI_BUFFJOIN

    IF lt_page IS INITIAL.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          textid  = /iwbep/cx_mgw_busi_exception=>business_error
          message = 'No Data Found'(001).
    ENDIF.

    LOOP AT lt_page INTO ls_page.
      CLEAR ls_entity.
      " Map fields from DB structure to OData structure
      ls_entity-kostl     = ls_page-kostl.
      SHIFT ls_entity-kostl LEFT DELETING LEADING '0'.
      ls_entity-kokrs     = ls_page-kokrs.
      ls_entity-datbi     = ls_page-datbi.
      ls_entity-datab     = ls_page-datab.
      ls_entity-bukrs     = ls_page-bukrs.
      ls_entity-kosar     = ls_page-kosar.
      ls_entity-prctr     = ls_page-prctr.
      ls_entity-mctxt     = ls_page-mctxt.
      ls_entity-spras     = ls_page-spras.
      ls_entity-ktext     = ls_page-ktext.
      ls_entity-ltext     = ls_page-ltext.
      INSERT ls_entity INTO TABLE et_entityset.
    ENDLOOP.

    " 6) Return total rows if requested
    IF lv_need_cnt = abap_true.
      es_response_context-inlinecount = lv_total.
    ENDIF.

  ENDMETHOD.
