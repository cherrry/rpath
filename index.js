'use strict';

var fs = require('fs');
var path = require('path');

var resolve = function (paths) {
    return paths.reduce(function (ps, p) {
        return ps.concat([path.resolve(p)]);
    }, []);
};

var rpath = function rpath(paths, isFollowSymlink, callback) {
    paths = resolve(typeof paths === 'string' ? [paths] : paths);
    isFollowSymlink = !!isFollowSymlink;

    var incomplete = paths.length;
    var allPaths = [];
    var complete = function complete (pathsFound) {
        incomplete--;
        allPaths = allPaths.concat(pathsFound);
        if (incomplete === 0) {
            callback(allPaths);
        }
    };

    if (paths.length === 0) {
        callback([]);
        return;
    }

    paths.map(function (p) {
        fs.lstat(p, function (err, stat) {
            if (stat.isSymbolicLink() && !isFollowSymlink) {
                complete([]);
            }

            if (stat.isFile()) {
                complete([p]);
            }

            if (stat.isDirectory()) {
                fs.readdir(p, function (err, subPaths) {
                    subPaths = subPaths.map(function (sp) {
                        return p + path.sep + sp;
                    });
                    rpath(subPaths, isFollowSymlink, function (allSubPaths) {
                        complete(allSubPaths);
                    });
                })
            }
        });
    });
};

rpath.sync = function rpathSync(paths, isFollowSymlink) {
    paths = resolve(typeof paths === 'string' ? [paths] : paths);
    isFollowSymlink = !!isFollowSymlink;

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
