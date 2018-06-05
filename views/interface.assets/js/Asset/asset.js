// TODO: Replace all HTML onclicks for streamified events.
var Svg = svg;

asset = {
  mkAssetHTML: function (str, asset) {
    var assetID = R.prop('id', asset);
    var symbolName = R.prop('symbol', asset);

    var element = assetID.replace(/\./g, '-');
    var maybeStarActive = ' id="' + assetID.replace(/\./g, '_') + '" onclick=toggleStar("' + assetID + '") ';
    var icon = R.prop('icon', asset);

    var assetInfoHTMLStr = '<div id="asset-' + element + '" class="td col1 asset asset-' + element + '"><div class="icon">' + icon + '</div>' + assetID + '<div class="star"><a' + maybeStarActive + 'role="button">' + R.prop('star', Svg) + '</a></div></div>';
    var assetBalanceHtmlStr = '<div class="td col2"><div class="balance balance-' + element + '">' + progressbar() + '</div></div>';
    var assetDollarValuationHtmlStr = '<div class="td col3"><div id="' + symbolName + '-dollar" class="dollars" style="color: #AAA;">n/a</div></div>';
    var assetSendBtnHtmlStr = '<div data="' + assetID + '" href="#action-send" class="pure-button pure-button-large pure-button-primary sendAssetButton" role="button" data-toggle="modal" disabled="disabled"><div class="icon">' + R.prop('send', Svg) + '</div>Send</div>';
    var assetReceiveBtnHtmlStr = '<div data="' + assetID + '" href="#action-receive" class="pure-button pure-button-large pure-button-secondary receiveAssetButton" role="button" data-toggle="modal" disabled="disabled"><div class="icon">' + R.prop('receive', Svg) + '</div>Receive</div>';
    var assetGenerateBtnHtmlStr = '<div data="' + assetID + '" href="#action-generate" class="pure-button pure-button-large pure-button-secondary generateAddressButton" role="button" data-toggle="modal" disabled="disabled"><div class="icon">' + R.prop('receive', Svg) + '</div>Receive</div>';

    var receiveOrGenerateBtn = assetID === 'bts' ? assetGenerateBtnHtmlStr : assetReceiveBtnHtmlStr;

    var htmlToRender = '<div class="tr">' +
        assetInfoHTMLStr +
        assetBalanceHtmlStr +
        assetDollarValuationHtmlStr +
        '<div class="td col4 actions">' +
        '<div class="assetbuttons assetbuttons-' + element + ' disabled">' +
        assetSendBtnHtmlStr +
        receiveOrGenerateBtn +
        '</div>' +
        '</div>' +
        '</div>';

    return str + htmlToRender;
  },
  toggleAssetButtons: function (element, assetID, balance) {
    var assetbuttonsClass = '.assets-main > .data .assetbuttons-' + assetID.replace(/\./g, '-');
    var balanceIsValid = R.allPass([
      R.compose(R.not, R.isNil),
      R.compose(R.not, isNaN)
    ])(balance);

    balanceIsValid
      ? toggleTransactionButtons(element, assetbuttonsClass, 'hide', 'data-toggle', 'modal', 'disabled', balance)
      : toggleTransactionButtons(element, assetbuttonsClass, 'show', 'disabled', 'disabled', 'data-toggle', 'n/a');
  }
};

function toggleTransactionButtons (elem, query, addOrRemove, attrToSet, val, attrToRemove, attr) {
  // HACK! Bug is not breaking functionality, but hack is ugly nonetheless. Optimize!
  var exists = R.not(R.isNil(document.querySelector(query))) || R.not(R.isNil(document.querySelector(elem)));
  if (exists) {
    document.querySelector(query).classList[addOrRemove]('disabled');
    document.querySelectorAll(query + ' div').forEach(toggleAttribute(attrToSet, val, attrToRemove));
    document.querySelector(elem).setAttribute('amount', attr);
  }
}

function toggleAttribute (attrToSet, val, attrToRemove) {
  return function (elem) {
    elem.setAttribute(attrToSet, val);
    elem.removeAttribute(attrToRemove);
  };
}
