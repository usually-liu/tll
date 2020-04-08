var engine = require('../netWork/MatchvsEngine');
var response = require("../netWork/MatchvsResponse");
var msg = require("../netWork/MatvhsvsMessage");

const STATE_NON = 0;      //初始状态
const STATE_WATING = 10;     //等待匹配
const STATE_OPREADING = 20;     //对手已准备好
const STATE_LIVING = 30;     //对手已离开

cc.Class({
    extends: cc.Component,

    properties: {
        resultNode: {
            type: cc.Node,
            default: null,
            tooltip: "结算界面",
        },

        nameNode: {
            type: cc.Node,
            default: null,
            tooltip: "姓名板",
        },

        loseNode: {
            type: cc.Node,
            default: null,
            tooltip: "失败",
        },

        winNode: {
            type: cc.Node,
            default: null,
            tooltip: "胜利",
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.initMatchvsEvent(this);
        this.resultState = STATE_NON;
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     * @param self this
     */
    initMatchvsEvent(self) {
        //在应用开始时手动绑定一下所有的回调事件
        response.prototype.bind();
        response.prototype.init(self);
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
        this.node.off(msg.MATCHVS_SEND_EVENT_RSP, this.sendEventResponse, this);
        this.node.off(msg.MATCHVS_SEND_EVENT_NOTIFY, this.sendEventNotify, this);
        this.node.off(msg.MATCHVS_LEAVE_ROOM, this.leaveRoomResponse, this);
        this.node.off(msg.MATCHVS_LEAVE_ROOM_NOTIFY, this.leaveRoomNotify, this);
        this.node.off(msg.MATCHVS_LOGOUT, this.logoutResponse, this);
        this.node.off(msg.MATCHVS_ERROE_MSG, this.errorResponse, this);
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
        // console.log('sendEventNotify：用户' + eventInfo.srcUserID + '对你使出了一招' + eventInfo.cpProto);
        if (eventInfo.cpProto == "goonMatch") {
            console.log("goonMatch");
            if(this.resultState = STATE_WATING){
                this.scheduleOnce(function () {
                    cc.director.loadScene('game');
                }, 3);
            }
            else{
                this.resultState = STATE_OPREADING;
            }
        }
    },

    /**
     * 离开房间回调
     * @param leaveRoomRsp
     */
    leaveRoomResponse(leaveRoomRsp) {
        if (leaveRoomRsp.status == 200) {
            console.log('leaveRoomResponse：离开房间成功，房间ID是' + leaveRoomRsp.roomID);
            //重新匹配
            this.room.joinMatch();
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

    start() {

    },

    showGameResult(bIsWin) {
        if (bIsWin == true) {
            this.resultNode.active = true;
            this.winNode.active = true;
            this.loseNode.active = false;
            this.scheduleOnce(function () {
                this.winNode.active = false;
                this.nameNode.active = true;
            }, 2);
        }
        else if (bIsWin == false) {
            this.resultNode.active = true;
            this.winNode.active = false;
            this.loseNode.active = true;
            this.scheduleOnce(function () {
                this.loseNode.active = false;
                this.nameNode.active = true;
            }, 2);
        }
    },

    /**
     * 点击继续对战按钮
     */
    goonMatch() {
        engine.prototype.sendEvent("goonMatch")
        if (this.resultState == STATE_OPREADING) {
            this.scheduleOnce(function () {
                cc.director.loadScene('game');
            }, 3);
        }
        else {
            this.resultState = STATE_WATING;
        }
    },

    /**
     * 点击重新匹配按钮
     */
    reMatch() {
        engine.prototype.leaveRoom();
    },

    // update (dt) {},
});
