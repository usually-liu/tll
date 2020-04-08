var engine = require('../netWork/MatchvsEngine');
cc.Class({
    extends: cc.Component,

    properties: {

        speed: {
            default: 0,
            tooltip: "发射速度",
        },

        resistance: {
            default: 500,
            tooltip: "阻力",
        },

    },

    // LIFE-CYCLE CALLBACKS:

    init(bIsPlayer) {
        console.log("init ball", bIsPlayer)
        this.bIsPlayerBall = bIsPlayer;
    },

    onLoad() {
        this.rot = 0;
        this.speedx = 0;
        this.speedy = 0;
        this.bIsPlayerBall = false;
    },

    start() {
        this.startPos = this.node.getPosition();
        //设置碰撞前的起始坐标
        this.preCollisionPos = this.node.getPosition();
    },

    update(dt) {

        if (this.speed > 0) {

            let dis = this.speed * dt
            this.node.x += this.speedx * dis;
            this.node.y += this.speedy * dis;
            this.speed -= this.resistance * dt;
            if (this.speed <= 0) {
                this.resetPlayerPos();
            }
        }

    },

    /**
     * 发射弹珠
     * @param {Number} speed 速度
     * @param {Number} rot 发射角度(弧度计)
     */
    shoot(speed, rot) {

        this.speed = speed;
        this.rot = rot;
        this.speedx = Math.sin(this.rot);
        this.speedy = Math.cos(this.rot);

    },

    resetPlayerPos() {

        this.speed = 0;
        this.node.setPosition(this.startPos);
        this.preCollisionPos = this.startPos;

        if (this.bIsPlayerBall == true) {
            this.game.resetState();
        }

    },

    /**
     * 
     * @param {Collider} other 产生碰撞的另一个碰撞组件
     * @param {Collider} self 产生碰撞的自身的碰撞组件
     */
    onCollisionEnter(other, self) {
        switch (other.tag) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
                console.log("Collision", other.tag)
                this.setCollisionVec2(other, self)
                break;
            //两球相撞
            case 10:
                console.log("Collision ball")
                this.speed = 0;
                this.resetPlayerPos();
                break;
            //进球
            case 14:
            case 15:
            case 16:
                //发送消息
                if (self.tag == 0) {
                    let tag = other.tag - 11;
                    let scorePoint = this.game.scorePointAry[tag].children
                    if (scorePoint[0].active == false) {
                        this.resetPlayerPos();
                        //播放进球特效
                        this.game.playGoal(other.tag);
                        console.log('on collision enter', other.tag);
                        let sendMsg = {
                            msgTitle: "goal",
                            tag: other.tag,
                        }
                        engine.prototype.sendEvent(JSON.stringify(sendMsg));
                        this.game.setScoreState(tag);
                    }
                }
                break;
        }
    },

    /**
     * 计算物体向量
     * @param {Object} other //碰撞对象
     * @param {Object} self //自身对象
     */
    setCollisionVec2(other, self) {
        //设置物体向量
        let incidentpos = cc.v2(self.node.x - this.preCollisionPos.x, self.node.y - this.preCollisionPos.y)
        //障碍物向量
        let tagNode = other.node.children
        let verticalPos = cc.v2();
        if (tagNode[0] && tagNode[1]) {
            //计算碰撞面的距离
            let newVec0 = tagNode[0].convertToWorldSpaceAR(cc.v2(0, 0));
            let newVec1 = tagNode[1].convertToWorldSpaceAR(cc.v2(0, 0));
            verticalPos = cc.v2(newVec0.x - newVec1.x, newVec0.y - newVec1.y);
            verticalPos.normalizeSelf();
            //将两个向量点乘
            if (incidentpos.dot(verticalPos) < 0) {
                verticalPos.negSelf();
            }
            let T = incidentpos.dot(verticalPos);
            verticalPos.mulSelf(2 * T);
            let b = verticalPos.sub(incidentpos);
            b.normalizeSelf();
            this.rot = b.signAngle(cc.v2(0, 1));
            this.speedx = Math.sin(this.rot);
            this.speedy = Math.cos(this.rot);
            this.preCollisionPos = this.node.getPosition();
            this.game.setCrash(self.node.getPosition());
        }
    },
});
