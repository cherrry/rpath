'use strict';

var fs = require('fs');
var path = require('path');

var resolve = function (paths) {
    return paths.reduce(function (ps, p) {
        return ps.concat([path.resolve(p)]);
    }, []);
}

var rpath = function rpath(paths, isFollowSymlink, callback) {};

rpath.sync = function rpathSync(paths, isFollowSymlink) {
    if (typeof paths === 'string') {
        paths = [paths];
    }

    paths = resolve(paths);
    return paths.map(function (p) {
        var stat = fs.lstatSync(p);

        if (stat.isSymbolicLink() && !isFollowSymlink) {
            return [];
        }

        if (stat.isFile()) {
            return [p];
        }

        if (stat.isDirectory()) {
            var subPaths = fs.readdirSync(p);
            return subPaths.map(function (sp) {
                return rpathSync(paths + path.sep + sp, isFollowSymlink);
            }).reduce(function (p1, p2) {
                return p1.concat(p2);
            }, []);
        }
    }).reduce(function (p1, p2) {
        return p1.concat(p2);
    });
};

module.exports = rpath;
