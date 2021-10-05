const htmlCanvas = document.getElementById(`c`);
const ctx = htmlCanvas.getContext(`2d`);
const bluebricks_img = document.getElementById(`bluebricks_png`);
const spikes_img = document.getElementById(`spikes_png`);
const avatar_crouch_img = document.getElementById(`avatar_crouch_png`);
const avatar_jump_img = document.getElementById(`avatar_jump_png`);
const avatar_stand_img = document.getElementById(`avatar_stand_png`);
const avatar_grasp_img = document.getElementById(`avatar_grasp_png`);
const avatar_pullup_img = document.getElementById(`avatar_pullup_png`);

canvas = {center: {}};
canvas.width = 800;
canvas.height = 600;
canvas.dimension = 32;
canvas.dimension_half = canvas.dimension / 2;
canvas.center.x = canvas.width / 2;
canvas.center.y = canvas.height / 2;
canvas.draw = () => {
    htmlCanvas.width = canvas.width;
    htmlCanvas.height = canvas.height;
    ctx.fillStyle = `#001`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
canvas.clear = () => {
    ctx.fillStyle = `#001`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

stage = {};
stage.matrix = [];
stage.width = 0;
stage.height = 0;
stage.spawn = {x: 0, y:0};

stage.inputStringArray = (string_array) => {
    stage.matrix = [];
    stage.width = string_array[0].length;
    stage.height = string_array.length;
    for(let iy = 0; iy < stage.height; iy++) {
        stage.matrix[iy] = [];
        for(let ix = 0; ix < stage.width; ix++) {
            stage.matrix[iy][ix] = 0;
        }
    }
    for(let iy = 0; iy < stage.height; iy++) {
        for(let ix = 0; ix < stage.width; ix++) {
            let bx = stage.width - ix - 1;
            let by = stage.height - iy - 1;
            string = string_array[iy];
            stage.matrix[by][bx] = string.charAt(ix);
            // if(isNaN(string.charAt(ix))) {
            //     stage.matrix[by][bx] = string.charAt(ix);
            // } else {
            //     stage.matrix[by][bx] = parseInt(string.charAt(ix));
            // }
            if(string.charAt(ix) === `S`) {
                stage.spawn.x = bx;
                stage.spawn.y = by;
            }
        }
    }
    avatar.position.x = stage.spawn.x;
    avatar.position.y = stage.spawn.y;
}
stage.draw = () => {
    for(let iy = 0; iy < stage.height; iy++) {
        for(let ix = 0; ix < stage.width; ix++) {
            let tile = 0;
            let print_x = (avatar.position.x - ix) * canvas.dimension + canvas.center.x - canvas.dimension_half;
            let print_y = (avatar.position.y - iy) * canvas.dimension + canvas.center.y - canvas.dimension_half;
            if(stage.matrix[iy][ix] === `b`) {tile = bluebricks_img}
            else if(stage.matrix[iy][ix] === `2`) {tile = spikes_img}
            else if(stage.matrix[iy][ix] === `3`) {
                tile = spikes_img;
                
            }
            else if(stage.matrix[iy][ix] === `4`) {
                tile = spikes_img;
                // ctx.translate(0, canvas.height);
                print_y = print_y * -1;
                print_y -= canvas.dimension;
                ctx.scale(1, -1);
            }
            else if(stage.matrix[iy][ix] === `5`) {
                tile = spikes_img;
            }


            if(tile !== 0) ctx.drawImage(tile, print_x, print_y, canvas.dimension, canvas.dimension);

            ctx.resetTransform();
        }
    }
}

avatar = {position: {}};
avatar.facing = -1;
avatar.crouching = false;
avatar.crouch_lock = false;
avatar.grasping = false;
avatar.alive = false;
avatar.falling = false;
avatar.pullingup = false;
avatar.delay_action = 0;
avatar.stand_delay = 20;
avatar.jump_delay = 10;
avatar.airtime = 0;
avatar.fell = 0;
avatar.jumping = 0;
avatar.position.x = 0;
avatar.position.y = 0;
avatar.time_crouched = 0;
avatar.height = 2;
avatar.width = 1;
avatar.sprite = avatar_stand_img;

avatar.correctStance = () => {
    if(avatar.zapped(0, 0)
    || (avatar.height === 2 && avatar.zapped(0, 1))) {
        avatar.dies();
    } else {
        if(avatar.grasping && avatar.height === 2) {
            avatar.time_crouched = 0;
            if(avatar.pullingup) {
                avatar.width = 2;
                avatar.height = 2;
                avatar.sprite = avatar_pullup_img;
            } else {
                avatar.width = 1;
                avatar.height = 2;
                avatar.sprite = avatar_grasp_img;
            }
        } else if((avatar.airtime > avatar.fell || avatar.airtime > 1 || avatar.jumping > 0) && !avatar.blocked(0, -1)) {
            if(!avatar.blocked(0, 1)) {
                avatar.time_crouched = 0;
                avatar.width = 1;
                avatar.height = 2;
                avatar.sprite = avatar_jump_img;
            }
        } else {
            if(avatar.crouching) {
                avatar.width = 1;
                avatar.height = 1;
                avatar.sprite = avatar_crouch_img;
                if(avatar.blocked(0, -1)) {avatar.time_crouched++} else avatar.time_crouched = 0;
                if(avatar.time_crouched >= avatar.stand_delay && !avatar.crouch_lock) avatar.crouch(2);
            } else {
                if(!avatar.blocked(0, 1)) {
                    avatar.time_crouched = 0;
                    avatar.width = 1;
                    avatar.height = 2;
                    avatar.sprite = avatar_stand_img;
                }
            }
        }
        if(avatar.blocked(0, -1) || (avatar.grasping && avatar.height === 2)) {
            avatar.airtime = 0;
            avatar.jumping = 0;
            avatar.fell = 0;
        }
    }
}
avatar.queueFunction = (push, function_to_queue, queue_context, queue_paramaters) => {
    let wrapFunction = (function_to_wrap, wrap_context, wrap_paramaters) => {return function() {function_to_wrap.apply(wrap_context, wrap_paramaters)}};
    let wrapped_function = wrapFunction(function_to_queue, queue_context, queue_paramaters);
    if(push) {saved_input.push(wrapped_function)} else {saved_input.unshift(wrapped_function)};
}
avatar.blocked = (direction, height) => {
    if(stage.matrix[avatar.position.y + height] === undefined
    || stage.matrix[avatar.position.y + height][avatar.position.x + direction] === undefined) {return false}
    else if (stage.matrix[avatar.position.y + height][avatar.position.x + direction] === `b`) {return true}
    else return false;
}
avatar.zapped = (direction, height) => {
    if(stage.matrix[avatar.position.y + height] === undefined
    || stage.matrix[avatar.position.y + height][avatar.position.x + direction] === undefined) {return false}
    else if (stage.matrix[avatar.position.y + height][avatar.position.x + direction] === `2`
    || stage.matrix[avatar.position.y + height][avatar.position.x + direction] === `3`
    || stage.matrix[avatar.position.y + height][avatar.position.x + direction] === `4`
    || stage.matrix[avatar.position.y + height][avatar.position.x + direction] === `5`) {return true}
    else return false;
    // if(stage.matrix[avatar.position.y + height] === undefined) {return true}
    // else if(stage.matrix[avatar.position.y + height][avatar.position.x + direction] === 0
    // || stage.matrix[avatar.position.y + height][avatar.position.x + direction] === 1) {return false}
    // else return true;
}
avatar.draw = () => {
    let print_x = canvas.center.x - canvas.dimension_half;
    let print_y = canvas.center.y - (canvas.dimension * (avatar.height - 1)) - canvas.dimension_half;
    let dimension_x = canvas.dimension * avatar.width;
    let dimension_y = canvas.dimension * avatar.height;
    if(avatar.facing === 1) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }
    ctx.drawImage(avatar.sprite, print_x, print_y, dimension_x, dimension_y);
    if(avatar.facing === 1) {ctx.resetTransform()};
}
avatar.ascend = () => {
    if(!avatar.blocked(0,1) && !avatar.blocked(0,2)) avatar.position.y++;
}
avatar.gravity = () => {
    if(!avatar.grasping) {
        if(!avatar.blocked(0, -1)) {
            avatar.airtime++;
            if(avatar.jumping === 0) {
                avatar.position.y--;
                avatar.fell++;
            } else avatar.jumping--;
        }
        if(!avatar.crouching && (avatar.airtime > 1 || avatar.jumping > 0)) avatar.queueFunction(false, avatar.crouch, this, [1]);
    }
}
avatar.crouch = (mode) => {if(mode === 1) {avatar.crouching = true} else if(mode === 2) {avatar.crouching = false}};
avatar.delayAction = (duration) => {
    avatar.delay_action += duration;
}
avatar.grasp = (mode) => {
    if(mode === 0) {
        avatar.grasping = false;
        avatar.pullingup = false;
    } else if(mode === 1) {
        avatar.grasping = true;
        avatar.crouching = false;
    }
}
avatar.pullup = (mode) => {if(mode === 0) {avatar.pullingup = false} else if(mode === 1) {avatar.pullingup = true}};
avatar.jump = (power) => {
    if(avatar.grasping && avatar.height === 2) {
        if(avatar.pullingup && !avatar.blocked(0, -1)) {
            avatar.grasp(0);
        } else if(!avatar.blocked(0, 2)) {
            avatar.position.y++;
            avatar.pullup(1);
        }
    } else if(avatar.jumping === 0 && avatar.blocked(0, -1)) {
        if(power > 0 && avatar.time_crouched < avatar.jump_delay) {avatar.queueFunction(false, avatar.jump, this, [power])}
        else {
            let can_jump = true;
            for(let i = 0; i <= power + 1; i++) if(avatar.blocked(0, i)) can_jump = false;
            if(avatar.blocked(0, 1)) can_jump = false;
            if(can_jump) {
                avatar.position.y++;
                avatar.jumping = power;
                for(let i = 0; i < power; i++) {
                    avatar.queueFunction(false, avatar.ascend, this, []);
                }
            }  
        }
        if(power > 0 && !avatar.crouching) {avatar.queueFunction(false, avatar.crouch, this, [1])};
    }
}
avatar.move = (direction) => {
    let can_move = false;
    let grasped = false;
    if(avatar.grasping) {
        if(avatar.facing === direction) {
            if(avatar.pullingup) {
                avatar.grasp(0);
                avatar.crouch(1);
                avatar.position.y++;
                can_move = true;
            } else if(!avatar.blocked(0, 2)) {
                avatar.position.y++;
                avatar.pullup(1);
                grasped = true;
            }
        } else {
            avatar.grasp(0);
        }
    } else {
        avatar.facing = direction;
        if(avatar.height === 1
        && avatar.blocked(direction, 0)
        && !avatar.blocked(direction, 1)
        && !avatar.blocked(0, 1)
        && !avatar.blocked(0, -1)) {
            avatar.crouch(2);
            avatar.height = 2;
            avatar.grasp(1);
            avatar.pullup(1);
            grasped = true;
        } else if(avatar.height === 2
        && avatar.blocked(direction, 1)
        && !avatar.blocked(0, 2)
        && !avatar.blocked(direction, 2)) {
            avatar.grasp(1);
            grasped = true;
        } else if(avatar.height === 2
        && avatar.blocked(direction, 0)
        && !avatar.blocked(0, -1)
        && !avatar.blocked(0, 1)
        && !avatar.blocked(direction, 1)) {
            avatar.grasp(1);
            avatar.pullup(1);
            grasped = true;
        } else if(!avatar.blocked(direction, 0)
        && (!avatar.blocked(direction, 1) || avatar.height === 1)) {
            can_move = true;
        } else if(avatar.blocked(0, -1)
        && !avatar.blocked(0, 1)
        && !avatar.blocked(direction, 1)) {
            avatar.queueFunction(false, avatar.move, this, [direction]);
            avatar.queueFunction(false, avatar.jump, this, [0]);
            if((avatar.blocked(0, 2) || avatar.blocked(direction, 2)) && avatar.height !== 1) avatar.queueFunction(false, avatar.crouch, this, [1]);
        }
    }
    if(!grasped) avatar.grasp(0);
    if(can_move) {
        if(avatar.blocked(0, 1)) {avatar.crouching = true; avatar.time_crouched = 0};
        // if(avatar.crouching && avatar.blocked(0, -1) && !avatar.blocked(direction, -1) && !avatar.blocked(direction, -2)) {
        //     avatar.facing = direction * -1;
        //     avatar.position.y--;
        //     avatar.grasp(1);
        //     avatar.pullup(1);
        //     grasped = true;
        // }
        // if(avatar.crouching && avatar.blocked(0, -1) && !avatar.blocked(direction, -1) && !avatar.blocked(direction, -2)) {
        //     avatar.queueFunction(false, avatar.move, this, [direction * -1]);
        //     avatar.queueFunction(false, avatar.delayAction, this, [1]);
        // }
        avatar.position.x += direction;
    }
}
avatar.dies = () => {
    avatar.alive = false;
    avatar.position.x = stage.spawn.x;
    avatar.position.y = stage.spawn.y;
}
avatar.resurrect = (new_position) => {
    avatar.facing = -1;
    avatar.crouching = false;
    avatar.crouch_lock = false;
    avatar.grasping = false;
    avatar.falling = false;
    avatar.airtime = 0;
    avatar.fell = 0;
    avatar.jumping = 0;
    avatar.position.x = new_position.x;
    avatar.position.y = new_position.y;
    avatar.time_crouched = 0;
    avatar.height = 2;
    avatar.alive = true;
}

const saved_input = [];
second = 0;
const gravity_tick = 3;
time_frozen = false;
time = () => {
    if(!time_frozen) {
        if(avatar.delay_action === 0) {if(saved_input.length > 0) (saved_input.shift())()} else avatar.delay_action--;
        if(second === gravity_tick) {second = 0; avatar.gravity()};
        if(!avatar.alive) {avatar.resurrect(stage.spawn)};
        avatar.correctStance();
        canvas.clear();
        stage.draw();
        avatar.draw();
        second++;
    }
    window.requestAnimationFrame(time);
}

arrow_left_held = false;
arrow_right_held = false;
shift_held = false;
function keyDown(e) {
    if(e.key === `ArrowLeft` || e.key === `a` || e.key === `A`) {arrow_left_held = true; avatar.queueFunction(true, avatar.move, this, [1])}
    else if(e.key === `ArrowRight` || e.key === `d` || e.key === `D`) {arrow_right_held = true; avatar.queueFunction(true, avatar.move, this, [-1])}
    else if(e.key === `ArrowUp` || e.key === `w` || e.key === `W`) {avatar.queueFunction(true, avatar.jump, this, [1])}
    else if(e.key === `ArrowDown` || e.key === `s` || e.key === `S`) {
        if(avatar.blocked(0, -1)) {
            if(avatar.crouch_lock && avatar.crouching) {avatar.queueFunction(true, avatar.crouch, this, [2])}
            else if(!avatar.crouching) {avatar.queueFunction(true, avatar.crouch, this, [1])};
            avatar.crouch_lock = !avatar.crouch_lock;
        } else {
            if(avatar.pullingup) {
                avatar.position.y--;
                avatar.pullup(0);
            }
            else if(avatar.grasping) {avatar.grasp(0)};
        }
    }
    else if(e.key === `Shift`) {shift_held = true}
    else if(e.key === `g`) {avatar.queueFunction(true, avatar.delayAction, this, [1])}
    else if(e.key === ` `) time_frozen = !time_frozen;
}
function keyUp(e) {
    if(e.key === `ArrowLeft`) {arrow_left_held = false}
    else if(e.key === `ArrowRight`) {arrow_right_held = false}
    else if(e.key === `Shift`) shift_held = false;
}
document.addEventListener(`keydown`, keyDown);
document.addEventListener(`keyup`, keyUp);

stage1 = [
    `bbbbbbb.....................................`,
    `bbbbbbb.....................................`,
    `bbbbbbb.....................................`,
    `bbbbbbb.....................................`,
    `bbbbbbb................b....................`,
    `bbbbbbb.....................................`,
    `bbbbbbb.....................................`,
    `bbbbbbb...........b.b.b.....................`,
    `bbbbbbb..........bb.........................`,
    `bbbbbbb.........bbb2222222..................`,
    `bbbbbbb........bbbbbbbbbbb..................`,
    `b....4........bbb...........................`,
    `b.........2..bbbb...........................`,
    `b.bbbbbbbbbbbbbbb.b.........................`,
    `b.........bb......b.....b...................`,
    `b.........bb......b....bb...................`,
    `b....S....bb......bbbbbbb222................`,
    `bbbbbbbbbbbbbbbbbbbbbbbbbbbb................`
]
stage.inputStringArray(stage1);

avatar.resurrect(stage.spawn);

canvas.draw();
avatar.draw();
time();

// to do:
//
// treat "undefined" as normal free spaces. this allows levels to be made without adding extra space at the top for jumping, and makes the skybox unlimited.