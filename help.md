参数说明
opts Object

opts.canvasId String required 微信小程序canvas-id

opts.width Number required canvas宽度，单位为px

opts.height Number required canvas高度，单位为px

opts.background String canvas背景颜色（如果页面背景颜色不是白色请设置为页面的背景颜色，默认透明）

opts.enableScroll Boolean 是否开启图表可拖拽滚动 默认false 支持line, area图表类型(需配合绑定scrollStart, scroll, scrollEnd方法)

opts.title Object (only for ring chart)

opts.title.name String 标题内容

opts.title.fontSize Number 标题字体大小（可选，单位为px）

opts.title.color String 标题颜色（可选）

opts.title.offsetX Number 标题横向位置偏移量，单位px，默认0

opts.subtitle Object (only for ring chart)

opts.subtitle.name String 副标题内容

opts.subtitle.offsetX Number 副标题横向位置偏移量，单位px，默认0

opts.subtitle.fontSize Number 副标题字体大小（可选，单位为px）

opts.subtitle.color String 副标题颜色（可选）

opts.animation Boolean default true 是否动画展示

opts.legend Boolen default true 是否显示图表下方各类别的标识

opts.type String required 图表类型，可选值为pie, line, column, area, ring, radar

opts.categories Array required (饼图、圆环图不需要) 数据类别分类

opts.dataLabel Boolean default true 是否在图表中显示数据内容值

opts.dataPointShape Boolean default true 是否在图表中显示数据点图形标识

opts.disablePieStroke Boolean default false 不绘制饼图（圆环图）各区块的白色分割线

opts.xAxis Object X轴配置

opts.xAxis.gridColor String 例如#7cb5ec default #cccccc X轴网格颜色

opts.xAxis.fontColor String 例如#7cb5ec default #666666 X轴数据点颜色

opts.xAxis.disableGrid Boolean default false 不绘制X轴网格

opts.xAxis.type String 可选值calibration(刻度) 默认为包含样式

opts.xAxis.name String 坐标轴名称。
opts.xAxis.nameTextStyle Object 坐标轴名称的文字样式。
opts.xAxis.nameTextStyle.color String 坐标轴名称的颜色。
opts.xAxis.nameTextStyle.fontSize Number 坐标轴名称文字的字体大小。
opts.xAxis.axisLabel.interval Number 刻度标签间隔
opts.xAxis.axisLabel.formatter Function 刻度标签的内容格式器

opts.yAxis Object Y轴配置

opts.yAxis.format Function 自定义Y轴文案显示

opts.yAxis.min Number Y轴起始值

opts.yAxis.max Number Y轴终止值

opts.yAxis.interval Number Y轴刻度间隔

opts.yAxis.title String Y轴title
opts.yAxis.name String 坐标轴名称。
opts.yAxis.nameTextStyle Object 坐标轴名称的文字样式。
opts.yAxis.nameTextStyle.color String 坐标轴名称的颜色。
opts.yAxis.nameTextStyle.fontSize Number 坐标轴名称文字的字体大小。

opts.yAxis.gridColor String 例如#7cb5ec default #cccccc Y轴网格颜色

opts.yAxis.fontColor String 例如#7cb5ec default #666666 Y轴数据点颜色

opts.yAxis.titleFontColor String 例如#7cb5ec default #333333 Y轴title颜色

opts.yAxis.disabled Boolean default false 不绘制Y轴

opts.yAxis.disableGrid Boolean default false 横向网络

opts.yAxis.axisTick.show Boolean default true 是否显示坐标轴刻度。

opts.yAxis.axisLabel.show Boolean default true 是否显示刻度标签。
opts.yAxis.axisLabel.interval Number 坐标轴刻度标签的显示间隔，在类目轴中有效。默认会采用标签不重叠的策略间隔显示标签。
opts.yAxis.axisLabel.align String default 'left' 文字水平对齐方式。
opts.yAxis.axisLabel.width Number 文字块的宽度。一般不用指定，不指定则自动是文字的宽度。

opts.yAxis.axisLine Object 坐标轴轴线相关设置。
opts.yAxis.axisLine.show Boolean 是否显示坐标轴轴线。 [ default: true ]

opts.extra Object 其他非通用配置项

opts.extra.ringWidth Number ringChart圆环宽度，单位为px

opts.extra.lineStyle String (仅对line, area图表有效) 可选值：curve曲线，straight直线 (default)

opts.extra.column Object 柱状图相关配置

opts.extra.column.width Number 柱状图每项的图形宽度，单位为px
opts.extra.column.barBorderRadius Number 柱状图每项的图形圆角，单位为px [5, 5, 0, 0] （顺时针左上，右上，右下，左下）  5 统一设置四个角的圆角大小

opts.extra.legendTextColor String 例如#7cb5ec default #cccccc legend文案颜色

opts.extra.radar Object 雷达图相关配置

opts.extra.radar.max Number, 默认为series data的最大值，数据区间最大值，用于调整数据显示的比例

opts.extra.radar.labelColor String, 默认为#666666, 各项标识文案的颜色

opts.extra.radar.gridColor String, 默认为#cccccc, 雷达图网格颜色

opts.extra.pie Object 饼图、圆环图相关配置

opts.extra.pie.offsetAngle Number, 默认为0, 起始角度偏移度数，顺时针方向，起点为3点钟位置（比如要设置起点为12点钟位置，即逆时针偏移90度，传入-90即可）
opts.extra.markLine Object 图表标线。
opts.extra.markLine.data Array 
opts.extra.markLine.data.yAxis Number 
opts.extra.markLine.data.lineStyle Number 
opts.extra.markLine.data.lineStyle.yAxis Number 标注值
opts.extra.markLine.data.lineStyle.color String 线的颜色。 
opts.extra.markLine.data.lineStyle.width String 线宽。 
opts.extra.markLine.data.lineStyle.type String [ default: solid ] 线的类型。 可选： 'solid' 'dashed' 'dotted'。 
opts.extra.markLine.data.label 该数据项标签的样式，起点和终点项的 label会合并到一起。 
opts.extra.markLine.data.label.show 是否显示标签。
opts.extra.markLine.data.label.formatter 标签内容格式器，支持字符串模板和回调函数两种形式，字符串模板与回调函数返回的字符串均支持用 \n 换行。
opts.extra.markLine.data.label.showValue 是否在左侧显示标注线值
opts.extra.markLine.data.label.valueColor 标注线值颜色

opts.series Array required 数据列表

数据列表每项结构定义

dataItem Object

dataItem.data Array required (饼图、圆环图为Number) 数据，如果传入null图表该处出现断点

dataItem.data Object required (饼图、圆环图为Number) 数据
dataItem.data.value Number required (饼图、圆环图为Number) 数据，如果传入null图表该处出现断点
dataItem.data.itemStyle.color String 单个拐点标志的样式设置。
dataItem.data.itemStyle.symbolSize Number 单个数据标记的大小。

dataItem.color String 例如#7cb5ec 不传入则使用系统默认配色方案

dataItem.name String 数据名称

dateItem.format Function 自定义显示数据内容

dateItem.lineStyle Object 线条样式

dateItem.lineStyle.width Number 线宽

dateItem.areaStyle Object 区域填充样式。
dateItem.areaStyle.color String 填充的颜色。

tooltip.background String 背景色
tooltip.position(item, cat, index) Function 提示框浮层的位置，默认不设置时位置会跟随鼠标的位置。
tooltip.format Function 格式化tooltip，返回null时隐藏。
tooltip.axisPointer Object 坐标轴指示器
tooltip.axisPointer.type String 指示器类型: 'line' 直线指示器
tooltip.axisPointer.lineStyle Object axisPointer.type 为 'line' 时有效。
tooltip.axisPointer.lineStyle.color String 线的颜色。
tooltip.legendStyle Object 
tooltip.legendStyle.show Boolean 
tooltip.textStyle.color tooltip文字颜色
