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