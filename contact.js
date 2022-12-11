var qsProxy = {};
function FrameBuilder(
  formId,
  appendTo,
  initialHeight,
  iframeCode,
  title,
  embedStyleJSON
) {
  this.formId = formId;
  this.initialHeight = initialHeight;
  this.iframeCode = iframeCode;
  this.frame = null;
  this.timeInterval = 200;
  this.appendTo = appendTo || false;
  this.formSubmitted = 0;
  this.frameMinWidth = "100%";
  this.defaultHeight = "";
  this.init = function () {
    this.embedURLHash = this.getMD5(window.location.href);
    if (
      embedStyleJSON &&
      embedStyleJSON[this.embedURLHash] &&
      embedStyleJSON[this.embedURLHash]["inlineStyle"]["embedWidth"]
    ) {
      this.frameMinWidth =
        embedStyleJSON[this.embedURLHash]["inlineStyle"]["embedWidth"] + "px";
    }
    if (embedStyleJSON && embedStyleJSON[this.embedURLHash]) {
      if (
        embedStyleJSON[this.embedURLHash]["inlineStyle"] &&
        embedStyleJSON[this.embedURLHash]["inlineStyle"]["embedHeight"]
      ) {
        this.defaultHeight =
          'data-frameHeight="' +
          embedStyleJSON[this.embedURLHash]["inlineStyle"]["embedHeight"] +
          '"';
      }
    }
    this.createFrame();
    this.addFrameContent(this.iframeCode);
  };
  this.createFrame = function () {
    var tmp_is_ie = !!window.ActiveXObject;
    this.iframeDomId = document.getElementById(this.formId)
      ? this.formId + "_" + new Date().getTime()
      : this.formId;
    if (typeof $jot !== "undefined") {
      var iframe = document.getElementById("223443440392552");
      var parent = $jot(iframe).closest(".jt-feedback.u-responsive-lightbox");
      if (parent) {
        this.iframeDomId = "lightbox-" + this.iframeDomId;
      }
    }
    var htmlCode =
      "<" +
      'iframe title="' +
      title.replace(/[\\"']/g, "\\$&").replace(/&amp;/g, "&") +
      '" src="" allowtransparency="true" allow="geolocation; microphone; camera" allowfullscreen="true" name="' +
      this.formId +
      '" id="' +
      this.iframeDomId +
      '" style="width: 10px; min-width:' +
      this.frameMinWidth +
      "; display: block; overflow: hidden; height:" +
      this.initialHeight +
      'px; border: none;" scrolling="no"' +
      this.defaultHeight +
      "></if" +
      "rame>";
    if (this.appendTo === false) {
      document.write(htmlCode);
    } else {
      var tmp = document.createElement("div");
      tmp.innerHTML = htmlCode;
      var a = this.appendTo;
      document.getElementById(a).appendChild(tmp.firstChild);
    }
    this.frame = document.getElementById(this.iframeDomId);
    if (tmp_is_ie === true) {
      try {
        var iframe = this.frame;
        var doc = iframe.contentDocument
          ? iframe.contentDocument
          : iframe.contentWindow.document || iframe.document;
        doc.open();
        doc.write("");
      } catch (err) {
        this.frame.src =
          "javascript:void((function(){document.open();document.domain='" +
          this.getBaseDomain() +
          "';document.close();})())";
      }
    }
    this.addEvent(this.frame, "load", this.bindMethod(this.setTimer, this));
    var self = this;
    if (window.chrome !== undefined) {
      this.frame.onload = function () {
        try {
          var doc = this.contentWindow.document;
          var _jotform = this.contentWindow.JotForm;
          if (doc !== undefined) {
            var form = doc.getElementById("" + self.iframeDomId);
            self.addEvent(form, "submit", function () {
              if (_jotform.validateAll()) {
                self.formSubmitted = 1;
              }
            });
          }
        } catch (e) {}
      };
    }
  };
  this.addEvent = function (obj, type, fn) {
    if (obj.attachEvent) {
      obj["e" + type + fn] = fn;
      obj[type + fn] = function () {
        obj["e" + type + fn](window.event);
      };
      obj.attachEvent("on" + type, obj[type + fn]);
    } else {
      obj.addEventListener(type, fn, false);
    }
  };
  this.addFrameContent = function (string) {
    if (
      window.location.search &&
      window.location.search.indexOf("disableSmartEmbed") > -1
    ) {
      string = string.replace(new RegExp("smartEmbed=1(?:&amp;|&)"), "");
      string = string.replace(new RegExp("isSmartEmbed"), "");
    } else {
      var cssLink = "stylebuilder/" + this.formId + ".css";
      var cssPlace = string.indexOf(cssLink);
      var prepend = string[cssPlace + cssLink.length] === "?" ? "&amp;" : "?";
      var embedUrl = prepend + "embedUrl=" + window.location.href;
      if (cssPlace > -1) {
        var positionLastRequestElement = string.indexOf('"/>', cssPlace);
        if (positionLastRequestElement > -1) {
          string =
            string.substr(0, positionLastRequestElement) +
            embedUrl +
            string.substr(positionLastRequestElement);
          string = string.replace(
            cssLink,
            "stylebuilder/" + this.formId + "/" + this.embedURLHash + ".css"
          );
        }
      }
    }
    string = string.replace(
      new RegExp('src\\=\\"[^"]*captcha.php"></scr' + "ipt>", "gim"),
      'src="http://api.recaptcha.net/js/recaptcha_ajax.js"></scr' +
        "ipt><" +
        'div id="recaptcha_div"><' +
        "/div>" +
        "<" +
        "style>#recaptcha_logo{ display:none;} #recaptcha_tagline{display:none;} #recaptcha_table{border:none !important;} .recaptchatable .recaptcha_image_cell, #recaptcha_table{ background-color:transparent !important; } <" +
        "/style>" +
        "<" +
        'script defer="defer"> window.onload = function(){ Recaptcha.create("6Ld9UAgAAAAAAMon8zjt30tEZiGQZ4IIuWXLt1ky", "recaptcha_div", {theme: "clean",tabindex: 0,callback: function (){' +
        'if (document.getElementById("uword")) { document.getElementById("uword").parentNode.removeChild(document.getElementById("uword")); } if (window["validate"] !== undefined) { if (document.getElementById("recaptcha_response_field")){ document.getElementById("recaptcha_response_field").onblur = function(){ validate(document.getElementById("recaptcha_response_field"), "Required"); } } } if (document.getElementById("recaptcha_response_field")){ document.getElementsByName("recaptcha_challenge_field")[0].setAttribute("name", "anum"); } if (document.getElementById("recaptcha_response_field")){ document.getElementsByName("recaptcha_response_field")[0].setAttribute("name", "qCap"); }}})' +
        " }<" +
        "/script>"
    );
    string = string.replace(
      /(type="text\/javascript">)\s+(validate\(\"[^"]*"\);)/,
      '$1 jTime = setInterval(function(){if("validate" in window){$2clearTimeout(jTime);}}, 1000);'
    );
    if (string.match("#sublabel_litemode")) {
      string = string.replace(
        'class="form-all"',
        'class="form-all" style="margin-top:0;"'
      );
    }
    var iframe = this.frame;
    var doc = iframe.contentDocument
      ? iframe.contentDocument
      : iframe.contentWindow.document || iframe.document;
    doc.open();
    doc.write(string);
    setTimeout(function () {
      doc.close();
      try {
        if ("JotFormFrameLoaded" in window) {
          JotFormFrameLoaded();
        }
      } catch (e) {}
    }, 200);
  };
  this.setTimer = function () {
    var self = this;
    this.interval = setTimeout(this.changeHeight.bind(this), this.timeInterval);
  };
  this.getBaseDomain = function () {
    var thn = window.location.hostname;
    var cc = 0;
    var buff = "";
    for (var i = 0; i < thn.length; i++) {
      var chr = thn.charAt(i);
      if (chr == ".") {
        cc++;
      }
      if (cc == 0) {
        buff += chr;
      }
    }
    if (cc == 2) {
      thn = thn.replace(buff + ".", "");
    }
    return thn;
  };
  this.changeHeight = function () {
    var actualHeight = this.getBodyHeight();
    var currentHeight = this.getViewPortHeight();
    var skipAutoHeight = this.frame.contentWindow
      ? this.frame.contentWindow.document.querySelector(
          '[data-welcome-view="true"]'
        )
      : null;
    if (actualHeight === undefined) {
      this.frame.style.height = this.frameHeight;
      if (!this.frame.style.minHeight) {
        this.frame.style.minHeight = "100vh";
        if (!("nojump" in this.frame.contentWindow.document.get)) {
          window.parent.scrollTo(0, 0);
        }
      } else if (!this.frame.dataset.parentScrolled) {
        this.frame.dataset.parentScrolled = true;
        var container =
          window.parent.document &&
          window.parent.document.querySelector(".jt-content");
        if (container && !("nojump" in window.parent.document.get)) {
          container.scrollTo(0, 0);
        }
      }
    } else if (Math.abs(actualHeight - currentHeight) > 18 && !skipAutoHeight) {
      this.frame.style.height = actualHeight + "px";
    }
    this.setTimer();
  };
  this.bindMethod = function (method, scope) {
    return function () {
      method.apply(scope, arguments);
    };
  };
  this.frameHeight = 0;
  this.getBodyHeight = function () {
    if (this.formSubmitted === 1) {
      return;
    }
    var height;
    var scrollHeight;
    var offsetHeight;
    try {
      if (this.frame.contentWindow.document.height) {
        height = this.frame.contentWindow.document.height;
        if (this.frame.contentWindow.document.body.scrollHeight) {
          height = scrollHeight =
            this.frame.contentWindow.document.body.scrollHeight;
        }
        if (this.frame.contentWindow.document.body.offsetHeight) {
          height = offsetHeight =
            this.frame.contentWindow.document.body.offsetHeight;
        }
      } else if (this.frame.contentWindow.document.body) {
        if (this.frame.contentWindow.document.body.offsetHeight) {
          height = offsetHeight =
            this.frame.contentWindow.document.body.offsetHeight;
        }
        var formWrapper =
          this.frame.contentWindow.document.querySelector(".form-all");
        var margin = parseInt(getComputedStyle(formWrapper).marginTop, 10);
        if (!isNaN(margin)) {
          height += margin;
        }
      }
    } catch (e) {}
    this.frameHeight = height;
    return height;
  };
  this.getViewPortHeight = function () {
    if (this.formSubmitted === 1) {
      return;
    }
    var height = 0;
    try {
      if (this.frame.contentWindow.window.innerHeight) {
        height = this.frame.contentWindow.window.innerHeight - 18;
      } else if (
        this.frame.contentWindow.document.documentElement &&
        this.frame.contentWindow.document.documentElement.clientHeight
      ) {
        height = this.frame.contentWindow.document.documentElement.clientHeight;
      } else if (
        this.frame.contentWindow.document.body &&
        this.frame.contentWindow.document.body.clientHeight
      ) {
        height = this.frame.contentWindow.document.body.clientHeight;
      }
    } catch (e) {}
    return height;
  };
  this.getMD5 = function (s) {
    function L(k, d) {
      return (k << d) | (k >>> (32 - d));
    }
    function K(G, k) {
      var I, d, F, H, x;
      F = G & 2147483648;
      H = k & 2147483648;
      I = G & 1073741824;
      d = k & 1073741824;
      x = (G & 1073741823) + (k & 1073741823);
      if (I & d) {
        return x ^ 2147483648 ^ F ^ H;
      }
      if (I | d) {
        if (x & 1073741824) {
          return x ^ 3221225472 ^ F ^ H;
        } else {
          return x ^ 1073741824 ^ F ^ H;
        }
      } else {
        return x ^ F ^ H;
      }
    }
    function r(d, F, k) {
      return (d & F) | (~d & k);
    }
    function q(d, F, k) {
      return (d & k) | (F & ~k);
    }
    function p(d, F, k) {
      return d ^ F ^ k;
    }
    function n(d, F, k) {
      return F ^ (d | ~k);
    }
    function u(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(r(F, aa, Z), k), I));
      return K(L(G, H), F);
    }
    function f(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(q(F, aa, Z), k), I));
      return K(L(G, H), F);
    }
    function D(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(p(F, aa, Z), k), I));
      return K(L(G, H), F);
    }
    function t(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(n(F, aa, Z), k), I));
      return K(L(G, H), F);
    }
    function e(G) {
      var Z;
      var F = G.length;
      var x = F + 8;
      var k = (x - (x % 64)) / 64;
      var I = (k + 1) * 16;
      var aa = Array(I - 1);
      var d = 0;
      var H = 0;
      while (H < F) {
        Z = (H - (H % 4)) / 4;
        d = (H % 4) * 8;
        aa[Z] = aa[Z] | (G.charCodeAt(H) << d);
        H++;
      }
      Z = (H - (H % 4)) / 4;
      d = (H % 4) * 8;
      aa[Z] = aa[Z] | (128 << d);
      aa[I - 2] = F << 3;
      aa[I - 1] = F >>> 29;
      return aa;
    }
    function B(x) {
      var k = "",
        F = "",
        G,
        d;
      for (d = 0; d <= 3; d++) {
        G = (x >>> (d * 8)) & 255;
        F = "0" + G.toString(16);
        k = k + F.substr(F.length - 2, 2);
      }
      return k;
    }
    function J(k) {
      k = k.replace(/rn/g, "n");
      var d = "";
      for (var F = 0; F < k.length; F++) {
        var x = k.charCodeAt(F);
        if (x < 128) {
          d += String.fromCharCode(x);
        } else {
          if (x > 127 && x < 2048) {
            d += String.fromCharCode((x >> 6) | 192);
            d += String.fromCharCode((x & 63) | 128);
          } else {
            d += String.fromCharCode((x >> 12) | 224);
            d += String.fromCharCode(((x >> 6) & 63) | 128);
            d += String.fromCharCode((x & 63) | 128);
          }
        }
      }
      return d;
    }
    var C = Array();
    var P, h, E, v, g, Y, X, W, V;
    var S = 7,
      Q = 12,
      N = 17,
      M = 22;
    var A = 5,
      z = 9,
      y = 14,
      w = 20;
    var o = 4,
      m = 11,
      l = 16,
      j = 23;
    var U = 6,
      T = 10,
      R = 15,
      O = 21;
    s = J(s);
    C = e(s);
    Y = 1732584193;
    X = 4023233417;
    W = 2562383102;
    V = 271733878;
    for (P = 0; P < C.length; P += 16) {
      h = Y;
      E = X;
      v = W;
      g = V;
      Y = u(Y, X, W, V, C[P + 0], S, 3614090360);
      V = u(V, Y, X, W, C[P + 1], Q, 3905402710);
      W = u(W, V, Y, X, C[P + 2], N, 606105819);
      X = u(X, W, V, Y, C[P + 3], M, 3250441966);
      Y = u(Y, X, W, V, C[P + 4], S, 4118548399);
      V = u(V, Y, X, W, C[P + 5], Q, 1200080426);
      W = u(W, V, Y, X, C[P + 6], N, 2821735955);
      X = u(X, W, V, Y, C[P + 7], M, 4249261313);
      Y = u(Y, X, W, V, C[P + 8], S, 1770035416);
      V = u(V, Y, X, W, C[P + 9], Q, 2336552879);
      W = u(W, V, Y, X, C[P + 10], N, 4294925233);
      X = u(X, W, V, Y, C[P + 11], M, 2304563134);
      Y = u(Y, X, W, V, C[P + 12], S, 1804603682);
      V = u(V, Y, X, W, C[P + 13], Q, 4254626195);
      W = u(W, V, Y, X, C[P + 14], N, 2792965006);
      X = u(X, W, V, Y, C[P + 15], M, 1236535329);
      Y = f(Y, X, W, V, C[P + 1], A, 4129170786);
      V = f(V, Y, X, W, C[P + 6], z, 3225465664);
      W = f(W, V, Y, X, C[P + 11], y, 643717713);
      X = f(X, W, V, Y, C[P + 0], w, 3921069994);
      Y = f(Y, X, W, V, C[P + 5], A, 3593408605);
      V = f(V, Y, X, W, C[P + 10], z, 38016083);
      W = f(W, V, Y, X, C[P + 15], y, 3634488961);
      X = f(X, W, V, Y, C[P + 4], w, 3889429448);
      Y = f(Y, X, W, V, C[P + 9], A, 568446438);
      V = f(V, Y, X, W, C[P + 14], z, 3275163606);
      W = f(W, V, Y, X, C[P + 3], y, 4107603335);
      X = f(X, W, V, Y, C[P + 8], w, 1163531501);
      Y = f(Y, X, W, V, C[P + 13], A, 2850285829);
      V = f(V, Y, X, W, C[P + 2], z, 4243563512);
      W = f(W, V, Y, X, C[P + 7], y, 1735328473);
      X = f(X, W, V, Y, C[P + 12], w, 2368359562);
      Y = D(Y, X, W, V, C[P + 5], o, 4294588738);
      V = D(V, Y, X, W, C[P + 8], m, 2272392833);
      W = D(W, V, Y, X, C[P + 11], l, 1839030562);
      X = D(X, W, V, Y, C[P + 14], j, 4259657740);
      Y = D(Y, X, W, V, C[P + 1], o, 2763975236);
      V = D(V, Y, X, W, C[P + 4], m, 1272893353);
      W = D(W, V, Y, X, C[P + 7], l, 4139469664);
      X = D(X, W, V, Y, C[P + 10], j, 3200236656);
      Y = D(Y, X, W, V, C[P + 13], o, 681279174);
      V = D(V, Y, X, W, C[P + 0], m, 3936430074);
      W = D(W, V, Y, X, C[P + 3], l, 3572445317);
      X = D(X, W, V, Y, C[P + 6], j, 76029189);
      Y = D(Y, X, W, V, C[P + 9], o, 3654602809);
      V = D(V, Y, X, W, C[P + 12], m, 3873151461);
      W = D(W, V, Y, X, C[P + 15], l, 530742520);
      X = D(X, W, V, Y, C[P + 2], j, 3299628645);
      Y = t(Y, X, W, V, C[P + 0], U, 4096336452);
      V = t(V, Y, X, W, C[P + 7], T, 1126891415);
      W = t(W, V, Y, X, C[P + 14], R, 2878612391);
      X = t(X, W, V, Y, C[P + 5], O, 4237533241);
      Y = t(Y, X, W, V, C[P + 12], U, 1700485571);
      V = t(V, Y, X, W, C[P + 3], T, 2399980690);
      W = t(W, V, Y, X, C[P + 10], R, 4293915773);
      X = t(X, W, V, Y, C[P + 1], O, 2240044497);
      Y = t(Y, X, W, V, C[P + 8], U, 1873313359);
      V = t(V, Y, X, W, C[P + 15], T, 4264355552);
      W = t(W, V, Y, X, C[P + 6], R, 2734768916);
      X = t(X, W, V, Y, C[P + 13], O, 1309151649);
      Y = t(Y, X, W, V, C[P + 4], U, 4149444226);
      V = t(V, Y, X, W, C[P + 11], T, 3174756917);
      W = t(W, V, Y, X, C[P + 2], R, 718787259);
      X = t(X, W, V, Y, C[P + 9], O, 3951481745);
      Y = K(Y, h);
      X = K(X, E);
      W = K(W, v);
      V = K(V, g);
    }
    var i = B(Y) + B(X) + B(W) + B(V);
    return i.toLowerCase();
  };
  this.init();
}
FrameBuilder.get = qsProxy || [];
var i223443440392552 = new FrameBuilder(
  "223443440392552",
  false,
  "",
  '<html lang="fr"><head><title>COLLABORONS</title><link rel="canonical" href="https://form.jotform.com/223443440392552"/><link rel="alternate" type="application/json+oembed" href="https://www.jotform.com/oembed/?format=json&amp;url=http://www.jotform.com/form/223443440392552" title="oEmbed Form"/><link rel="alternate" type="text/xml+oembed" href="https://www.jotform.com/oembed/?format=xml&amp;url=http://www.jotform.com/form/&#x27;223443440392552" title="oEmbed Form"/><meta property="og:title" content="COLLABORONS"/><meta property="og:url" content="http://www.jotform.com/form/223443440392552"/><meta property="og:description" content="Please click the link to complete this form."/><meta property="og:image" content="https://www.jotform.com/resources/assets/icon/jotform-icon-dark-400x400.png?v=1"/><meta name="slack-app-id" content="AHNMASS8M"/><link rel="preload" href="https://cdn.jotfor.ms/stylebuilder/default.css?4.2" as="style"/><link rel="preload" href="https://cdn.jotfor.ms/stylebuilder/223443440392552.css?themeID=5966322fcf3bfe329d776651&amp;smartEmbed=1" as="style"/><link id="default-css" type="text/css" rel="stylesheet" href="https://cdn.jotfor.ms/stylebuilder/default.css?4.2"/><link id="form-css" type="text/css" rel="stylesheet" href="https://cdn.jotfor.ms/stylebuilder/223443440392552.css?themeID=5966322fcf3bfe329d776651&amp;smartEmbed=1"/><link type="text/css" rel="stylesheet" media="all" href="https://cdn.jotfor.ms/wizards/languageWizard/custom-dropdown/css/lang-dd.css"/><style>\n        body { overflow: hidden; }\n        body ul,\n        body ol { list-style: none; }\n        body { opacity: 0; }\n      </style><link rel="shortcut icon" href="https://cdn.jotfor.ms/assets/img/favicons/favicon-2021.svg"/><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/><meta http-equiv="Content-Type" content="text/html; charset=utf-8"/><script src="https://browser.sentry-cdn.com/5.12.1/bundle.min.js" integrity="sha384-y+an4eARFKvjzOivf/Z7JtMJhaN6b+lLQ5oFbBbUwZNNVir39cYtkjW1r6Xjbxg3" crossorigin="anonymous"></script><script>window.FORM_MODE = "cardform";</script></head><body class="jfCardForm notLoaded isSmartEmbed cf-minimal welcomeMode"><div class="js-pressEnterHint isHidden" style="color:white;position:absolute;z-index:1;bottom:29.5%;left:37.2%;display:none">You can always press Enter\u23ce to continue</div><div id="fullscreen-toggle" class="jfForm-fullscreen"></div><div id="jfQuestion-proxy" class="forFullScreen"></div><div>\n        <script src="https://cdn01.jotfor.ms/static/prototype.forms.js?3.3.37920" type="text/javascript"></script>\n<script src="https://cdn02.jotfor.ms/static/jotform.forms.js?3.3.37920" type="text/javascript"></script>\n<script defer src="https://cdnjs.cloudflare.com/ajax/libs/punycode/1.4.1/punycode.js"></script>\n<script type="text/javascript">\tJotForm.newDefaultTheme = false;\n\tJotForm.extendsNewTheme = false;\n\tJotForm.singleProduct = false;\n\tJotForm.newPaymentUIForNewCreatedForms = false;\n\n var jsTime = setInterval(function(){try{\n   JotForm.jsForm = true;\n\n   if (window.CardForm) { window.CardForm.jsForm = true; } \n\n   JotForm.setConditions([{"action":[{"field":"9","visibility":"Show","id":"action_0_1579704830003"}],"id":"1579704830003","index":"0","link":"Any","priority":"0","terms":[{"field":"8","operator":"equals","value":"Other (Please specify...)"}],"type":"field"}]);\tJotForm.clearFieldOnHide="disable";\n\n\tJotForm.init(function(){\n\t/*INIT-START*/\n      JotForm.alterTexts({"ageVerificationError":"Vous devez avoir plus de {Ageminimum} ans pour envoyer ce formulaire.","alphabetic":"Ce champ ne peut contenir que des lettres","alphanumeric":"Ce champ ne peut contenir que des lettres et des chiffres.","appointmentSelected":"Vous avez s\u00e9lectionn\u00e9 {time} le {date}","ccDonationMinLimitError":"Le montant minimum est de {minAmount} {currency}","ccInvalidCVC":"Le num\u00e9ro CVC est invalide.","ccInvalidExpireDate":"La date d\'expiration est invalide.","ccInvalidExpireMonth":"Expiration month is invalid.","ccInvalidExpireYear":"Expiration year is invalid.","ccInvalidNumber":"Le num\u00e9ro de la carte bancaire est invalide.","ccMissingDetails":"Please fill up the credit card details.","ccMissingDonation":"Veuillez saisir des valeurs num\u00e9riques pour le montant des dons.","ccMissingProduct":"Veuillez s\u00e9lectionner au moins un produit.","characterLimitError":"Trop de caract\u00e8res. La limite est de","characterMinLimitError":"Nombre de caract\u00e8res insuffisant. Le nombre minimum est de","confirmClearForm":"\u00cates-vous certain de vouloir supprimer les inscriptions de ce formulaire ?","confirmEmail":"L\'adresse e-mail ne correspond pas","currency":"Ce champ ne peut contenir que des valeurs mon\u00e9taires.","cyrillic":"Ce champ ne peut contenir que des caract\u00e8res cyrilliques","dateInvalid":"Ce format de date n\'est pas valide. Le format de la date est {format}","dateInvalidSeparate":"Cette date n\'est pas valide. Veuillez saisir une date valide {element}.","dateLimited":"Cette date est indisponible.","disallowDecimals":"Veuillez entrer un nombre entier.","doneButton":"Termin\u00e9","doneMessage":"Bien jou\u00e9 ! Toutes les erreurs sont r\u00e9solues.","dragAndDropFilesHere_infoMessage":"Glissez-d\u00e9posez des fichiers ici","email":"Saisir une adresse courriel valide","fillMask":"La valeur du champ doit remplir le masque.","freeEmailError":"Les comptes e-mail gratuits ne sont pas autoris\u00e9s","generalError":"Ce formulaire contient des erreurs. Veuillez les corriger avant de continuer.","generalPageError":"Cette page contient des erreurs. Veuillez les corriger avant de continuer.","geoNotAvailableDesc":"Location provider not available. Please enter the address manually.","geoNotAvailableTitle":"Position Unavailable","geoPermissionDesc":"Check your browser\'s privacy settings.","geoPermissionTitle":"Permission Denied","geoTimeoutDesc":"Please check your internet connection and try again.","geoTimeoutTitle":"Timeout","gradingScoreError":"Le score total devrais \u00eatre moins ou \u00e9gal \u00e0","incompleteFields":"Des champs obligatoires ne sont pas remplis. Veuillez les compl\u00e9ter.","inputCarretErrorA":"Le nombre saisi ne peut pas \u00eatre inf\u00e9rieur \u00e0 la valeur minimum :","inputCarretErrorB":"Vous ne pouvez pas saisir une valeur sup\u00e9rieure \u00e0 la valeur maximum :","justSoldOut":"Tout juste \u00e9puis\u00e9","lessThan":"Votre note doit \u00eatre inf\u00e9rieure ou \u00e9gale \u00e0","maxDigitsError":"Le nombre de chiffres maximum autoris\u00e9 est de","maxFileSize_infoMessage":"Taille de fichier max.","maxSelectionsError":"The maximum number of selections allowed is ","minCharactersError":"Le nombre de caract\u00e8res ne doit pas \u00eatre inf\u00e9rieur \u00e0 :","minSelectionsError":"Le nombre minimum requis de s\u00e9lections est de","multipleError":"Il y a {count} erreurs dans cette page. Veuillez les corriger avant de continuer.","multipleFileUploads_emptyError":"{file} est vide, veuillez s\u00e9lectionner \u00e0 nouveau les fichiers sans celui-ci.","multipleFileUploads_fileLimitError":"Seuls {fileLimit} t\u00e9l\u00e9chargements de fichiers sont autoris\u00e9s.","multipleFileUploads_minSizeError":"{file} est trop petite, la taille de fichier minimale est {minSizeLimit}.","multipleFileUploads_onLeave":"Les fichiers sont en cours de t\u00e9l\u00e9chargement, si vous quittez maintenant le t\u00e9l\u00e9chargement sera annul\u00e9.","multipleFileUploads_sizeError":"{file} est trop volumineux, la taille maximale d\'un fichier est de {sizeLimit}.","multipleFileUploads_typeError":"L\'extension de {file} est invalide. Seules les extensions {extensions} sont autoris\u00e9es.","multipleFileUploads_uploadFailed":"File upload failed, please remove it and upload the file again.","nextButtonText":"ENVOY\u00c9","noSlotsAvailable":"Aucun emplacement disponible","notEnoughStock":"Pas assez de stock pour la s\u00e9lection actuelle","notEnoughStock_remainedItems":"Pas assez de stock pour la s\u00e9lection actuelle ({count} articles restants)","noUploadExtensions":"File has no extension file type (e.g. .txt, .png, .jpeg)","numeric":"Ce champ ne peut contenir que des valeurs num\u00e9riques","oneError":"Il y a {count} erreur dans cette page. Veuillez la corriger avant de continuer.","pastDatesDisallowed":"La date ne doit pas se situer dans le pass\u00e9.","pleaseWait":"Veuillez patienter.","prevButtonText":"Precedent","required":"Ce champ est obligatoire.","requiredLegend":"Tous les champs marqu\u00e9s d\'un * sont obligatoires et doivent \u00eatre remplis.","requireEveryCell":"Toutes les cellules sont n\u00e9cessaires.","requireEveryRow":"Chaque ligne est obligatoire.","requireOne":"Au moins un champ est requis","restrictedDomain":"This domain is not allowed","seeErrorsButton":"Voir les erreurs","selectionSoldOut":"S\u00e9lection \u00e9puis\u00e9e","slotUnavailable":"{time} on {date} has been selected is unavailable. Please select another slot.","soldOut":"Epuis\u00e9","submitButtonText":"ENVOY\u00c9","subProductItemsLeft":"({count} articles restants)","uploadExtensions":"Vous ne pouvez uploader que les fichiers suivants :","uploadFilesize":"La taille du fichier ne peut pas d\u00e9passer :","uploadFilesizemin":"la taille du fichier ne peut pas \u00eatre inf\u00e9rieure \u00e0 :","url":"Ce champ peut uniquement contenir une URL valide","validateEmail":"You need to validate this e-mail","wordLimitError":"Trop de mots. Le nombre max. de mots est de","wordMinLimitError":"Nombre de mots insuffisants. Le minimum est de"});\n      FormTranslation.init({"detectUserLanguage":"1","firstPageOnly":"0","options":"Fran\u00e7ais|English (US)","originalLanguage":"fr","primaryLanguage":"fr","saveUserLanguage":"1","showStatus":"flag-with-nation","theme":"light-theme","version":"2"});\n\t\n        \n        \n\t});\n\n   clearInterval(jsTime);\n }catch(e){}}, 1000);\n\n   JotForm.prepareCalculationsOnTheFly([null,{"name":"culturePay","qid":"1","text":"Donnez une vie digitale a vos idee ou projet !","type":"control_head"},null,null,null,null,{"name":"email6","qid":"6","text":"E-mail","type":"control_email"},null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,{"name":"saisissezUne","qid":"23","text":"Avez-vous une structure ?","type":"control_radio"},null,null,null,null,{"name":"name28","qid":"28","text":"Comment nous avez-vous decouvert ?","type":"control_checkbox"},null,{"name":"saisissezUne30","qid":"30","text":"\u00a0A partir de quand souhaitez-vous commencer notre collaboration ?\u00a0","type":"control_textbox"},null,{"name":"name32","qid":"32","text":"Pour quel type de projet souhaitez-vous nous solliciter ?","type":"control_checkbox"},{"description":"","name":"saisissezUne33","qid":"33","text":"Prenoms et Nom","type":"control_textbox"},null,{"description":"Merci d\'indiquer un budget en \u20ac","name":"A","qid":"35","text":"Quel est votre budget ?\u00a0","type":"control_number"},null,{"name":"aPartir","qid":"37","text":"Pourquoi souhaitez-vous travailler avec Nous ?","type":"control_textbox"}]);\n   setTimeout(function() {\nJotForm.paymentExtrasOnTheFly([null,{"name":"culturePay","qid":"1","text":"Donnez une vie digitale a vos idee ou projet !","type":"control_head"},null,null,null,null,{"name":"email6","qid":"6","text":"E-mail","type":"control_email"},null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,{"name":"saisissezUne","qid":"23","text":"Avez-vous une structure ?","type":"control_radio"},null,null,null,null,{"name":"name28","qid":"28","text":"Comment nous avez-vous decouvert ?","type":"control_checkbox"},null,{"name":"saisissezUne30","qid":"30","text":"\u00a0A partir de quand souhaitez-vous commencer notre collaboration ?\u00a0","type":"control_textbox"},null,{"name":"name32","qid":"32","text":"Pour quel type de projet souhaitez-vous nous solliciter ?","type":"control_checkbox"},{"description":"","name":"saisissezUne33","qid":"33","text":"Prenoms et Nom","type":"control_textbox"},null,{"description":"Merci d\'indiquer un budget en \u20ac","name":"A","qid":"35","text":"Quel est votre budget ?\u00a0","type":"control_number"},null,{"name":"aPartir","qid":"37","text":"Pourquoi souhaitez-vous travailler avec Nous ?","type":"control_textbox"}]);}, 20); \n</script>\n\n      </div><div class="formFooter"><div class="formFooter-wrapper formFooter-leftSide"><a href="https://www.jotform.com/cards/?utm_source=formfooter&amp;utm_medium=banner&amp;utm_term=223443440392552&amp;utm_content=jotform_logo&amp;utm_campaign=powered_by_jotform_cf" target="_blank" class="formFooter-logoLink"><img class="formFooter-logo" alt="JotForm Logo" src="https://cdn.jotfor.ms/assets/img/logo2021/jotform-logo-white.svg"/></a></div><div class="formFooter-wrapper formFooter-rightSide"><span class="formFooter-text">Now create your own Jotform - It&#x27;s free!</span><a class="formFooter-button" href="https://www.jotform.com/cards/?utm_source=formfooter&amp;utm_medium=banner&amp;utm_term=223443440392552&amp;utm_content=jotform_button&amp;utm_campaign=powered_by_jotform_cf" target="_blank">Create your own Jotform</a></div></div><div class="jfForm-wrapper"><div class="jfForm-backgroundContainer"></div><div class="jfForm-backgroundUnderlay"></div><div class="jfForm-backgroundOverlay"></div><div class="jfForm-background"><div class="jfForm-background-mask"></div></div><div class="jfWelcome-wrapper" role="banner"><div class="jfWelcome"><div class="jfWelcome-imageWrapper"><div class="jfWelcome-image" role="img" aria-label="COLLABORONS"><span class="iconSvg iconSvgFill "><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path data-name="users" d="M7.5 12A5.5 5.5 0 102 6.5 5.506 5.506 0 007.5 12zm9.5 0a5 5 0 10-2.9-9.058 7.483 7.483 0 01-.407 7.78A4.959 4.959 0 0017 12zm-.5 2a10.408 10.408 0 00-1.45.1A6.554 6.554 0 0118 19.375V23h6v-3.625C24 16.411 20.636 14 16.5 14zM8 14c-4.411 0-8 2.411-8 5.375V23h16v-3.625C16 16.411 12.412 14 8 14z"></path></svg></span></div></div><div id="header_welcomePage" class="jfWelcome-header form-header" data-component="header" style="opacity:1">COLLABORONS</div><div id="subHeader_welcomePage" class="jfWelcome-description form-subHeader">Dans l&#x27;optique de cibler au mieux vos besoins et vos attentes, nous vous remercions de bien vouloir nous accorder quelques minutes pour renseigner ce questionnaire. Il nous permettra un gain de temps pr\u00e9cieux et la certitude de pouvoir vous proposer des r\u00e9ponses adapt\u00e9es.\u00a0</div><div class="jfWelcome-sectionInfo"><span class="jfWelcome-sectionInfo-questionCount"></span><span class="jfWelcome-sectionInfo-text"></span></div><div class="jfWelcome-buttonWrapper"><button class="jfWelcome-button" id="jfCard-welcome-previous" style="display:none"></button></div><div class="jfWelcome-buttonWrapper"><button class="jfWelcome-button" id="jfCard-welcome-start" style="display:inline">START</button></div></div></div><div class="jfForm-logo" role="img" aria-hidden="true"><span class="iconSvg iconSvgFill "><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path data-name="users" d="M7.5 12A5.5 5.5 0 102 6.5 5.506 5.506 0 007.5 12zm9.5 0a5 5 0 10-2.9-9.058 7.483 7.483 0 01-.407 7.78A4.959 4.959 0 0017 12zm-.5 2a10.408 10.408 0 00-1.45.1A6.554 6.554 0 0118 19.375V23h6v-3.625C24 16.411 20.636 14 16.5 14zM8 14c-4.411 0-8 2.411-8 5.375V23h16v-3.625C16 16.411 12.412 14 8 14z"></path></svg></span></div><form role="main" class="jotform-form" id="223443440392552" name="form_223443440392552" action="https://submit.jotform.co/submit/223443440392552/" method="post" autoComplete="on"><input type="hidden" name="formID" value="223443440392552"/><div class="jfTranslation"><input type="text" class="jfTranslation-input" id="input_language" name="input_language" style="display:none"/><div class="jfTranslation-dropdown language-dd" id="langDd" style="display:none"><div class="jfTranslation-placeholder dd-placeholder lang-emp">Language</div><ul class="jfTranslation-list lang-list dn" id="langList"><li data-lang="fr" class="fr">Fran\u00e7ais</li><li data-lang="en" class="en">English (US)</li></ul></div></div><ul class="jfForm-all form-section page-section form-all" id="cardAnimationWrapper"><li class="form-line" data-type="control_textbox" id="id_33"><div id="cid_33" class="jfCard-wrapper"><div class="jfCard" data-type="control_textbox"><div class="jfCard-index"><div>1</div></div><div class="jfCard-question"><div class="jfQuestion-fullscreen isHidden" aria-hidden="true" role="button" aria-label="fullscreen mode" tabindex="-1"></div><label for="input_33" class="jfQuestion-label isLeftAlign" id="label_33"><span class="jsQuestionLabelContainer jfQuestionLabelContainer">Pr\u00e9noms et Nom</span></label><span class="jfQuestion-description" id="input_33_description"><span></span></span><div class="jfCard-mobileError jsMobileErrorWrapper"></div><div class="jfQuestion-fields"><div class="jfField" data-type="textbox"><input type="text" id="input_33" name="q33_saisissezUne33" data-type="input-textbox" class="form-textbox jfInput-input" size="20" value="" data-component="textbox" aria-required="false" aria-describedby="input_33_description" aria-labelledby="label_33"/><label class="jfField-sublabel " for="input_33"></label></div></div></div><div class="jfCard-actions"><button style="display:none" type="button" class="jfInput-button forPrev u-left" data-component="button" aria-label="Precedent">Precedent</button><button style="display:block" type="button" class="jfInput-button forNext u-right" data-component="button" aria-label="ENVOY\u00c9">ENVOY\u00c9</button><button style="display:none" type="submit" class="jfInput-button forSubmit form-submit-button u-right" data-component="button" aria-label="ENVOY\u00c9">ENVOY\u00c9</button><div class="cf"><div class="jfCard-actionsNotification" aria-live="polite"><div class="jfPressEnter isHidden" aria-hidden="true">Press<br/>Enter</div></div></div><div class="jfCard-disableSubmitError"></div></div></div></div></li><li class="form-line" data-type="control_email" id="id_6"><div id="cid_6" class="jfCard-wrapper"><div class="jfCard" data-type="control_email"><div class="jfCard-index"><div>2</div></div><div class="jfCard-question"><div class="jfQuestion-fullscreen isHidden" aria-hidden="true" role="button" aria-label="fullscreen mode" tabindex="-1"></div><label for="input_6" class="jfQuestion-label isLeftAlign" id="label_6"><span class="jsQuestionLabelContainer jfQuestionLabelContainer">E-mail</span><span class="jfRequiredStar">* <span class="jfRequiredStar-message">Ce champ est obligatoire.</span></span></label><span class="jfQuestion-description" id="input_6_description"><span></span></span><div class="jfCard-mobileError jsMobileErrorWrapper"></div><div class="jfQuestion-fields questionMode"><div class="jfField" data-type="email"><input type="email" id="input_6" name="q6_email6" class="form-textbox validate[required, Email] forEmail jfInput-input" autoComplete="email" size="30" value="" placeholder="ex: email@yahoo.com" data-component="email" required="" aria-required="true" aria-describedby="input_6_description"/><label class="jfField-sublabel " for="input_6"></label><div class="jfCardTooltip js-tooltipContainer"><div class="js-tooltipMessageContainer-info"></div><div class="js-tooltipMessageContainer-error"></div><div class="jfCardTooltip-close js-tooltipCloseButton"><span class="iconSvg  "><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 326 326"><g data-name="Layer 2"><g data-name="Layer 1"><path class="icon_error_svg__fail-outer" d="M163 0C73.12 0 0 73.12 0 163s73.12 163 163 163 163-73.12 163-163S252.88 0 163 0z"></path><path class="icon_error_svg__fail-inner" d="M227.6 98.4a14.75 14.75 0 00-20.86 0L163 142.14 119.26 98.4a14.75 14.75 0 10-20.86 20.86L142.14 163 98.4 206.74a14.75 14.75 0 1020.86 20.86L163 183.86l43.74 43.74a14.75 14.75 0 1020.86-20.86L183.86 163l43.74-43.74a14.75 14.75 0 000-20.86z"></path></g></g></svg></span></div></div></div><div class="jfEmailVerify-loading"><span class="loadingDot"></span><span class="loadingDot isD2"></span><span class="loadingDot isD3"></span></div></div></div><div class="jfCard-actions"><button style="display:block" type="button" class="jfInput-button forPrev u-left" data-component="button" aria-label="Precedent">Precedent</button><button style="display:block" type="button" class="jfInput-button forNext u-right" data-component="button" aria-label="ENVOY\u00c9">ENVOY\u00c9</button><button style="display:none" type="submit" class="jfInput-button forSubmit form-submit-button u-right" data-component="button" aria-label="ENVOY\u00c9">ENVOY\u00c9</button><div class="cf"><div class="jfCard-actionsNotification" aria-live="polite"><div class="jfPressEnter isHidden" aria-hidden="true">Press<br/>Enter</div></div></div><div class="jfCard-disableSubmitError"></div></div></div></div></li><li class="form-line" data-type="control_checkbox" id="id_32"><div id="cid_32" class="jfCard-wrapper"><div class="jfCard" data-type="control_checkbox"><div class="jfCard-index"><div>3</div></div><div class="jfCard-question"><div class="jfQuestion-fullscreen isHidden" aria-hidden="true" role="button" aria-label="fullscreen mode" tabindex="-1"></div><label for="input_group_32" class="jfQuestion-label isLeftAlign" id="label_32"><span class="jsQuestionLabelContainer jfQuestionLabelContainer"><strong>Pour quel type de projet souhaitez-vous nous solliciter ?</strong></span><span class="jfRequiredStar">* <span class="jfRequiredStar-message">Ce champ est obligatoire.</span></span></label><span class="jfQuestion-description" id="input_32_description"><span></span></span><div class="jfCard-mobileError jsMobileErrorWrapper"></div><div role="group" id="input_group_32" class="jfQuestion-fields form-multiple-column" data-columncount="2" data-component="checkbox"><div class="jfField form-checkbox-item"><label data-id="label_input_32_0" class="jfCheckbox withoutImage"><input type="checkbox" class="jfCheckbox-input form-checkbox validate[required]" name="q32_name32[]" value="Projet web" id="input_32_0" required="" aria-describedby="label_32"/><div class="jfCheckbox-label"><span class="jfCheckbox-customInput"><span class="jfCheckbox-customInputIcon"></span></span><img class="jfCheckbox-visual" alt="Checkbox" loading="lazy"/><span class="jfCheckbox-labelText">Projet web</span></div></label></div><div class="jfField form-checkbox-item"><label data-id="label_input_32_1" class="jfCheckbox withoutImage"><input type="checkbox" class="jfCheckbox-input form-checkbox validate[required]" name="q32_name32[]" value="Projet mobile" id="input_32_1" required="" aria-describedby="label_32"/><div class="jfCheckbox-label"><span class="jfCheckbox-customInput"><span class="jfCheckbox-customInputIcon"></span></span><img class="jfCheckbox-visual" alt="Checkbox" loading="lazy"/><span class="jfCheckbox-labelText">Projet mobile</span></div></label></div><div class="jfField jfField-lastRowItem form-checkbox-item"><label data-id="label_input_32_2" class="jfCheckbox withoutImage"><input type="checkbox" class="jfCheckbox-input form-checkbox validate[required]" name="q32_name32[]" value="Maquette" id="input_32_2" required="" aria-describedby="label_32"/><div class="jfCheckbox-label"><span class="jfCheckbox-customInput"><span class="jfCheckbox-customInputIcon"></span></span><img class="jfCheckbox-visual" alt="Checkbox" loading="lazy"/><span class="jfCheckbox-labelText">Maquette</span></div></label></div><div class="jfField jfField-lastRowItem form-checkbox-item"><label data-id="label_input_32_3" class="jfCheckbox withoutImage"><input type="checkbox" class="jfCheckbox-input form-checkbox validate[required]" name="q32_name32[]" value="Autre" id="input_32_3" required="" aria-describedby="label_32"/><div class="jfCheckbox-label"><span class="jfCheckbox-customInput"><span class="jfCheckbox-customInputIcon"></span></span><img class="jfCheckbox-visual" alt="Checkbox" loading="lazy"/><span class="jfCheckbox-labelText">Autre</span></div></label></div></div></div><div class="jfCard-actions"><button style="display:block" type="button" class="jfInput-button forPrev u-left" data-component="button" aria-label="Precedent">Precedent</button><button style="display:block" type="button" class="jfInput-button forNext u-right" data-component="button" aria-label="ENVOY\u00c9">ENVOY\u00c9</button><button style="display:none" type="submit" class="jfInput-button forSubmit form-submit-button u-right" data-component="button" aria-label="ENVOY\u00c9">ENVOY\u00c9</button><div class="cf"><div class="jfCard-actionsNotification" aria-live="polite"><div class="jfPressEnter isHidden" aria-hidden="true">Press<br/>Enter</div></div></div><div class="jfCard-disableSubmitError"></div></div></div></div></li><li class="form-line" data-type="control_radio" id="id_23"><div id="cid_23" class="jfCard-wrapper"><div class="jfCard" data-type="control_radio"><div class="jfCard-index"><div>4</div></div><div class="jfCard-question"><div class="jfQuestion-fullscreen isHidden" aria-hidden="true" role="button" aria-label="fullscreen mode" tabindex="-1"></div><label for="input_group_23" class="jfQuestion-label isLeftAlign" id="label_23"><span class="jsQuestionLabelContainer jfQuestionLabelContainer"><strong>Avez-vous une structure ?</strong></span><span class="jfRequiredStar">* <span class="jfRequiredStar-message">Ce champ est obligatoire.</span></span></label><span class="jfQuestion-description" id="input_23_description"><span></span></span><div class="jfCard-mobileError jsMobileErrorWrapper"></div><div role="group" id="input_group_23" class="jfQuestion-fields form-multiple-column" data-columncount="3" data-component="radio"><div class="jfField jfField-lastRowItem form-radio-item"><label data-id="label_input_23_0" class="jfRadio withoutImage"><input type="radio" class="jfRadio-input form-radio validate[required]" name="q23_saisissezUne" value="Association" id="input_23_0" required="" aria-describedby="label_23"/><div class="jfRadio-label"><span class="jfRadio-customInput"><span class="jfRadio-customInputIcon"></span></span><img class="jfRadio-visual" alt="Radio" loading="lazy"/><span class="jfRadio-labelText">Association</span></div></label></div><div class="jfField jfField-lastRowItem form-radio-item"><label data-id="label_input_23_1" class="jfRadio withoutImage"><input type="radio" class="jfRadio-input form-radio validate[required]" name="q23_saisissezUne" value="Soci\u00e9t\u00e9" id="input_23_1" required="" aria-describedby="label_23"/><div class="jfRadio-label"><span class="jfRadio-customInput"><span class="jfRadio-customInputIcon"></span></span><img class="jfRadio-visual" alt="Radio" loading="lazy"/><span class="jfRadio-labelText">Soci\u00e9t\u00e9</span></div></label></div><div class="jfField jfField-lastRowItem form-radio-item"><label data-id="label_input_23_2" class="jfRadio withoutImage"><input type="radio" class="jfRadio-input form-radio validate[required]" name="q23_saisissezUne" value="Pas encore" id="input_23_2" required="" aria-describedby="label_23"/><div class="jfRadio-label"><span class="jfRadio-customInput"><span class="jfRadio-customInputIcon"></span></span><img class="jfRadio-visual" alt="Radio" loading="lazy"/><span class="jfRadio-labelText">Pas encore</span></div></label></div></div></div><div class="jfCard-actions"><button style="display:block" type="button" class="jfInput-button forPrev u-left" data-component="button" aria-label="Precedent">Precedent</button><button style="display:block" type="button" class="jfInput-button forNext u-right" data-component="button" aria-label="ENVOY\u00c9">ENVOY\u00c9</button><button style="display:none" type="submit" class="jfInput-button forSubmit form-submit-button u-right" data-component="button" aria-label="ENVOY\u00c9">ENVOY\u00c9</button><div class="cf"><div class="jfCard-actionsNotification" aria-live="polite"><div class="jfPressEnter isHidden" aria-hidden="true">Press<br/>Enter</div></div></div><div class="jfCard-disableSubmitError"></div></div></div></div></li><li class="form-line" data-type="control_number" id="id_35"><div id="cid_35" class="jfCard-wrapper"><div class="jfCard" data-type="control_number"><div class="jfCard-index"><div>5</div></div><div class="jfCard-question"><div class="jfQuestion-fullscreen isHidden" aria-hidden="true" role="button" aria-label="fullscreen mode" tabindex="-1"></div><label for="input_35" class="jfQuestion-label isLeftAlign" id="label_35"><span class="jsQuestionLabelContainer jfQuestionLabelContainer">Quel est votre budget ?\u00a0</span><span class="jfRequiredStar">* <span class="jfRequiredStar-message">Ce champ est obligatoire.</span></span></label><span class="jfQuestion-description" id="input_35_description"><span>Merci d\'indiquer un budget en \u20ac</span></span><div class="jfCard-mobileError jsMobileErrorWrapper"></div><div class="jfQuestion-fields"><div class="jfField" data-type="number"><input type="number" id="input_35" name="q35_A" data-type="input-number" class=" form-number-input form-textbox validate[required] forNumber jfInput-input" size="5" value="" placeholder="ex : 23" data-component="number" required="" step="any" aria-required="true" aria-describedby="input_35_description"/><label class="jfField-sublabel " for="input_35"></label></div></div></div><div class="jfCard-actions"><button style="display:block" type="button" class="jfInput-button forPrev u-left" data-component="button" aria-label="Precedent">Precedent</button><button style="display:block" type="button" class="jfInput-button forNext u-right" data-component="button" aria-label="ENVOY\u00c9">ENVOY\u00c9</button><button style="display:none" type="submit" class="jfInput-button forSubmit form-submit-button u-right" data-component="button" aria-label="ENVOY\u00c9">ENVOY\u00c9</button><div class="cf"><div class="jfCard-actionsNotification" aria-live="polite"><div class="jfPressEnter isHidden" aria-hidden="true">Press<br/>Enter</div></div></div><div class="jfCard-disableSubmitError"></div></div></div></div></li><li class="form-line" data-type="control_textbox" id="id_30"><div id="cid_30" class="jfCard-wrapper"><div class="jfCard" data-type="control_textbox"><div class="jfCard-index"><div>6</div></div><div class="jfCard-question"><div class="jfQuestion-fullscreen isHidden" aria-hidden="true" role="button" aria-label="fullscreen mode" tabindex="-1"></div><label for="input_30" class="jfQuestion-label isLeftAlign" id="label_30"><span class="jsQuestionLabelContainer jfQuestionLabelContainer">\u00a0A partir de quand souhaitez-vous commencer notre collaboration ?\u00a0</span><span class="jfRequiredStar">* <span class="jfRequiredStar-message">Ce champ est obligatoire.</span></span></label><span class="jfQuestion-description" id="input_30_description"><span></span></span><div class="jfCard-mobileError jsMobileErrorWrapper"></div><div class="jfQuestion-fields"><div class="jfField" data-type="textbox"><input type="text" id="input_30" name="q30_saisissezUne30" data-type="input-textbox" class="form-textbox validate[required] jfInput-input" size="20" value="" data-component="textbox" required="" aria-required="true" aria-describedby="input_30_description" aria-labelledby="label_30"/><label class="jfField-sublabel " for="input_30"></label></div></div></div><div class="jfCard-actions"><button style="display:block" type="button" class="jfInput-button forPrev u-left" data-component="button" aria-label="Precedent">Precedent</button><button style="display:block" type="button" class="jfInput-button forNext u-right" data-component="button" aria-label="ENVOY\u00c9">ENVOY\u00c9</button><button style="display:none" type="submit" class="jfInput-button forSubmit form-submit-button u-right" data-component="button" aria-label="ENVOY\u00c9">ENVOY\u00c9</button><div class="cf"><div class="jfCard-actionsNotification" aria-live="polite"><div class="jfPressEnter isHidden" aria-hidden="true">Press<br/>Enter</div></div></div><div class="jfCard-disableSubmitError"></div></div></div></div></li><li class="form-line" data-type="control_textbox" id="id_37"><div id="cid_37" class="jfCard-wrapper"><div class="jfCard" data-type="control_textbox"><div class="jfCard-index"><div>7</div></div><div class="jfCard-question"><div class="jfQuestion-fullscreen isHidden" aria-hidden="true" role="button" aria-label="fullscreen mode" tabindex="-1"></div><label for="input_37" class="jfQuestion-label isLeftAlign" id="label_37"><span class="jsQuestionLabelContainer jfQuestionLabelContainer">Pourquoi souhaitez-vous travailler avec Nous ?</span></label><span class="jfQuestion-description" id="input_37_description"><span></span></span><div class="jfCard-mobileError jsMobileErrorWrapper"></div><div class="jfQuestion-fields"><div class="jfField" data-type="textbox"><input type="text" id="input_37" name="q37_aPartir" data-type="input-textbox" class="form-textbox jfInput-input" size="20" value="" data-component="textbox" aria-required="false" aria-describedby="input_37_description" aria-labelledby="label_37"/><label class="jfField-sublabel " for="input_37"></label></div></div></div><div class="jfCard-actions"><button style="display:block" type="button" class="jfInput-button forPrev u-left" data-component="button" aria-label="Precedent">Precedent</button><button style="display:block" type="button" class="jfInput-button forNext u-right" data-component="button" aria-label="ENVOY\u00c9">ENVOY\u00c9</button><button style="display:none" type="submit" class="jfInput-button forSubmit form-submit-button u-right" data-component="button" aria-label="ENVOY\u00c9">ENVOY\u00c9</button><div class="cf"><div class="jfCard-actionsNotification" aria-live="polite"><div class="jfPressEnter isHidden" aria-hidden="true">Press<br/>Enter</div></div></div><div class="jfCard-disableSubmitError"></div></div></div></div></li><li class="form-line" data-type="control_checkbox" id="id_28"><div id="cid_28" class="jfCard-wrapper"><div class="jfCard" data-type="control_checkbox"><div class="jfCard-index"><div>8</div></div><div class="jfCard-question"><div class="jfQuestion-fullscreen isHidden" aria-hidden="true" role="button" aria-label="fullscreen mode" tabindex="-1"></div><label for="input_group_28" class="jfQuestion-label isLeftAlign" id="label_28"><span class="jsQuestionLabelContainer jfQuestionLabelContainer">Comment nous avez-vous d\u00e9couvert ?</span><span class="jfRequiredStar">* <span class="jfRequiredStar-message">Ce champ est obligatoire.</span></span></label><span class="jfQuestion-description" id="input_28_description"><span></span></span><div class="jfCard-mobileError jsMobileErrorWrapper"></div><div role="group" id="input_group_28" class="jfQuestion-fields form-multiple-column" data-columncount="2" data-component="checkbox"><div class="jfField form-checkbox-item"><label data-id="label_input_28_0" class="jfCheckbox withoutImage"><input type="checkbox" class="jfCheckbox-input form-checkbox validate[required]" name="q28_name28[]" value="Instagram" id="input_28_0" required="" aria-describedby="label_28"/><div class="jfCheckbox-label"><span class="jfCheckbox-customInput"><span class="jfCheckbox-customInputIcon"></span></span><img class="jfCheckbox-visual" alt="Checkbox" loading="lazy"/><span class="jfCheckbox-labelText">Instagram</span></div></label></div><div class="jfField form-checkbox-item"><label data-id="label_input_28_1" class="jfCheckbox withoutImage"><input type="checkbox" class="jfCheckbox-input form-checkbox validate[required]" name="q28_name28[]" value="Bouche-\u00e0-oreille" id="input_28_1" required="" aria-describedby="label_28"/><div class="jfCheckbox-label"><span class="jfCheckbox-customInput"><span class="jfCheckbox-customInputIcon"></span></span><img class="jfCheckbox-visual" alt="Checkbox" loading="lazy"/><span class="jfCheckbox-labelText">Bouche-\u00e0-oreille</span></div></label></div><div class="jfField form-checkbox-item"><label data-id="label_input_28_2" class="jfCheckbox withoutImage"><input type="checkbox" class="jfCheckbox-input form-checkbox validate[required]" name="q28_name28[]" value="Twitter" id="input_28_2" required="" aria-describedby="label_28"/><div class="jfCheckbox-label"><span class="jfCheckbox-customInput"><span class="jfCheckbox-customInputIcon"></span></span><img class="jfCheckbox-visual" alt="Checkbox" loading="lazy"/><span class="jfCheckbox-labelText">Twitter</span></div></label></div><div class="jfField form-checkbox-item"><label data-id="label_input_28_3" class="jfCheckbox withoutImage"><input type="checkbox" class="jfCheckbox-input form-checkbox validate[required]" name="q28_name28[]" value="Linkedin" id="input_28_3" required="" aria-describedby="label_28"/><div class="jfCheckbox-label"><span class="jfCheckbox-customInput"><span class="jfCheckbox-customInputIcon"></span></span><img class="jfCheckbox-visual" alt="Checkbox" loading="lazy"/><span class="jfCheckbox-labelText">Linkedin</span></div></label></div><div class="jfField jfField-lastRowItem form-checkbox-item"><label data-id="label_input_28_4" class="jfCheckbox withoutImage"><input type="checkbox" class="jfCheckbox-input form-checkbox validate[required]" name="q28_name28[]" value="Youtube" id="input_28_4" required="" aria-describedby="label_28"/><div class="jfCheckbox-label"><span class="jfCheckbox-customInput"><span class="jfCheckbox-customInputIcon"></span></span><img class="jfCheckbox-visual" alt="Checkbox" loading="lazy"/><span class="jfCheckbox-labelText">Youtube</span></div></label></div></div></div><div class="jfCard-actions"><button style="display:block" type="button" class="jfInput-button forPrev u-left" data-component="button" aria-label="Precedent">Precedent</button><button style="display:block" type="button" class="jfInput-button forNext u-right" data-component="button" aria-label="ENVOY\u00c9">ENVOY\u00c9</button><button style="display:none" type="submit" class="jfInput-button forSubmit form-submit-button u-right" data-component="button" aria-label="ENVOY\u00c9">ENVOY\u00c9</button><div class="cf"><div class="jfCard-actionsNotification" aria-live="polite"><div class="jfPressEnter isHidden" aria-hidden="true">Press<br/>Enter</div></div></div><div class="jfCard-disableSubmitError"></div></div></div></div></li><li style="display:none">Should be Empty:<input type="text" name="website" value="" aria-hidden="true"/></li></ul></form></div><div class="jStaticItems"></div><input type="hidden" aria-hidden="true" id="simple_spc" name="simple_spc" value="223443440392552-223443440392552"/><div class="jfProgress progress-animate" id="cardProgress" aria-hidden="true" role="navigation" aria-label="Progress Bar"><span class="jfProgressLine"><span class="jfProgressLine-inner jsFeedbackProgressLine" style="width:100%"></span></span><span class="jfProgress-itemWrapperLine "></span><span id="jsSubmitError" class="jfProgress-formError"></span><div class="jfProgress-itemWrapper " role="list"><div class="jfProgress-itemCell" role="listitem"><div class="jfProgress-item" data-index="0" role="link" tabindex="0"><div class="jfProgress-itemCircle"><span class="jfProgress-itemPulse"></span></div><span class="jfProgress-itemLabel">Question Label</span><span class="jfProgress-statusIcon"><span class="iconSvg  "><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 326 326" class="icon_check_svg__check-outer"><g data-name="Layer 2"><g data-name="Layer 1"><path d="M163 0C73.12 0 0 73.12 0 163s73.12 163 163 163 163-73.12 163-163S252.88 0 163 0z"></path><path d="M237.88 108.5a13.49 13.49 0 00-19.08 0l-80.38 80.38-31.23-31.22a13.49 13.49 0 00-19.08 19.09l40.77 40.76a13.5 13.5 0 0019.08 0l.34-.34 89.56-89.56a13.49 13.49 0 000-19.08z" class="icon_check_svg__check-inner" fill="#fff"></path></g></g></svg></span></span></div></div></div><div class="jfProgress-info"><span class="jfProgress-infoContent" id="cardProgressToggle" role="button" aria-label="See all"><span class="jfProgress-infoContentText"><span class="cardProgress-currentIndex" id="cardProgress-currentIndex">1 </span><span class="cardProgress-questionCount cardProgress-middleText">of</span><span class="cardProgress-questionCount" id="cardProgress-questionCount"> 8</span><span class="cardProgress-seeAll">See All</span><span class="cardProgress-goBack"><span class="iconSvg  "><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.2 52.6"><path class="arrow_left_svg__st0" d="M23.7 51.7c1.5 1.4 3.8 1.3 5.2-.2 1.3-1.4 1.3-3.6 0-5l-20-20 20-20c1.5-1.4 1.7-3.7.3-5.2S25.5-.4 24 1l-.3.3L1.1 23.8c-1.4 1.4-1.4 3.8 0 5.2l22.6 22.7z"></path></svg></span><span class="cardProgress-goBack-text">Go Back</span></span></span></span></div><div class="jfProgress-mobileNavigation jsMobileNavigation" style="display:none"><button type="button" class="jfInput-button forPrev forMobileNav u-left jsMobilePrev noTranslate" data-component="button" aria-label="Precedent"><span class="iconSvg  "><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.2 52.6"><path class="arrow_left_svg__st0" d="M23.7 51.7c1.5 1.4 3.8 1.3 5.2-.2 1.3-1.4 1.3-3.6 0-5l-20-20 20-20c1.5-1.4 1.7-3.7.3-5.2S25.5-.4 24 1l-.3.3L1.1 23.8c-1.4 1.4-1.4 3.8 0 5.2l22.6 22.7z"></path></svg></span></button><button type="button" class="jfInput-button forNext forMobileNav u-right jsMobileNext noTranslate" data-component="button" aria-label="ENVOY\u00c9"><span class="iconSvg  "><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.2 52.6"><path class="arrow_left_svg__st0" d="M23.7 51.7c1.5 1.4 3.8 1.3 5.2-.2 1.3-1.4 1.3-3.6 0-5l-20-20 20-20c1.5-1.4 1.7-3.7.3-5.2S25.5-.4 24 1l-.3.3L1.1 23.8c-1.4 1.4-1.4 3.8 0 5.2l22.6 22.7z"></path></svg></span></button><button style="display:none" type="button" class="jfInput-button forSubmit forMobileNav form-submit-button u-center jsMobileSubmit" data-component="button" aria-label="ENVOY\u00c9">ENVOY\u00c9</button><button class="jfInput-button u-left forBackToForm" style="display:none" aria-label="Back To Form"></button></div></div><div class="js-overlayWrapper jfOverlay" aria-hidden="true"><div class="jfOverlay-modalWrapper js-overlay-modalWrapper"><span class="jfOverlay-close"><span class="iconSvg  "><svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 209.37 209.37"><path d="M104.1 94.23c-5.83-6-11.26-11.65-16.79-17.2C75.06 64.72 62.72 52.5 50.5 40.17c-1.61-1.63-2.65-1.87-4.22 0a53.62 53.62 0 01-5.62 5.61c-1.83 1.58-1.87 2.65-.07 4.42 10.36 10.14 20.58 20.45 30.86 30.71C79 88.46 86.6 96 94.5 103.84L38.58 160l9.18 9.74 56.09-56.38 56.38 56.56 10.38-10.36-56.16-55.81c10-10 19.95-20 29.87-29.88 8-8 16-15.91 23.94-23.94.66-.66 1.31-2.42 1-2.78-2.8-3.08-5.82-6-9.24-9.36z"></path></svg></span></span><img class="js-overlayImage jfOverlayImage" alt="close" loading="lazy"/></div></div><script src="https://cdn.jotfor.ms/s/umd/latest/for-cardform-js.js?4.2"></script><script defer="" src="https://www.jotform.com/ownerView.php?id=223443440392552"></script><script type="text/javascript" src="https://cdn.jotfor.ms/js/formTranslation.v2.js?3.3.37920"></script><script>window.CardForm = new CardLayout({"formMode":"welcome","isSSOProtected":false,"isSaveAndContinueLaterActivated":false,"ownerView":false,"ownerPercentage":89,"isProduction":true,"isFormProgressVisible":true,"apiURL":"https://api.jotform.com","reviewBeforeSubmit":null,"questions":[{"qid":"input_33","id":"33","type":"control_textbox"},{"qid":"input_6","id":"6","type":"control_email"},{"qid":"input_32","id":"32","type":"control_checkbox"},{"qid":"input_23","id":"23","type":"control_radio"},{"qid":"input_35","id":"35","type":"control_number"},{"qid":"input_30","id":"30","type":"control_textbox"},{"qid":"input_37","id":"37","type":"control_textbox"},{"qid":"input_28","id":"28","type":"control_checkbox"}],"allQuestions":[{"id":"1","type":"control_head","isHidden":false,"fields":null},{"id":"33","type":"control_textbox","isHidden":false,"fields":null},{"id":"6","type":"control_email","isHidden":false,"fields":null},{"id":"32","type":"control_checkbox","isHidden":false,"fields":null},{"id":"23","type":"control_radio","isHidden":false,"fields":null},{"id":"35","type":"control_number","isHidden":false,"fields":null},{"id":"30","type":"control_textbox","isHidden":false,"fields":null},{"id":"37","type":"control_textbox","isHidden":false,"fields":null},{"id":"28","type":"control_checkbox","isHidden":false,"fields":null}],"captchaMode":null,"sectionHeaders":[{"props":{"text":{"text":"Text","value":"Donnez une vie digitale \u00e0 vos id\u00e9e ou projet !","nolabel":true},"subHeader":{"text":"Sub Heading","value":"Soyez parmi ceux qui refa\u00e7onne demain !"},"headerType":{"text":"Heading Type","value":"Default","dropdown":[["Default","Default"],["Large","Large"],["Small","Small"]]},"headerImage":{"text":"Image Source","value":"","icon":"images/blank.gif","iconClassName":"toolbar-image_source"},"alt":{"text":"Alt","value":"","toolbar":false},"width":{"text":"Image Width","value":""},"imageAlign":{"text":"Image Align","value":"Left","dropdown":[["Left","Left"],["Top","Top"],["Right","Right"]],"icon":"images/blank.gif","iconClassName":"toolbar-image_align"},"textAlign":{"text":"Text Align","value":"Left","dropdown":[["Left","Left"],["Center","Center"],["Right","Right"]],"icon":"images/blank.gif","iconClassName":"toolbar-label_align"},"verticalTextAlign":{"text":"Vertical Text Align","value":"Middle","dropdown":[["Top","Top"],["Middle","Middle"],["Bottom","Bottom"]],"icon":"images/blank.gif","iconClassName":"toolbar-label_align"},"name":{"hidden":true,"value":"culturePay"},"order":{"hidden":true,"value":"1"},"previousButtonText":{"hidden":true,"value":"Previous"},"qid":{"value":"input_1"},"showQuestionCount":{"hidden":true,"value":"Yes"},"type":{"hidden":true,"value":"control_head"},"id":{"value":"1"},"qname":{"value":"q1_culturePay"}},"index":0}],"welcomePageProps":{"id":{"value":"welcomePage"},"text":{"value":"COLLABORONS"},"subHeader":{"value":"Dans l\'optique de cibler au mieux vos besoins et vos attentes, nous vous remercions de bien vouloir nous accorder quelques minutes pour renseigner ce questionnaire. Il nous permettra un gain de temps pr\u00e9cieux et la certitude de pouvoir vous proposer des r\u00e9ponses adapt\u00e9es.\u00a0"},"imageSrc":{"value":"https://eu.jotform.com/cardforms/assets/icons/icon-sets-v2/solid/People/jfc_icon_solid-users.svg"},"buttonText":{"value":"START"},"showQuestionCount":{"value":"No"},"isFormTitleVisible":true},"formID":223443440392552,"fullscreenMode":true});</script></body></html>',
  "COLLABORONS",
  Array
);
(function () {
  window.handleIFrameMessage = function (e) {
    if (!e.data || !e.data.split) return;
    var args = e.data.split(":");
    if (args[2] != "223443440392552") {
      return;
    }
    var iframe = document.getElementById("223443440392552");
    if (!iframe) {
      return;
    }
    switch (args[0]) {
      case "scrollIntoView":
        if (!("nojump" in FrameBuilder.get)) {
          iframe.scrollIntoView();
        }
        break;
      case "setHeight":
        var height = args[1] + "px";
        if (window.jfDeviceType === "mobile" && typeof $jot !== "undefined") {
          var parent = $jot(iframe).closest(
            ".jt-feedback.u-responsive-lightbox"
          );
          if (parent) {
            height = "100%";
          }
        }
        iframe.style.height = height;
        break;
      case "setMinHeight":
        iframe.style.minHeight = args[1] + "px";
        break;
      case "collapseErrorPage":
        if (iframe.clientHeight > window.innerHeight) {
          iframe.style.height = window.innerHeight + "px";
        }
        break;
      case "reloadPage":
        if (iframe) {
          location.reload();
        }
        break;
      case "removeIframeOnloadAttr":
        iframe.removeAttribute("onload");
        break;
      case "loadScript":
        if (!window.isPermitted(e.origin, ["jotform.com", "jotform.pro"])) {
          break;
        }
        var src = args[1];
        if (args.length > 3) {
          src = args[1] + ":" + args[2];
        }
        var script = document.createElement("script");
        script.src = src;
        script.type = "text/javascript";
        document.body.appendChild(script);
        break;
      case "exitFullscreen":
        if (window.document.exitFullscreen) window.document.exitFullscreen();
        else if (window.document.mozCancelFullScreen)
          window.document.mozCancelFullScreen();
        else if (window.document.mozCancelFullscreen)
          window.document.mozCancelFullScreen();
        else if (window.document.webkitExitFullscreen)
          window.document.webkitExitFullscreen();
        else if (window.document.msExitFullscreen)
          window.document.msExitFullscreen();
        break;
      case "setDeviceType":
        window.jfDeviceType = args[1];
        break;
    }
  };
  window.isPermitted = function (originUrl, whitelisted_domains) {
    var url = document.createElement("a");
    url.href = originUrl;
    var hostname = url.hostname;
    var result = false;
    if (typeof hostname !== "undefined") {
      whitelisted_domains.forEach(function (element) {
        if (
          hostname.slice(-1 * element.length - 1) === ".".concat(element) ||
          hostname === element
        ) {
          result = true;
        }
      });
      return result;
    }
  };
  if (window.addEventListener) {
    window.addEventListener("message", handleIFrameMessage, false);
  } else if (window.attachEvent) {
    window.attachEvent("onmessage", handleIFrameMessage);
  }
})();
