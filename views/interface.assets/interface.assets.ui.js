// User interface transformations
UItransform = {
  formatFloat : function(n) {
    if(isNaN(n)) {
      output = '?';
    } else {
      var balance = String(Number(n));
      if (balance === "0") {
        output = '0';
      } else {
        var maxlen = 8;   // amount of significant digits
        var output = '';
        var zeros = 0;
        var i;
        var size_open = '<span>';
        var size_stop = '</span>';
        if (balance[0] === "0") {
          output+='<span>'+size_open;
          for(i = 0; i < balance.length && i <= maxlen; i+=1) {
            if (balance[i] === "0" || balance[i] === ".") {
              zeros += 1;
              if(balance[i] === ".") {
                output += size_stop+balance.substr(i, 1)+size_open;
              } else {
                output += balance.substr(i, 1);
              }
            } else {
              i = balance.length;
            }
          }
          output+=size_stop+'</span>';
        }
        output += balance.substr(zeros,(i > maxlen?maxlen:i));
        if ((balance.length-zeros) > maxlen) {
          output += '<span>&hellip;</span>';
        }
      }
    }
    return output;
  },
  txStart : function() {
        $('#action-send .pure-button-send').addClass('pure-button-disabled').removeClass('pure-button-primary');
        $('#action-send').css('opacity', '0.7');
      },
  txStop : function() {
        $('#action-send .pure-button-send').removeClass('pure-button-disabled').addClass('pure-button-primary');
        $('#action-send').css('opacity', '1');
      },
  txHideModal : function() {
        $('#action-send').modal('hide').css('opacity', '1');
      },
  setBalance : function(element,setBalance) {
        $(element).html(setBalance);
      },
  deductBalance : function(element,newBalance) {
        $(element).html('<span style="color:#D77;">'+String(newBalance))+'</span>';
      }
}

$(".clearable").each(function() {

  var $inp = $(this).find("input:text"),
      $cle = $(this).find(".clearable__clear");

  $inp.on("input", function(){
    $cle.toggle(!!this.value);
  });

  $cle.on("touchstart click", function(e) {
    e.preventDefault();
    $inp.val("").trigger("input");
  });

});

displayAssets = function displayAssets() {
  balance = {}
  balance.asset = [];
  balance.amount = [];
  balance.lasttx = [];

  // create mode array of selected assets
  var activeAssetsObj = {};
  var i = 0;
  for(i = 0; i < GL.assetsActive.length; ++i) {
    if(typeof GL.assetmodes[GL.assetsActive[i]] !== 'undefined') {
      activeAssetsObj[GL.assetsActive[i]] = GL.assetmodes[GL.assetsActive[i]];
    }
  }

  var i = 0;
  var output = '';
  // create asset table
  output+='<table class="pure-table pure-table-striped"><thead>';
  output+='<tr><th class="icon-title"></th><th class="asset-title">Asset</th><th></th><th>Balance</th><th class="actions"></th></tr></thead><tbody>';
  for (var entry in activeAssetsObj) {
    balance.asset[i] = entry;
    balance.amount[i] = 0;
    balance.lasttx[i] = 0;

    var maybeAsset = GL.assetsStarred.find(function (starred) {
      return starred.id === balance.asset[i]
    })

    var element=balance.asset[i].replace(/\./g,'-');
    var maybeStarActive = maybeAsset === undefined ? '' : ' id="' + maybeAsset['id'].replace(/\./g, '_') + '" onclick=toggle_star(' + i + ') '

    // var starIsToggled=storage.Get(userStorageKey('ff00-0033'));
    output+='<tr><td class="icon">'+svg['circle']+'</td><td class="asset asset-'+element+'">'+entry+'</td><td class="star"><a' + maybeStarActive + 'role="button">'+ svg['star'] + '</a></td><td><div class="balance balance-'+element+'">'+progressbar()+'</div></td><td class="actions"><div class="assetbuttons assetbuttons-'+element+' disabled">';
    output+='<a onclick=\'fill_send("'+entry+'");\' href="#action-send" class="pure-button pure-button-primary" role="button" data-toggle="modal" disabled="disabled">Send</a>';
    output+='<a onclick=\'fill_recv("'+entry+'");\' href="#action-receive" class="pure-button pure-button-secondary" role="button" data-toggle="modal" disabled="disabled">Receive</a>';
    output+='<a href="#action-advanced" class="pure-button pure-button-grey advanced-button" role="button" disabled="disabled"><div class="advanced-icon">'+svg['advanced']+'</div><span class="button-label">Advanced</span></a>';
    output+='</div>'
    output+='<div class="assetbutton-mobile assetbuttons-'+element+' disabled">'
    output+='<a onclick=\'fill_actions("'+entry+'");\' href="#action-actions" class="pure-button pure-button-grey actions-button" role="button" data-toggle="modal" disabled="disabled"><div class="actions-icon">'+svg['actions']+'</div>Actions</a>';
    output+='</div></td></tr>';
    i++;
  }
  output+='</tbody></table>';
  // refresh assets
  ui_assets({i:i,balance:balance,path:path});
  intervals = setInterval( function(path) {
    ui_assets({i:i,balance:balance,path:path});
  },30000,path);
  $('.assets-main > .data').html(output);	// insert new data into DOM

  // render starred assets svgs
  for (var i=0; i < GL.assetsStarred.length; i++) {
    setStarredAssetClass(i, GL.assetsStarred[i]['starred']);
  }
}

// main asset management code
$(document).ready( function(){
  // fill advanced modal with work-in-progress icon
  var output = '<div style="text-align: center; margin-left: auto; margin-right: auto; width: 30%; color: #CCC;">'+svg['cogs']+'</div>';
  $('#advancedmodal').html(output);	// insert new data into DOM

  // add icon
  $('.manage-icon').html(svg['edit']);

  // elements: MAIN
  $('.assets-main .spinner-loader').fadeOut('slow', function() {
    displayAssets();
  });
});
