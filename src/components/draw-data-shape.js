export default function drawPointShape (points, color, shape, context) {

    context.setStrokeStyle("#ffffff");
    context.setLineWidth(1);

    points.forEach(function(item, index) {
        if (!item) {
            return;
        }
        if (item.color) {
            context.setFillStyle(item.color);
        }

        context.beginPath();
        switch (shape) {
            case 'diamond':
                context.moveTo(item.x, item.y - 4.5);
                context.lineTo(item.x - 4.5, item.y);
                context.lineTo(item.x, item.y + 4.5);
                context.lineTo(item.x + 4.5, item.y);
                context.lineTo(item.x, item.y - 4.5);
                break;
            case 'circle':
                context.moveTo(item.x + 3.5, item.y);
                context.arc(item.x, item.y, item.size || 4, 0, 2 * Math.PI, false);
                break;
            case 'rect':
                context.moveTo(item.x - 3.5, item.y - 3.5);
                context.rect(item.x - 3.5, item.y - 3.5, 7, 7);
                break;
            case 'triangle':
                context.moveTo(item.x, item.y - 4.5);
                context.lineTo(item.x - 4.5, item.y + 4.5);
                context.lineTo(item.x + 4.5, item.y + 4.5);
                context.lineTo(item.x, item.y - 4.5);
                break;
        }

        context.closePath();
        context.fill();
    });
    context.stroke();
}

/**
 * 画矩形
 *
 * @param x         左上角x坐标
 * @param y         左上角y坐标
 * @param width     宽度
 * @param height    高度
 * @param radius    圆角，[5, 5, 0, 0] （顺时针左上，右上，右下，左下）  5 统一设置四个角的圆角大小
 * @param context   画布
 * @param opts      配置
 * @param opts.color    填充颜色
 */
export function drawRect(x, y, width, height, radius, context, opts) {
    let r = radius;
    if (!Array.isArray(r)) {
        r = [r, r, r, r];
    }


    if (!r || r.length === 0) {
        r = [0,0,0,0];
    }

    switch (r.length) {
        case 1:
            r = r.concat(r, r, r);
            break;
        case 2:
            r = r.concat(r);
            break;
        case 3:
            r.push(r[1]);
            break;
    }

    let realX = Math.round(x);
    let realY = Math.round(y);
    let realWidth = Math.round(width);
    let realHeight = Math.round(height);
    r = r.map(r => Math.round(r));

    // Android 端arcTo有bug，需要在半径为0时调用lineTo

    context.beginPath();
    context.setFillStyle(opts.color);

    // draw top and top right corner
    if (r[0] === 0) {
        context.moveTo(realX, realY);
    } else {
        context.moveTo(realX + r[0], realY);
    }

    if (r[1] === 0) {
        context.lineTo(realX + realWidth, realY);
    } else {
        context.arcTo(realX + realWidth, realY, realX + realWidth, realY + r[1], r[1]);
    }


    // draw right side and bottom right corner
    if (r[2] === 0) {
        context.lineTo(realX + realWidth, realY + realHeight);
    } else {
        context.arcTo(realX + realWidth, realY + realHeight, realX + realWidth - r[2], realY + realHeight, r[2]);
    }

    // draw bottom and bottom left corner
    if (r[3] === 0) {
        context.lineTo(realX, realY + realHeight);
    } else {
        context.arcTo(realX, realY + realHeight, realX, realY + realHeight - r[3], r[3]);
    }

    // draw left and top left corner
    if (r[0] === 0 ) {
        context.lineTo(realX, realY);
    } else {
        context.arcTo(realX, realY, realX + r[0], realY, r[0]);
    }

    context.fill();
}