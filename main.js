const html_canvas = document.getElementById(`c`);
const ctx = html_canvas.getContext(`2d`);
// const html_stage_input = document.getElementById(`stage_input`);
const locked_exit_img = document.getElementById(`locked_exit_png`);
const key_img = document.getElementById(`key_png`);
const blue_bricks_img = document.getElementById(`blue_bricks_png`);
const spikes_img = document.getElementById(`spikes_png`);
const moving_block_img = document.getElementById(`moving_block_png`);
// const stained_glass_moon_img = document.getElementById(`stained_glass_moon_png`);
const avatar_crouch_img = document.getElementById(`avatar_crouch_png`);
const avatar_jump_img = document.getElementById(`avatar_jump_png`);
const avatar_stand_img = document.getElementById(`avatar_stand_png`);
const avatar_grasp_img = document.getElementById(`avatar_grasp_png`);
const avatar_pullup_img = document.getElementById(`avatar_pullup_png`);

canvas = {center: {}};
canvas.width = 800;
canvas.height = 608;
canvas.dimension = 32;
canvas.dimension_half = canvas.dimension / 2;
canvas.center.x = canvas.width / 2;
canvas.center.y = canvas.height / 2;
canvas.draw = () => {
    html_canvas.width = canvas.width;
    html_canvas.height = canvas.height;
    ctx.fillStyle = `#001`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
canvas.clear = () => {
    ctx.fillStyle = `#001`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
canvas.deathScreen = () => {
    canvas.clear();
    ctx.textAlign = `center`;
    ctx.fillStyle = `#800`;
    ctx.font = `${canvas.dimension * 1.5}px Courier New`;
    ctx.fillText(`You died`, canvas.center.x, canvas.center.y);
    ctx.fillStyle = `#666`;
    ctx.font = `${canvas.dimension}px Courier New`;
    ctx.fillText(`Press any key to try again`, canvas.center.x, canvas.center.y + (canvas.dimension * 2));
}
canvas.victoryScreen = () => {
    canvas.clear();
    ctx.textAlign = `center`;
    ctx.fillStyle = `#080`;
    ctx.font = `${canvas.dimension * 1.5}px Courier New`;
    ctx.fillText(`Success`, canvas.center.x, canvas.center.y);
    ctx.fillStyle = `#666`;
    ctx.font = `${canvas.dimension}px Courier New`;
    ctx.fillText(`Ticks: ${avatar.age}`, canvas.center.x, canvas.center.y + (canvas.dimension * 2));
}

stage = {};
stage.matrix = [];
stage.input = [];
stage.width = 0;
stage.height = 0;
stage.spawn = {x: 0, y:0};

stage.movingBlocks = () => {
    let north_list = [];
    let east_list = [];
    let south_list = [];
    let west_list = [];
    for(let iy = 0; iy < stage.height; iy++) {
        for(let ix = 0; ix < stage.width; ix++) {
            if(stage.matrix[iy][ix] === `n` || stage.matrix[iy][ix] === `e` || stage.matrix[iy][ix] === `s` || stage.matrix[iy][ix] === `w`) {
                let block_position = {x: ix, y: iy};
                if(stage.matrix[iy][ix] === `n`) {north_list.push(block_position)};
                if(stage.matrix[iy][ix] === `e`) {east_list.push(block_position)};
                if(stage.matrix[iy][ix] === `s`) {south_list.push(block_position)};
                if(stage.matrix[iy][ix] === `w`) {west_list.push(block_position)};
            }
        }
    }
    while(north_list.length + east_list.length + south_list.length + west_list.length > 0) {
        if(north_list.length > 0) {stage.shiftTile(north_list.pop(), 1, 0)};
        if(east_list.length > 0) {stage.shiftTile(east_list.shift(), 1, 1)};
        if(south_list.length > 0) {stage.shiftTile(south_list.shift(), 1, 2)};
        if(west_list.length > 0) {stage.shiftTile(west_list.pop(), 1, 3)};
    }
}
stage.isTile = (tile) => {if(tile === `b` || tile === `n` || tile === `e` || tile === `s` || tile === `w` || tile === `1` || tile === `2` || tile === `3` || tile === `4`) {return true} else return false};
stage.shiftTile = (tile_position, force, direction) => {
    let tile_x = tile_position.x;
    let tile_y = tile_position.y;
    if(stage.matrix[tile_y] !== undefined && stage.isTile(stage.matrix[tile_y][tile_x])) {
        let tile_list = [];
        let direction_x = 0;
        let direction_y = 0;
        if(direction === 0) {direction_y = 1}
        else if(direction === 1) {direction_x = -1}
        else if(direction === 2) {direction_y = -1}
        else {direction_x = 1};
        for(let i = 0; i <= force; i++) {
            // if(stage.matrix[tile_y + (direction_y * i)] === undefined) stage.matrix[tile_y + (direction_y * i)] = [];
            // if(!stage.isTile(stage.matrix[tile_y + (direction_y * i)][tile_x + (direction_x * i)])) {[i, force] = [force + 1, i]}
            // else tile_list[i] = stage.matrix[tile_y + (direction_y * i)][tile_x + (direction_x * i)];
            if(stage.matrix[tile_y + (direction_y * i)] === undefined
            || stage.matrix[tile_y + (direction_y * i)][tile_x + (direction_x * i)] === undefined) {[i, force] = [force + 1, i - 1]}
            else if(!stage.isTile(stage.matrix[tile_y + (direction_y * i)][tile_x + (direction_x * i)])) {[i, force] = [force + 1, i]}
            else tile_list[i] = stage.matrix[tile_y + (direction_y * i)][tile_x + (direction_x * i)];
        }
        if(!stage.isTile(tile_list[force])) {
            let avatar_on_top = false;
            let avatar_in_way = false;
            let avatar_holding_on = false;
            if((avatar.position.y === tile_y && avatar.position.x === tile_x + (direction_x * force))
            || (avatar.height === 2 && avatar.position.y + 1 === tile_y && avatar.position.x === tile_x + (direction_x * force))) avatar_in_way = true;
            for(let i = 0; i < force; i++) {if(avatar.position.x === tile_x + (direction_x * i) && avatar.position.y === tile_y + (direction_y * i) + 1) avatar_on_top = true}
            if(avatar.grasping && (avatar.position.x === tile_x - avatar.facing) && ((avatar.pullingup && avatar.position.y === tile_y) || (!avatar.pullingup && avatar.position.y === tile_y - 1))) avatar_holding_on = true;
            for(let i = force; i > 0; i--) {stage.matrix[tile_y + (direction_y * i)][tile_x + (direction_x * i)] = stage.matrix[tile_y + (direction_y * (i - 1))][tile_x + (direction_x * (i - 1))]};
            stage.matrix[tile_y][tile_x] = `.`;
            if(avatar_holding_on && !avatar_in_way) {
                if(direction_y === 1) {
                    if(avatar.blocked(0, 2)) {
                        if(avatar.pullingup) {avatar.pullup(0)}
                        else avatar.grasp(0);
                    } else avatar.position.y++;
                } else if(direction_y === -1) {if(!avatar.blocked(0, -1)) avatar.position.y--}
                else if(!avatar.blocked(direction_x, 0)) avatar.position.x += direction_x;
            } else if(avatar_in_way || avatar_on_top) {
                if(direction_y === 1 && avatar.height === 2 && avatar.blocked(0, 2)) {avatar.crouch(1); avatar.height = 1; avatar.position.y++}
                else if(direction_y === -1 && avatar.height === 2 && avatar.blocked(0, -1)) {avatar.crouch(1); avatar.height = 1}
                else if(!avatar.blocked(direction_x, direction_y)
                && (avatar.height === 1 || !avatar.blocked(direction_x, direction_y + 1))
                && !(avatar.grasping && avatar_on_top && direction_y === -1)) {
                    avatar.position.x += direction_x;
                    avatar.position.y += direction_y
                }
            }
            avatar.correctStance();
        } else {
            if(tile_list[0] === `n`) stage.matrix[tile_y][tile_x] = `s`
            else if(tile_list[0] === `e`) stage.matrix[tile_y][tile_x] = `w`
            else if(tile_list[0] === `s`) stage.matrix[tile_y][tile_x] = `n`
            else if(tile_list[0] === `w`) stage.matrix[tile_y][tile_x] = `e`
        }
    } 
}
stage.inputStringArray = (string_array) => {
    stage.input = string_array;
    stage.matrix = [];
    stage.width = string_array[0].length;
    stage.height = string_array.length;
    for(let iy = 0; iy < stage.height; iy++) {stage.matrix[iy] = []};
    for(let iy = 0; iy < stage.height; iy++) {
        for(let ix = 0; ix < stage.width; ix++) {
            let bx = stage.width - ix - 1;
            let by = stage.height - iy - 1;
            string = string_array[iy];
            stage.matrix[by][bx] = string.charAt(ix);
            if(string.charAt(ix) === `a`) {
                stage.spawn.x = bx;
                stage.spawn.y = by;
            }
        }
    }
}
stage.draw = () => {
    for(let iy = 0; iy < stage.height; iy++) {
        for(let ix = 0; ix < stage.width; ix++) {
            let tile = 0;
            let print_x = (avatar.position.x - ix) * canvas.dimension + canvas.center.x;
            let print_y = (avatar.position.y - iy) * canvas.dimension + canvas.center.y;
            let dimension_x = canvas.dimension;
            let dimension_y = canvas.dimension;
            if(stage.matrix[iy][ix] === `b`) {tile = blue_bricks_img}
            else if(stage.matrix[iy][ix] === `n`) {tile = moving_block_img}
            else if(stage.matrix[iy][ix] === `e`) {
                tile = moving_block_img;
                ctx.rotate(Math.PI * 0.5);
                [print_x, print_y] = [print_y, print_x * -1];
            }
            else if(stage.matrix[iy][ix] === `s`) {
                tile = moving_block_img;
                ctx.rotate(Math.PI * 1);
                [print_x, print_y] = [print_x * -1, print_y * -1];
            }
            else if(stage.matrix[iy][ix] === `w`) {
                tile = moving_block_img;
                ctx.rotate(Math.PI * 1.5);
                [print_x, print_y] = [print_y * -1, print_x];
            }
            else if(stage.matrix[iy][ix] === `1`) {tile = spikes_img}
            else if(stage.matrix[iy][ix] === `2`) {
                tile = spikes_img;
                ctx.rotate(Math.PI * 0.5);
                [print_x, print_y] = [print_y, print_x * -1];
            } else if(stage.matrix[iy][ix] === `3`) {
                tile = spikes_img;
                ctx.rotate(Math.PI * 1);
                [print_x, print_y] = [print_x * -1, print_y * -1];
            } else if(stage.matrix[iy][ix] === `4`) {
                tile = spikes_img;
                ctx.rotate(Math.PI * 1.5);
                [print_x, print_y] = [print_y * -1, print_x];
            } else if(stage.matrix[iy][ix] === `x`) {
                tile = locked_exit_img;
                print_y -= canvas.dimension;
                dimension_y *= 2;
            } else if(stage.matrix[iy][ix] === `k`) {
                tile = key_img;
            }
            // else if(stage.matrix[iy][ix] === `g`) {
            //     tile = stained_glass_moon_img;
            //     dimension_x *= 2;
            //     dimension_y *= 4;
            // }
            print_x -= canvas.dimension_half;
            print_y -= canvas.dimension_half;
            if(tile !== 0) ctx.drawImage(tile, print_x, print_y, dimension_x, dimension_y);
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
avatar.stand_delay = 15;
avatar.jump_delay = 10;
avatar.airtime = 0;
avatar.fell = 0;
avatar.jumping = 0;
avatar.position.x = 0;
avatar.position.y = 0;
avatar.time_crouched = 0;
avatar.height = 2;
avatar.width = 1;
avatar.keys = 0;
avatar.sprite = avatar_stand_img;
avatar.age = 0;
avatar.successful = false;

avatar.canExit = () => {if(avatar.keys > 0 && avatar.height === 2 && stage.matrix[avatar.position.y][avatar.position.x] === `x`) {return true} else return false};
avatar.pullup = (mode) => {if(mode === 0) {avatar.pullingup = false} else if(mode === 1) {avatar.pullingup = true}};
avatar.crouch = (mode) => {if(mode === 1) {avatar.crouching = true} else if(mode === 2) {avatar.crouching = false}};
avatar.ascend = () => {if(!avatar.blocked(0,1) && !avatar.blocked(0,2)) avatar.position.y++};
avatar.delayAction = (duration) => {avatar.delay_action += duration};
avatar.correctStance = () => {
    if(avatar.height === 2) {
        // if(avatar.blocked(0, 1) && !avatar.blocked(0, 0)) {
        //     avatar.grasp(0);
        //     avatar.crouch(1);
        //     avatar.height = 1;
        //     avatar.sprite = avatar_crouch_img;
        // }
        // if(avatar.blocked(0, 0) && !avatar.blocked(0, 1)) {
        //     avatar.grasp(0);
        //     avatar.crouch(1);
        //     avatar.height = 1;
        //     avatar.sprite = avatar_crouch_img;
        //     avatar.position.y++;
        // }
        if(avatar.grasping) {
            if(avatar.pullingup) {if(!avatar.blocked(avatar.facing, 0) || avatar.blocked(avatar.facing, 1)) avatar.grasp(0)}
            else if(!avatar.blocked(avatar.facing, 1) || avatar.blocked(avatar.facing, 2)) avatar.grasp(0);
        }
    }
    if(avatar.grasping && avatar.height === 2) {
        avatar.height = 2;
        if(avatar.pullingup) {
            avatar.width = 2;
            avatar.sprite = avatar_pullup_img;
        } else {
            avatar.width = 1;
            avatar.sprite = avatar_grasp_img;
        }
    } else if((avatar.airtime > avatar.fell || avatar.airtime > 1 || avatar.jumping > 0) && !avatar.blocked(0, -1)) {
        if(!avatar.blocked(0, 1)) {
            avatar.width = 1;
            avatar.height = 2;
            avatar.sprite = avatar_jump_img;
        }
    } else {
        if(avatar.crouching) {
            avatar.width = 1;
            avatar.height = 1;
            avatar.sprite = avatar_crouch_img;
            if(avatar.blocked(0, -1)) avatar.time_crouched++;
            if(avatar.time_crouched >= avatar.stand_delay
            && !avatar.crouch_lock
            && !avatar.blocked(0, 1)
            && !avatar.zapped(0, 1)) {
                avatar.crouch(2);
            }
        } else if(!avatar.blocked(0, 1)) {
            avatar.width = 1;
            avatar.height = 2;
            avatar.sprite = avatar_stand_img;
        }
    }
    if(avatar.blocked(0, -1) || (avatar.grasping && avatar.height === 2)) {
        avatar.airtime = 0;
        avatar.jumping = 0;
        avatar.fell = 0;
    }
    if(avatar.height !== 1 || !avatar.crouching || !avatar.blocked(0, -1)) avatar.time_crouched = 0;
    if(avatar.blocked(0, 0) || avatar.zapped(0, 0) || (avatar.height === 2 && (avatar.zapped(0, 1) || avatar.blocked(0, 1)))) avatar.dies();
    if(stage.matrix[avatar.position.y][avatar.position.x] === `k`) {
        stage.matrix[avatar.position.y][avatar.position.x] = `.`;
        avatar.keys++;
    }
    if(avatar.canExit()) {
        avatar.successful = true;
        avatar.dies();
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
    else {
        let tile = stage.matrix[avatar.position.y + height][avatar.position.x + direction];
        if(tile === `b` || tile === `n` || tile === `e` || tile === `s` || tile === `w`) {return true}
        else return false;
    }
}
avatar.zapped = (direction, height) => {
    if(stage.matrix[avatar.position.y + height] === undefined
    || stage.matrix[avatar.position.y + height][avatar.position.x + direction] === undefined) {return false}
    else {
        let tile = stage.matrix[avatar.position.y + height][avatar.position.x + direction];
        if(tile === `1` || tile === `2` || tile === `3` || tile === `4`) {return true}
        else return false;
    }
}
avatar.draw = () => {
    if(avatar.alive) {
        let print_x = canvas.center.x - canvas.dimension_half;
        let print_y = canvas.center.y - (canvas.dimension * (avatar.height - 1)) - canvas.dimension_half;
        let dimension_x = canvas.dimension * avatar.width;
        let dimension_y = canvas.dimension * avatar.height;
        if(avatar.facing === 1) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(avatar.sprite, print_x, print_y, dimension_x, dimension_y);
        if(avatar.facing === 1) ctx.resetTransform();
    }
}
avatar.gravity = () => {
    if(avatar.alive && !avatar.grasping) {
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
avatar.grasp = (mode) => {
    if(avatar.alive) {
        if(mode === 0) {
            avatar.grasping = false;
            avatar.pullingup = false;
        } else if(mode === 1) {
            avatar.grasping = true;
            avatar.crouching = false;
        }
    }
}
avatar.jump = (power) => {
    if(avatar.alive) {
        if(power === 0
        && avatar.crouching
        && avatar.time_crouched >= avatar.stand_delay
        && !avatar.crouch_lock
        && !avatar.blocked(0, 1)
        && !avatar.zapped(0, 1)) {
            avatar.crouch(2);
        } 
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
                    for(let i = 0; i < power; i++) {avatar.queueFunction(false, avatar.ascend, this, [])};
                }  
            }
            if(power > 0 && !avatar.crouching) {avatar.queueFunction(false, avatar.crouch, this, [1])};
        }
    }
}
avatar.move = (direction) => {
    if(avatar.alive) {
        let can_move = false;
        let grasped = false;
        if(avatar.crouching
        && avatar.time_crouched >= avatar.stand_delay
        && !avatar.crouch_lock
        && !avatar.blocked(0, 1)
        && !avatar.zapped(0, 1)) {
            avatar.crouch(2);
        } 
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
        avatar.correctStance();
    }
}
avatar.dies = () => {
    if(avatar.alive) {
        canvas.deathScreen();
        avatar.alive = false;
        avatar.position.x = stage.spawn.x;
        avatar.position.y = stage.spawn.y;
    }
}
avatar.resurrect = (new_position) => {
    if(!avatar.alive) {
        stage.inputStringArray(stage.input);
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
        avatar.width = 1;
        avatar.height = 2;
        avatar.keys = 0;
        avatar.age = 0;
        avatar.successful = false;
        avatar.alive = true;
    }
}

const saved_input = [];
let gravity_second = 0;
let moving_blocks_second = 0;
const gravity_tick = 3;
const moving_blocks_tick = 60;
let time_frozen = false;
time = () => {
    if(avatar.alive) {
        if(!time_frozen) {
            if(avatar.delay_action === 0) {if(saved_input.length > 0) (saved_input.shift())()} else avatar.delay_action--;
            if(gravity_second === gravity_tick) {gravity_second = 0; avatar.gravity()};
            if(moving_blocks_second === moving_blocks_tick) {moving_blocks_second = 0; stage.movingBlocks()};
            avatar.age++;
            canvas.clear();
            stage.draw();
            avatar.correctStance();
            avatar.draw();
            gravity_second++;
            moving_blocks_second++;
        }
    } else {
        if(avatar.successful) {
            canvas.victoryScreen();
        } else {
            canvas.deathScreen();
        }
    }
    window.requestAnimationFrame(time);
}

let arrow_left_held = false;
let arrow_right_held = false;
let shift_held = false;
function keyDown(e) {
    if(avatar.alive) {
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
                } else if(avatar.grasping) avatar.grasp(0);
            }
        }
        else if(e.key === `g`) {avatar.queueFunction(true, avatar.delayAction, this, [1])}
    } else {
        avatar.resurrect(stage.spawn);
    }
    if(e.key === `Shift`) {shift_held = true}
    // if(e.key === `q`) {console.log(html_stage_input.innerHTML)};
    // else if(e.key === ` `) time_frozen = !time_frozen;
}
function keyUp(e) {
    if(e.key === `ArrowLeft`) {arrow_left_held = false}
    else if(e.key === `ArrowRight`) {arrow_right_held = false}
    else if(e.key === `Shift`) shift_held = false;
}
document.addEventListener(`keydown`, keyDown);
document.addEventListener(`keyup`, keyUp);

let stage1 = [
    `bbbbbbb.....................`,
    `bbbbbbb.....................`,
    `bbbbbbb.....................`,
    `bbbbbbb.....................`,
    `bbbbbbb................b....`,
    `bbbbbbb.....................`,
    `bbbbbbb.....................`,
    `bbbbbbb...........b.b.b.....`,
    `bbbbbbb..........bb.........`,
    `bbbbbbb2........bbb1111111..`,
    `bbbbbbb........bbbbbbbbbbb..`,
    `b3...3........bbb333........`,
    `b.........1..bbbb...........`,
    `b.bbbbbbbbbbbbbbb.b.........`,
    `b........4bb......b.....b...`,
    `b.........bb......b....bb...`,
    `b....a....bb......bbbbbbb111`,
    `bbbbbbbbbbbbbbbbbbbbbbbbbbbb`
]
let stage2 = [
    `bbbbbbbbbbbbbbbbb`,
    `bbbbbb.....bbbbbb`,
    `bbbbbb..k..bbbbbb`,
    `b....b.bbb.b....b`,
    `b....b.33b.3....b`,
    `b....3...3......b`,
    `b.b.w.........b.b`,
    `b......1...1....b`,
    `b....11b111b....b`,
    `bb...bbbbbbb...bb`,
    `bb.a.bbbbbbb.x.bb`,
    `bbbbbbbbbbbbbbbbb`
]
let stage3 = [
    `bbbbbbbbbbbbbbbbb`,
    `b...............b`,
    `b...............b`,
    `b...............b`,
    `b...............b`,
    `b...............b`,
    `b.n.............b`,
    `b.n.............b`,
    `b.n.......eee...b`,
    `b...............b`,
    `b.......a.......b`,
    `bbbbbbbbbbbbbbbbb`
]
stage.inputStringArray(stage3);

avatar.resurrect(stage.spawn);

canvas.draw();
avatar.draw();
time();

// to do:
//
// fix blocks moving in unicen
// treat "undefined" as normal free spaces. this allows levels to be made without adding extra space at the top for jumping, and makes the skybox unlimited.