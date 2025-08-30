METHOD /iwbep/if_mgw_appl_srv_runtime~create_stream.
  DATA: lv_json_xstr TYPE xstring,
        lv_json_str  TYPE string,
        lt_projects  TYPE STANDARD TABLE OF zcl_z659_project_mpc=>ts_projectsstream, "your DDIC type {projectExternalCode, fieldA, fieldB}
        ls_proj      TYPE zcl_z659_project_mpc=>ts_projectsstream,
        lt_return    TYPE STANDARD TABLE OF bapiret2,
        ls_ret       TYPE bapiret2,
        lt_log       TYPE STANDARD TABLE OF zcl_z659_project_mpc=>ts_projectsstream,"zty_project_result, "optional: per-row results
        ls_log       TYPE zcl_z659_project_mpc=>ts_projectsstream."zty_project_result.

  " 1) Read raw body as xstring
  lv_json_xstr = is_media_resource-value.

  " 2) Convert to string (assuming UTF-8)
  lv_json_str = cl_abap_codepage=>convert_from( source = lv_json_xstr ).

  " 3) Deserialize JSON array -> internal table
  /ui2/cl_json=>deserialize(
    EXPORTING json = lv_json_str
    CHANGING  data = lt_projects ).

  " 4) Loop and call your BAPI per project
  LOOP AT lt_projects INTO ls_proj.
*    CLEAR: lt_return, ls_ret.
*
*    ">>> Map to your BAPI <<<
*    "CALL FUNCTION 'BAPI_PROJECTDEF_CREATE'  "example placeholder
*    "  EXPORTING
*    "    i_extern_id = ls_proj-projectExternalCode
*    "    i_field_a   = ls_proj-fieldA
*    "    i_field_b   = ls_proj-fieldB
*    "  TABLES
*    "    return      = lt_return.
*
*    READ TABLE lt_return WITH KEY type = 'E' INTO ls_ret.
*    IF sy-subrc = 0.
*      ls_log-project_external_code = ls_proj-projectExternalCode.
*      ls_log-status = 'E'.
*      ls_log-message = ls_ret-message.
*    ELSE.
*      "CALL FUNCTION 'BAPI_TRANSACTION_COMMIT' EXPORTING wait = abap_true.
*      ls_log-project_external_code = ls_proj-projectExternalCode.
*      ls_log-status = 'S'.
*      ls_log-message = |Created|.
*    ENDIF.
*    APPEND ls_log TO lt_log.
  ENDLOOP.

*  " 5) Optional: build a JSON response (summary) to return as stream
*  DATA(lv_resp_json) = /ui2/cl_json=>serialize( data = lt_log compress = abap_true ).
*
*  DATA(ls_media TYPE /iwbep/if_mgw_appl_srv_runtime=>ty_s_media_resource).
*  ls_media-mime_type = 'application/json'.
*  ls_media-value     = cl_abap_codepage=>convert_to( lv_resp_json ).
*
*  " Return a 201 with a JSON body describing per-row results
*  er_entity = VALUE #( ).
*  copy_stream_to_ref( EXPORTING is_media_resource = ls_media CHANGING cr_data = er_entity ).
ENDMETHOD.
