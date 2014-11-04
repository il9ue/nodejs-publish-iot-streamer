var utilities = {};

/**
 * ROOT_PATH
 */
utilities.ROOT_PATH = __dirname;

/**
 * MEDIASTREAMER_PATH
 */
utilities.MEDIASTREAMER_PATH
    = utilities.ROOT_PATH + '/mediaStreamer';

/**
 * WEBSOCKETCLIENT_PATH
 */
utilities.WEBSOCKETCLIENT_PATH
    = utilities.ROOT_PATH + '/websocketClient';

/**
 *
 */
utilities.deleteFolderRecursive = function (path) {
    var fs = require('fs');
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

/**
 * url : http://localhost:3000/download/app/1
 */
utilities.getAppId = function(url) {
    var url_array = url.split("/");
    return url_array[5];
};

/**
 * export this instance
 */
module.exports = utilities;