const getCenter = function (arr: any) {
    var x = arr.map (function (a: any){ return a[0] });
    var y = arr.map (function (a: any){ return a[1] });
    var minX = Math.min.apply (null, x);
    var maxX = Math.max.apply (null, x);
    var minY = Math.min.apply (null, y);
    var maxY = Math.max.apply (null, y);
    return [(minX + maxX) / 2, (minY + maxY) / 2];
}

export { getCenter };
