# Receive N records via JSON to Deep Insert 
This is an example of receiving mass data as JSON in SEGW OData for abap
## (Dummy Header and real Items)

## Premises
- OData for abap on SEGW
- Receiving N records as JSON in BODY
- Sender must configure Header Content-Type = application/json
- Sender must configure Header accept = application/json
- Sender must configure Body with header "dummy"
- Sender must configure Body with items as ToItem property navigation/association
- Example of Body
  
         {
          "ProjectExternalCode": "ID-123", //this could be empty, no problem
          "Project1Item": { //ould be e.g. ToItem
            "results": [ //Odata need result word here
              { "ProjectExternalCode": "projectA", "ProjectExternalCodeItem": "field A" },
              { "ProjectExternalCode": "projectB", "ProjectExternalCodeItem": "field B" }
            ]
          }
        }

## SEGW

<img width="1885" height="1012" alt="image" src="https://github.com/user-attachments/assets/b27d7017-2890-4b6c-8351-2d661e2ea5ba" />


## SE24 Deep Insert method

    METHOD /iwbep/if_mgw_appl_srv_runtime~create_deep_entity.
  
      "DEFINIÇÃO DE ESTRUTURA ANINHADA
      DATA: BEGIN OF ls_project.
              INCLUDE TYPE ZCL_Z659_PROJECT_mpc=>ts_project1header.
      DATA:    ToProject1Item TYPE STANDARD TABLE OF ZCL_Z659_PROJECT_mpc=>ts_project1item WITH DEFAULT KEY.
      DATA: END OF ls_project.
  
      DATA(lv_entityset_name) = io_tech_request_context->get_entity_set_name( ).
      lv_entityset_name = 'project1HeaderSet'.
  
          io_data_provider->read_entry_data(
          IMPORTING
            es_data = ls_project ).
  
          "TRATAMENTO DADOS ITENS
  
          "INLINE DECLARATION DE FIELD SYMBOL
  
          LOOP AT ls_project-ToProject1Item ASSIGNING FIELD-SYMBOL(<fs_item_entity>).
            BREAK-POINT.
          ENDLOOP.
  
          copy_data_to_ref(
          EXPORTING
            is_data = ls_project
          CHANGING
            cr_data = er_deep_entity ).
  

  
    ENDMETHOD.


## Testing Body
  
    {
      "ProjectExternalCode": "ID-123",
      "Project1Item": {
        "results": [
          { "ProjectExternalCode": "projectA", "ProjectExternalCodeItem": "field A" },
          { "ProjectExternalCode": "projectB", "ProjectExternalCodeItem": "field B" }
        ]
      }
    }

<img width="1903" height="1000" alt="image" src="https://github.com/user-attachments/assets/f13193c1-93e8-463e-a03d-9978af36ce8d" />


## Response

<img width="1774" height="1009" alt="image" src="https://github.com/user-attachments/assets/d22010e6-538f-4191-9a4e-9bd3eadf3580" />

