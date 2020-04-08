cc.Class({
    extends: cc.Component,

    properties: {
        hallNode: {
            type: cc.Node,
            default: null,
            tooltip: "大厅界面",
        },

        ballNode: {
            type: cc.Node,
            default: null,
            tooltip: "溜溜球界面",
        },

        content: {
            type: cc.Node,
            default: null,
            tooltip: "滚动条节点",
        },

        ballPrefab: {
            type: cc.Prefab,
            default: null,
            tooltip: "溜溜球皮肤预设",
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.ballContentPool = new cc.NodePool();
        let initCount = 11;
        for (let i = 0; i < initCount; ++i) {
            let ball = cc.instantiate(this.ballPrefab);
            this.ballContentPool.put(ball);
        }
    },

    start() {

        let initCount = 11;
        this.content.height = initCount * 530;
        for (let i = 0; i < initCount; ++i) {
            let ballContent = null;
            if (this.ballContentPool.size() > 0) {
                ballContent = this.ballContentPool.get();
            }
            else {
                ballContent = cc.instantiate(this.ballPrefab);
            }
            ballContent.parent = this.content;
            ballContent.x = 0;
            ballContent.y = -265 - i * 535;
            ballContent.getComponent("ballContent").setBallHave(i);
        }

    },

    /**
     * 返回大厅
     */
    backToHall() {

        this.hallNode.active = true;
        this.ballNode.active = false;

    },

    // update (dt) {},
});
