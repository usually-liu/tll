cc.Class({
    extends: cc.Component,

    properties: {
        nameNode: {
            type: cc.Sprite,
            default: null,
            tooltip: "姓名板",
        },

        haveNode: {
            type: cc.Node,
            default: null,
            tooltip: "已拥有",
        },

        notHaveNode: {
            type: cc.Node,
            default: null,
            tooltip: "未拥有",
        },

        include:{
            type: cc.Label,
            default: null,
            tooltip: "说明文字",
        },

        ballSpriteFrame: {
            type: cc.SpriteFrame,
            default: [],
            tooltip: "溜溜球图片",
        },

        nameSpriteFrame: {
            type: cc.SpriteFrame,
            default: [],
            tooltip: "溜溜球名字",
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

        //设置默认的溜溜球ID,防止点击获取渠道时报错
        

    },

    /**
     * 设置已获取溜溜球
     * @param {ID} index 
     */
    setBallHave(index) {

        this.haveNode.active = true;
        this.notHaveNode.active = false;
        this.setBallName(index);

    },

    /**
     * 设置未获取溜溜球
     * @param {ID} index 
     */
    setBallNotHave(index) {

        this.haveNode.active = false;
        this.notHaveNode.active = true;
        this.setBallName(index);

    },

    /**
     * 设置溜溜球名字
     * @param {ID} index 
     */
    setBallName(index) {

        this.nameNode.spriteFrame = this.nameSpriteFrame[index];

    },

    /**
     * 根据溜溜获取方法获取溜溜球 
     */
    toGetBall() {

    },

    // update (dt) {},
});
