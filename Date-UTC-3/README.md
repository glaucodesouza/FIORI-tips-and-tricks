# Solução para o problema de data vinda do SAP

A data vindo do SAP, decrementa -3 horas.
As vezes isto acaba decrementando o dia vindo de lá.

A solução abaixo:

    oOcorrencia.Data                    = new Date(oOcorrencia.Data.getTime() + (3 * 60 * 60 * 1000));
