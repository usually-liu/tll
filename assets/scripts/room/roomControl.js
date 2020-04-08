var engine = require('../netWork/MatchvsEngine');
var response = require("../netWork/MatchvsResponse");
var msg = require("../netWork/MatvhsvsMessage");
var GameData = require('../netWork/ExamplesData');
cc.Class({
    extends: cc.Component,

    properties: {
        hallNode: {
            type: cc.Node,
            default: null,
            tooltip: "大厅界面",
        },

        matchNode: {
            type: cc.Node,
            default: null,
            tooltip: "匹配界面",
        },

        ballNode:{
            type:cc.Node,
            default:null,
            tooltip:"溜溜球界面"
        },

        matchEnemyNode: {
            type: cc.Node,
            default: null,
            tooltip: "未匹配对手节点",
        },

        matchEnemyFindNode: {
            type: cc.Node,
            default: null,
            tooltip: "匹配对手节点",
        },

        matchingNode: {
            type: cc.Node,
            default: null,
            tooltip: "匹配中界面",
        },

        matchingSuccessNode: {
            type: cc.Node,
            default: null,
            tooltip: "匹配成功面板",
        },

        resultControl: {
            type: cc.Node,
            default: null,
            tooltip: "结果节点",
        },

    },

    onLoad() {
        this.initMatchvsEvent(this);
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     * @param self this
     */
    initMatchvsEvent(self) {
        //在应用开始时手动绑定一下所有的回调事件
        response.prototype.bind();
        response.prototype.init(self);
        this.node.on(msg.MATCHVS_INIT, this.initResponse, this);
        this.node.on(msg.MATCHVS_REGISTER_USER, this.registerUserResponse, this);
        this.node.on(msg.MATCHVS_LOGIN, this.loginResponse, this);
        this.node.on(msg.MATCHVS_JOIN_ROOM_RSP, this.joinRoomResponse, this);
        this.node.on(msg.MATCHVS_JOIN_ROOM_NOTIFY, this.joinRoomNotify, this);
        this.node.on(msg.MATCHVS_JOIN_OVER_RSP, this.joinOverResponse, this);
        this.node.on(msg.MATCHVS_JOIN_OVER_NOTIFY, this.joinOverNotify, this);
        this.node.on(msg.MATCHVS_SEND_EVENT_RSP, this.sendEventResponse, this);
        this.node.on(msg.MATCHVS_SEND_EVENT_NOTIFY, this.sendEventNotify, this);
        this.node.on(msg.MATCHVS_LEAVE_ROOM, this.leaveRoomResponse, this);
        this.node.on(msg.MATCHVS_LEAVE_ROOM_NOTIFY, this.leaveRoomNotify, this);
        this.node.on(msg.MATCHVS_LOGOUT, this.logoutResponse, this);
        this.node.on(msg.MATCHVS_ERROE_MSG, this.errorResponse, this);
    },

    /**
     * 移除监听
     */
    removeEvent() {
        this.node.off(msg.MATCHVS_INIT, this.initResponse, this);
        this.node.off(msg.MATCHVS_REGISTER_USER, this.registerUserResponse, this);
        this.node.off(msg.MATCHVS_LOGIN, this.loginResponse, this);
        this.node.off(msg.MATCHVS_JOIN_ROOM_RSP, this.joinRoomResponse, this);
        this.node.off(msg.MATCHVS_JOIN_ROOM_NOTIFY, this.joinRoomNotify, this);
        this.node.off(msg.MATCHVS_JOIN_OVER_RSP, this.joinOverResponse, this);
        this.node.off(msg.MATCHVS_JOIN_OVER_NOTIFY, this.joinOverNotify, this);
        this.node.off(msg.MATCHVS_SEND_EVENT_RSP, this.sendEventResponse, this);
        this.node.off(msg.MATCHVS_SEND_EVENT_NOTIFY, this.sendEventNotify, this);
        this.node.off(msg.MATCHVS_LEAVE_ROOM, this.leaveRoomResponse, this);
        this.node.off(msg.MATCHVS_LEAVE_ROOM_NOTIFY, this.leaveRoomNotify, this);
        this.node.off(msg.MATCHVS_LOGOUT, this.logoutResponse, this);
        this.node.off(msg.MATCHVS_ERROE_MSG, this.errorResponse, this);
    },

    /**
     * 初始化回调
     * @param info
     */
    initResponse(status) {
        if (status == 200) {
            console.log('initResponse：初始化成功，status：' + status);
            //回调成功后注册
            var resultregist = engine.prototype.registerUser();
            console.log(resultregist, 'registerUser');
        } else {
            console.log('initResponse：初始化失败，status：' + status)
        }
    },


    /**
     * 注册回调
     * @param userInfo
     */
    registerUserResponse(userInfo) {
        if (userInfo.status == 0) {
            console.log('registerUserResponse：注册用户成功,id = ' + userInfo.id + 'token = ' + userInfo.token + 'name:' + userInfo.name +
                'avatar:' + userInfo.avatar);
            GameData.userID = userInfo.id;
            GameData.token = userInfo.token;
            GameData.userName = userInfo.name;
            //登录
            var resultlogin = engine.prototype.login(GameData.userID, GameData.token);
            if (resultlogin == -6) {
                console.log('已登录，请勿重新登录');
            } else if (resultlogin === -26) {
                console.log("GameData:", GameData);
                console.log('[游戏账户与渠道不匹配，请使用cocos账号登录Matchvs官网创建游戏]：(https://www.matchvs.com/cocos)');
            } else {
                console.log(resultlogin, 'login');
            }
        } else {
            console.log('registerUserResponse: 注册用户失败');
        }
    },

    /**
     * 登陆回调
     * @param MsLoginRsp
     */
    loginResponse(MsLoginRsp) {
        if (MsLoginRsp.status == 200) {
            console.log('loginResponse: 登录成功');
        } else if (MsLoginRsp.status == 402) {
            console.log('loginResponse: 应用校验失败，确认是否在未上线时用了release环境，并检查gameID、appkey 和 secret');
        } else if (MsLoginRsp.status == 403) {
            console.log('loginResponse：检测到该账号已在其他设备登录');
        } else if (MsLoginRsp.status == 404) {
            console.log('loginResponse：无效用户 ');
        } else if (MsLoginRsp.status == 500) {
            console.log('loginResponse：服务器内部错误');
        }
    },

    /**
     * 进入房间回调
     * @param status
     * @param userInfoList
     * @param roomInfo
     */
    joinRoomResponse(status, userInfoList, roomInfo) {
        if (status == 200) {
            console.log('joinRoomResponse: 进入房间成功：房间ID为：' + roomInfo.roomID + '房主ID：' + roomInfo.ownerId + '房间属性为：' + roomInfo.roomProperty);
            for (var i = 0; i < userInfoList.length; i++) {
                console.log('joinRoomResponse：房间的玩家ID是' + userInfoList[i].userID);
                this.onMatchSuccess(userInfoList[i]);
            }
            if (userInfoList.length == 0) {
                console.log('joinRoomResponse：房间暂时无其他玩家');
                let dataNode = cc.find("data").getComponent("data");
                dataNode.bisRoomLeader = true;
            }
        } else {
            console.log('joinRoomResponse：进入房间失败');
        }
    },

    /**
     * 其他玩家加入房间通知
     * @param roomUserInfo
     */
    joinRoomNotify(roomUserInfo) {
        console.log('joinRoomNotify：加入房间的玩家ID是' + roomUserInfo.userID);
        this.onMatchSuccess(roomUserInfo);
    },

    /**
     * 关闭房间成功
     * @param joinOverRsp
     */
    joinOverResponse(joinOverRsp) {
        if (joinOverRsp.status == 200) {
            console.log('joinOverResponse: 关闭房间成功');
        } else if (joinOverRsp.status == 400) {
            console.log('joinOverResponse: 客户端参数错误 ');
        } else if (joinOverRsp.status == 403) {
            console.log('joinOverResponse: 该用户不在房间 ');
        } else if (joinOverRsp.status == 404) {
            console.log('joinOverResponse: 用户或房间不存在');
        } else if (joinOverRsp.status == 500) {
            console.log('joinOverResponse: 服务器内部错误');
        }
    },

    /**
     * 关闭房间通知
     * @param notifyInfo
     */
    joinOverNotify(notifyInfo) {
        console.log('joinOverNotify：用户' + notifyInfo.srcUserID + '关闭了房间，房间ID为：' + notifyInfo.roomID);
    },

    /**
     * 发送消息回调
     * @param sendEventRsp
     */
    sendEventResponse(sendEventRsp) {
        if (sendEventRsp.status == 200) {
            console.log('sendEventResponse：发送消息成功');
        } else {
            console.log('sendEventResponse：发送消息失败');
        }
    },

    /**
     * 接收到其他用户消息通知
     * @param eventInfo
     */
    sendEventNotify(eventInfo) {
        console.log('sendEventNotify：用户' + eventInfo.srcUserID + '对你使出了一招' + eventInfo.cpProto);
    },

    /**
     * 离开房间回调
     * @param leaveRoomRsp
     */
    leaveRoomResponse(leaveRoomRsp) {
        if (leaveRoomRsp.status == 200) {
            console.log('leaveRoomResponse：离开房间成功，房间ID是' + leaveRoomRsp.roomID);
        } else if (leaveRoomRsp.status == 400) {
            console.log('leaveRoomResponse：客户端参数错误,请检查参数');
        } else if (leaveRoomRsp.status == 404) {
            console.log('leaveRoomResponse：房间不存在')
        } else if (leaveRoomRsp.status == 500) {
            console.log('leaveRoomResponse：服务器错误');
        }
    },

    /**
     * 其他离开房间通知
     * @param leaveRoomInfo
     */
    leaveRoomNotify(leaveRoomInfo) {
        console.log('leaveRoomNotify：' + leaveRoomInfo.userID + '离开房间，房间ID是' + leaveRoomInfo.roomID);
    },

    /**
     * 注销回调
     * @param status
     */
    logoutResponse(status) {
        if (status == 200) {
            console.log('logoutResponse：注销成功');
        } else if (status == 500) {
            console.log('logoutResponse：注销失败，服务器错误');
        }

    },

    /**
     * 错误信息回调
     * @param errorCode
     * @param errorMsg
     */
    errorResponse(errorCode, errorMsg) {
        console.log('errorMsg:' + errorMsg + 'errorCode:' + errorCode);
    },

    /**
     * 离开场景时解除监听
     */
    onDestroy() {
        this.removeEvent();
    },

    start() {
        // console.log("game start");
        this.resultControl.getComponent('resultControl').room = this;
        let dataNode = cc.find("data").getComponent("data");
        // console.log(dataNode.testNum);
        // console.log(dataNode.bIsWin)
        // console.log(dataNode.testNum)
        if (dataNode.bisShowGameResult == true) {
            this.resultControl.getComponent('resultControl').showGameResult(dataNode.bIsWin)
        }
    },

    /**
     * 初始化
     */
    initUser() {
        //初始化
        var result;
        if (GameData.isPAAS) {
            result = engine.prototype.premiseInit(GameData.host, GameData.gameID, GameData.appKey);
        } else {
            result = engine.prototype.init(GameData.channel, GameData.platform, GameData.gameID, GameData.appKey);
        }
        // console.log(result, 'init');
    },

    /**
     * 匹配对手
     */
    joinMatch() {
        var result = engine.prototype.joinRandomRoom(GameData.mxaNumer);
        console.log(result, 'joinMatch');
        if (result == 0) {
            this.hallNode.active = false;
            this.matchNode.active = true;
        }
        else if (result == -1) {

        }
    },

    /**
     * 当匹配对手成功时
     * @param {Array} userInfo 玩家信息
     */

    onMatchSuccess(userInfo) {
        //设置界面显示与隐藏
        this.matchEnemyNode.active = false;
        this.matchEnemyFindNode.active = true;
        this.matchingNode.active = false;
        this.matchingSuccessNode.active = true;
        //播放动画
        let anim = this.matchingSuccessNode.getComponent(cc.Animation);
        anim.play('matchSuccess')
        this.scheduleOnce(function () {
            cc.director.loadScene('game');
        }, 3);
    },

    /**
     * 跳转至溜溜球界面
     */
    jumpToBall(){

        this.hallNode.active = false;
        this.ballNode.active = true;

    }

    // update (dt) {},
});
