// export.js

var malloc = cwrap('malloc', 'number', ['number']);
var free = cwrap('free', 'number', ['number']);

var urarlib_list = cwrap('urarlib_list', 'number', ['string', 'number']);
var urarlib_freelist = cwrap('urarlib_freelist', 'number', ['number']);
var urarlib_get = cwrap('urarlib_get', 'number', ['number', 'number', 'number', 'string', 'string']);

var get_item_from_archive_list = cwrap('get_item_from_archive_list', 'number', ['number']);
var get_next_from_archive_list = cwrap('get_next_from_archive_list', 'number', ['number']);

var get_name_from_archive_entry = cwrap('get_name_from_archive_entry', 'number', ['number']);
var get_pack_size_from_archive_entry = cwrap('get_pack_size_from_archive_entry', 'number', ['number']);
var get_unp_size_from_archive_entry = cwrap('get_unp_size_from_archive_entry', 'number', ['number']);
var get_host_os_from_archive_entry = cwrap('get_host_os_from_archive_entry', 'number', ['number']);
var get_file_time_from_archive_entry = cwrap('get_file_time_from_archive_entry', 'number', ['number']);
var get_file_attr_from_archive_entry = cwrap('get_file_attr_from_archive_entry', 'number', ['number']);

var RarArchiveEntry = (function () {
  function RarArchiveEntry(entryPtr) {
    this.entryPtr = entryPtr;
    this.name = Pointer_stringify(get_name_from_archive_entry(this.entryPtr));
    this.packSize = get_pack_size_from_archive_entry(this.entryPtr);
    this.unpackSize = get_unp_size_from_archive_entry(this.entryPtr);
    this.hostOS = get_host_os_from_archive_entry(this.entryPtr);
    this.fileTime = get_file_time_from_archive_entry(this.entryPtr);
    this.fileAttr = get_file_attr_from_archive_entry(this.entryPtr);
  }
  RarArchiveEntry.prototype['isDirectory'] = function () {
    return (get_file_attr_from_archive_entry(this.entryPtr) & 0x10) > 0;
  };
  return RarArchiveEntry;
})();

var Unrar = (function () {
  var fileid = 0;

  function Unrar(arraybuffer, password) {
    this.buffer = arraybuffer;
    this.password = password || '';
    this.archiveName = (++fileid) + '.rar';
    this.listPtr = malloc(0);
    this.filenameToPtr = {};
    this.entries = [];

    FS.createDataFile('/', this.archiveName, new Uint8Array(this.buffer), true, false);

    var fileNum = urarlib_list(this.archiveName, this.listPtr);
    var next = getValue(this.listPtr, 'i32*');
    while (next !== 0) {
      var entry =new RarArchiveEntry(get_item_from_archive_list(next));
      var namePtr = get_name_from_archive_entry(entry.entryPtr);
      this.filenameToPtr[entry.name] = namePtr;
      this.entries.push(entry);
      next = get_next_from_archive_list(next);
    }
  }
  Unrar.prototype['getEntries'] = function () {
    return this.entries;
  };
  Unrar.prototype['close'] = function () {
    urarlib_freelist(getValue(this.listPtr, 'i32*'));
    free(this.listPtr);
    FS.deleteFile('/' + this.archiveName);
  };
  Unrar.prototype['decompress'] = function (filename) {
    var sizePtr = malloc(4);
    var outputPtr = malloc(0);

    var result = urarlib_get(outputPtr, sizePtr,
                             this.filenameToPtr[filename],
                             this.archiveName,
                             this.password);
    var size = getValue(sizePtr, 'i32*');
    var data = null;
    if (result === 1) {
      var begin = getValue(outputPtr, 'i8*');
      data = new Uint8Array(HEAPU8.subarray(begin, begin + size));
    }
    free(getValue(outputPtr, 'i8*'));
    free(outputPtr);
    free(sizePtr);
    return data;
  };
  return Unrar;
})();

if (typeof process === 'object' && typeof require === 'function') { // NODE
  module.exports = Unrar;
} else if (typeof define === "function" && define.amd) { // AMD
  define('unrar', [], function () { return Unrar; });
} else if (typeof window === 'object') { // WEB
  window['Unrar'] = Unrar;
} else if (typeof importScripts === 'function') { // WORKER
  this['Unrar'] = Unrar;
}
