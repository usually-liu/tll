cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    /**
     * 显示并播放动画
     * @param {v2} pos 
     */
    showAndPlayAnim(pos){

        let anim = this.getComponent(cc.Animation);
        this.node.active = true;
        this.node.setPosition(pos);
        anim.play('crash')
        
    },

    /**
     * 当动画播放结束时
     */
    onCrashEnd(){
        
        this.node.active = false;

    }

    // update (dt) {},
});
