method vendaset_get_entity.

//GET WHERE clause automatically, from service

data(lt_select) = io_tech_request_context->get_select_with_mandtry_fields( ).

data(lt_where) = io_tech_request_context->get_osql_where_clause_convert( ).

select (lt_select)
from ztab_vendas_cab
into corresponding fields of table er_entityset
where (lt_where).

endmethod.
