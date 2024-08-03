# DEPLOY

## Como fazer:

https://www.youtube.com/watch?v=oaCez85vTQQ  

## Commands:

## 1-npm install

## 2-npm run build

## 3-Configurar o arquivo de deploy

(Escolher opção A ou B, porque são iguais)  

**A)ou:** npx fiori add deploy-config  

**B)ou**: npm run deploy-config (**escolher exemplo: S4D-100, a destination que tiver a request**)  

**Please choose the target**: ABAP  

**Destination**: S4D100  

(**escolher exemplo: S4D-100, a destination que tiver apontar para o mesmo mandante da sua request workbench**)  

**SAPUI5 ABAP Repository**: nome_do_app_no_sap (até 15 caracteres)  

**Deployment Description:** Consulta Posição por Transporte  

**Package: zfixxxx**  

**Transport Request (mandatory):** S4DK900001  

**OBS.:**
Caso não funcione este comando, tente digitar o comando indicado abaixo.
npm install -g @sap/generator-fiori  

## 4-npm run deploy (last command)

# If any error, try bellow commands

## 1-update npm package:  

npm install --global npm@latest  

## 2-After:  

(Install Yeoman)  

npm install --global yo  

## 3-Caso não funcione, precisa desinstalar a versão atual do Yeoman.  
npm uninstall - g yo  
depois de desinstalado você instala a versão antiga:  
npm install - g yo@4.0.0  

## 4-Caso ainda não funcione, tente o Deploy direto no ambiente SAP com o report de Deploy  
