method vendaset_get_entity.

data: ls_entity type zcl_zmonitorvendas_mpc=>ts_venda.

io_tech_request_conquest->get_converted_keys(
  importing
    es_key_values = ls_entity
).

select single *
from ztab_vendas_cab
into corresponding fields of er_entity
where id = ls_entity-ID.

endmethod.
