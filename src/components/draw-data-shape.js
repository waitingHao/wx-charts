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
    if (!Array.isArray(radius)) {
        radius = [radius, radius, radius, radius];
    }


    if (!radius || radius.length === 0) {
        radius = [0,0,0,0];
    }

    switch (radius.length) {
        case 1:
            radius = radius.concat(radius, radius, radius);
            break;
        case 2:
            radius = radius.concat(radius);
            break;
        case 3:
            radius.push(radius[1]);
            break;
    }

    x = Math.round(x);
    y = Math.round(y);
    width = Math.round(width);
    height = Math.round(height);
    radius = radius.map(r => Math.round(r));

    // Android 端arcTo有bug，需要在半径为0时调用lineTo

    context.beginPath();
    context.setFillStyle(opts.color);

    // draw top and top right corner
    if (radius[0] === 0) {
        context.moveTo(x, y);
    } else {
        context.moveTo(x + radius[0], y);
    }

    if (radius[1] === 0) {
        context.lineTo(x + width, y);
    } else {
        context.arcTo(x + width, y, x + width, y + radius[1], radius[1]);
    }


    // draw right side and bottom right corner
    if (radius[2] === 0) {
        context.lineTo(x + width, y + height);
    } else {
        context.arcTo(x + width, y + height, x + width - radius[2], y + height, radius[2]);
    }

    // draw bottom and bottom left corner
    if (radius[3] === 0) {
        context.lineTo(x, y + height);
    } else {
        context.arcTo(x, y + height, x, y + height - radius[3], radius[3]);
    }

    // draw left and top left corner
    if (radius[0] === 0 ) {
        context.lineTo(x, y);
    } else {
        context.arcTo(x, y, x + radius[0], y, radius[0]);
    }

    context.fill();
}