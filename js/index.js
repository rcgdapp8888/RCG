var gcontract = "0x62bD064d399016490933915200534a7Bb0D7466f";
var ticket = "0x499C83DC2d90303382a5315f6E3DaBF46eaADE19";
var fcontract = "0xD4585de767522084fAe6379f2CA9cda68D860878";
var BN = BigNumber.clone();
var iconins;
var itickets;
var ifeecon;
var gnetId = 1;
var netCheck = false;
var symbol;
var web3 = window.web3;
var myTickets;
var myWithdrawals;
var times;
var parterCanWd = 0;
var defaultAccount = '';
var isStart = false;
var language = store.get('language');
var lan_arr;
var tipl;
document.addEventListener('click', function(e) {
	var dom = e.target;
	if (
		dom.classList.contains('navbar-toggle') ||
		dom.classList.contains('icon-bar')
	) {
		return;
	}
	document.querySelector('.navbar-collapse').classList.remove('in');
});
var initLaguage = function() {
	if (!language) {
        language = 'language_sg';
	}
	$('ul.language-menu > li').click(function() {
		store.set('language', 'language_' + $(this).attr('data-value'));
		window.location.reload();
	});
	if (!language) {
        lan_arr = language_sg;
        tipl = tipl_language_sg;
	} else {
		try {
			lan_arr = eval(language);
			tipl = eval('tipl_' + language);
		} catch (err) {
            lan_arr = language_sg;
            tipl = tipl_language_sg;
		}
	}
	for (var i = 0; i < lan_arr.length; i++) {
		$('.lan-' + (i + 1)).html(lan_arr[i]);
	}
};
initLaguage();
var checkNet = function() {
	if (isStart) {
		return;
	}
	if (window.ethereum) {
		web3 = window.web3 = new Web3(ethereum);
		try {
			isStart = true;
			handlerWeb3(window.web3);
		} catch (error) {}
	} else {
		if (window.web3) {
			web3 = window.web3 = new Web3(web3.currentProvider);
			isStart = true;
			handlerWeb3(window.web3);
		} else {
			alertify.error(tipl[2]);
		}
	}
};
var handlerWeb3 = function(web3) {
	iconins = new web3.eth.Contract(abi, gcontract);
	itickets = new web3.eth.Contract(abitoken, ticket);
	ifeecon = new web3.eth.Contract(feeabi, fcontract);
	web3.eth.net.getId(function(err, netId) {
		if (netId != gnetId) {
			if (gnetId == 3 || gnetId == 4 || gnetId == 10) {
				alertify.error(tipl[0]);
			}
			if (gnetId == 1) {
				alertify.error(tipl[1]);
			}
		} else {
			netCheck = true;
			if (window.ethereum) {
				window.ethereum.enable().then(checkLogin);
			} else if (window.web3) {
				checkLogin();
			}
		}
	});
};
var checkLogin = function() {
	var accountInterval = setInterval(function() {
		web3.eth.getAccounts(function(err, acc) {
			if (err != null) {
				console.log('error');
				return;
			}
			if (acc.length == 0 && defaultAccount != '') {
				window.location.reload();
				return;
			}
			if (acc.length == 0) {
				return;
			}
			if (acc[0] != defaultAccount) {
				defaultAccount = acc[0];
				window.location.reload();
				console.log('account change, start bat updateData!');
			}
		});
	}, 1000);
	web3.eth.getAccounts(function(err, accounts) {
		if (err) {
			alertify.error(err);
			return;
		}
		if (accounts.length == 0) {
			alertify.error(tipl[3]);
			return;
		}
		defaultAccount = accounts[0];
		var option = {
			from: defaultAccount
		};
		if (defaultAccount != '') {
			updateIntiveLink();
			/* get person info */
			iconins.methods.getWebUserInfo(defaultAccount).call({from: ticket}, getWebUserInfoCB);
			/* get award record */
			iconins.methods.getRewardRecord(defaultAccount).call({from: ticket}, getRewardRecordCB);
			/* get user info */
			iconins.methods.getUserByAddr(defaultAccount).call({from: ticket}, getUserByAddrCB);
			
			ticketData();
		}
	});
};
/* generate my invite link */
var updateIntiveLink = function() {
	var url = location.href;
	if (url.indexOf('?') != -1) {
		url = url.split('?')[0];
	}
	var g = defaultAccount;
	if (g) {
		if (
			$('#invite-link')
			.html()
			.trim() == '--'
		) {
			$('#invite-link').html(url + '?r=' + g);
		}
	}
};
/* get ticket info */
var ticketData = function() {
	if (defaultAccount != '' && itickets) {
		itickets.methods.symbol().call(function(err, result1) {
			if (!err) {
				symbol = result1;
				itickets.methods.balanceOf(defaultAccount).call(function(err, result2) {
					myTickets = web3.utils.fromWei(BN(result2).toFixed(), 'ether');
					//console.log(myTickets);
				});
				updateSymbol(symbol);
			} else {
				alertify.error(err);
				return;
			}
		});
	}
};
var updateSymbol = function(symbol) {
	$('.ticket-sybmol').html(symbol);
};
var update1 = function() {
	if (defaultAccount != '' && iconins) {
		iconins.methods.getWebUserInfo(defaultAccount).call({from: ticket}, getWebUserInfoCB);
		iconins.methods.getUserByAddr(defaultAccount).call({from: ticket}, getUserByAddrCB);
		iconins.methods.getRewardRecord(defaultAccount).call({from: ticket}, getRewardRecordCB);
		iconins.methods.getWebGameInfo().call({from: ticket}, getWebGameInfoCB);
		updateIntiveLink();
		ticketData();
	}
};
var getRecomander = function() {
	var reg = new RegExp('(^|&)r=([^&]*)(&|$)');
	var r = window.location.search.substr(1).match(reg);
	if (r != null) {
		return unescape(r[2]);
	}
	return null;
};
var recommander = getRecomander();
var checkAll = function() {
	if (!web3) {
		noWeb3();
		return false;
	}
	if (!netCheck) {
		errNet();
		return false;
	}
	if (!defaultAccount || defaultAccount == '') {
		alertify.error(tipl[3]);
		return;
	}
	return true;
};
var noWeb3 = function() {
	alertify.error(tipl[2]);
};
var errNet = function() {
	alertify.error(tipl[4]);
};
var updateExt001 = function() {
	if (iconins) {
		iconins.methods.getWebGameInfo().call({from: ticket}, getWebGameInfoCB);
		ticketData();
	}
};
/* get user info cb */
var getWebUserInfoCB = function(err, result) {
	if (!err) {
		var a = [];
		// totalBonusAmount
		a.push(web3.utils.fromWei(BN(result[0]).toFixed(), 'ether'));
		// totalInviteAmount
		a.push(web3.utils.fromWei(BN(result[1]).toFixed(), 'ether'));
		// lastSettlementTime
		a.push(BN(result[2]).toFixed());
		// freezeAmount
		a.push(web3.utils.fromWei(BN(result[3]).toFixed(), 'ether'));
		// freeAmount
		a.push(web3.utils.fromWei(BN(result[4]).toFixed(), 'ether'));
		// invite count
		a.push(BN(result[5]).toFixed());
		// myinviter address
		a.push(result[6]);
		
		myInviterProcess(a[6]);
		
		myWithdrawals = a[4];

		var exp = parseInt(a[2]) + 86400;
		var diff = exp - Math.round(new Date().getTime() / 1000);	
		refreshIncomeTimer(diff);
		
		$('.my-recomand-count').html(BN(a[5]).toFixed());
		$('.p-gen').html(BN(a[0]).toFixed(8, 1));
		$('.p-dy').html(BN(a[1]).toFixed(8, 1));
		$('.pext-incomecan').html(BN(a[3]).toFixed(8, 1));
		$('.p-unwithdraw').html(BN(a[4]).toFixed(8, 1));
		// check inviter
		if (a[6] == '0x0000000000000000000000000000000000000000'){
			checkRecommander();
		}
	} else {
		console.log(err);
	}
};
var getUserByAddrCB = function (err, result){
	if (!err) {
		var a = [];
		// user status
		a.push(result[1]);
		// invest eth
		a.push(web3.utils.fromWei(BN(result[4]).toFixed(), 'ether'));
		// user index
		a.push(BN(result[8]).toFixed());

		$('.pext-incomeper').html(
			BN(a[1]).times(BN(0.003)).toFixed(3, 1) + ' ~ ' + BN(a[1]).times(BN(0.022)).toFixed(3, 1)
		);	
		$('.p-teth').html(BN(a[1]).toFixed(8, 1));
		
	} else {
		console.log(err);
	}
}
/* get user reward record */
var getRewardRecordCB = function(err, result) {
	if (!err) {
		var a = [];
		// totalRechargeAmount
		a.push(web3.utils.fromWei(BN(result[0]).toFixed(), 'ether'));
		// totalBonusAmount
		a.push(web3.utils.fromWei(BN(result[1]).toFixed(), 'ether'));
		// totalInviteAmount
		a.push(web3.utils.fromWei(BN(result[2]).toFixed(), 'ether'));
		// totalBigPool
		a.push(web3.utils.fromWei(BN(result[3]).toFixed(), 'ether'));
		// totalSmallPool
		a.push(web3.utils.fromWei(BN(result[4]).toFixed(), 'ether'));
	
		$('.p-win').html(BN(a[3]).toFixed(8, 1));
		$('.node-gen').html(BN(a[4]).toFixed(8, 1))
	} else {
		console.log(err);
	}
}
var myInviterProcess = function(result) {
	if (!result || result == '0x0000000000000000000000000000000000000000') {
		$('.my-inviter').html('/');
	} else {
		$('.my-inviter').html(
			result.length > 15 ?
			result.substring(0, 10) + '...' + result.substr(-5) :
			result
		);
	}
};
var t1;
var t2;
var t3;
var refreshBigTimer = function(senconds) {
	if (senconds > 0) {
		if (t1) {
			t1.clear();
		}
		t1 = new Tick(senconds, '.b-dtime');
		t1.timer(t1);
	} else {
		$('.b-dtime').html(tipl[20]);
	}
};
var refreshTimer24 = function(senconds) {
	if (senconds > 0) {
		if (t2) {
			t2.clear();
		}
		t2 = new Tick(senconds, '.b-dtime24');
		t2.timer(t2);
	} else {
		$('.b-dtime24').html(tipl[20]);
	}
};
/* next settle timer */
var refreshIncomeTimer = function(senconds) {
	if (senconds > 0) {
		if (t3) {
			t3.clear();
		}
		t3 = new Tick(senconds, '.pext-incomenext');
		t3.timer(t3);
	} else {
		$('.pext-incomenext').html('00:00:00');
	}
};
var getWebGameInfoCB = function(err, result) {
	if (!err) {
		var a = [];
		// pool_big
		a.push(web3.utils.fromWei(BN(result[0]).toFixed(), 'ether'));
		// pool_small
		a.push(web3.utils.fromWei(BN(result[1]).toFixed(), 'ether'));
		// ticketRate
		a.push(BN(result[2]).toFixed());
		// burnTokenCount
		a.push(web3.utils.fromWei(BN(result[3]).toFixed(), 'ether'));
		// totalInvestCount
		a.push(web3.utils.fromWei(BN(result[4]).toFixed(), 'ether'));
		// timeBigPool
		a.push(BN(result[5]).toFixed());
		// curUserIndex
		a.push(BN(result[6]).toFixed());
		// static rate
		a.push(BN(result[7]).toFixed() / 1000);
		// timeSmallPool
		a.push(BN(result[8]).toFixed());
		
		// cost ticket
		times = a[2] / 10;
		
		var exp = parseInt(a[5]) + 86400;
		var diff = exp - Math.round(new Date().getTime() / 1000);
		refreshBigTimer(diff);
		
		var exp2 = parseInt(a[8]) + 86400;
		var diff2 = exp2 - Math.round(new Date().getTime() / 1000);
		refreshTimer24(diff2);
		
		//console.log(a);
		$('.b-pot').html(BN(a[0]).toFixed(8, 1));
		$('.s-pot').html(BN(a[1]).toFixed(8, 1));
		$('.ext-times').html(a[2]);
		$('.burn-times').html(parseInt(a[2] / 10));
		$('.ext-destory').html(parseInt(a[3]));
		
		// show pool
		/* iconins.methods.showPool().call({from:ticket}, function(err1, result2){
			$('.s-bqp').html(BN(web3.utils.fromWei(BN(result2[6]).toFixed(), 'ether')).toFixed(8, 1));
		}); */
		web3.eth.getBalance(fcontract, function(err1, result2){
			$('.s-bqp').html(BN(web3.utils.fromWei(BN(result2).toFixed(), 'ether')).toFixed(8,1));
		});
		
	}
};
/* invest */
var buy = function(etherValue) {
	if (recommander) {
		//console.log(recommander);
		iconins.methods.invest_abc(recommander).send({
				from: defaultAccount,
				value: etherValue,
				gas: 1000000
			},
			function(err, result) {
				if (err) {
					console.log(err.message);
					alertify.error('投资失败，请检查门票和以太坊余额是否足够。');
				}
			}
		);
	} else {
		alertify.error('没有推荐人，无法投资。');
	}
};
/* check myticket balance */
var checkTicket = function(inputCount) {
	var needCount = checkTicket0(myTickets, inputCount, times);
	if (needCount != 0) {
		alertify.error(tipl[11] + needCount + ' ' + symbol);
		return false;
	}
	return true;
};
var checkTicket0 = function(_myTickets, _eth, _times) {
	if (_times) {
		var val = BN(_myTickets).comparedTo(BN(_eth).times(BN(_times)));
		if (val == -1) {
			return BN(_eth)
				.times(BN(_times))
				.toFixed();
		}
	}
	return 0;
};
var checkIsOver = function() {
	var vv = $('.pext-incomecan').html();
	if (!vv || vv == '--') {
		alertify.error(tipl[17]);
		return false;
	}
	if (vv != '0.00000000' && vv != '0') {
		alertify.error(tipl[16]);
		return false;
	}
	return true;
};
var checkRecommander = function() {
	if (recommander) {
		if (
			$('.will-reg-recommander').html() != '' &&
			$('.will-reg-recommander').html() != '--'
		) {
			return;
		}
		$('.will-reg-recommander-con').removeClass('hidden');
		if (iconins) {
			iconins.methods.getUserByAddr(recommander).call({
					from: ticket
				},
				function(err, result) {
					if (err) {
						alertify.error(err.message);
						$('.will-reg-recommander').html(
							"<span style='color:red;'>ERROR!</span>"
						);
						return;
					}
					var userStatus = result[1];
					var userIndex = result[8];
					
					var showStr =
						recommander.length > 15 ?
						recommander.substring(0, 10) + '...' + recommander.substr(-5) :
						recommander;
					if (userIndex == 0 || userStatus == false) {
						$('.will-reg-recommander').html(
							"<span style='color:red;'>" +
							showStr +
							"<span style='font-size:12px;'>&nbsp;(" +
							tipl[14] +
							')</span>' +
							'</span>'
						);
						return;
					}
					$('.will-reg-recommander').html(
						"<span style='color:green;'>" + showStr + '</span>'
					);
				}
			);
		}
	}
};
var init = function() {
	/* buy ticket */
	$('#buy-ticket-action').click(function() {
		if (!checkAll()) {
			return;
		}
		if ($('.ticket-ethinput').val() < 0.1) {
			alertify.error(tipl[18] + ' 0.1 ETH');
			return;
		}
		var etherValue = web3.utils.toWei(
			$('.ticket-ethinput').val() + '',
			'ether'
		);
		var message = {
			from: defaultAccount,
			//to: gcontract,
			value: etherValue,
			gas: 100000
		};
		itickets.methods.buy_abc().send(message, function(err, result) {
			if (err) {
				console.log(err);
				alertify.error('购买门票失败，请检查以太坊余额和门票额度是否足够。');
				return;
			}
		});
	});
	$('.ticket-ethinput').on('input', function(e) {
		var val = e.delegateTarget.value;
		if (times) {
			$('.ticket-stsinput').html(
				BN(val)
				.times(times * 10)
				.toFixed(0, 1)
			);
		}
	});
	/* withdraw eth */
	$('.my-withdraw-btn').click(function() {
		if (!checkAll()) {
			return;
		}
		if(myWithdrawals < 0.1){
			alertify.error(tipl[10]);
			return;
		}
		if (iconins) {
			var etherValue = web3.utils.toWei(
				myWithdrawals,
				'ether'
			);
			iconins.methods.withdraw_abc(etherValue).send({
					from: defaultAccount
				},
				function(err, result) {
					if (err) {
						alertify.error(err.message);
					}
				}
			);
		}
	});
	/* settle action */
	$('.action-finish').click(function() {
		if (!checkAll()) {
			return;
		}
		if (iconins) {
			iconins.methods.settlement_abc().send({
					from: defaultAccount,
					gas: 2000000
				},
				function(err, result) {
					if (err) {
						alertify.error(err.message);
					}
				}
			);
		}
	});
	var amount = function() {
		return parseInt(
			!$('#amount').val() || $('#amount').val() == '' ? 0 : $('#amount').val()
		);
	};
	$('#ic-input1').click(function() {
		$('#amount').val(1);
	});
	$('#ic-input11').click(function() {
		$('#amount').val(13);
	});
	$('#ic-input31').click(function() {
		$('#amount').val(24);
	});
	/* invest */
	$('.buywitheth').click(function() {
		if (!checkAll()) {
			return;
		}
		if (!checkIsOver()){
			return;
		}
		if ($('.ethinput').val() < 1) {
			alertify.error(tipl[7]);
			return;
		}
		if (!checkTicket($('.ethinput').val())){
			return;
		}
		var inputValue = $('.ethinput').val();
		var etherValue = web3.utils.toWei(inputValue, 'ether');
		buy(etherValue);
	});
	var clipboard = new ClipboardJS('#share-link');
	clipboard.on('success', function(e) {
		e.clearSelection();
		alertify.success(tipl[5] + ' ' + e.text);
	});
	checkNet();
	updateExt001();
	setInterval(function() {
	  checkNet();
	  //checkRecommander();
	}, 3000);
	setInterval(function() {
	  update1();
	}, 10000);
};
init();
