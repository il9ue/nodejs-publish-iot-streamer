//
// Setting Application
//

var path = require('path')
var fs = require('fs')

// make sure to make directory if it isn't existed
var make_sure_dir = function( dir ){
    if( ! fs.existsSync( dir ) ){
        fs.mkdirSync( dir );
    }
    return dir;
}

var server_addr = 'http://localhost:4000'
var rails_internal_addr = "http://localhost:9000"
var node_internal_addr = "http://localhost:4000"
var tmp_dir = make_sure_dir( path.resolve('./tmp') );
var photo_dir = make_sure_dir( path.resolve('./tmp/photo') );

var filepath_for_capturing = function(devid) {
    return path.join(photo_dir,'dev_stil_image_'+devid+'.jpg')
}

// accessing address for captured photo
var url_for_capturing = function(devid) {
    var addr = server_addr;
    addr += '/api/v1/mydevices/' + devid + '/camera/photo/image/'
    addr += path.basename(filepath_for_capturing(devid))
    return addr;
}

var twitter_port_url = function(devid) {
    var addr = rails_internal_addr + '/api/v1/sns/' + devid + '/post';
    return addr
}

exports.twitter_port_url = twitter_port_url;
exports.node_internal_addr = node_internal_addr;
exports.server_addr = server_addr;
exports.tmp_dir = tmp_dir;
exports.photo_dir = photo_dir;
exports.db_addr = db_addr;
exports.filepath_for_capturing = filepath_for_capturing;
exports.url_for_capturing = url_for_capturing;
