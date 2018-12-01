import { getDataRange } from './charts-util'
import Util from '../util/util'
import { measureText, convertCoordinateOrigin, isInAngleRange } from './charts-util'

function dataCombine(series) {
    return series.reduce(function(a, b) {
        let data = null;
        // 数组数据
        if (Array.isArray(b.data)) {
            // 支持扩展类型数据
            data = b.data.map(function (value) {
                return ((typeof value === 'object') && !isNaN(value.value)) ? value.value : value;
            });
        } else {
            // 单数据
            data = ((typeof b.data === 'object') && !isNaN(b.data.value)) ? b.data.value : b.data;
        }

        return a.concat(data);
    }, []);
}

export function getSeriesDataItem(series, index) {
    let data = [];
    series.forEach((item) => {
        if (item.data[index] !== null && typeof item.data[index] !== 'undefined') {
            let seriesItem = {};
            seriesItem.color = item.color;
            seriesItem.name = item.name;
            // 扩展数据配置项
            let itemData = item.data[index];
            if (item.format) {
                seriesItem.data = item.format(itemData, item);
            } else {
                if (typeof itemData === 'object' && itemData.value) {
                    seriesItem.data = itemData.value;
                } else {
                    itemData.value = itemData;
                }
            }
            data.push(seriesItem);
        }
    });

    return data;
}

export function getChartDataAreaBoundary (xAxisPoints) {
    return {
        leftBorder: xAxisPoints[0],
        rightBorder: xAxisPoints[xAxisPoints.length - 1]
    }
}

export function getMaxTextListLength(list) {
    let lengthList = list.map(item => measureText(item));
    return Math.max.apply(null, lengthList);
}

export function getRadarCoordinateSeries(length) {
    let eachAngle = 2 * Math.PI / length;
    let CoordinateSeries = [];
    for (let i = 0; i < length; i++) {
        CoordinateSeries.push(eachAngle * i);
    }

    return CoordinateSeries.map(item => -1 * item + Math.PI / 2);
}

export function getToolTipData(seriesData, calPoints, index, categories, option) {
    let opts = option;
    if (!opts) {
        opts = {};
    }
    let textList = seriesData.map(item => {
        return {
            text: opts.format ? opts.format(item, categories[index]) : `${item.name}: ${item.data}`,
            color: item.color
        }
    });
    let validCalPoints = [];
    let offset = {
        x: 0,
        y: 0
    };
    calPoints.forEach(points => {
        if (typeof points[index] !== 'undefined' && points[index] !== null) {
            validCalPoints.push(points[index]);
        }
    });
    validCalPoints.forEach(item => {
        offset.x = Math.round(item.x);
        offset.y += item.y;
    });

    offset.y /= validCalPoints.length;
    return { textList, offset };
}

export function findCurrentIndex (currentPoints, xAxisPoints, opts, config, offset) {
    let os = offset;
    if (!os) {
        os = 0;
    }
    let currentIndex = -1;
    if (isInExactChartArea(currentPoints, opts, config)) {
        xAxisPoints.forEach((item, index) => {
            if (currentPoints.x + os > item) {
                currentIndex = index;
            }
        });
    }

    return currentIndex;
}

export function isInExactChartArea (currentPoints, opts, config) {
    return currentPoints.x < opts.width - config.padding
        // && currentPoints.x > config.padding + config.yAxisWidth + config.yAxisTitleWidth
        && currentPoints.x > calStartX(config, opts)
        && currentPoints.y > config.padding
        && currentPoints.y < opts.height - config.legendHeight - config.xAxisHeight - config.padding
}

export function findRadarChartCurrentIndex (currentPoints, radarData, count) {
    let eachAngleArea = 2 * Math.PI / count;
    let currentIndex = -1;

    function fixAngle (angle) {
        let ag = angle;
        if (ag < 0) {
            ag += 2 * Math.PI;
        }
        if (ag > 2 * Math.PI) {
            ag -= 2 * Math.PI;
        }
        return ag;
    }

    if (isInExactPieChartArea(currentPoints, radarData.center, radarData.radius)) {
        let angle = Math.atan2(radarData.center.y - currentPoints.y, currentPoints.x - radarData.center.x);
        angle =  -1 * angle;
        if (angle < 0) {
            angle += 2 * Math.PI;
        }
        let angleList = radarData.angleList.map(item => {
            let i = fixAngle(-1 * item);

            return i;
        });

        angleList.forEach((item, index) => {
            let rangeStart = fixAngle(item - eachAngleArea / 2);
            let rangeEnd = fixAngle(item + eachAngleArea / 2);
            if (rangeEnd < rangeStart) {
                rangeEnd += 2 * Math.PI;
            }
            if ((angle >= rangeStart && angle <= rangeEnd)
                || (angle + 2 * Math.PI >= rangeStart && angle + 2 * Math.PI <= rangeEnd)) {
                currentIndex = index;
            }
        });
    }

    return currentIndex;
}

export function findPieChartCurrentIndex (currentPoints, pieData) {
    let currentIndex = -1;
    if (isInExactPieChartArea(currentPoints, pieData.center, pieData.radius)) {
        let angle = Math.atan2(pieData.center.y - currentPoints.y, currentPoints.x - pieData.center.x);
        angle = -angle;
        for (let i = 0, len = pieData.series.length; i < len; i++) {
            let item = pieData.series[i];
            if (isInAngleRange(angle, item._start_, item._start_ + item._proportion_ * 2 * Math.PI)) {
                currentIndex = i;
                break;
            }
        }
    }

    return currentIndex;
}

export function isInExactPieChartArea (currentPoints, center, radius) {
    return Math.pow(currentPoints.x - center.x, 2) + Math.pow(currentPoints.y - center.y, 2) <= Math.pow(radius, 2);
}

/**
 * 把数据点坐标分组，中间有断层会把点分成两组
 *
 * 用于在画线时，中断的点处不用线连接
 *
 * @param points    所有数据点坐标
 * @returns {Array} 数据点坐标分组
 */
export function splitPoints(points) {
    let groupPoints = [];
    let items = [];
    points.forEach((item, index) => {
        if (item !== null) {
            items.push(item);
        } else {
            // 有断层，把前面的数据放到一组
            if (items.length) {
                groupPoints.push(items);
            }
            // 下一组数据
            items = [];
        }
    });
    if (items.length) {
        groupPoints.push(items);
    }

    return groupPoints;
}

export function calLegendData(series, opts, config) {
    if (opts.legend === false) {
        return {
            legendList: [],
            legendHeight: 0
        }
    }
    let padding = 5;
    let marginTop = 8;
    let shapeWidth = 15;
    let legendList = [];
    let widthCount = 0;
    let currentRow = [];
    series.forEach((item) => {
        let itemWidth = 3 * padding + shapeWidth + measureText(item.name || 'undefined');
        if (widthCount + itemWidth > opts.width) {
            legendList.push(currentRow);
            widthCount = itemWidth;
            currentRow = [item];
        } else {
            widthCount += itemWidth;
            currentRow.push(item);
        }
    });
    if (currentRow.length) {
        legendList.push(currentRow);
    }

    return {
        legendList,
        legendHeight: legendList.length * (config.fontSize + marginTop) + padding
    }
}

/**
 * 计算目录样式数据
 *
 * 包括label角度
 *
 * @param categories
 * @param opts
 * @param config
 * @returns {{angle: number, xAxisHeight: (*|number)}}
 */
export function calCategoriesData(categories, opts, config) {
    let result = {
        angle: 0,
        xAxisHeight: config.xAxisHeight
    };
    let eachSpacing = getXAxisPoints(categories, opts, config).eachSpacing;

    // get max length of categories text
    let categoriesTextLenth = categories.map((item) => {
        // 添加带换行符的宽度判断逻辑
        let textWidth = item.toString().split('\n').reduce(function (sum, single) {
            return Math.max(sum, measureText(single));
        }, 0);
        return textWidth;
    });

    let maxTextLength = Math.max.apply(this, categoriesTextLenth);

    // 如果x坐标标签文字大于间隔，倾斜
    let chartEachSpacing = eachSpacing;
    // 如果手动设置了间隔配置，计算实际间隔大小，而不是一直用单元隔的大小
    if (opts.xAxis && opts.xAxis.axisLabel && opts.xAxis.axisLabel.interval) {
        chartEachSpacing *= opts.xAxis.axisLabel.interval;
    }
    if ( maxTextLength + 2 * config.xAxisTextPadding > chartEachSpacing) {
        result.angle = 45 * Math.PI / 180;
        result.xAxisHeight = 2 * config.xAxisTextPadding + maxTextLength * Math.sin(result.angle);
    }

    return result;
}

export function getRadarDataPoints(angleList, center, radius, series, opts, process ) {
    let p = process;
    if (!p) {
        p = 1;
    }
    let radarOption = opts.extra.radar || {};
    radarOption.max = radarOption.max || 0;
    let maxData = Math.max(radarOption.max, Math.max.apply(null, dataCombine(series)));

    let data = [];
    series.forEach(each => {
        let listItem = {};
        listItem.color = each.color;
        listItem.data = [];
        each.data.forEach((item, index) => {
            let tmp = {};
            tmp.angle = angleList[index];

            tmp.proportion = item / maxData;
            tmp.position = convertCoordinateOrigin(radius * tmp.proportion * p * Math.cos(tmp.angle), radius * tmp.proportion * p * Math.sin(tmp.angle), center);
            listItem.data.push(tmp);
        });

        data.push(listItem);
    });

    return data;
}

export function getPieDataPoints(series, process) {
    let p = process;
    if (!p) {
        p = 1;
    }
    let count = 0;
    let _start_ = 0;
    series.forEach(function(item) {
        item.data = item.data === null ? 0 : item.data;
        count += item.data;
    });
    series.forEach(function(item) {
        item.data = item.data === null ? 0 : item.data;
        item._proportion_ = item.data / count * p;
    });
    series.forEach(function(item) {
        item._start_ = _start_;
        _start_ += 2 * item._proportion_ * Math.PI;
    });

    return series;
}

export function getPieTextMaxLength(series) {
    let sr = getPieDataPoints(series);
    let maxLength = 0;
    sr.forEach((item) => {
        let text = item.format ? item.format(+item._proportion_.toFixed(2), item) : `${Util.toFixed(item._proportion_ * 100)}%`;
        maxLength = Math.max(maxLength, measureText(text));
    });

    return maxLength;
}

export function fixColumeData(points, eachSpacing, columnLen, index, config, opts) {
    return points.map(function(item) {
        if (item === null) {
            return null;
        }
        item.width = (eachSpacing - 2 * config.columePadding) / columnLen;
        
        if (opts.extra.column && opts.extra.column.width && +opts.extra.column.width > 0) {
            // customer column width
            item.width = Math.min(((eachSpacing - 2) / columnLen), +opts.extra.column.width);

            // 添加圆角参数
            if (opts.extra.column.barBorderRadius) {
                item.barBorderRadius = opts.extra.column.barBorderRadius;
            }
        } else {
            // default width should less tran 25px
            // don't ask me why, I don't know
            item.width = Math.min(item.width, 25);
        }
        item.x += (index + 0.5 - (columnLen) / 2) * item.width;

        return item;
    });
}

export function calStartX(config, opts) {
    let yAxisTotalWidth = config.yAxisWidth + config.yAxisTitleWidth;
    let startX = config.padding + yAxisTotalWidth;

    if (opts && opts.grid) {
        if (opts.grid.left) {
            startX += opts.grid.left;
        }
    }

    return startX;
}

export function calStartY(config, opts) {
    let startY = opts.height - config.padding - config.xAxisHeight - config.legendHeight;
    if (opts && opts.grid) {
        if (opts.grid.bottom) {
            startY -= opts.grid.bottom;
        }
    }
    return startY;
}

export function getXAxisPoints(categories, opts, config) {
    let startX = calStartX(config, opts);
    let spacingValid = opts.width - config.padding - startX;

    let dataCount = opts.enableScroll ? Math.min(5, categories.length) : categories.length;
    let eachSpacing = spacingValid / dataCount;

    let xAxisPoints = [];
    let endX = opts.width - config.padding;
    categories.forEach(function(item, index) {
        xAxisPoints.push(startX + index * eachSpacing);
    });
    if (opts.enableScroll === true) {
        xAxisPoints.push(startX + categories.length * eachSpacing);
    } else {    
        xAxisPoints.push(endX);
    }

    return { xAxisPoints, startX, endX, eachSpacing };
}

export function getDataPoints(data, ranges, xAxisPoints, eachSpacing, opts, config, process = 1) {
    let {minRange, maxRange} = ranges;
    let points = [];
    // 可用高度
    // let validHeight = opts.height - 2 * config.padding - config.xAxisHeight - config.legendHeight;
    let validHeight = calStartY(config, opts) - config.padding;
    data.forEach(function(item, index) {
        let value = null;
        let color = null;
        let size = null;
        if (typeof item === 'object') {
            value = item.value;
            if (item.itemStyle && item.itemStyle.color) {
                color = item.itemStyle.color;
            }
            if (item.symbolSize) {
                size = item.symbolSize;
            }
        } else {
            value = item;
        }
        if (!value) {
            points.push(null);
        } else {        
            let point = {};
            point.x = xAxisPoints[index] + Math.round(eachSpacing / 2);
            // 计算点的高度在整个可用图形高度中的位置，可用高度 * (点数值 / 有效数值范围高度)
            let height = validHeight * (value - minRange) / (maxRange - minRange);
            height *= process;
            // point.y = opts.height - config.xAxisHeight - config.legendHeight - Math.round(height) - config.padding;
            point.y = calStartY(config, opts) - Math.round(height);
            if (color) {
                point.color = color;
            }
            if (size) {
                point.size = size;
            }
            points.push(point);
        }
    });

    return points;
}

export function getYAxisLines(y, ranges, xAxisPoints, eachSpacing, opts, config, process = 1) {
    let {minRange, maxRange} = ranges;
    let startY = calStartY(config, opts);
    // 可用高度
    let validHeight = startY - config.padding;

    let point = {};
    point.startX = xAxisPoints[0];
    point.endX = xAxisPoints[xAxisPoints.length - 1]/* + Math.round(eachSpacing / 2)*/;
    // 计算点的高度在整个可用图形高度中的位置，可用高度 * (点数值 / 有效数值范围高度)
    let height = validHeight * (y - minRange) / (maxRange - minRange);
    height *= process;
    point.y = startY - Math.round(height);
    // x轴所在y
    point.startY = startY;
    // 最上方的界限
    point.endY = startY - validHeight;

    return point;
}

export function getYAxisTextList(series, opts, config) {
    let data = dataCombine(series);
    // remove null from data
    data = data.filter((item) => {
        return item !== null;
    });
    let minData = Math.min.apply(this, data);
    let maxData = Math.max.apply(this, data);
    if (data.length === 0)
    {
        minData = maxData = 0;
    }

    if (typeof opts.yAxis.min === 'number') {
        minData = Math.min(opts.yAxis.min, minData);
    }
    if (typeof opts.yAxis.max === 'number') {
        maxData = Math.max(opts.yAxis.max, maxData);
    }

    // fix issue https://github.com/xiaolin3303/wx-charts/issues/9
    if (minData === maxData) {
        let rangeSpan = maxData || 1;
        minData -= rangeSpan;
        maxData += rangeSpan;
    }

    let dataRange = getDataRange(minData, maxData);
    let minRange = dataRange.minRange;
    let maxRange = dataRange.maxRange;

    let range = [];
    let eachRange = (maxRange - minRange) / config.yAxisSplit;

    for (var i = 0; i <= config.yAxisSplit; i++) {
        range.push(minRange + eachRange * i);
    }
    return range.reverse();
}

export function calYAxisData(series, opts, config) {

    let ranges = getYAxisTextList(series, opts, config);
    let yAxisWidth = config.yAxisWidth;
    let rangesFormat = ranges.map(function(item) {
        let i = item;
        i = Util.toFixed(i, 2);
        i = opts.yAxis.format ? opts.yAxis.format(Number(i)) : i;
        yAxisWidth = Math.max(yAxisWidth, measureText(i) + 5);
        return i;
    });
    if (opts.yAxis.disabled === true || (opts.yAxis && opts.yAxis.axisLabel && opts.yAxis.axisLabel.show === false)) {
        yAxisWidth = 0;
    }

    return { rangesFormat, ranges, yAxisWidth };
}