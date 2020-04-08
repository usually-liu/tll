var engine = require('../netWork/MatchvsEngine');
var response = require("../netWork/MatchvsResponse");
var msg = require("../netWork/MatvhsvsMessage");
var GameData = require('../netWork/ExamplesData');

const GAME_STATE_READY = 0;//准备状态
const GAME_STATE_START = 10;//游戏开始
const GAME_STATE_SHOOT = 20;//发射状态
const GAME_STATE_RECHANGE = 30;//重新装填状态
const GAME_STATE_GAMEOVER = 40;//游戏结束状态

cc.Class({
    extends: cc.Component,

    properties: {

        player: {
            default: null,
            type: cc.Node,
            tooltip: "玩家对象",
        },

        handPlayer: {
            default: null,
            type: cc.Node,
            tooltip: "玩家手势节点"
        },

        handPlayerNormal: {
            default: null,
            type: cc.Node,
        },

        handPlayerFire: {
            default: null,
            type: cc.Node,
        },

        handEnemy: {
            default: null,
            type: cc.Node,
            tooltip: "玩家手势节点"
        },

        handEnemyNormal: {
            default: null,
            type: cc.Node,
        },

        handEnemyFire: {
            default: null,
            type: cc.Node,
        },

        enemy: {
            default: null,
            type: cc.Node,
            tooltip: "对手对象",
        },

        handEnemy: {
            default: null,
            type: cc.Node,
            tooltip: "对手手势节点"
        },

        arrow: {
            default: null,
            type: cc.Node,
            tooltip: "箭头",
        },

        progressBar: {
            default: null,
            type: cc.ProgressBar,
            tooltip: "力度条"
        },

        barrier: {
            default: [],
            type: cc.Node,
            tooltip: "障碍物",
        },

        txtBoard: {
            default: null,
            type: cc.Node,
            tooltip: "文字提示板",
        },

        txtStart: {
            default: null,
            type: cc.Node,
            tooltip: "开始",
        },

        txtGoal: {
            default: null,
            type: cc.Node,
            tooltip: "进球"
        },

        scorePoint: {
            default: null,
            type: cc.Node,
            tooltip: "进球点父节点",
        },

        scroePrefab: {
            default: null,
            type: cc.Prefab,
            tooltip: "得分点预设"
        },

        crashPrefab: {
            default: null,
            type: cc.Prefab,
            tooltip: "碰撞特效预设",
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.initMatchvsEvent(this);
        this.startPos = cc.v2(0, 0);
        this.endPos = cc.v2(0, 0);
        this.player.getComponent('ball').game = this;
        this.player.getComponent('ball').init(true);
        this.enemy.getComponent('ball').game = this;
        this.enemy.getComponent('ball').init(false);

        this.gameState = GAME_STATE_READY;
        //初始化玩家当前得分
        this.score = 0;         //我方得分
        this.enemyScore = 0;    //对方得分
        //建造得分点对象池
        this.scorePointAry = [];
        this.scorePool = new cc.NodePool();
        let initCount = 6;
        for (let i = 0; i < initCount; ++i) {
            let scorePoint = cc.instantiate(this.scroePrefab);
            this.scorePool.put(scorePoint);
        }
        //建造碰撞点对象池
        this.crashPool = new cc.NodePool();
        let crashCount = 10;
        for (let i = 0; i < crashCount; ++i) {
            let crashPoint = cc.instantiate(this.crashPrefab);
            this.crashPool.put(crashPoint);
        }
        //保存全局节点对象
        this.data = cc.find("data").getComponent("data")
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     * @param self this
     */
    initMatchvsEvent(self) {
        //在应用开始时手动绑定一下所有的回调事件
        //初始化触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this, true);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this, true);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this, true);
        // console.log("1")
        response.prototype.bind();
        response.prototype.init(self);
        this.node.on(msg.MATCHVS_JOIN_OVER_RSP, this.joinOverResponse, this);
        this.node.on(msg.MATCHVS_JOIN_OVER_NOTIFY, this.joinOverNotify, this);
        this.node.on(msg.MATCHVS_SEND_EVENT_RSP, this.sendEventResponse, this);
        this.node.on(msg.MATCHVS_SEND_EVENT_NOTIFY, this.sendEventNotify, this);
        this.node.on(msg.MATCHVS_LEAVE_ROOM, this.leaveRoomResponse, this);
        this.node.on(msg.MATCHVS_LEAVE_ROOM_NOTIFY, this.leaveRoomNotify, this);
        // this.node.on(msg.MATCHVS_LOGOUT, this.logoutResponse, this);
        this.node.on(msg.MATCHVS_ERROE_MSG, this.errorResponse, this);
    },

    /**
     * 移除监听
     */
    removeEvent() {
        this.node.off(msg.MATCHVS_JOIN_OVER_RSP, this.joinOverResponse, this);
        this.node.off(msg.MATCHVS_JOIN_OVER_NOTIFY, this.joinOverNotify, this);
        this.node.off(msg.MATCHVS_SEND_EVENT_RSP, this.sendEventResponse, this);
        this.node.off(msg.MATCHVS_SEND_EVENT_NOTIFY, this.sendEventNotify, this);
        this.node.off(msg.MATCHVS_LEAVE_ROOM, this.leaveRoomResponse, this);
        this.node.off(msg.MATCHVS_LEAVE_ROOM_NOTIFY, this.leaveRoomNotify, this);
        // this.node.off(msg.MATCHVS_LOGOUT, this.logoutResponse, this);
        this.node.off(msg.MATCHVS_ERROE_MSG, this.errorResponse, this);
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

            console.log(sendEventRsp);
        } else {
            console.log('sendEventResponse：发送消息失败');
        }
    },

    /**
     * 接收到其他用户消息通知
     * @param eventInfo
     */
    sendEventNotify(eventInfo) {
        console.log('sendEventNotify：' + eventInfo.cpProto);
        let getMes = JSON.parse(eventInfo.cpProto);
        if (getMes.msgTitle == "setScorePoint") {
            //设置敌方得分点
            for (let i = 0; i < 3; i++) {
                console.log("set enemy ScorePoint", i)
                let scorePoint = null;
                if (this.scorePool.size() > 0) {
                    scorePoint = this.scorePool.get();
                }
                else {
                    scorePoint = cc.instantiate(this.scroePrefab);
                }
                scorePoint.parent = this.scorePoint
                //设置碰撞点的tag值
                scorePoint.getComponent(cc.Collider).tag = 14 + i
                let y = 628;
                let x = -1 * getMes.pos[i];
                // scorePoint.x = 0
                scorePoint.setPosition(cc.v2(x, y))
                this.scorePointAry[i + 3] = scorePoint;
            }
        }
        else if (getMes.msgTitle == "setbarrier") {
            for (let i = 0; i < 2; i++) {
                this.barrier[i].x = -1 * getMes.pos[i]
                this.barrier[i].angle = 180;
                this.barrier[i].active = true;
            }
        }
        else if (getMes.msgTitle == "shoot") {
            this.enemy.getComponent('ball').shoot(getMes.dis, getMes.angle);
            this.handEnemyNormal.active = false;
            this.handEnemyFire.active = true;
        }
        else if (getMes.msgTitle == "touchMove") {
            //显示手势
            this.handEnemy.active = true;
            this.handEnemyNormal.active = true;
            this.handEnemyFire.active = false;
            this.handEnemy.angle = getMes.angle;
        }
        else if (getMes.msgTitle == "goal") {
            //显示进球特效
            this.playGoal();
            this.setScoreState(getMes.tag - 14)
            this.enemy.getComponent('ball').resetPlayerPos();
        }
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
     * 错误信息回调
     * @param errorCode
     * @param errorMsg
     */
    errorResponse(errorCode, errorMsg) {
        console.log('errorMsg:' + errorMsg + 'errorCode:' + errorCode);
    },

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.touchStart, this, true);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this, true);
        this.node.off(cc.Node.EventType.TOUCH_END, this.touchEnd, this, true);
        this.removeEvent();
    },

    start() {

        //设置帧率
        cc.game.setFrameRate(60);
        console.log('设置帧率为60');
        //开启碰撞系统
        cc.director.getCollisionManager().enabled = true;
        // cc.director.getCollisionManager().enabledDebugDraw = true
        this.txtBoard.active = true;
        this.txtStart.active = true;
        this.txtGoal.active = false;

        this.scheduleOnce(function () {

            //改变状态
            this.gameState = GAME_STATE_START;
            //隐藏文字
            this.txtBoard.active = false;
            //设置我方得分点
            let scorePointPos = [];
            for (let i = 0; i < 3; i++) {
                console.log("set player ScorePoint", i)
                let scorePoint = null;
                if (this.scorePool.size() > 0) {
                    scorePoint = this.scorePool.get();
                }
                else {
                    scorePoint = cc.instantiate(this.scroePrefab);
                }
                scorePoint.parent = this.scorePoint
                //设置碰撞点的tag值
                scorePoint.getComponent(cc.Collider).tag = 11 + i
                //设置坐标
                let y = -350;
                let x = i * 330 - 330 + Math.floor(Math.random() * 100 - 50);
                scorePointPos[i] = x;
                // let x = 0
                scorePoint.setPosition(cc.v2(x, y))
                this.scorePointAry[i] = scorePoint;
            }
            //发送得分点信息
            let sendMsg = {
                msgTitle: "setScorePoint",
                pos: scorePointPos,
            }
            engine.prototype.sendEvent(JSON.stringify(sendMsg));
            //设置障碍物
            if (this.data.bisRoomLeader == true) {
                let barrierPos = [];
                for (let i = 0; i < 2; i++) {
                    this.barrier[i].active = true;
                    this.barrier[i].x = (i - 1) * 1000 + 500 + Math.floor(Math.random() * 100 - 50);
                    barrierPos[i] = this.barrier[i].x;
                }
                let barrierMsg = {
                    msgTitle: "setbarrier",
                    pos: barrierPos,
                }
                engine.prototype.sendEvent(JSON.stringify(barrierMsg));
            }

        }, 1);

    },

    // update (dt) {},

    touchStart(event) {
        // cc.log("touchStart");
        // cc.log(event.getLocationX(),event.getLocationY());
        if (this.gameState != GAME_STATE_START) {
            return;
        }
        this.startPos = event.getLocation();
        //显示箭头
        this.arrow.active = true;
        //显示手势
        this.handPlayer.active = true;
        this.handPlayerNormal.active = true;
        this.handPlayerFire.active = false;
        //重置进度条
        this.progressBar.progress = 0;
    },

    touchMove(event) {
        // cc.log("touchMove");
        if (this.gameState != GAME_STATE_START) {
            return;
        }

        let pos = event.getLocation();
        let scaleNum = 300;
        //计算方向
        let dx = this.startPos.x - pos.x;
        let dy = this.startPos.y - pos.y;
        let dir = cc.v2(dx, dy);
        let rot = dir.signAngle(cc.Vec2.UP);
        //计算角度
        let angle = -1 * rot * 180 / Math.PI;
        // console.log(angle)
        //设置角度的最大偏移值
        if (angle > 60)
            angle = 60;
        else if (angle < -60)
            angle = -60;
        //计算距离
        let dis = pos.sub(this.startPos).mag();
        //设置箭头角度
        this.arrow.angle = angle;
        //设置手势角度
        this.handPlayer.angle = angle;
        //计算缩放大小
        let scale = dis / scaleNum > 1 ? 1 : dis / scaleNum;
        //更新节点Y轴缩放(最高为1.0)
        this.arrow.scaleY = scale;
        //设置进度条(最高为1.0)
        this.progressBar.progress = scale;
        // cc.log(angle);
        //发送消息
        let sendMsg = {
            msgTitle: "touchMove",
            angle: angle + 180,
        }
        engine.prototype.sendEvent(JSON.stringify(sendMsg));

    },

    touchEnd(event) {
        // cc.log("touchEnd");
        //隐藏箭头
        if (this.gameState != GAME_STATE_START) {
            return;
        }

        this.arrow.scaleY = 0;
        this.arrow.active = false;

        if (this.player.getComponent('ball').speed != 0)
            return

        this.endPos = event.getLocation();
        //计算方向
        let dx = this.startPos.x - this.endPos.x;
        let dy = this.startPos.y - this.endPos.y;
        let dir = cc.v2(dx, dy);
        let angle = dir.signAngle(cc.Vec2.UP);
        if (angle > 60 * Math.PI / 180)
            angle = 60 * Math.PI / 180;
        else if (angle < -60 * Math.PI / 180)
            angle = -60 * Math.PI / 180;
        // cc.log(angle);
        let dis = this.endPos.sub(this.startPos).mag();
        this.player.getComponent('ball').shoot(dis * 3, angle);
        //发送消息
        let msgAngle = dir.signAngle(cc.v2(0, -1))
        let sendMsg = {
            msgTitle: "shoot",
            dis: dis * 3,
            angle: msgAngle,
        }
        engine.prototype.sendEvent(JSON.stringify(sendMsg));
        //重置进度条
        this.progressBar.progress = 0;
        //切换手势显示
        this.handPlayerNormal.active = false;
        this.handPlayerFire.active = true;
        //改变游戏状态
        this.gameState = GAME_STATE_SHOOT;
    },

    /**
     * 播放进球特效
     */
    playGoal() {
        this.txtBoard.active = true;
        this.txtStart.active = false;
        this.txtGoal.active = true
        this.scheduleOnce(function () {
            this.txtBoard.active = false;
        }, 1);
    },

    /**
     * 设置弹球进洞
     */
    setScoreState(tag) {

        if (this.scorePointAry[tag].children[0].active == false) {
            this.scorePointAry[tag].children[0].active = true;
            if (tag >= 3)
                this.score++;
            else
                this.enemyScore++
        }

        if (this.score >= 3 || this.enemyScore >= 3) {
            this.gameState = GAME_STATE_GAMEOVER;
            this.setResult();
            this.scheduleOnce(function () {
                cc.director.loadScene('room');
            }, 3);
        }

    },

    /**
     * 重置状态(设为可发射状态)
     */
    resetState() {

        this.gameState = GAME_STATE_START;

    },

    /**
     * 设置弹球碰撞
     * @param {v2} pos 
     */
    setCrash(pos) {

        cc.log("crash");
        //从对象池中取出对象
        let crashpoint = null;
        if (this.crashPool.size() > 0) {
            crashpoint = this.crashPool.get();
        }
        else {
            crashpoint = cc.instantiate(this.crashPrefab);
        }
        crashpoint.parent = this.scorePoint
        crashpoint.getComponent('crash').showAndPlayAnim(pos)

    },

    /**
     * 设置比赛结果
     */

    setResult() {

        this.data.bisShowGameResult = true
        if (this.enemyScore >= 3) {
            this.data.bIsWin = false;
        }
        else if (this.score >= 3) {
            this.data.bIsWin = true;
        }

    },

});
