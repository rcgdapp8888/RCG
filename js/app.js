///////////////////////////////////////////////////////////////////////////////
// 业务逻辑
///////////////////////////////////////////////////////////////////////////////

$(function () {

    // document click
    $(document).click(function () {
        var $this = $(this);

        if ($this.hasClass('navbar-toggle') || $this.hasClass('icon-bar')) {
            return;
        }

        $('.navbar-collapse').removeClass('in'); 
    });

    // 多语言初始化及页面显示
    function initLanguage() {

        if (!config.language) {
            config.language = 'language_cn';
        }

        if (!config.language) {
            config.lang_arr = lang_cn;
            config.lang_tip = tipl_language_cn;
        }
        else {
            try {
                config.lang_arr = eval(language);
                config.lang_tip = eval('tipl_' + language);
            } catch (err) {
                config.lang_arr = language_cn;
                config.lang_tip = tipl_language_cn;
            }
        }

        for (var i = 0; i < config.lang_arr.length; i++) {
            $('.lan-' + (i + 1)).html(config.lang_arr[i]);
        }
    }
    initLanguage();

    // 分享链接复制
    var clipboard = new ClipboardJS('#share-link');
    clipboard.on('success', function (e) {
        e.clearSelection();
        alertify.success(config.lang_tip[5] + ' ' + e.text);
    });

    // 投资数量选择
    $('.btn-eth-input').click(function () {
        $('#amount').val($(this).data("value"));
    });

    function gettip(res) {
        var v = res.Status;
        if (v < config.lang_tip.length)
            return config.lang_tip[v];

        return res.Message;
    }

    // 环境检查
    function checkAll() {
        if (!config.web3) { 
            alertify.error(config.lang_tip[2]);
            return false;
        }

        if (!config.isNetworkInited) {
            alertify.error(config.lang_tip[4]);
            return false;
        }

        if (!config.defaultAccount || config.defaultAccount == '') {
            alertify.error(config.lang_tip[3]);
            return false;
        }

        if (!config.walletAccount) {
            alertify.error(config.lang_tip[17]);
            return false;
        }

        return true;
    }

    // 检查是否在收益中
    function checkIsOver () {
        //var vv = $('.pext-incomecan').html();
        //if (!vv || vv == '--') {
        //    alertify.error(config.lang_tip[17]);
        //    return false;
        //}

        //var v = parseFloat(vv || '0');
        ////if (vv != '0.00000000' && vv != '0') {
        //if (v != 0) { 
        //    alertify.error(config.lang_tip[16]);
        //    return false;
        //}

        if (!config.walletAccount) {
            alertify.error(config.lang_tip[17]);
            return false;
        }

        if (config.incomeCan != 0) {
            alertify.error(config.lang_tip[16]);
            return false;
        }

        return true;
    };

    // 购买令牌输入
    $('.ticket-ethinput').on('input', function (e) {
        var val = e.delegateTarget.value || '0';
        if (config.rcgPrice) {
            var num = parseFloat(val) * config.tokenPrice * config.rcgPrice;
            $('.ticket-stsinput').html(num);
        }
    });

    // 购买令牌
    $('#buy-ticket-action').click(function () {
        if (!checkAll()) {
            return;
        }
        var v = parseFloat($('.ticket-ethinput').val() || '0');
        if (v < 0.1) {
            alertify.error(config.lang_tip[18]);
            return;
        }
        
        // 必须是0.1的倍数
        v = v * 10;
        if ((v - parseInt(v)) != 0) {
            alertify.error(config.lang_tip[22]);
        }

        var etherValue = web3.utils.toWei(
            $('.ticket-ethinput').val() + '',
            'ether'
        );

        // 发起支付
        var obj = {
            from: config.defaultAccount,
            to: config.walletAccount,
            gas: config.gas, 
            value: etherValue,
        };
        config.web3.eth.sendTransaction(obj, function (error, hash) {
            if (!!error) {
                alertify.error(error.message + '(' + error.code + ')');
                return;
            }

            // 发送成功，返回 交易Hash，提交购买TOKEN记录
            $.ajax({
                url: config.urls.userInfo
                , type: 'post'
                , data: { w: config.defaultAccount, ether: etherValue, type: 'token',  hash: hash }
                , async: true
                , cache: false
                , dataType: 'json'
                , success: function (res) {
                    if (res.Status == 200) {
                        // 
                        alertify.error('交易发送成功'); 
                    } else {
                        console.log(res.Message, new Date());
                        alertify.error(gettip(res.Status));
                    }
                }
                , error: function (e, code) {
                    alertify.error('error: buy ticket'); 
                }
            });
        }); 
    });

    // 可用令牌验证
    function checkToken(value, callback) {
        $.ajax({
            url: config.urls.checkJoin
            , type: 'post'
            , data: { w: config.defaultAccount, value: value}
            , async: true
            , cache: false
            , dataType: 'json'
            , success: function (res) {
                if (res.Status == 200) {
                    callback();
                } else {
                    console.log(res.Message, new Date());
                    alertify.error(gettip(res.Status));
                }
            }
            , error: function (e, code) {
                alertify.error('error: buy ticket');
            }
        });
    }

    // 参与入金
    $('.buywitheth').click(function () {
        
        if (!checkAll()) {
            return;
        }

        if (!checkIsOver()) {
            return;
        }

        if (!config.refereeAccount) {
            alertify.error(config.lang_tip[24]);
            return;
        }

        var inputValue = parseFloat($('.ethinput').val() || "0");

        if (inputValue < 1) {
            alertify.error(config.lang_tip[7]);
            return;
        }

        if ((inputValue % 1) != 0) {
            alertify.error(config.lang_tip[23]);
            return;
        }

        // 检查令牌
        var needCount = inputValue * config.tokenPrice; 
        if (needCount > config.tokenBalance) {
            alertify.error(config.lang_tip[11] + needCount + ' ');
            return;
        }

        // 支付 ETH
        var etherValue = web3.utils.toWei(inputValue, 'ether');

        // 验证并发起支付
        checkToken(inputValue, function () {

            var obj = {
                from: config.defaultAccount,
                to: config.walletAccount,
                gas: config.gas,
                value: etherValue,
            };

            config.web3.eth.sendTransaction(obj, function (error, hash) {
                if (!!error) {
                    alertify.error(error.message + '(' + error.code + ')');
                    return;
                }

                var data = {
                    w: config.defaultAccount,
                    value: inputValue,
                    needToken: needCount,
                    ether: etherValue,
                    type: 'join',
                    hash: hash
                };

                // 发送成功，返回 交易Hash，提交入金记录
                $.ajax({
                    url: config.urls.joinNow
                    , type: 'post'
                    , data: data
                    , async: true
                    , cache: false
                    , dataType: 'json'
                    , success: function (res) {
                        if (res.Status == 200) {
                            // 
                            alertify.error('交易发送成功');
                        } else { 
                            console.log(res.Message, new Date());
                            alertify.error(gettip(res.Status));
                        }
                    }
                    , error: function (e, code) {
                        alertify.error('error: buy ticket');
                    }
                });
            }); 
        })
    });

    // 切换语言
    $('ul.language-menu > li').click(function () {
        store.set('language', 'lang_' + $(this).attr('data-value'));
        window.location.reload();
    });

    // 从url中提取推荐人
    var getRecomander = function () {
        var reg = new RegExp('(^|&)r=([^&]*)(&|$)');
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return unescape(r[2]);
        }
        return null;
    };

    // 初始化网络环境
    function checkNetwork () {
        if (config.isNetworkInited)
            return;
         
        if (window.ethereum) {
            config.web3 = window.web3 = new Web3(ethereum);
            try {
                config.isNetworkInited = true; 
                handlerWeb3(window.web3);
            } catch (error) { }
        } else if (window.web3) {
            config.web3 = window.web3 = new Web3(web3.currentProvider);
            try {
                config.isNetworkInited = true;
                handlerWeb3(window.web3);
            } catch (error) { }
        } else {
            alertify.error(config.lang_tip[2]);
        } 

        setTimeout(function () { checkNetwork() }, config.delayReload);
    }

    // web3 实例创建成功
    function handlerWeb3(web3) {
        web3.eth.net.getId(function (err, netId) {
            if (netId != config.netId) { 
                if (config.netId == 3 || config.netId == 4 || config.netId == 10) {
                    alertify.error(config.lang_tip[0]);
                }
                if (config.netId == 1) {
                    alertify.error(config.lang_tip[1]);
                }
            } else {
                config.netCheck = true;
                if (window.ethereum) {
                    window.ethereum.enable().then(checkAccounts);
                } else if (window.web3) {
                    checkAccounts();
                }
            }
        });
    }

    // 获取 ETH 账户 并定时检查 token 默认账户是否有变更 
    function checkAccounts() {

        // 获取 Token 的 ETH 账户信息
        config.web3.eth.getAccounts(function (err, accounts) {
            if (!!err) {
                alertify.error(err);
                return;
            }

            if (accounts.length == 0) {
                alertify.error(config.lang_tip[3]);
                return;
            }

            config.defaultAccount = accounts[0];
            updateIntiveLink();
            checkLogin();
        });

        // 定时检查默认账户是否有改变
        setInterval(function () {
            config.web3.eth.getAccounts(function (err, acc) {
                if (!!err) {
                    //alertify.error(err);
                    console.log('error');
                    return;
                }

                if (acc.length == 0 && config.defaultAccount != '') {
                    window.location.reload();
                    return;
                }

                if (acc.length == 0)
                    return;

                if (acc[0] != config.defaultAccount) {
                    console.log('account change, start bat updateData!');
                    //config.defaultAccount = acc[0];
                    window.location.reload();
                } 
            });
        }, 1000);
    }

    // 检查登录 
    function checkLogin() {
        if (!!config.defaultAccount) {
            $.ajax({
                url: config.urls.userInfo
                , type: 'post'
                , data: { r: getRecomander(), w: config.defaultAccount }
                , async: true
                , cache: false
                , dataType: 'json'
                , success: function (res) {
                    if (res.Status == 200) {
                        updateUserInfo(res.Data);
                    } else {
                        console.log(res.Message, new Date());
                        alertify.error(gettip(res.Status));
                    }
                }
                , error: function (e, code) {
                    alertify.error('error: checkLogin');
                }
                , complete() {
                    setTimeout(function () { checkLogin(); }, config.delayReload);
                }
            });
        }
        else {
            setTimeout(function () { checkLogin(); }, config.delayReload);
        }

        //setInterval(function () { checkLogin(); }, config.delayReload);
    }

    // 更新我的邀请链接
    function updateIntiveLink() {
        var url = location.href;
        if (url.indexOf('?') != -1) {
            url = url.split('?')[0];
        }
        var acc = config.defaultAccount;
        if (acc) {
            var flag = $('#invite-link').html().trim() == '--';
            if (flag) {
                $('#invite-link').html(url + '?r=' + acc);
            }
        }
    }

    // 更新显示
    function updateUserInfo(res) {

        config.ticketSybmol = res.ticketSybmol
        config.rcgPrice = res.rcgPrice; 
        config.tokenPrice = res.tokenPrice;
        config.tokenBurn = res.tokenBurn; 
        config.ticketSybmol = res.ticketSybmol;
        config.incomeCan = res.incomeCan;

        config.bonusBalance = res.bonusBalance;
        config.tokenBalance = res.tokenBalance;

        config.refereeAccount = res.refereeAccount;
        config.walletAccount = res.walletAccount;
        
        updateReferee(res.refereeAddress);

        $('.pool-share').html(res.sharePool.toFixed(8));
        $('.pool-insurance').html(res.insurancePool.toFixed(8)); 
        $('.my-recomand-count').html(res.refereeCount);
        $('.price-token').html(res.tokenPrice);
        $('.burn-token').html(res.tokenBurn);
        $('.ticket-sybmol').html(res.ticketSybmol);

        $('.pext-incomecan').html(res.incomeCan);
    }

    // 我的推荐人
    function updateReferee(addr) {
        var str = '/';
        if (!!addr && addr != '0x0000000000000000000000000000000000000000') {
            str = addr.length <= 15 ? addr : addr.substring(0, 10) + '...' + addr.substr(-5); 
        }

        $('.my-inviter').html(str);
    }

    //
    checkNetwork();
    //setInterval(function () { checkNetwork(); }, config.delayReload); 

});