(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/@stablelib/int/lib/int.js
  var require_int = __commonJS({
    "node_modules/@stablelib/int/lib/int.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      function imulShim(a, b) {
        var ah = a >>> 16 & 65535, al = a & 65535;
        var bh = b >>> 16 & 65535, bl = b & 65535;
        return al * bl + (ah * bl + al * bh << 16 >>> 0) | 0;
      }
      exports.mul = Math.imul || imulShim;
      function add(a, b) {
        return a + b | 0;
      }
      exports.add = add;
      function sub(a, b) {
        return a - b | 0;
      }
      exports.sub = sub;
      function rotl(x, n) {
        return x << n | x >>> 32 - n;
      }
      exports.rotl = rotl;
      function rotr(x, n) {
        return x << 32 - n | x >>> n;
      }
      exports.rotr = rotr;
      function isIntegerShim(n) {
        return typeof n === "number" && isFinite(n) && Math.floor(n) === n;
      }
      exports.isInteger = Number.isInteger || isIntegerShim;
      exports.MAX_SAFE_INTEGER = 9007199254740991;
      exports.isSafeInteger = function(n) {
        return exports.isInteger(n) && (n >= -exports.MAX_SAFE_INTEGER && n <= exports.MAX_SAFE_INTEGER);
      };
    }
  });

  // node_modules/@stablelib/binary/lib/binary.js
  var require_binary = __commonJS({
    "node_modules/@stablelib/binary/lib/binary.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var int_1 = require_int();
      function readInt16BE(array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        return (array[offset + 0] << 8 | array[offset + 1]) << 16 >> 16;
      }
      exports.readInt16BE = readInt16BE;
      function readUint16BE(array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        return (array[offset + 0] << 8 | array[offset + 1]) >>> 0;
      }
      exports.readUint16BE = readUint16BE;
      function readInt16LE(array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        return (array[offset + 1] << 8 | array[offset]) << 16 >> 16;
      }
      exports.readInt16LE = readInt16LE;
      function readUint16LE(array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        return (array[offset + 1] << 8 | array[offset]) >>> 0;
      }
      exports.readUint16LE = readUint16LE;
      function writeUint16BE(value, out, offset) {
        if (out === void 0) {
          out = new Uint8Array(2);
        }
        if (offset === void 0) {
          offset = 0;
        }
        out[offset + 0] = value >>> 8;
        out[offset + 1] = value >>> 0;
        return out;
      }
      exports.writeUint16BE = writeUint16BE;
      exports.writeInt16BE = writeUint16BE;
      function writeUint16LE(value, out, offset) {
        if (out === void 0) {
          out = new Uint8Array(2);
        }
        if (offset === void 0) {
          offset = 0;
        }
        out[offset + 0] = value >>> 0;
        out[offset + 1] = value >>> 8;
        return out;
      }
      exports.writeUint16LE = writeUint16LE;
      exports.writeInt16LE = writeUint16LE;
      function readInt32BE(array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        return array[offset] << 24 | array[offset + 1] << 16 | array[offset + 2] << 8 | array[offset + 3];
      }
      exports.readInt32BE = readInt32BE;
      function readUint32BE(array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        return (array[offset] << 24 | array[offset + 1] << 16 | array[offset + 2] << 8 | array[offset + 3]) >>> 0;
      }
      exports.readUint32BE = readUint32BE;
      function readInt32LE(array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        return array[offset + 3] << 24 | array[offset + 2] << 16 | array[offset + 1] << 8 | array[offset];
      }
      exports.readInt32LE = readInt32LE;
      function readUint32LE(array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        return (array[offset + 3] << 24 | array[offset + 2] << 16 | array[offset + 1] << 8 | array[offset]) >>> 0;
      }
      exports.readUint32LE = readUint32LE;
      function writeUint32BE(value, out, offset) {
        if (out === void 0) {
          out = new Uint8Array(4);
        }
        if (offset === void 0) {
          offset = 0;
        }
        out[offset + 0] = value >>> 24;
        out[offset + 1] = value >>> 16;
        out[offset + 2] = value >>> 8;
        out[offset + 3] = value >>> 0;
        return out;
      }
      exports.writeUint32BE = writeUint32BE;
      exports.writeInt32BE = writeUint32BE;
      function writeUint32LE(value, out, offset) {
        if (out === void 0) {
          out = new Uint8Array(4);
        }
        if (offset === void 0) {
          offset = 0;
        }
        out[offset + 0] = value >>> 0;
        out[offset + 1] = value >>> 8;
        out[offset + 2] = value >>> 16;
        out[offset + 3] = value >>> 24;
        return out;
      }
      exports.writeUint32LE = writeUint32LE;
      exports.writeInt32LE = writeUint32LE;
      function readInt64BE(array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        var hi = readInt32BE(array, offset);
        var lo = readInt32BE(array, offset + 4);
        return hi * 4294967296 + lo - (lo >> 31) * 4294967296;
      }
      exports.readInt64BE = readInt64BE;
      function readUint64BE(array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        var hi = readUint32BE(array, offset);
        var lo = readUint32BE(array, offset + 4);
        return hi * 4294967296 + lo;
      }
      exports.readUint64BE = readUint64BE;
      function readInt64LE(array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        var lo = readInt32LE(array, offset);
        var hi = readInt32LE(array, offset + 4);
        return hi * 4294967296 + lo - (lo >> 31) * 4294967296;
      }
      exports.readInt64LE = readInt64LE;
      function readUint64LE(array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        var lo = readUint32LE(array, offset);
        var hi = readUint32LE(array, offset + 4);
        return hi * 4294967296 + lo;
      }
      exports.readUint64LE = readUint64LE;
      function writeUint64BE(value, out, offset) {
        if (out === void 0) {
          out = new Uint8Array(8);
        }
        if (offset === void 0) {
          offset = 0;
        }
        writeUint32BE(value / 4294967296 >>> 0, out, offset);
        writeUint32BE(value >>> 0, out, offset + 4);
        return out;
      }
      exports.writeUint64BE = writeUint64BE;
      exports.writeInt64BE = writeUint64BE;
      function writeUint64LE(value, out, offset) {
        if (out === void 0) {
          out = new Uint8Array(8);
        }
        if (offset === void 0) {
          offset = 0;
        }
        writeUint32LE(value >>> 0, out, offset);
        writeUint32LE(value / 4294967296 >>> 0, out, offset + 4);
        return out;
      }
      exports.writeUint64LE = writeUint64LE;
      exports.writeInt64LE = writeUint64LE;
      function readUintBE(bitLength, array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        if (bitLength % 8 !== 0) {
          throw new Error("readUintBE supports only bitLengths divisible by 8");
        }
        if (bitLength / 8 > array.length - offset) {
          throw new Error("readUintBE: array is too short for the given bitLength");
        }
        var result = 0;
        var mul = 1;
        for (var i = bitLength / 8 + offset - 1; i >= offset; i--) {
          result += array[i] * mul;
          mul *= 256;
        }
        return result;
      }
      exports.readUintBE = readUintBE;
      function readUintLE(bitLength, array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        if (bitLength % 8 !== 0) {
          throw new Error("readUintLE supports only bitLengths divisible by 8");
        }
        if (bitLength / 8 > array.length - offset) {
          throw new Error("readUintLE: array is too short for the given bitLength");
        }
        var result = 0;
        var mul = 1;
        for (var i = offset; i < offset + bitLength / 8; i++) {
          result += array[i] * mul;
          mul *= 256;
        }
        return result;
      }
      exports.readUintLE = readUintLE;
      function writeUintBE(bitLength, value, out, offset) {
        if (out === void 0) {
          out = new Uint8Array(bitLength / 8);
        }
        if (offset === void 0) {
          offset = 0;
        }
        if (bitLength % 8 !== 0) {
          throw new Error("writeUintBE supports only bitLengths divisible by 8");
        }
        if (!int_1.isSafeInteger(value)) {
          throw new Error("writeUintBE value must be an integer");
        }
        var div = 1;
        for (var i = bitLength / 8 + offset - 1; i >= offset; i--) {
          out[i] = value / div & 255;
          div *= 256;
        }
        return out;
      }
      exports.writeUintBE = writeUintBE;
      function writeUintLE(bitLength, value, out, offset) {
        if (out === void 0) {
          out = new Uint8Array(bitLength / 8);
        }
        if (offset === void 0) {
          offset = 0;
        }
        if (bitLength % 8 !== 0) {
          throw new Error("writeUintLE supports only bitLengths divisible by 8");
        }
        if (!int_1.isSafeInteger(value)) {
          throw new Error("writeUintLE value must be an integer");
        }
        var div = 1;
        for (var i = offset; i < offset + bitLength / 8; i++) {
          out[i] = value / div & 255;
          div *= 256;
        }
        return out;
      }
      exports.writeUintLE = writeUintLE;
      function readFloat32BE(array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        var view = new DataView(array.buffer, array.byteOffset, array.byteLength);
        return view.getFloat32(offset);
      }
      exports.readFloat32BE = readFloat32BE;
      function readFloat32LE(array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        var view = new DataView(array.buffer, array.byteOffset, array.byteLength);
        return view.getFloat32(offset, true);
      }
      exports.readFloat32LE = readFloat32LE;
      function readFloat64BE(array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        var view = new DataView(array.buffer, array.byteOffset, array.byteLength);
        return view.getFloat64(offset);
      }
      exports.readFloat64BE = readFloat64BE;
      function readFloat64LE(array, offset) {
        if (offset === void 0) {
          offset = 0;
        }
        var view = new DataView(array.buffer, array.byteOffset, array.byteLength);
        return view.getFloat64(offset, true);
      }
      exports.readFloat64LE = readFloat64LE;
      function writeFloat32BE(value, out, offset) {
        if (out === void 0) {
          out = new Uint8Array(4);
        }
        if (offset === void 0) {
          offset = 0;
        }
        var view = new DataView(out.buffer, out.byteOffset, out.byteLength);
        view.setFloat32(offset, value);
        return out;
      }
      exports.writeFloat32BE = writeFloat32BE;
      function writeFloat32LE(value, out, offset) {
        if (out === void 0) {
          out = new Uint8Array(4);
        }
        if (offset === void 0) {
          offset = 0;
        }
        var view = new DataView(out.buffer, out.byteOffset, out.byteLength);
        view.setFloat32(offset, value, true);
        return out;
      }
      exports.writeFloat32LE = writeFloat32LE;
      function writeFloat64BE(value, out, offset) {
        if (out === void 0) {
          out = new Uint8Array(8);
        }
        if (offset === void 0) {
          offset = 0;
        }
        var view = new DataView(out.buffer, out.byteOffset, out.byteLength);
        view.setFloat64(offset, value);
        return out;
      }
      exports.writeFloat64BE = writeFloat64BE;
      function writeFloat64LE(value, out, offset) {
        if (out === void 0) {
          out = new Uint8Array(8);
        }
        if (offset === void 0) {
          offset = 0;
        }
        var view = new DataView(out.buffer, out.byteOffset, out.byteLength);
        view.setFloat64(offset, value, true);
        return out;
      }
      exports.writeFloat64LE = writeFloat64LE;
    }
  });

  // node_modules/@stablelib/wipe/lib/wipe.js
  var require_wipe = __commonJS({
    "node_modules/@stablelib/wipe/lib/wipe.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      function wipe(array) {
        for (var i = 0; i < array.length; i++) {
          array[i] = 0;
        }
        return array;
      }
      exports.wipe = wipe;
    }
  });

  // node_modules/@stablelib/chacha/lib/chacha.js
  var require_chacha = __commonJS({
    "node_modules/@stablelib/chacha/lib/chacha.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var binary_1 = require_binary();
      var wipe_1 = require_wipe();
      var ROUNDS = 20;
      function core(out, input, key) {
        var j0 = 1634760805;
        var j1 = 857760878;
        var j2 = 2036477234;
        var j3 = 1797285236;
        var j4 = key[3] << 24 | key[2] << 16 | key[1] << 8 | key[0];
        var j5 = key[7] << 24 | key[6] << 16 | key[5] << 8 | key[4];
        var j6 = key[11] << 24 | key[10] << 16 | key[9] << 8 | key[8];
        var j7 = key[15] << 24 | key[14] << 16 | key[13] << 8 | key[12];
        var j8 = key[19] << 24 | key[18] << 16 | key[17] << 8 | key[16];
        var j9 = key[23] << 24 | key[22] << 16 | key[21] << 8 | key[20];
        var j10 = key[27] << 24 | key[26] << 16 | key[25] << 8 | key[24];
        var j11 = key[31] << 24 | key[30] << 16 | key[29] << 8 | key[28];
        var j12 = input[3] << 24 | input[2] << 16 | input[1] << 8 | input[0];
        var j13 = input[7] << 24 | input[6] << 16 | input[5] << 8 | input[4];
        var j14 = input[11] << 24 | input[10] << 16 | input[9] << 8 | input[8];
        var j15 = input[15] << 24 | input[14] << 16 | input[13] << 8 | input[12];
        var x0 = j0;
        var x1 = j1;
        var x2 = j2;
        var x3 = j3;
        var x4 = j4;
        var x5 = j5;
        var x6 = j6;
        var x7 = j7;
        var x8 = j8;
        var x9 = j9;
        var x10 = j10;
        var x11 = j11;
        var x12 = j12;
        var x13 = j13;
        var x14 = j14;
        var x15 = j15;
        for (var i = 0; i < ROUNDS; i += 2) {
          x0 = x0 + x4 | 0;
          x12 ^= x0;
          x12 = x12 >>> 32 - 16 | x12 << 16;
          x8 = x8 + x12 | 0;
          x4 ^= x8;
          x4 = x4 >>> 32 - 12 | x4 << 12;
          x1 = x1 + x5 | 0;
          x13 ^= x1;
          x13 = x13 >>> 32 - 16 | x13 << 16;
          x9 = x9 + x13 | 0;
          x5 ^= x9;
          x5 = x5 >>> 32 - 12 | x5 << 12;
          x2 = x2 + x6 | 0;
          x14 ^= x2;
          x14 = x14 >>> 32 - 16 | x14 << 16;
          x10 = x10 + x14 | 0;
          x6 ^= x10;
          x6 = x6 >>> 32 - 12 | x6 << 12;
          x3 = x3 + x7 | 0;
          x15 ^= x3;
          x15 = x15 >>> 32 - 16 | x15 << 16;
          x11 = x11 + x15 | 0;
          x7 ^= x11;
          x7 = x7 >>> 32 - 12 | x7 << 12;
          x2 = x2 + x6 | 0;
          x14 ^= x2;
          x14 = x14 >>> 32 - 8 | x14 << 8;
          x10 = x10 + x14 | 0;
          x6 ^= x10;
          x6 = x6 >>> 32 - 7 | x6 << 7;
          x3 = x3 + x7 | 0;
          x15 ^= x3;
          x15 = x15 >>> 32 - 8 | x15 << 8;
          x11 = x11 + x15 | 0;
          x7 ^= x11;
          x7 = x7 >>> 32 - 7 | x7 << 7;
          x1 = x1 + x5 | 0;
          x13 ^= x1;
          x13 = x13 >>> 32 - 8 | x13 << 8;
          x9 = x9 + x13 | 0;
          x5 ^= x9;
          x5 = x5 >>> 32 - 7 | x5 << 7;
          x0 = x0 + x4 | 0;
          x12 ^= x0;
          x12 = x12 >>> 32 - 8 | x12 << 8;
          x8 = x8 + x12 | 0;
          x4 ^= x8;
          x4 = x4 >>> 32 - 7 | x4 << 7;
          x0 = x0 + x5 | 0;
          x15 ^= x0;
          x15 = x15 >>> 32 - 16 | x15 << 16;
          x10 = x10 + x15 | 0;
          x5 ^= x10;
          x5 = x5 >>> 32 - 12 | x5 << 12;
          x1 = x1 + x6 | 0;
          x12 ^= x1;
          x12 = x12 >>> 32 - 16 | x12 << 16;
          x11 = x11 + x12 | 0;
          x6 ^= x11;
          x6 = x6 >>> 32 - 12 | x6 << 12;
          x2 = x2 + x7 | 0;
          x13 ^= x2;
          x13 = x13 >>> 32 - 16 | x13 << 16;
          x8 = x8 + x13 | 0;
          x7 ^= x8;
          x7 = x7 >>> 32 - 12 | x7 << 12;
          x3 = x3 + x4 | 0;
          x14 ^= x3;
          x14 = x14 >>> 32 - 16 | x14 << 16;
          x9 = x9 + x14 | 0;
          x4 ^= x9;
          x4 = x4 >>> 32 - 12 | x4 << 12;
          x2 = x2 + x7 | 0;
          x13 ^= x2;
          x13 = x13 >>> 32 - 8 | x13 << 8;
          x8 = x8 + x13 | 0;
          x7 ^= x8;
          x7 = x7 >>> 32 - 7 | x7 << 7;
          x3 = x3 + x4 | 0;
          x14 ^= x3;
          x14 = x14 >>> 32 - 8 | x14 << 8;
          x9 = x9 + x14 | 0;
          x4 ^= x9;
          x4 = x4 >>> 32 - 7 | x4 << 7;
          x1 = x1 + x6 | 0;
          x12 ^= x1;
          x12 = x12 >>> 32 - 8 | x12 << 8;
          x11 = x11 + x12 | 0;
          x6 ^= x11;
          x6 = x6 >>> 32 - 7 | x6 << 7;
          x0 = x0 + x5 | 0;
          x15 ^= x0;
          x15 = x15 >>> 32 - 8 | x15 << 8;
          x10 = x10 + x15 | 0;
          x5 ^= x10;
          x5 = x5 >>> 32 - 7 | x5 << 7;
        }
        binary_1.writeUint32LE(x0 + j0 | 0, out, 0);
        binary_1.writeUint32LE(x1 + j1 | 0, out, 4);
        binary_1.writeUint32LE(x2 + j2 | 0, out, 8);
        binary_1.writeUint32LE(x3 + j3 | 0, out, 12);
        binary_1.writeUint32LE(x4 + j4 | 0, out, 16);
        binary_1.writeUint32LE(x5 + j5 | 0, out, 20);
        binary_1.writeUint32LE(x6 + j6 | 0, out, 24);
        binary_1.writeUint32LE(x7 + j7 | 0, out, 28);
        binary_1.writeUint32LE(x8 + j8 | 0, out, 32);
        binary_1.writeUint32LE(x9 + j9 | 0, out, 36);
        binary_1.writeUint32LE(x10 + j10 | 0, out, 40);
        binary_1.writeUint32LE(x11 + j11 | 0, out, 44);
        binary_1.writeUint32LE(x12 + j12 | 0, out, 48);
        binary_1.writeUint32LE(x13 + j13 | 0, out, 52);
        binary_1.writeUint32LE(x14 + j14 | 0, out, 56);
        binary_1.writeUint32LE(x15 + j15 | 0, out, 60);
      }
      function streamXOR(key, nonce, src, dst, nonceInplaceCounterLength) {
        if (nonceInplaceCounterLength === void 0) {
          nonceInplaceCounterLength = 0;
        }
        if (key.length !== 32) {
          throw new Error("ChaCha: key size must be 32 bytes");
        }
        if (dst.length < src.length) {
          throw new Error("ChaCha: destination is shorter than source");
        }
        var nc;
        var counterLength;
        if (nonceInplaceCounterLength === 0) {
          if (nonce.length !== 8 && nonce.length !== 12) {
            throw new Error("ChaCha nonce must be 8 or 12 bytes");
          }
          nc = new Uint8Array(16);
          counterLength = nc.length - nonce.length;
          nc.set(nonce, counterLength);
        } else {
          if (nonce.length !== 16) {
            throw new Error("ChaCha nonce with counter must be 16 bytes");
          }
          nc = nonce;
          counterLength = nonceInplaceCounterLength;
        }
        var block = new Uint8Array(64);
        for (var i = 0; i < src.length; i += 64) {
          core(block, nc, key);
          for (var j = i; j < i + 64 && j < src.length; j++) {
            dst[j] = src[j] ^ block[j - i];
          }
          incrementCounter(nc, 0, counterLength);
        }
        wipe_1.wipe(block);
        if (nonceInplaceCounterLength === 0) {
          wipe_1.wipe(nc);
        }
        return dst;
      }
      exports.streamXOR = streamXOR;
      function stream(key, nonce, dst, nonceInplaceCounterLength) {
        if (nonceInplaceCounterLength === void 0) {
          nonceInplaceCounterLength = 0;
        }
        wipe_1.wipe(dst);
        return streamXOR(key, nonce, dst, dst, nonceInplaceCounterLength);
      }
      exports.stream = stream;
      function incrementCounter(counter, pos, len) {
        var carry = 1;
        while (len--) {
          carry = carry + (counter[pos] & 255) | 0;
          counter[pos] = carry & 255;
          carry >>>= 8;
          pos++;
        }
        if (carry > 0) {
          throw new Error("ChaCha: counter overflow");
        }
      }
    }
  });

  // node_modules/@stablelib/xchacha20/lib/xchacha20.js
  var require_xchacha20 = __commonJS({
    "node_modules/@stablelib/xchacha20/lib/xchacha20.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var binary_1 = require_binary();
      var wipe_1 = require_wipe();
      var chacha_1 = require_chacha();
      var ROUNDS = 20;
      function streamXOR(key, nonce, src, dst) {
        if (nonce.length !== 24) {
          throw new Error("XChaCha20 nonce must be 24 bytes");
        }
        var subkey = hchacha(key, nonce.subarray(0, 16), new Uint8Array(32));
        var modifiedNonce = new Uint8Array(12);
        modifiedNonce.set(nonce.subarray(16), 4);
        var result = chacha_1.streamXOR(subkey, modifiedNonce, src, dst);
        wipe_1.wipe(subkey);
        return result;
      }
      exports.streamXOR = streamXOR;
      function stream(key, nonce, dst) {
        wipe_1.wipe(dst);
        return streamXOR(key, nonce, dst, dst);
      }
      exports.stream = stream;
      function hchacha(key, src, dst) {
        var j0 = 1634760805;
        var j1 = 857760878;
        var j2 = 2036477234;
        var j3 = 1797285236;
        var j4 = key[3] << 24 | key[2] << 16 | key[1] << 8 | key[0];
        var j5 = key[7] << 24 | key[6] << 16 | key[5] << 8 | key[4];
        var j6 = key[11] << 24 | key[10] << 16 | key[9] << 8 | key[8];
        var j7 = key[15] << 24 | key[14] << 16 | key[13] << 8 | key[12];
        var j8 = key[19] << 24 | key[18] << 16 | key[17] << 8 | key[16];
        var j9 = key[23] << 24 | key[22] << 16 | key[21] << 8 | key[20];
        var j10 = key[27] << 24 | key[26] << 16 | key[25] << 8 | key[24];
        var j11 = key[31] << 24 | key[30] << 16 | key[29] << 8 | key[28];
        var j12 = src[3] << 24 | src[2] << 16 | src[1] << 8 | src[0];
        var j13 = src[7] << 24 | src[6] << 16 | src[5] << 8 | src[4];
        var j14 = src[11] << 24 | src[10] << 16 | src[9] << 8 | src[8];
        var j15 = src[15] << 24 | src[14] << 16 | src[13] << 8 | src[12];
        var x0 = j0;
        var x1 = j1;
        var x2 = j2;
        var x3 = j3;
        var x4 = j4;
        var x5 = j5;
        var x6 = j6;
        var x7 = j7;
        var x8 = j8;
        var x9 = j9;
        var x10 = j10;
        var x11 = j11;
        var x12 = j12;
        var x13 = j13;
        var x14 = j14;
        var x15 = j15;
        for (var i = 0; i < ROUNDS; i += 2) {
          x0 = x0 + x4 | 0;
          x12 ^= x0;
          x12 = x12 >>> 32 - 16 | x12 << 16;
          x8 = x8 + x12 | 0;
          x4 ^= x8;
          x4 = x4 >>> 32 - 12 | x4 << 12;
          x1 = x1 + x5 | 0;
          x13 ^= x1;
          x13 = x13 >>> 32 - 16 | x13 << 16;
          x9 = x9 + x13 | 0;
          x5 ^= x9;
          x5 = x5 >>> 32 - 12 | x5 << 12;
          x2 = x2 + x6 | 0;
          x14 ^= x2;
          x14 = x14 >>> 32 - 16 | x14 << 16;
          x10 = x10 + x14 | 0;
          x6 ^= x10;
          x6 = x6 >>> 32 - 12 | x6 << 12;
          x3 = x3 + x7 | 0;
          x15 ^= x3;
          x15 = x15 >>> 32 - 16 | x15 << 16;
          x11 = x11 + x15 | 0;
          x7 ^= x11;
          x7 = x7 >>> 32 - 12 | x7 << 12;
          x2 = x2 + x6 | 0;
          x14 ^= x2;
          x14 = x14 >>> 32 - 8 | x14 << 8;
          x10 = x10 + x14 | 0;
          x6 ^= x10;
          x6 = x6 >>> 32 - 7 | x6 << 7;
          x3 = x3 + x7 | 0;
          x15 ^= x3;
          x15 = x15 >>> 32 - 8 | x15 << 8;
          x11 = x11 + x15 | 0;
          x7 ^= x11;
          x7 = x7 >>> 32 - 7 | x7 << 7;
          x1 = x1 + x5 | 0;
          x13 ^= x1;
          x13 = x13 >>> 32 - 8 | x13 << 8;
          x9 = x9 + x13 | 0;
          x5 ^= x9;
          x5 = x5 >>> 32 - 7 | x5 << 7;
          x0 = x0 + x4 | 0;
          x12 ^= x0;
          x12 = x12 >>> 32 - 8 | x12 << 8;
          x8 = x8 + x12 | 0;
          x4 ^= x8;
          x4 = x4 >>> 32 - 7 | x4 << 7;
          x0 = x0 + x5 | 0;
          x15 ^= x0;
          x15 = x15 >>> 32 - 16 | x15 << 16;
          x10 = x10 + x15 | 0;
          x5 ^= x10;
          x5 = x5 >>> 32 - 12 | x5 << 12;
          x1 = x1 + x6 | 0;
          x12 ^= x1;
          x12 = x12 >>> 32 - 16 | x12 << 16;
          x11 = x11 + x12 | 0;
          x6 ^= x11;
          x6 = x6 >>> 32 - 12 | x6 << 12;
          x2 = x2 + x7 | 0;
          x13 ^= x2;
          x13 = x13 >>> 32 - 16 | x13 << 16;
          x8 = x8 + x13 | 0;
          x7 ^= x8;
          x7 = x7 >>> 32 - 12 | x7 << 12;
          x3 = x3 + x4 | 0;
          x14 ^= x3;
          x14 = x14 >>> 32 - 16 | x14 << 16;
          x9 = x9 + x14 | 0;
          x4 ^= x9;
          x4 = x4 >>> 32 - 12 | x4 << 12;
          x2 = x2 + x7 | 0;
          x13 ^= x2;
          x13 = x13 >>> 32 - 8 | x13 << 8;
          x8 = x8 + x13 | 0;
          x7 ^= x8;
          x7 = x7 >>> 32 - 7 | x7 << 7;
          x3 = x3 + x4 | 0;
          x14 ^= x3;
          x14 = x14 >>> 32 - 8 | x14 << 8;
          x9 = x9 + x14 | 0;
          x4 ^= x9;
          x4 = x4 >>> 32 - 7 | x4 << 7;
          x1 = x1 + x6 | 0;
          x12 ^= x1;
          x12 = x12 >>> 32 - 8 | x12 << 8;
          x11 = x11 + x12 | 0;
          x6 ^= x11;
          x6 = x6 >>> 32 - 7 | x6 << 7;
          x0 = x0 + x5 | 0;
          x15 ^= x0;
          x15 = x15 >>> 32 - 8 | x15 << 8;
          x10 = x10 + x15 | 0;
          x5 ^= x10;
          x5 = x5 >>> 32 - 7 | x5 << 7;
        }
        binary_1.writeUint32LE(x0, dst, 0);
        binary_1.writeUint32LE(x1, dst, 4);
        binary_1.writeUint32LE(x2, dst, 8);
        binary_1.writeUint32LE(x3, dst, 12);
        binary_1.writeUint32LE(x12, dst, 16);
        binary_1.writeUint32LE(x13, dst, 20);
        binary_1.writeUint32LE(x14, dst, 24);
        binary_1.writeUint32LE(x15, dst, 28);
        return dst;
      }
      exports.hchacha = hchacha;
    }
  });

  // node_modules/@stablelib/constant-time/lib/constant-time.js
  var require_constant_time = __commonJS({
    "node_modules/@stablelib/constant-time/lib/constant-time.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      function select(subject, resultIfOne, resultIfZero) {
        return ~(subject - 1) & resultIfOne | subject - 1 & resultIfZero;
      }
      exports.select = select;
      function lessOrEqual(a, b) {
        return (a | 0) - (b | 0) - 1 >>> 31 & 1;
      }
      exports.lessOrEqual = lessOrEqual;
      function compare(a, b) {
        if (a.length !== b.length) {
          return 0;
        }
        var result = 0;
        for (var i = 0; i < a.length; i++) {
          result |= a[i] ^ b[i];
        }
        return 1 & result - 1 >>> 8;
      }
      exports.compare = compare;
      function equal(a, b) {
        if (a.length === 0 || b.length === 0) {
          return false;
        }
        return compare(a, b) !== 0;
      }
      exports.equal = equal;
    }
  });

  // node_modules/@stablelib/poly1305/lib/poly1305.js
  var require_poly1305 = __commonJS({
    "node_modules/@stablelib/poly1305/lib/poly1305.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var constant_time_1 = require_constant_time();
      var wipe_1 = require_wipe();
      exports.DIGEST_LENGTH = 16;
      var Poly1305 = (
        /** @class */
        (function() {
          function Poly13052(key) {
            this.digestLength = exports.DIGEST_LENGTH;
            this._buffer = new Uint8Array(16);
            this._r = new Uint16Array(10);
            this._h = new Uint16Array(10);
            this._pad = new Uint16Array(8);
            this._leftover = 0;
            this._fin = 0;
            this._finished = false;
            var t0 = key[0] | key[1] << 8;
            this._r[0] = t0 & 8191;
            var t1 = key[2] | key[3] << 8;
            this._r[1] = (t0 >>> 13 | t1 << 3) & 8191;
            var t2 = key[4] | key[5] << 8;
            this._r[2] = (t1 >>> 10 | t2 << 6) & 7939;
            var t3 = key[6] | key[7] << 8;
            this._r[3] = (t2 >>> 7 | t3 << 9) & 8191;
            var t4 = key[8] | key[9] << 8;
            this._r[4] = (t3 >>> 4 | t4 << 12) & 255;
            this._r[5] = t4 >>> 1 & 8190;
            var t5 = key[10] | key[11] << 8;
            this._r[6] = (t4 >>> 14 | t5 << 2) & 8191;
            var t6 = key[12] | key[13] << 8;
            this._r[7] = (t5 >>> 11 | t6 << 5) & 8065;
            var t7 = key[14] | key[15] << 8;
            this._r[8] = (t6 >>> 8 | t7 << 8) & 8191;
            this._r[9] = t7 >>> 5 & 127;
            this._pad[0] = key[16] | key[17] << 8;
            this._pad[1] = key[18] | key[19] << 8;
            this._pad[2] = key[20] | key[21] << 8;
            this._pad[3] = key[22] | key[23] << 8;
            this._pad[4] = key[24] | key[25] << 8;
            this._pad[5] = key[26] | key[27] << 8;
            this._pad[6] = key[28] | key[29] << 8;
            this._pad[7] = key[30] | key[31] << 8;
          }
          Poly13052.prototype._blocks = function(m, mpos, bytes) {
            var hibit = this._fin ? 0 : 1 << 11;
            var h0 = this._h[0], h1 = this._h[1], h2 = this._h[2], h3 = this._h[3], h4 = this._h[4], h5 = this._h[5], h6 = this._h[6], h7 = this._h[7], h8 = this._h[8], h9 = this._h[9];
            var r0 = this._r[0], r1 = this._r[1], r2 = this._r[2], r3 = this._r[3], r4 = this._r[4], r5 = this._r[5], r6 = this._r[6], r7 = this._r[7], r8 = this._r[8], r9 = this._r[9];
            while (bytes >= 16) {
              var t0 = m[mpos + 0] | m[mpos + 1] << 8;
              h0 += t0 & 8191;
              var t1 = m[mpos + 2] | m[mpos + 3] << 8;
              h1 += (t0 >>> 13 | t1 << 3) & 8191;
              var t2 = m[mpos + 4] | m[mpos + 5] << 8;
              h2 += (t1 >>> 10 | t2 << 6) & 8191;
              var t3 = m[mpos + 6] | m[mpos + 7] << 8;
              h3 += (t2 >>> 7 | t3 << 9) & 8191;
              var t4 = m[mpos + 8] | m[mpos + 9] << 8;
              h4 += (t3 >>> 4 | t4 << 12) & 8191;
              h5 += t4 >>> 1 & 8191;
              var t5 = m[mpos + 10] | m[mpos + 11] << 8;
              h6 += (t4 >>> 14 | t5 << 2) & 8191;
              var t6 = m[mpos + 12] | m[mpos + 13] << 8;
              h7 += (t5 >>> 11 | t6 << 5) & 8191;
              var t7 = m[mpos + 14] | m[mpos + 15] << 8;
              h8 += (t6 >>> 8 | t7 << 8) & 8191;
              h9 += t7 >>> 5 | hibit;
              var c = 0;
              var d0 = c;
              d0 += h0 * r0;
              d0 += h1 * (5 * r9);
              d0 += h2 * (5 * r8);
              d0 += h3 * (5 * r7);
              d0 += h4 * (5 * r6);
              c = d0 >>> 13;
              d0 &= 8191;
              d0 += h5 * (5 * r5);
              d0 += h6 * (5 * r4);
              d0 += h7 * (5 * r3);
              d0 += h8 * (5 * r2);
              d0 += h9 * (5 * r1);
              c += d0 >>> 13;
              d0 &= 8191;
              var d1 = c;
              d1 += h0 * r1;
              d1 += h1 * r0;
              d1 += h2 * (5 * r9);
              d1 += h3 * (5 * r8);
              d1 += h4 * (5 * r7);
              c = d1 >>> 13;
              d1 &= 8191;
              d1 += h5 * (5 * r6);
              d1 += h6 * (5 * r5);
              d1 += h7 * (5 * r4);
              d1 += h8 * (5 * r3);
              d1 += h9 * (5 * r2);
              c += d1 >>> 13;
              d1 &= 8191;
              var d2 = c;
              d2 += h0 * r2;
              d2 += h1 * r1;
              d2 += h2 * r0;
              d2 += h3 * (5 * r9);
              d2 += h4 * (5 * r8);
              c = d2 >>> 13;
              d2 &= 8191;
              d2 += h5 * (5 * r7);
              d2 += h6 * (5 * r6);
              d2 += h7 * (5 * r5);
              d2 += h8 * (5 * r4);
              d2 += h9 * (5 * r3);
              c += d2 >>> 13;
              d2 &= 8191;
              var d3 = c;
              d3 += h0 * r3;
              d3 += h1 * r2;
              d3 += h2 * r1;
              d3 += h3 * r0;
              d3 += h4 * (5 * r9);
              c = d3 >>> 13;
              d3 &= 8191;
              d3 += h5 * (5 * r8);
              d3 += h6 * (5 * r7);
              d3 += h7 * (5 * r6);
              d3 += h8 * (5 * r5);
              d3 += h9 * (5 * r4);
              c += d3 >>> 13;
              d3 &= 8191;
              var d4 = c;
              d4 += h0 * r4;
              d4 += h1 * r3;
              d4 += h2 * r2;
              d4 += h3 * r1;
              d4 += h4 * r0;
              c = d4 >>> 13;
              d4 &= 8191;
              d4 += h5 * (5 * r9);
              d4 += h6 * (5 * r8);
              d4 += h7 * (5 * r7);
              d4 += h8 * (5 * r6);
              d4 += h9 * (5 * r5);
              c += d4 >>> 13;
              d4 &= 8191;
              var d5 = c;
              d5 += h0 * r5;
              d5 += h1 * r4;
              d5 += h2 * r3;
              d5 += h3 * r2;
              d5 += h4 * r1;
              c = d5 >>> 13;
              d5 &= 8191;
              d5 += h5 * r0;
              d5 += h6 * (5 * r9);
              d5 += h7 * (5 * r8);
              d5 += h8 * (5 * r7);
              d5 += h9 * (5 * r6);
              c += d5 >>> 13;
              d5 &= 8191;
              var d6 = c;
              d6 += h0 * r6;
              d6 += h1 * r5;
              d6 += h2 * r4;
              d6 += h3 * r3;
              d6 += h4 * r2;
              c = d6 >>> 13;
              d6 &= 8191;
              d6 += h5 * r1;
              d6 += h6 * r0;
              d6 += h7 * (5 * r9);
              d6 += h8 * (5 * r8);
              d6 += h9 * (5 * r7);
              c += d6 >>> 13;
              d6 &= 8191;
              var d7 = c;
              d7 += h0 * r7;
              d7 += h1 * r6;
              d7 += h2 * r5;
              d7 += h3 * r4;
              d7 += h4 * r3;
              c = d7 >>> 13;
              d7 &= 8191;
              d7 += h5 * r2;
              d7 += h6 * r1;
              d7 += h7 * r0;
              d7 += h8 * (5 * r9);
              d7 += h9 * (5 * r8);
              c += d7 >>> 13;
              d7 &= 8191;
              var d8 = c;
              d8 += h0 * r8;
              d8 += h1 * r7;
              d8 += h2 * r6;
              d8 += h3 * r5;
              d8 += h4 * r4;
              c = d8 >>> 13;
              d8 &= 8191;
              d8 += h5 * r3;
              d8 += h6 * r2;
              d8 += h7 * r1;
              d8 += h8 * r0;
              d8 += h9 * (5 * r9);
              c += d8 >>> 13;
              d8 &= 8191;
              var d9 = c;
              d9 += h0 * r9;
              d9 += h1 * r8;
              d9 += h2 * r7;
              d9 += h3 * r6;
              d9 += h4 * r5;
              c = d9 >>> 13;
              d9 &= 8191;
              d9 += h5 * r4;
              d9 += h6 * r3;
              d9 += h7 * r2;
              d9 += h8 * r1;
              d9 += h9 * r0;
              c += d9 >>> 13;
              d9 &= 8191;
              c = (c << 2) + c | 0;
              c = c + d0 | 0;
              d0 = c & 8191;
              c = c >>> 13;
              d1 += c;
              h0 = d0;
              h1 = d1;
              h2 = d2;
              h3 = d3;
              h4 = d4;
              h5 = d5;
              h6 = d6;
              h7 = d7;
              h8 = d8;
              h9 = d9;
              mpos += 16;
              bytes -= 16;
            }
            this._h[0] = h0;
            this._h[1] = h1;
            this._h[2] = h2;
            this._h[3] = h3;
            this._h[4] = h4;
            this._h[5] = h5;
            this._h[6] = h6;
            this._h[7] = h7;
            this._h[8] = h8;
            this._h[9] = h9;
          };
          Poly13052.prototype.finish = function(mac, macpos) {
            if (macpos === void 0) {
              macpos = 0;
            }
            var g = new Uint16Array(10);
            var c;
            var mask;
            var f;
            var i;
            if (this._leftover) {
              i = this._leftover;
              this._buffer[i++] = 1;
              for (; i < 16; i++) {
                this._buffer[i] = 0;
              }
              this._fin = 1;
              this._blocks(this._buffer, 0, 16);
            }
            c = this._h[1] >>> 13;
            this._h[1] &= 8191;
            for (i = 2; i < 10; i++) {
              this._h[i] += c;
              c = this._h[i] >>> 13;
              this._h[i] &= 8191;
            }
            this._h[0] += c * 5;
            c = this._h[0] >>> 13;
            this._h[0] &= 8191;
            this._h[1] += c;
            c = this._h[1] >>> 13;
            this._h[1] &= 8191;
            this._h[2] += c;
            g[0] = this._h[0] + 5;
            c = g[0] >>> 13;
            g[0] &= 8191;
            for (i = 1; i < 10; i++) {
              g[i] = this._h[i] + c;
              c = g[i] >>> 13;
              g[i] &= 8191;
            }
            g[9] -= 1 << 13;
            mask = (c ^ 1) - 1;
            for (i = 0; i < 10; i++) {
              g[i] &= mask;
            }
            mask = ~mask;
            for (i = 0; i < 10; i++) {
              this._h[i] = this._h[i] & mask | g[i];
            }
            this._h[0] = (this._h[0] | this._h[1] << 13) & 65535;
            this._h[1] = (this._h[1] >>> 3 | this._h[2] << 10) & 65535;
            this._h[2] = (this._h[2] >>> 6 | this._h[3] << 7) & 65535;
            this._h[3] = (this._h[3] >>> 9 | this._h[4] << 4) & 65535;
            this._h[4] = (this._h[4] >>> 12 | this._h[5] << 1 | this._h[6] << 14) & 65535;
            this._h[5] = (this._h[6] >>> 2 | this._h[7] << 11) & 65535;
            this._h[6] = (this._h[7] >>> 5 | this._h[8] << 8) & 65535;
            this._h[7] = (this._h[8] >>> 8 | this._h[9] << 5) & 65535;
            f = this._h[0] + this._pad[0];
            this._h[0] = f & 65535;
            for (i = 1; i < 8; i++) {
              f = (this._h[i] + this._pad[i] | 0) + (f >>> 16) | 0;
              this._h[i] = f & 65535;
            }
            mac[macpos + 0] = this._h[0] >>> 0;
            mac[macpos + 1] = this._h[0] >>> 8;
            mac[macpos + 2] = this._h[1] >>> 0;
            mac[macpos + 3] = this._h[1] >>> 8;
            mac[macpos + 4] = this._h[2] >>> 0;
            mac[macpos + 5] = this._h[2] >>> 8;
            mac[macpos + 6] = this._h[3] >>> 0;
            mac[macpos + 7] = this._h[3] >>> 8;
            mac[macpos + 8] = this._h[4] >>> 0;
            mac[macpos + 9] = this._h[4] >>> 8;
            mac[macpos + 10] = this._h[5] >>> 0;
            mac[macpos + 11] = this._h[5] >>> 8;
            mac[macpos + 12] = this._h[6] >>> 0;
            mac[macpos + 13] = this._h[6] >>> 8;
            mac[macpos + 14] = this._h[7] >>> 0;
            mac[macpos + 15] = this._h[7] >>> 8;
            this._finished = true;
            return this;
          };
          Poly13052.prototype.update = function(m) {
            var mpos = 0;
            var bytes = m.length;
            var want;
            if (this._leftover) {
              want = 16 - this._leftover;
              if (want > bytes) {
                want = bytes;
              }
              for (var i = 0; i < want; i++) {
                this._buffer[this._leftover + i] = m[mpos + i];
              }
              bytes -= want;
              mpos += want;
              this._leftover += want;
              if (this._leftover < 16) {
                return this;
              }
              this._blocks(this._buffer, 0, 16);
              this._leftover = 0;
            }
            if (bytes >= 16) {
              want = bytes - bytes % 16;
              this._blocks(m, mpos, want);
              mpos += want;
              bytes -= want;
            }
            if (bytes) {
              for (var i = 0; i < bytes; i++) {
                this._buffer[this._leftover + i] = m[mpos + i];
              }
              this._leftover += bytes;
            }
            return this;
          };
          Poly13052.prototype.digest = function() {
            if (this._finished) {
              throw new Error("Poly1305 was finished");
            }
            var mac = new Uint8Array(16);
            this.finish(mac);
            return mac;
          };
          Poly13052.prototype.clean = function() {
            wipe_1.wipe(this._buffer);
            wipe_1.wipe(this._r);
            wipe_1.wipe(this._h);
            wipe_1.wipe(this._pad);
            this._leftover = 0;
            this._fin = 0;
            this._finished = true;
            return this;
          };
          return Poly13052;
        })()
      );
      exports.Poly1305 = Poly1305;
      function oneTimeAuth(key, data) {
        var h = new Poly1305(key);
        h.update(data);
        var digest = h.digest();
        h.clean();
        return digest;
      }
      exports.oneTimeAuth = oneTimeAuth;
      function equal(a, b) {
        if (a.length !== exports.DIGEST_LENGTH || b.length !== exports.DIGEST_LENGTH) {
          return false;
        }
        return constant_time_1.equal(a, b);
      }
      exports.equal = equal;
    }
  });

  // node_modules/@stablelib/chacha20poly1305/lib/chacha20poly1305.js
  var require_chacha20poly1305 = __commonJS({
    "node_modules/@stablelib/chacha20poly1305/lib/chacha20poly1305.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var chacha_1 = require_chacha();
      var poly1305_1 = require_poly1305();
      var wipe_1 = require_wipe();
      var binary_1 = require_binary();
      var constant_time_1 = require_constant_time();
      exports.KEY_LENGTH = 32;
      exports.NONCE_LENGTH = 12;
      exports.TAG_LENGTH = 16;
      var ZEROS = new Uint8Array(16);
      var ChaCha20Poly1305 = (
        /** @class */
        (function() {
          function ChaCha20Poly13052(key) {
            this.nonceLength = exports.NONCE_LENGTH;
            this.tagLength = exports.TAG_LENGTH;
            if (key.length !== exports.KEY_LENGTH) {
              throw new Error("ChaCha20Poly1305 needs 32-byte key");
            }
            this._key = new Uint8Array(key);
          }
          ChaCha20Poly13052.prototype.seal = function(nonce, plaintext, associatedData, dst) {
            if (nonce.length > 16) {
              throw new Error("ChaCha20Poly1305: incorrect nonce length");
            }
            var counter = new Uint8Array(16);
            counter.set(nonce, counter.length - nonce.length);
            var authKey = new Uint8Array(32);
            chacha_1.stream(this._key, counter, authKey, 4);
            var resultLength = plaintext.length + this.tagLength;
            var result;
            if (dst) {
              if (dst.length !== resultLength) {
                throw new Error("ChaCha20Poly1305: incorrect destination length");
              }
              result = dst;
            } else {
              result = new Uint8Array(resultLength);
            }
            chacha_1.streamXOR(this._key, counter, plaintext, result, 4);
            this._authenticate(result.subarray(result.length - this.tagLength, result.length), authKey, result.subarray(0, result.length - this.tagLength), associatedData);
            wipe_1.wipe(counter);
            return result;
          };
          ChaCha20Poly13052.prototype.open = function(nonce, sealed, associatedData, dst) {
            if (nonce.length > 16) {
              throw new Error("ChaCha20Poly1305: incorrect nonce length");
            }
            if (sealed.length < this.tagLength) {
              return null;
            }
            var counter = new Uint8Array(16);
            counter.set(nonce, counter.length - nonce.length);
            var authKey = new Uint8Array(32);
            chacha_1.stream(this._key, counter, authKey, 4);
            var calculatedTag = new Uint8Array(this.tagLength);
            this._authenticate(calculatedTag, authKey, sealed.subarray(0, sealed.length - this.tagLength), associatedData);
            if (!constant_time_1.equal(calculatedTag, sealed.subarray(sealed.length - this.tagLength, sealed.length))) {
              return null;
            }
            var resultLength = sealed.length - this.tagLength;
            var result;
            if (dst) {
              if (dst.length !== resultLength) {
                throw new Error("ChaCha20Poly1305: incorrect destination length");
              }
              result = dst;
            } else {
              result = new Uint8Array(resultLength);
            }
            chacha_1.streamXOR(this._key, counter, sealed.subarray(0, sealed.length - this.tagLength), result, 4);
            wipe_1.wipe(counter);
            return result;
          };
          ChaCha20Poly13052.prototype.clean = function() {
            wipe_1.wipe(this._key);
            return this;
          };
          ChaCha20Poly13052.prototype._authenticate = function(tagOut, authKey, ciphertext, associatedData) {
            var h = new poly1305_1.Poly1305(authKey);
            if (associatedData) {
              h.update(associatedData);
              if (associatedData.length % 16 > 0) {
                h.update(ZEROS.subarray(associatedData.length % 16));
              }
            }
            h.update(ciphertext);
            if (ciphertext.length % 16 > 0) {
              h.update(ZEROS.subarray(ciphertext.length % 16));
            }
            var length = new Uint8Array(8);
            if (associatedData) {
              binary_1.writeUint64LE(associatedData.length, length);
            }
            h.update(length);
            binary_1.writeUint64LE(ciphertext.length, length);
            h.update(length);
            var tag = h.digest();
            for (var i = 0; i < tag.length; i++) {
              tagOut[i] = tag[i];
            }
            h.clean();
            wipe_1.wipe(tag);
            wipe_1.wipe(length);
          };
          return ChaCha20Poly13052;
        })()
      );
      exports.ChaCha20Poly1305 = ChaCha20Poly1305;
    }
  });

  // node_modules/@stablelib/xchacha20poly1305/lib/xchacha20poly1305.js
  var require_xchacha20poly1305 = __commonJS({
    "node_modules/@stablelib/xchacha20poly1305/lib/xchacha20poly1305.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var xchacha20_1 = require_xchacha20();
      var chacha20poly1305_1 = require_chacha20poly1305();
      var wipe_1 = require_wipe();
      exports.KEY_LENGTH = 32;
      exports.NONCE_LENGTH = 24;
      exports.TAG_LENGTH = 16;
      var XChaCha20Poly13052 = (
        /** @class */
        (function() {
          function XChaCha20Poly13053(key) {
            this.nonceLength = exports.NONCE_LENGTH;
            this.tagLength = exports.TAG_LENGTH;
            if (key.length !== exports.KEY_LENGTH) {
              throw new Error("ChaCha20Poly1305 needs 32-byte key");
            }
            this._key = new Uint8Array(key);
          }
          XChaCha20Poly13053.prototype.seal = function(nonce, plaintext, associatedData, dst) {
            if (nonce.length !== 24) {
              throw new Error("XChaCha20Poly1305: incorrect nonce length");
            }
            var subKey = xchacha20_1.hchacha(this._key, nonce.subarray(0, 16), new Uint8Array(32));
            var modifiedNonce = new Uint8Array(12);
            modifiedNonce.set(nonce.subarray(16), 4);
            var chaChaPoly = new chacha20poly1305_1.ChaCha20Poly1305(subKey);
            var result = chaChaPoly.seal(modifiedNonce, plaintext, associatedData, dst);
            wipe_1.wipe(subKey);
            wipe_1.wipe(modifiedNonce);
            chaChaPoly.clean();
            return result;
          };
          XChaCha20Poly13053.prototype.open = function(nonce, sealed, associatedData, dst) {
            if (nonce.length !== 24) {
              throw new Error("XChaCha20Poly1305: incorrect nonce length");
            }
            if (sealed.length < this.tagLength) {
              return null;
            }
            var subKey = xchacha20_1.hchacha(this._key, nonce.subarray(0, 16), new Uint8Array(32));
            var modifiedNonce = new Uint8Array(12);
            modifiedNonce.set(nonce.subarray(16), 4);
            var chaChaPoly = new chacha20poly1305_1.ChaCha20Poly1305(subKey);
            var result = chaChaPoly.open(modifiedNonce, sealed, associatedData, dst);
            wipe_1.wipe(subKey);
            wipe_1.wipe(modifiedNonce);
            chaChaPoly.clean();
            return result;
          };
          XChaCha20Poly13053.prototype.clean = function() {
            wipe_1.wipe(this._key);
            return this;
          };
          return XChaCha20Poly13053;
        })()
      );
      exports.XChaCha20Poly1305 = XChaCha20Poly13052;
    }
  });

  // client/crypto.js
  var import_xchacha20poly1305 = __toESM(require_xchacha20poly1305(), 1);
  var te = new TextEncoder();
  var td = new TextDecoder();
  function unb64u(s) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function parseFragmentKey() {
    const h = (location.hash || "").replace(/^#/, "");
    const params = new URLSearchParams(h);
    const k = params.get("k");
    if (!k) return null;
    return unb64u(k);
  }
  async function hkdfSha256(ikmRaw, salt, infoStr, outLen) {
    const key = await crypto.subtle.importKey("raw", ikmRaw, "HKDF", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt, info: te.encode(infoStr) },
      key,
      outLen * 8
    );
    return new Uint8Array(bits);
  }
  function requireArgon2() {
    const a = globalThis.argon2;
    if (!a || !a.hash) throw new Error("argon2 not loaded");
    return a;
  }
  async function argon2idKey(passphrase, saltBytes, params) {
    const argon2 = requireArgon2();
    const res = await argon2.hash({
      pass: passphrase,
      salt: saltBytes,
      type: argon2.ArgonType.Argon2id,
      mem: params.m,
      time: params.t,
      parallelism: params.p,
      hashLen: 32
    });
    return new Uint8Array(res.hash);
  }
  async function deriveMasterKey(linkKey2, passphrase, kdf) {
    if (!passphrase) return linkKey2;
    const salt = unb64u(kdf.salt);
    const pwKey = await argon2idKey(passphrase, salt, kdf.params);
    const ikm = new Uint8Array(linkKey2.length + pwKey.length);
    ikm.set(linkKey2, 0);
    ikm.set(pwKey, linkKey2.length);
    return hkdfSha256(ikm, salt, "ghostnote:v1:master", 32);
  }
  function decryptXChaCha(payloadObj2, masterKey) {
    const aead = new import_xchacha20poly1305.XChaCha20Poly1305(masterKey);
    const nonce = unb64u(payloadObj2.nonce);
    const ct = unb64u(payloadObj2.ct);
    const aad = te.encode("GN1");
    const pt = aead.open(nonce, ct, aad);
    if (!pt) throw new Error("decrypt failed");
    return td.decode(pt);
  }

  // client/view_entry.js
  var statusEl = document.getElementById("status");
  var passWrap = document.getElementById("passWrap");
  var passEl = document.getElementById("pass");
  var decoyWrap = document.getElementById("decoyWrap");
  var decoyText = document.getElementById("decoyText");
  var revealBtn = document.getElementById("revealBtn");
  var secretWrap = document.getElementById("secretWrap");
  var secretText = document.getElementById("secretText");
  var frost = document.getElementById("frost");
  var badgeLabel = document.querySelector(".badge span:last-child");
  function status(msg) {
    if (statusEl) statusEl.textContent = msg;
  }
  function show(el) {
    if (el) el.hidden = false;
  }
  function hide(el) {
    if (el) el.hidden = true;
  }
  function noteIdFromUrl() {
    const u = new URL(location.href);
    const m = u.pathname.match(/\/n\/([^\/?#]+)/);
    if (m && m[1]) return m[1];
    const qs = u.searchParams;
    return qs.get("id") || qs.get("note") || qs.get("nid") || null;
  }
  function renderBadLink(reason) {
    if (badgeLabel) badgeLabel.textContent = "Invalid link";
    hide(decoyWrap);
    hide(passWrap);
    hide(revealBtn);
    hide(secretWrap);
    frost?.classList.remove("isMelted");
    const msg = `Invalid GhostNote link.

${reason}

Open a real note link like:
/n/<id>#k=...

Tip: the #k= part is required to decrypt.`;
    status(msg);
    const card = document.getElementById("recipientCard") || document.body;
    if (!document.getElementById("goHomeBtn")) {
      const a = document.createElement("a");
      a.id = "goHomeBtn";
      a.href = "/";
      a.className = "btn btn--ghost";
      a.style.display = "inline-flex";
      a.style.marginTop = "12px";
      a.textContent = "Go to Composer";
      card.appendChild(a);
    }
  }
  async function fetchNote(id) {
    const res = await fetch(`/api/notes/${encodeURIComponent(id)}`, { method: "GET" });
    if (!res.ok) return null;
    return res.json();
  }
  var payloadObj = null;
  var linkKey = null;
  var noteId = null;
  async function reveal() {
    try {
      if (!payloadObj || !linkKey) {
        status("missing payload/key.");
        return;
      }
      const kdf = payloadObj.kdf || null;
      const needsPass = !!(kdf && kdf.name === "argon2id");
      const passphrase = needsPass ? (passEl?.value || "").trim() : "";
      if (needsPass && !passphrase) {
        status("passphrase required.");
        passEl?.focus();
        return;
      }
      frost?.classList.add("isMelted");
      status("decrypting locally...");
      const masterKey = await deriveMasterKey(linkKey, passphrase, kdf);
      const pt = decryptXChaCha(payloadObj, masterKey);
      show(secretWrap);
      if (secretText) secretText.textContent = pt;
      hide(decoyWrap);
      hide(passWrap);
      hide(revealBtn);
      status("done.");
    } catch {
      status("decrypt failed (wrong key/passphrase or tampered ciphertext).");
    }
  }
  async function main() {
    noteId = noteIdFromUrl();
    if (!noteId) {
      renderBadLink("No note id found in the URL path or query string.");
      return;
    }
    linkKey = parseFragmentKey();
    if (!linkKey) {
      renderBadLink("Missing #k=... fragment key.");
      return;
    }
    status("fetching note (burn-on-view happens now)...");
    const data = await fetchNote(noteId);
    if (!data) {
      status("note not found / expired / burned / IP-locked.");
      hide(revealBtn);
      hide(passWrap);
      hide(decoyWrap);
      hide(secretWrap);
      return;
    }
    if (data.decoy) {
      show(decoyWrap);
      if (decoyText) decoyText.textContent = data.decoy;
    } else {
      hide(decoyWrap);
    }
    try {
      payloadObj = JSON.parse(data.payload);
    } catch {
      status("corrupt payload.");
      hide(revealBtn);
      return;
    }
    const kdf = payloadObj.kdf || null;
    const needsPass = !!(kdf && kdf.name === "argon2id");
    if (needsPass) {
      show(passWrap);
      passEl?.focus();
    } else {
      hide(passWrap);
    }
    show(revealBtn);
    status("ready. click UNLOCK to decrypt locally.");
    revealBtn?.addEventListener("click", reveal);
    passEl?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") reveal();
    });
  }
  main().catch(() => {
    renderBadLink("Viewer crashed.");
  });
})();
