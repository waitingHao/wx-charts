import {
    calLegendData,
    calStartX,
    calStartY,
    calYAxisData,
    fixColumeData,
    getDataPoints,
    getMaxTextListLength,
    getPieDataPoints,
    getRadarCoordinateSeries,
    getRadarDataPoints,
    getXAxisPoints,
    getYAxisLines,
    getYAxisSplit,
    splitPoints
} from './charts-data'
import {calRotateTranslate, convertCoordinateOrigin, createCurveControlPoints, measureText} from './charts-util'
import {default as drawPointShape, drawRect} from './draw-data-shape'
import {drawPieText, drawPointText, drawRadarLabel, drawRingTitle} from './draw-data-text'
import {drawToolTip, drawToolTipSplitLine} from './draw-tooltip'

function drawYAxisTitle(title, opts, config, context) {
    let startX = config.xAxisHeight + (opts.height - config.xAxisHeight - measureText(title)) / 2;
    context.save();
    context.beginPath();
    context.setFontSize(config.fontSize);
    context.setFillStyle(opts.yAxis.titleFontColor || '#333333');
    context.translate(0, opts.height);
    context.rotate(-90 * Math.PI / 180);
    context.fillText(title, startX, config.padding + 0.5 * config.fontSize);
    context.stroke();
    context.closePath();
    context.restore();
}

export function drawColumnDataPoints(series, opts, config, context, process = 1) {
    let {ranges} = calYAxisData(series, opts, config);
    let {xAxisPoints, eachSpacing} = getXAxisPoints(opts.categories, opts, config);
    let minRange = ranges.pop();
    let maxRange = ranges.shift();
    let endY = calStartY(config, opts);

    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0 && opts.enableScroll === true) {
        context.translate(opts._scrollDistance_, 0);
    }

    series.forEach(function (eachSeries, seriesIndex) {
        let data = eachSeries.data;
        let points = getDataPoints(data, {minRange, maxRange}, xAxisPoints, eachSpacing, opts, config, process);
        points = fixColumeData(points, eachSpacing, series.length, seriesIndex, config, opts);

        // 绘制柱状数据图 TODO 性能优化
        points.forEach(function (item, index) {
            if (item !== null) {
                let startX = item.x - item.width / 2 + 1;
                // let height = opts.height - item.y - config.padding - config.xAxisHeight - config.legendHeight;
                let height = endY - item.y;
                // 添加圆角矩形支持
                let width = item.width - 2;
                if (!Array.isArray(item.barBorderRadius)) {
                    item.barBorderRadius = [item.barBorderRadius];
                }
                let halfWidth = width / 2;
                item.barBorderRadius = item.barBorderRadius.map(r => Math.min(halfWidth, r));
                // 高度减1，防止覆盖x轴
                drawRect(startX, item.y, width, height - 1, item.barBorderRadius, context, {
                    color: item.color || eachSeries.color
                });
            }
        });
    });
    series.forEach(function (eachSeries, seriesIndex) {
        let data = eachSeries.data;
        let points = getDataPoints(data, {minRange, maxRange}, xAxisPoints, eachSpacing, opts, config, process);
        points = fixColumeData(points, eachSpacing, series.length, seriesIndex, config, opts);
        if (opts.dataLabel !== false && process === 1) {
            drawPointText(points, eachSeries, config, context);
        }
    });
    context.restore();
    return {
        xAxisPoints,
        eachSpacing
    }
}

export function drawAreaDataPoints(series, opts, config, context, process = 1) {
    let {ranges} = calYAxisData(series, opts, config);
    let {xAxisPoints, eachSpacing} = getXAxisPoints(opts.categories, opts, config);
    let minRange = ranges.pop();
    let maxRange = ranges.shift();
    let endY = calStartY(config, opts);
    let calPoints = [];

    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0 && opts.enableScroll === true) {
        context.translate(opts._scrollDistance_, 0);
    }


    if (opts.tooltip && opts.tooltip.textList && opts.tooltip.textList.length && process === 1) {
        drawToolTipSplitLine(opts.tooltip.offset.x, opts, config, context);
    }

    series.forEach(function (eachSeries, seriesIndex) {
        let data = eachSeries.data;
        let points = getDataPoints(data, {minRange, maxRange}, xAxisPoints, eachSpacing, opts, config, process);
        calPoints.push(points);

        let splitPointList = splitPoints(points);

        splitPointList.forEach((points) => {
            // 绘制区域数据
            context.beginPath();
            context.setStrokeStyle(eachSeries.color);
            context.setFillStyle(eachSeries.color);
            context.setGlobalAlpha(0.6);
            context.setLineWidth(2);
            if (points.length > 1) {
                let firstPoint = points[0];
                let lastPoint = points[points.length - 1];

                context.moveTo(firstPoint.x, firstPoint.y);
                if (opts.extra.lineStyle === 'curve') {
                    points.forEach(function (item, index) {
                        if (index > 0) {
                            let ctrlPoint = createCurveControlPoints(points, index - 1);
                            context.bezierCurveTo(ctrlPoint.ctrA.x, ctrlPoint.ctrA.y, ctrlPoint.ctrB.x, ctrlPoint.ctrB.y, item.x, item.y);
                        }
                    });
                } else {
                    points.forEach(function (item, index) {
                        if (index > 0) {
                            context.lineTo(item.x, item.y);
                        }
                    });
                }

                context.lineTo(lastPoint.x, endY);
                context.lineTo(firstPoint.x, endY);
                context.lineTo(firstPoint.x, firstPoint.y);
            } else {
                let item = points[0];
                context.moveTo(item.x - eachSpacing / 2, item.y);
                context.lineTo(item.x + eachSpacing / 2, item.y);
                context.lineTo(item.x + eachSpacing / 2, endY);
                context.lineTo(item.x - eachSpacing / 2, endY);
                context.moveTo(item.x - eachSpacing / 2, item.y);
            }
            context.closePath();
            context.fill();
            context.setGlobalAlpha(1);
        });

        if (opts.dataPointShape !== false) {
            let shape = config.dataPointShape[seriesIndex % config.dataPointShape.length];
            drawPointShape(points, eachSeries.color, shape, context);
        }
    });
    if (opts.dataLabel !== false && process === 1) {
        series.forEach(function (eachSeries, seriesIndex) {
            let data = eachSeries.data;
            let points = getDataPoints(data, {minRange, maxRange}, xAxisPoints, eachSpacing, opts, config, process);
            drawPointText(points, eachSeries, config, context);
        });
    }

    context.restore();

    return {
        xAxisPoints,
        calPoints,
        eachSpacing
    };
}

export function drawLineArea(series, opts, config, calPoints, xAxisPoints, context) {
    if (!series) {
        return;
    }
    // TODO 封装
    let startY = calStartY(config, opts);
    calPoints.forEach(function (cp, index) {
        if (!series[index].areaStyle || !series[index].areaStyle.color) {
            return;
        }
        context.setFillStyle(series[index].areaStyle.color);
        context.beginPath();
        context.moveTo(cp[0].x, startY);
        cp.forEach(function (point) {
            context.lineTo(point.x, point.y);
        });
        context.lineTo(cp[cp.length - 1].x, startY);
        context.lineTo(cp[0].x, startY);
        context.closePath();
        context.fill();
    });
}

export function drawLineDataPoints(series, opts, config, context, process = 1) {
    let {ranges} = calYAxisData(series, opts, config);
    let {xAxisPoints, eachSpacing} = getXAxisPoints(opts.categories, opts, config);
    let minRange = ranges.pop();
    let maxRange = ranges.shift();
    let calPoints = [];

    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0 && opts.enableScroll === true) {
        context.translate(opts._scrollDistance_, 0);
    }

    if (opts.tooltip && opts.tooltip.textList && opts.tooltip.textList.length && process === 1) {
        drawToolTipSplitLine(opts.tooltip.offset.x, opts, config, context);
    }


    series.forEach(function (eachSeries, seriesIndex) {
        let data = eachSeries.data;
        // 计算点的实际坐标
        let points = getDataPoints(data, {minRange, maxRange}, xAxisPoints, eachSpacing, opts, config, process);
        calPoints.push(points);
        let splitPointList = splitPoints(points);

        splitPointList.forEach((points, index) => {
            context.beginPath();
            context.setStrokeStyle(eachSeries.color);
            if (eachSeries.lineStyle && eachSeries.lineStyle.width) {
                context.setLineWidth(eachSeries.lineStyle.width);
            } else {
                context.setLineWidth(2);
            }

            if (points.length === 1) {
                context.moveTo(points[0].x, points[0].y);
                context.arc(points[0].x, points[0].y, 1, 0, 2 * Math.PI);
            } else {
                context.moveTo(points[0].x, points[0].y);
                if (opts.extra.lineStyle === 'curve') {
                    points.forEach(function (item, index) {
                        if (index > 0) {
                            let ctrlPoint = createCurveControlPoints(points, index - 1);
                            context.bezierCurveTo(ctrlPoint.ctrA.x, ctrlPoint.ctrA.y, ctrlPoint.ctrB.x, ctrlPoint.ctrB.y, item.x, item.y);
                        }
                    });
                } else {
                    points.forEach(function (item, index) {
                        if (index > 0) {
                            context.lineTo(item.x, item.y);
                        }
                    });
                }
                context.moveTo(points[0].x, points[0].y);
            }
            context.closePath();
            context.stroke();
        });

        if (opts.dataPointShape !== false) {
            let shape = null;
            // 根据参数配置项来确定数据点形状，如果配置不在支持的形状里，那么从支持的形状列表中取
            if (typeof opts.dataPointShape === 'string' && config.dataPointShape.includes(opts.dataPointShape)) {
                shape = opts.dataPointShape;
            } else {
                shape = config.dataPointShape[seriesIndex % config.dataPointShape.length]
            }
            drawPointShape(points, eachSeries.color, shape, context);
        }
    });
    if (opts.dataLabel !== false && process === 1) {
        series.forEach(function (eachSeries, seriesIndex) {
            let data = eachSeries.data;
            let points = getDataPoints(data, {minRange, maxRange}, xAxisPoints, eachSpacing, opts, config, process);
            drawPointText(points, eachSeries, config, context);
        });
    }

    context.restore();

    return {
        xAxisPoints,
        calPoints,
        eachSpacing
    };
}

export function drawToolTipBridge(opts, config, context, process) {
    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0 && opts.enableScroll === true) {
        context.translate(opts._scrollDistance_, 0);
    }
    if (opts.tooltip && opts.tooltip.textList && opts.tooltip.textList.length && process === 1) {
        drawToolTip(opts.tooltip.textList, opts.tooltip.offset, opts, config, context);
    }
    context.restore();
}

export function drawXAxis(categories, opts, config, context) {
    // startX, endX,
    let {xAxisPoints, eachSpacing} = getXAxisPoints(categories, opts, config);
    // let startY = opts.height - config.padding - config.xAxisHeight - config.legendHeight;
    let startY = calStartY(config, opts);
    let endY = startY + config.xAxisLineHeight;

    // 对X轴列表做抽稀处理 TODO 添加自定义间隔
    let ratio;
    if (opts.xAxis && opts.xAxis.axisLabel && opts.xAxis.axisLabel.interval) {
        ratio = opts.xAxis.axisLabel.interval;
    } else {
        let validWidth = opts.width - config.padding - calStartX(config, opts);
        let maxXAxisListLength = Math.min(categories.length, Math.ceil(validWidth / config.fontSize / 1.5));
        ratio = Math.ceil(categories.length / maxXAxisListLength);
    }

    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0) {
        context.translate(opts._scrollDistance_, 0);
    }

    context.beginPath();
    context.setStrokeStyle(opts.xAxis.gridColor || "#cccccc");

    // 绘画x坐标刻度

    if (opts.xAxis.disableGrid !== true && (opts.xAxis.axisTick && opts.xAxis.axisTick.show !== false)) {
        xAxisPoints.forEach(function (item, index) {
            if (index % ratio !== 0) {
                return;
            }
            if (opts.xAxis.type === 'calibration') {
                if (index > 0) {
                    context.moveTo(item - eachSpacing / 2, startY);
                    context.lineTo(item - eachSpacing / 2, startY + 4);
                }
            } else {
                context.moveTo(item, startY);
                context.lineTo(item, endY);
            }
        });
    }
    context.closePath();
    context.stroke();

    let cats = categories.map((item, index) => {
        return index % ratio !== 0 ? '' : item;
    });

    // x坐标标签
    if (config._xAxisTextAngle_ === 0) {
        // 不倾斜
        context.beginPath();
        context.setFontSize(config.fontSize);
        context.setFillStyle(opts.xAxis.fontColor || '#666666');
        context.setTextAlign('center');
        cats.forEach(function (item, index) {
            // 添加分行支持
            let items;
            if (item) {
                items = item.toString().split('\n');
            } else {
                items = [item];
            }

            let textWidth = items.reduce(function (sum, single) {
                return Math.max(sum, measureText(single));
            }, 0);

            // 居中样式，不用加文本偏移
            // let offset = eachSpacing / 2 - textWidth / 2;
            let offset = eachSpacing / 2;
            items.forEach(function (t, tIndex) {
                let y = startY + config.fontSize + 5;
                if (tIndex > 0) {
                    y += config.fontSize + 2;
                }
                context.fillText(t, xAxisPoints[index] + offset, y, textWidth);
            });
        });
        context.closePath();
        context.stroke();
    } else {
        cats.forEach(function (item, index) {
            context.save();
            context.beginPath();
            context.setFontSize(config.fontSize);
            context.setFillStyle(opts.xAxis.fontColor || '#666666');
            let textWidth = measureText(item);
            let offset = eachSpacing / 2 - textWidth;
            let {transX, transY} = calRotateTranslate(xAxisPoints[index] + eachSpacing / 2, startY + config.fontSize / 2 + 5, opts.height);
            context.rotate(-1 * config._xAxisTextAngle_);
            context.translate(transX, transY);
            context.fillText(item, xAxisPoints[index] + offset, startY + config.fontSize + 5);
            context.closePath();
            context.stroke();
            context.restore();
        });
    }

    context.restore();
}

export function drawMarkLine(series, opts, config, context) {
    if (!(opts.extra && opts.extra.markLine && opts.extra.markLine.data)) {
        return;
    }

    let {ranges} = calYAxisData(series, opts, config);
    let {xAxisPoints, eachSpacing} = getXAxisPoints(opts.categories, opts, config);
    let minRange = ranges.pop();
    let maxRange = ranges.shift();
    let calPoints = [];

    opts.extra.markLine.data.forEach(function (mark, seriesIndex) {
        // 计算点的实际坐标
        let point = getYAxisLines(mark.yAxis, {minRange, maxRange}, xAxisPoints, eachSpacing, opts, config);
        calPoints.push(point);

        // 图标线超出y坐标不绘制
        if (point.y > point.endY) {

            context.beginPath();
            let color;
            if (mark.lineStyle && mark.lineStyle.color) {
                color = mark.lineStyle.color;
            } else {
                color = config.markLineColors[seriesIndex % config.markLineColors.length]
            }

            context.setStrokeStyle(color);

            context.setLineDash(null);
            let lineWidth = 2;
            if (mark.lineStyle) {
                if (mark.lineStyle.width) {
                    lineWidth = mark.lineStyle.width;
                }
                if (mark.lineStyle.type === 'dashed') {
                    context.setLineDash([2, 1]);
                }
            }
            context.setLineWidth(lineWidth);

            context.moveTo(point.startX, point.y);
            context.lineTo(point.endX, point.y);

            context.stroke();

            let text;
            let fontSize = 10;
            if (mark.label.show) {
                context.setFillStyle(color);
                if (typeof mark.label.formatter === 'function') {
                    text = mark.label.formatter();
                }
                if (typeof mark.label.formatter === 'string') {
                    text = mark.label.formatter;
                }

                if (!text) {
                    text = mark.yAxis;
                }
                context.setFontSize(fontSize);
                context.fillText(text, point.endX, point.y + (fontSize / 2) - 2);
            }

            if (mark.showValue === true && mark.yAxis) {
                context.setFillStyle(mark.valueColor || color);
                context.setFontSize(fontSize);
                let textInfo = context.measureText(mark.yAxis.toString());
                context.fillText(mark.yAxis, point.startX - textInfo.width - 2, point.y + (fontSize / 2) - 2);
            }
        }

    });

    context.setLineDash(null);

    return {
        xAxisPoints,
        calPoints,
        eachSpacing
    };
}


export function drawYAxisGrid(opts, config, context) {
    // let spacingValid = opts.height - 2 * config.padding - config.xAxisHeight - config.legendHeight;
    let spacingValid = calStartY(config, opts) - config.padding;

    let {yAxisSplit} = getYAxisSplit(null, opts, config);
    let eachSpacing = (spacingValid / yAxisSplit);
    // let yAxisTotalWidth = config.yAxisWidth + config.yAxisTitleWidth;
    // let startX = config.padding + yAxisTotalWidth;
    let startX = calStartX(config, opts);
    let endX = opts.width - config.padding;

    let points = [];
    for (let i = 0; i < yAxisSplit; i++) {
        points.push(Math.floor(config.padding + eachSpacing * i));
    }
    points.push(Math.floor(config.padding + eachSpacing * yAxisSplit));

    context.setStrokeStyle(opts.yAxis.gridColor || "#cccccc");
    context.setLineWidth(1);
    if (opts.yAxis.disableGrid !== true) {
        context.beginPath();
        // 设置风格类型
        if (opts.yAxis.gridLineStyle && opts.yAxis.gridLineStyle.type === 'dashed') {
            context.setLineDash([2, 1]);
        }

        // 绘画网格，最后一条为x轴，不在此绘画
        for (let i = 0; i < points.length - 1; i++) {
            let item = points[i];
            context.moveTo(startX, item);
            context.lineTo(endX, item);
        }
        context.stroke();
        context.setLineDash(null);
    }
    // 关闭网格时，还是要绘画x轴线
    if (points && points.length > 0) {
        context.beginPath();
        context.moveTo(startX, points[points.length - 1]);
        context.lineTo(endX, points[points.length - 1]);
        context.stroke();
    }
}

export function drawYAxis(series, opts, config, context) {
    if (opts.yAxis.disabled === true) {
        return;
    }

    // let yAxisTotalWidth = config.yAxisWidth + config.yAxisTitleWidth;
    // let startX = config.padding + yAxisTotalWidth;
    let startX = calStartX(config, opts);


    let endX = opts.width - config.padding;
    let startY = config.padding;
    let endY = calStartY(config, opts);

    if (!opts.yAxis.axisLine || opts.yAxis.axisLine.show !== false) {
        context.beginPath();
        context.setStrokeStyle(opts.xAxis.gridColor || "#cccccc");
        context.moveTo(startX, startY);
        context.lineTo(startX, endY);
        context.stroke();
    }

    if (opts.yAxis && opts.yAxis.axisLabel && opts.yAxis.axisLabel.show === false) {
        return;
    }


    let {rangesFormat} = calYAxisData(series, opts, config);

    let spacingValid = calStartY(config, opts) - config.padding;

    let {yAxisSplit} = getYAxisSplit(series, opts, config);
    let eachSpacing = (spacingValid / yAxisSplit);


    // set YAxis background
    context.setFillStyle(opts.background || '#ffffff');
    if (opts._scrollDistance_ < 0) {
        context.fillRect(0, 0, startX, endY + config.xAxisHeight + 5);
    }
    context.fillRect(endX, 0, opts.width, endY + config.xAxisHeight + 5);

    let points = [];
    for (let i = 0; i <= yAxisSplit; i++) {
        points.push(Math.floor(config.padding + eachSpacing * i));
    }

    context.stroke();
    context.beginPath();
    context.setFontSize(config.fontSize);
    context.setFillStyle(opts.yAxis.fontColor || '#666666')

    let textX = config.padding + config.yAxisTitleWidth;
    if (opts.yAxis.axisLabel && opts.yAxis.axisLabel.align) {
        textX = startX - 5;
        context.setTextAlign(opts.yAxis.axisLabel.align);
    }

    rangesFormat.forEach(function (item, index) {
        let pos = points[index] ? points[index] : endY;
        context.fillText(item, textX, pos + config.fontSize / 2 - 1);
    });
    context.closePath();
    context.stroke();

    if (opts.yAxis.title) {
        drawYAxisTitle(opts.yAxis.title, opts, config, context);
    }
}

export function drawLegend(series, opts, config, context) {
    if (!opts.legend) {
        return;
    }
    // each legend shape width 15px
    // the spacing between shape and text in each legend is the `padding`
    // each legend spacing is the `padding`
    // legend margin top `config.padding`
    //, legendHeight
    let {legendList} = calLegendData(series, opts, config);
    let padding = 5;
    let marginTop = 8;
    let shapeWidth = 15;
    legendList.forEach((itemList, listIndex) => {
        let width = 0;
        itemList.forEach(function (item) {
            item.name = item.name || 'undefined';
            width += 3 * padding + measureText(item.name) + shapeWidth;
        });
        let startX = (opts.width - width) / 2 + padding;
        let startY = opts.height - config.padding - config.legendHeight + listIndex * (config.fontSize + marginTop) + padding + marginTop;

        context.setFontSize(config.fontSize);
        itemList.forEach(function (item) {
            switch (opts.type) {
                case 'line':
                    context.beginPath();
                    context.setLineWidth(1);
                    context.setStrokeStyle(item.color);
                    context.moveTo(startX - 2, startY + 5);
                    context.lineTo(startX + 17, startY + 5);
                    context.stroke();
                    context.closePath();
                    context.beginPath();
                    context.setLineWidth(1);
                    context.setStrokeStyle('#ffffff');
                    context.setFillStyle(item.color);
                    context.moveTo(startX + 7.5, startY + 5);
                    context.arc(startX + 7.5, startY + 5, 4, 0, 2 * Math.PI);
                    context.fill();
                    context.stroke();
                    context.closePath();
                    break;
                case 'pie':
                case 'ring':
                    context.beginPath();
                    context.setFillStyle(item.color);
                    context.moveTo(startX + 7.5, startY + 5);
                    context.arc(startX + 7.5, startY + 5, 7, 0, 2 * Math.PI);
                    context.closePath();
                    context.fill();
                    break;
                default:
                    context.beginPath();
                    context.setFillStyle(item.color);
                    context.moveTo(startX, startY);
                    context.rect(startX, startY, 15, 10);
                    context.closePath();
                    context.fill();
            }
            startX += padding + shapeWidth;
            context.beginPath();
            context.setFillStyle(opts.extra.legendTextColor || '#333333');
            context.fillText(item.name, startX, startY + 9);
            context.closePath();
            context.stroke();
            startX += measureText(item.name) + 2 * padding;
        });
    });
}

export function drawPieDataPoints(seriesP, opts, config, context, process = 1) {
    // TODO 此处长宽没值会死循环，临时处理
    if (!opts.width || !opts.height) {
        throw new Error('图表长宽参数异常');
    }

    let pieOption = opts.extra.pie || {};
    let series = getPieDataPoints(seriesP, process);
    let centerPosition = {
        x: opts.width / 2,
        y: (opts.height - config.legendHeight) / 2
    };

    opts.pieChartLinePadding = opts.pieChartLinePadding || config.pieChartLinePadding;
    opts.pieChartTextPadding = opts.pieChartTextPadding || config.pieChartTextPadding;

    let radius = Math.min(
        centerPosition.x - opts.pieChartLinePadding - opts.pieChartTextPadding - config._pieTextMaxLength_,
        centerPosition.y - opts.pieChartLinePadding - opts.pieChartTextPadding
    );
    if (opts.dataLabel) {
        radius -= 10;
    } else {
        radius -= 2 * config.padding;
    }
    series = series.map((eachSeries) => {
        eachSeries._start_ += (pieOption.offsetAngle || 0) * Math.PI / 180;
        return eachSeries;
    });
    series.forEach(function (eachSeries) {
        context.beginPath();
        context.setLineWidth(opts.pieStrokeWidth || 2);
        context.setStrokeStyle(opts.pieStrokeColor || '#ffffff');
        context.setFillStyle(eachSeries.color);
        context.moveTo(centerPosition.x, centerPosition.y);
        context.arc(centerPosition.x, centerPosition.y, radius, eachSeries._start_, eachSeries._start_ + 2 * eachSeries._proportion_ * Math.PI);
        context.closePath();
        context.fill();
        if (opts.disablePieStroke !== true) {
            context.stroke();
        }
    });

    if (opts.type === 'ring') {
        let innerPieWidth = radius * 0.6;
        if (typeof opts.extra.ringWidth === 'number' && opts.extra.ringWidth > 0) {
            innerPieWidth = Math.max(0, radius - opts.extra.ringWidth);
        }
        context.beginPath();
        context.setFillStyle(opts.background || '#ffffff');
        context.moveTo(centerPosition.x, centerPosition.y);
        context.arc(centerPosition.x, centerPosition.y, innerPieWidth, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
    }

    if (opts.dataLabel !== false && process === 1) {
        // fix https://github.com/xiaolin3303/wx-charts/issues/132
        let valid = false;
        for (let i = 0, len = series.length; i < len; i++) {
            if (series[i].data > 0) {
                valid = true;
                break;
            }
        }

        if (valid) {
            drawPieText(series, opts, config, context, radius, centerPosition);
        }
    }

    if (process === 1 && opts.type === 'ring') {
        drawRingTitle(opts, config, context);
    }

    return {
        center: centerPosition,
        radius,
        series
    }
}

export function drawRadarDataPoints(series, opts, config, context, process = 1) {
    let radarOption = opts.extra.radar || {};
    let coordinateAngle = getRadarCoordinateSeries(opts.categories.length);
    let centerPosition = {
        x: opts.width / 2,
        y: (opts.height - config.legendHeight) / 2
    }

    let radius = Math.min(
        centerPosition.x - (getMaxTextListLength(opts.categories) + config.radarLabelTextMargin),
        centerPosition.y - config.radarLabelTextMargin
    );

    radius -= config.padding;

    // draw grid
    context.beginPath();
    context.setLineWidth(1);
    context.setStrokeStyle(radarOption.gridColor || "#cccccc");
    coordinateAngle.forEach(angle => {
        let pos = convertCoordinateOrigin(radius * Math.cos(angle), radius * Math.sin(angle), centerPosition);
        context.moveTo(centerPosition.x, centerPosition.y);
        context.lineTo(pos.x, pos.y);
    });
    context.stroke();
    context.closePath();

    // draw split line grid
    for (let i = 1; i <= config.radarGridCount; i++) {
        let startPos = {};
        context.beginPath();
        context.setLineWidth(1);
        context.setStrokeStyle(radarOption.gridColor || "#cccccc");
        coordinateAngle.forEach((angle, index) => {
            let pos = convertCoordinateOrigin(radius / config.radarGridCount * i * Math.cos(angle), radius / config.radarGridCount * i * Math.sin(angle), centerPosition);
            if (index === 0) {
                startPos = pos;
                context.moveTo(pos.x, pos.y);
            } else {
                context.lineTo(pos.x, pos.y);
            }
        });
        context.lineTo(startPos.x, startPos.y);
        context.stroke();
        context.closePath();
    }

    let radarDataPoints = getRadarDataPoints(coordinateAngle, centerPosition, radius, series, opts, process);
    radarDataPoints.forEach((eachSeries, seriesIndex) => {
        // 绘制区域数据
        context.beginPath();
        context.setFillStyle(eachSeries.color);
        context.setGlobalAlpha(0.6);
        eachSeries.data.forEach((item, index) => {
            if (index === 0) {
                context.moveTo(item.position.x, item.position.y);
            } else {
                context.lineTo(item.position.x, item.position.y);
            }
        });
        context.closePath();
        context.fill();
        context.setGlobalAlpha(1);

        if (opts.dataPointShape !== false) {
            let shape = config.dataPointShape[seriesIndex % config.dataPointShape.length];
            let points = eachSeries.data.map(item => {
                return item.position;
            });
            drawPointShape(points, eachSeries.color, shape, context);
        }
    });
    // draw label text
    drawRadarLabel(coordinateAngle, radius, centerPosition, opts, config, context);

    return {
        center: centerPosition,
        radius,
        angleList: coordinateAngle
    }
}

export function drawCanvas(opts, context) {
    context.draw();
}