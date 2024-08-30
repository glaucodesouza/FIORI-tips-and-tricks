
if (sInput === undefined) {
  const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
  const sMyMessage = oResourceBundle.getText("myMessage");
  MessageBox.error("" + sMyMessage + "");
}
