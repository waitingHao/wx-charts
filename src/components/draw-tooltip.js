import {measureFormulaText} from './charts-util'
import { assign } from '../util/polyfill/index';
import {drawRect} from './draw-data-shape'
import {calStartY, calEndY} from './charts-data'
import {fillFormulaText} from './draw-data-text'

export function drawToolTipSplitLine(offsetX, opts, config, context) {
    let startY = calEndY(config, opts);
    // let endY = opts.height - config.padding - config.xAxisHeight - config.legendHeight;
    let endY = calStartY(config, opts);
    context.beginPath();
    context.setStrokeStyle('#cccccc');
    context.setLineWidth(1);
    context.moveTo(offsetX, startY);
    context.lineTo(offsetX, endY);
    context.stroke();
    context.closePath();
}

export function drawToolTip(textList, offsetP, opts, config, context) {
    let legendWidth = 4;
    let legendMarginRight = 5;
    // 隐藏legend
    if (opts.tooltip.option.legendStyle && opts.tooltip.option.legendStyle.show === false) {
        legendWidth = 0;
        legendMarginRight = 0;
    }
    let arrowWidth = 8;
    let isOverRightBorder = false;
    let offset = assign({
        x: 0,
        y: 0
    }, offsetP);
    offset.y -= 8;
    let formulaTextWidths = [];
    let lineNu = 0;
    let textWidth = textList.map((item) => {
        // 支持公式的文本宽度测量
        let textLines = item.text.split('\n');
        let width = 0;
        textLines.forEach(t => {
            let w = 0;
            let fontSizes = measureFormulaText(t, config.fontSize, context);
            formulaTextWidths.push(fontSizes);
            fontSizes.forEach(t => {
                w += t.width;
            });
            width = Math.max(width, w);
            lineNu++;
        });

        return width;
    });

    let toolTipWidth = legendWidth + legendMarginRight + 4 * config.toolTipPadding + Math.max.apply(null, textWidth);
    let toolTipHeight = 2 * config.toolTipPadding + lineNu * config.toolTipLineHeight;

    // if beyond the right border
    if (offset.x - Math.abs(opts._scrollDistance_) + arrowWidth + toolTipWidth > opts.width) {
        isOverRightBorder = true;
    }

    let startY = calStartY(config, opts);
    let endY = calEndY(config, opts);

    // 创建位置对象
    let tooltipPosition = {
        x: offset.x,
        y: offset.y
    };
    if (typeof opts.tooltip.option.position === 'function') {
        tooltipPosition = opts.tooltip.option.position(offset, {
            startY, endY
        });
    }

    // draw background rect
    context.beginPath();
    context.setFillStyle(opts.tooltip.option.background || config.toolTipBackground);
    context.setGlobalAlpha(config.toolTipOpacity);
    if (isOverRightBorder) {
        // 箭头
        // context.moveTo(offset.x, offset.y + 10);
        // context.lineTo(offset.x - arrowWidth, offset.y + 10 - 5);
        // context.lineTo(offset.x - arrowWidth, offset.y + 10 + 5);
        context.moveTo(tooltipPosition.x, tooltipPosition.y + 10);
        // context.fillRect(tooltipPosition.x - toolTipWidth - arrowWidth, tooltipPosition.y, toolTipWidth, toolTipHeight);
        drawRect(tooltipPosition.x - toolTipWidth - arrowWidth, tooltipPosition.y, toolTipWidth, toolTipHeight, 5, context, {
            color: opts.tooltip.option.background || config.toolTipBackground
        });
    } else {
        // 箭头
        // context.moveTo(offset.x, offset.y + 10);
        // context.lineTo(offset.x + arrowWidth, offset.y + 10 - 5);
        // context.lineTo(offset.x + arrowWidth, offset.y + 10 + 5);
        context.moveTo(tooltipPosition.x, tooltipPosition.y + 10);
        // context.fillRect(tooltipPosition.x + arrowWidth, tooltipPosition.y, toolTipWidth, toolTipHeight);
        drawRect(tooltipPosition.x + arrowWidth, tooltipPosition.y, toolTipWidth, toolTipHeight, 5, context, {
            color: opts.tooltip.option.background || config.toolTipBackground
        });
    }

    context.closePath();
    context.fill();
    context.setGlobalAlpha(1);

    // 坐标轴指示器
    if (opts.tooltip.option.axisPointer) {
        if (opts.tooltip.option.axisPointer.type === 'line') {
            if (opts.tooltip.option.axisPointer.lineStyle) {
                if (opts.tooltip.option.axisPointer.lineStyle.color) {
                    context.setStrokeStyle(opts.tooltip.option.axisPointer.lineStyle.color);
                }
            }

            context.beginPath();
            context.moveTo(offset.x, startY);
            context.lineTo(offset.x, endY);
            context.stroke();
            context.closePath();
        }
    }

    // draw legend
    if (legendWidth !== 0) {
        textList.forEach((item, index) => {
            context.beginPath();
            context.setFillStyle(item.color);
            let startX = tooltipPosition.x + arrowWidth + 2 * config.toolTipPadding;
            let startY = tooltipPosition.y + (config.toolTipLineHeight - config.fontSize) / 2 + config.toolTipLineHeight * index + config.toolTipPadding;
            if (isOverRightBorder) {
                startX = tooltipPosition.x - toolTipWidth - arrowWidth + 2 * config.toolTipPadding;
            }
            context.fillRect(startX, startY, legendWidth, config.fontSize);
            context.closePath();
        });
    }

    // draw text list
    let textColor = '#ffffff';
    if (opts.tooltip.option && opts.tooltip.option.textStyle && opts.tooltip.option.textStyle.color) {
        textColor = opts.tooltip.option.textStyle.color;
    }
    context.beginPath();
    context.setFontSize(config.fontSize);
    context.setFillStyle(textColor);
    formulaTextWidths.forEach((item, index) => {
        let startX = tooltipPosition.x + arrowWidth + 2 * config.toolTipPadding + legendWidth + legendMarginRight;
        if (isOverRightBorder) {
            startX = tooltipPosition.x - toolTipWidth - arrowWidth + 2 * config.toolTipPadding + legendWidth + legendMarginRight;
        }
        let startY = tooltipPosition.y + (config.toolTipLineHeight - config.fontSize) / 2 + config.toolTipLineHeight * index + config.toolTipPadding - 1;
        // context.fillText(item.text, startX, startY + config.fontSize);

        // 支持公式的文本绘制，如 PM_2_._5
        fillFormulaText(item, startX, startY + config.fontSize, config.fontSize, context);
    });
    context.stroke();
    context.closePath();
}

