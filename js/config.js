///////////////////////////////////////////////////////////////////////////////
// 全局配置
///////////////////////////////////////////////////////////////////////////////

// 服务主机
//const _apphost = 'localhost:1128';              // 本是
const _apphost = 'dapp191128.uqitest.com';        // 测试服

const _http = 'http';                           // 协议
const _appServer = _http + '://' + _apphost;    // 

var config = {
    appServer: _appServer,                      // 应用服务器

    web3: null,                                 // web3 实例
    netId: 1,                                   // ETH net id

    isNetworkInited: false,                     // 网络环境是否已初始化
    netCheck: false,                            // 网络检查是否通过

    ticketSybmol: 'RCG',                         // 

    tokenPrice: 10,                             // 每1ETH可购买令牌数量
    tokenBurn: 1,                               // 入金1ETH需要令牌数量
    rcgPrice: 1000,                             // 每购买1枚令牌赠送RCG数量

    tokenBalance: 0,                            // 令牌余额
    bonusBalance: 0,                            // 未提取共享池收益 
    incomeCan: 0,                               // 动静出局还差

    refereeAccount: '',                         // 推荐人
    walletAccount: '',                          // 平台钱包地址
    defaultAccount: '',                         // 默认钱包地址
    gas: 100000,                                // 矿工费,汽油

    delayReload: 10*1000,                       // 数据重载间隔，秒

    language: '',                               // 默认语言
    lang_arr: [],
    lang_tip: [],

    urls: {
        userInfo: _appServer + '/app/dapp/userinfo',
        buyToken: _appServer + '/app/dapp/buytoken',
        checkJoin: _appServer + '/app/dapp/checkjoin',
        joinNow: _appServer + '/app/dapp/joinnow',
    }
};