//数据类,用于记录玩家当前的状态
cc.Class({
    extends: cc.Component,

    properties: {
        bisShowGameResult: {
            default: false,
            tooltip: "是否显示比赛结果",
        },

        bIsWin: {
            default: false,
            tooltip: "是否胜利",
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        //设置该脚本为常驻脚本
        cc.game.addPersistRootNode(this.node)
        this.bisShowGameResult = false;
        this.bIsWin = false;
        this.testNum = 10;
        this.bisRoomLeader = false;
    },

    start() {

    },

    // update (dt) {},
});
