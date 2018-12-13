import Util from '../util/util'

function findRange (num, type, limit) {
    let nNum = num;
    if (isNaN(nNum)) {
        throw new Error('[wxCharts] unvalid series data!');
    }
    let nLimit = limit || 10;
    let nType = type;
    nType = nType ? nType : 'upper';
    let multiple = 1;
    while (nLimit < 1) {
        nLimit *= 10;
        multiple *= 10;
    }
    if (nType === 'upper') {
        nNum = Math.ceil(nNum * multiple);
    } else {
        nNum = Math.floor(nNum * multiple);
    }
    while (nNum % nLimit !== 0) {
        if (nType === 'upper') {
            nNum++;
        } else {
            nNum--;
        }
    }

    return nNum / multiple;
}

export function calValidDistance (distance, chartData, config, opts) {

    let dataChartAreaWidth = opts.width - config.padding - chartData.xAxisPoints[0];
    let dataChartWidth = chartData.eachSpacing * opts.categories.length;
    let validDistance = distance;
    if (distance >= 0) {
        validDistance = 0;
    } else if (Math.abs(distance) >= (dataChartWidth - dataChartAreaWidth)) {
        validDistance = dataChartAreaWidth - dataChartWidth;
    }
    return validDistance;
}

export function isInAngleRange(angle, startAngle, endAngle) {
    function adjust (angle) {
        let nAngle = angle;
        while (nAngle < 0) {
            nAngle += 2 * Math.PI;
        }
        while (nAngle > 2 * Math.PI) {
            nAngle -= 2 * Math.PI;
        }

        return nAngle;
    }

    let nAngle = adjust(angle);
    let nStartAngle = adjust(startAngle);
    let nEndAngle = adjust(endAngle);
    if (nStartAngle > nEndAngle) {
        nEndAngle += 2 * Math.PI;
        if (nAngle < nStartAngle) {
            nAngle += 2 * Math.PI;
        }
    }

    return nAngle >= nStartAngle && nAngle <= nEndAngle;
}

export function calRotateTranslate(x, y, h) {
    var xv = x;
    var yv = h - y;

    var transX = xv + (h - yv -xv) / Math.sqrt(2);
    transX *= -1;

    var transY = (h -yv) * (Math.sqrt(2) - 1) - (h - yv - xv) / Math.sqrt(2);

    return {
        transX,
        transY
    };
}


export function createCurveControlPoints(points, i) {

    function isNotMiddlePoint (points, i) {
        if (points[i - 1] && points[i + 1]) {
            return points[i].y >= Math.max(points[i - 1].y, points[i + 1].y)
                   || points[i].y <= Math.min(points[i - 1].y, points[i + 1].y);
        } else {
            return false
        }
    }

    const a = 0.2;
    const b = 0.2;
    let pAx = null;
    let pAy = null;
    let pBx = null;
    let pBy = null;
    if(i < 1){
        pAx = points[0].x + (points[1].x-points[0].x) * a;
        pAy = points[0].y + (points[1].y-points[0].y) * a;
    }else{
        pAx = points[i].x + (points[i + 1].x - points[i-1].x) * a;
        pAy = points[i].y + (points[i + 1].y - points[i-1].y) * a;
    }

    if(i > points.length - 3){
        let last =points.length - 1;
        pBx = points[last].x - (points[last].x - points[last - 1].x) * b;
        pBy = points[last].y - (points[last].y - points[last - 1].y) * b;
    }else{
        pBx = points[i + 1].x - (points[i + 2].x-points[i].x) * b;
        pBy = points[i + 1].y - (points[i + 2].y-points[i].y) * b;
    }

    // fix issue https://github.com/xiaolin3303/wx-charts/issues/79
    if (isNotMiddlePoint(points, i + 1)) {
        pBy = points[i + 1].y;
    }
    if (isNotMiddlePoint(points, i)) {
        pAy = points[i].y;
    }

    return {
        ctrA: {x: pAx, y: pAy},
        ctrB: {x: pBx, y: pBy}
    }
}

export function convertCoordinateOrigin (x, y, center) {
    return {
        x: center.x + x,
        y: center.y - y
    }
}

export function avoidCollision (obj, target) {
    if (target) {
        // is collision test
        while (Util.isCollision(obj, target)) {
            if (obj.start.x > 0) {
                obj.start.y--;
            } else if (obj.start.x < 0) {
                obj.start.y++;
            } else {
                if (obj.start.y > 0) {
                    obj.start.y++;
                } else {
                    obj.start.y--;
                }
            }
        }
    }
    return obj;
}

export function fillSeriesColor (series, config) {
    let index = 0;
    return series.map(function(item) {
        if (!item.color) {
            item.color = config.colors[index];
            index = (index + 1) % config.colors.length;
        }
        return item;
    });
}

export function getDataRange (minData, maxData) {
    let limit = 0;
    let range = maxData - minData;
    if (range >= 10000) {
        limit = 1000;
    } else if (range >= 1000) {
        limit = 100;
    } else if (range >= 100) {
        limit = 10;
    } else if (range >= 10) {
        limit = 5;
    } else if (range >= 1) {
        limit = 1;
    } else if (range >= 0.1) {
        limit = 0.1;
    } else {
        limit = 0.01;
    }
    return {
        minRange: findRange(minData, 'lower', limit),
        maxRange: findRange(maxData, 'upper', limit)
    }
}

export function measureMaxText(context, text) {
    let widths = text.map(t => {
        return context.measureText(t.toString()).width;
    });

    return Math.max.apply(null, widths);
}

export function measureText(text, fontSize, context) {
    if (context && context.measureText) {
        let metrics = context.measureText(String(text));
        return metrics.width;
    }

    let fs = fontSize;
    if (typeof fs === 'undefined') {
        fs = 10;
    }

    // wx canvas 未实现measureText方法, 此处自行实现
    let nText = String(text);
    nText = nText.split('');
    let width = 0;
    nText.forEach(function(item) {
        if (/[a-zA-Z]/.test(item)) {
            width += 7;
        } else if (/[0-9]/.test(item)) {
            width += 5.5;
        } else if (/\./.test(item)) {
            width += 2.7;
        } else if (/-/.test(item)) {
            width += 3.25;
        } else if (/[\u4e00-\u9fa5]/.test(item)) {
            width += 10;
        } else if (/\(|\)/.test(item)) {
            width += 3.73;
        } else if (/\s/.test(item)) {
            width += 2.5;
        } else if (/%/.test(item)) {
            width += 8;
        } else {
            width += 10;
        }
    });
    return width * fs / 10;
}

/**
 * 带公式字符串宽度缓存，如果有动画或者需要大量重绘时用缓存减少测量耗时
 */
const FORMULA_TEXT_WIDTH_CACHE = {};

/**
 * 测量带上下标的字符串
 *
 * @param text
 * @param fontSize
 * @param context
 * @returns {*}
 */
export function measureFormulaText(text, fontSize, context) {
    if (!text) {
        return [];
    }
    if (FORMULA_TEXT_WIDTH_CACHE[text]) {
        return FORMULA_TEXT_WIDTH_CACHE[text];
    }

    let textInfo = [{
        text: '',
        width: 0,
        type: null
    }];
    // 遍历字符串，根据正常/上标/下标类型进行切割分组
    // 如： PM_1_0 ug/m^3 -> ['PM', '10', ' ug/m', '3']
    for (let i = 0; i < text.length; i++) {
        let ch = text.charAt(i);
        let ti = textInfo[textInfo.length - 1];
        switch (ch) {
            case '_':
                if (ti.type !== 'sub') {
                    textInfo.push({
                        text: '',
                        width: 0,
                        type: 'sub'
                    })
                }
                ch = text.charAt(++i);
                break;
            case '^':
                if (ti.type !== 'sup') {
                    textInfo.push({
                        text: '',
                        width: 0,
                        type: 'sup'
                    })
                }
                ch = text.charAt(++i);
                break;
            default:
                if (ti.type) {
                    textInfo.push({
                        text: '',
                        width: 0,
                        type: null
                    })
                }
        }
        ti = textInfo[textInfo.length - 1];
        ti.text += ch;
    }

    // 字符串按类型分组后测量每组宽度
    textInfo.forEach(info => {
        switch (info.type) {
            case 'sub':
                context.setFontSize(fontSize * 2 / 3);
                context.setTextBaseline('middle');
                break;
            case 'sup':
                context.setFontSize(fontSize * 2 / 3);
                context.setTextBaseline('bottom');
                break;
            default:
                context.setFontSize(fontSize);
                context.setTextBaseline('normal');
        }
        info.width = context.measureText(info.text).width;
    });

    FORMULA_TEXT_WIDTH_CACHE[text] = textInfo;
    return textInfo;
}